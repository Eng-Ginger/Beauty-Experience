import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromCookies } from '@/lib/auth'
import { LOYALTY_TIERS } from '@/lib/loyaltyTiers'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(4),
  dob: z.string().optional().nullable(),
})

function randomSix() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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
    const { name, email, phone, dob } = parsed.data
    const membershipId = `BE-M-${randomSix()}`

    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const { error: insertErr } = await supabaseAdmin.from('loyalty_members').insert({
      membership_id: membershipId,
      ziina_intent_id: null,
      name,
      email,
      phone,
      dob: dob || null,
      tier: 'rose',
      discount_percent: LOYALTY_TIERS.rose.discountPercent,
      status: 'active',
      joined_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (insertErr) {
      return NextResponse.json({ error: 'Could not create membership' }, { status: 500 })
    }

    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('membership_id')
      .eq('customer_id', session.customerId)
      .maybeSingle()

    if (existingCustomer?.membership_id) {
      await supabaseAdmin
        .from('loyalty_members')
        .update({ status: 'upgraded' })
        .eq('membership_id', existingCustomer.membership_id)
    }

    await supabaseAdmin
      .from('customers')
      .update({ membership_id: membershipId })
      .eq('customer_id', session.customerId)

    return NextResponse.json({ success: true, membershipId })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
