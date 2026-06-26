import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import {
  getClientIp,
  checkAdminRateLimit,
  recordAdminAuthFail,
  clearAdminAuthFails,
  verifyAdminPassword,
} from '@/lib/adminRateLimit'

const schema = z.object({
  membershipId: z.string().min(1),
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
    const { membershipId, adminPassword } = parsed.data

    if (!verifyAdminPassword(adminPassword)) {
      recordAdminAuthFail(ip)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    clearAdminAuthFails(ip)

    const { error: revokeErr } = await supabaseAdmin
      .from('loyalty_members')
      .update({ status: 'revoked' })
      .eq('membership_id', membershipId)

    if (revokeErr) {
      console.error('Revoke failed:', revokeErr)
      return NextResponse.json({ error: revokeErr.message }, { status: 500 })
    }

    await supabaseAdmin
      .from('customers')
      .update({ membership_id: null })
      .eq('membership_id', membershipId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Revoke route exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
