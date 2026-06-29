import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { LOYALTY_TIERS, LoyaltyTierKey } from '@/lib/loyaltyTiers'
import {
  getClientIp,
  checkAdminRateLimit,
  recordAdminAuthFail,
  clearAdminAuthFails,
  verifyAdminPassword,
} from '@/lib/adminRateLimit'

const schema = z.object({
  email: z.string().email(),
  tier: z.enum(['rose', 'gold', 'platinum']),
  adminPassword: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const limit = checkAdminRateLimit(ip)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter ?? 60) } }
    )
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { email, tier, adminPassword } = parsed.data

    if (!verifyAdminPassword(adminPassword)) {
      recordAdminAuthFail(ip)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    clearAdminAuthFails(ip)

    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('customer_id, name, email, phone, dob, membership_id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found with that email' },
        { status: 404 }
      )
    }

    const tierInfo = LOYALTY_TIERS[tier as LoyaltyTierKey]
    const membershipId = customer.customer_id

    if (customer.membership_id) {
      await supabaseAdmin
        .from('loyalty_members')
        .update({ status: 'upgraded' })
        .eq('membership_id', customer.membership_id)
    }

    const { error: insertErr } = await supabaseAdmin.from('loyalty_members').insert({
      membership_id: membershipId,
      ziina_intent_id: null,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      dob: customer.dob,
      tier,
      discount_percent: tierInfo.discountPercent,
      status: 'active',
      joined_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (insertErr) {
      console.error('Grant insert failed:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    await supabaseAdmin
      .from('customers')
      .update({ membership_id: membershipId })
      .eq('customer_id', customer.customer_id)

    return NextResponse.json({ success: true, membershipId })
  } catch (err: any) {
    console.error('Grant route exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
