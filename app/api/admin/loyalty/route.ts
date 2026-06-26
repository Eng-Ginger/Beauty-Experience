import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  getClientIp,
  checkAdminRateLimit,
  recordAdminAuthFail,
  clearAdminAuthFails,
  verifyAdminPassword,
} from '@/lib/adminRateLimit'

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
    const { password, tier } = await req.json()
    if (!verifyAdminPassword(password)) {
      recordAdminAuthFail(ip)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    clearAdminAuthFails(ip)

    let query = supabaseAdmin
      .from('loyalty_members')
      .select(
        'membership_id, name, email, phone, tier, status, discount_percent, joined_at, expires_at, created_at'
      )
      .order('created_at', { ascending: false })

    if (tier && tier !== 'all') query = query.eq('tier', tier)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    const members = (data || []).map((m) => ({
      membershipId: m.membership_id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      tier: m.tier,
      status: m.status,
      discountPercent: m.discount_percent,
      joinedAt: m.joined_at,
      expiresAt: m.expires_at,
      createdAt: m.created_at,
    }))

    return NextResponse.json({ members })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
