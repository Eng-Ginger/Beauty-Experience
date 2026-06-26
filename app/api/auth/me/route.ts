import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('customer_id, name, email, phone, dob, membership_id')
    .eq('customer_id', session.customerId)
    .maybeSingle()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  let membership = null
  if (customer.membership_id) {
    const { data: m } = await supabaseAdmin
      .from('loyalty_members')
      .select('membership_id, tier, status, discount_percent, expires_at')
      .eq('membership_id', customer.membership_id)
      .maybeSingle()
    if (m) {
      membership = {
        membershipId: m.membership_id,
        tier: m.tier,
        status: m.status,
        discountPercent: m.discount_percent,
        expiresAt: m.expires_at,
      }
    }
  }

  return NextResponse.json({
    customerId: customer.customer_id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    dob: customer.dob,
    membershipId: customer.membership_id,
    membership,
  })
}
