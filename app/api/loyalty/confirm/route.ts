import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getZiinaPaymentIntent } from '@/lib/ziina'
import { activateLoyaltyMembership } from '@/lib/loyaltyActivation'
import { getSessionFromCookies } from '@/lib/auth'

const schema = z.object({ membershipId: z.string().min(3) })

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { membershipId } = parsed.data

    const { data: member } = await supabaseAdmin
      .from('loyalty_members')
      .select('ziina_intent_id, status')
      .eq('membership_id', membershipId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }
    if (member.status === 'active') {
      return NextResponse.json({ status: 'active' })
    }

    const intent = await getZiinaPaymentIntent(member.ziina_intent_id)
    // Defensive parsing — log `intent` once if this doesn't match what
    // Ziina actually returns, then adjust the path below.
    const status = String(intent?.data?.status ?? intent?.status ?? '').toLowerCase()

    if (status === 'completed') {
      await activateLoyaltyMembership(member.ziina_intent_id)
      return NextResponse.json({ status: 'active' })
    }
    return NextResponse.json({ status: status || 'pending' })
  } catch (err) {
    console.error('Confirm error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
