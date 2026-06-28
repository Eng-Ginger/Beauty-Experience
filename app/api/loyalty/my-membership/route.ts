import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ membership: null })

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('membership_id')
    .eq('customer_id', session.customerId)
    .maybeSingle()

  if (!customer?.membership_id) return NextResponse.json({ membership: null })

  const { data: membership } = await supabaseAdmin
    .from('loyalty_members')
    .select('tier, status, expires_at, discount_percent')
    .eq('membership_id', customer.membership_id)
    .maybeSingle()

  return NextResponse.json({ membership: membership ?? null })
}
