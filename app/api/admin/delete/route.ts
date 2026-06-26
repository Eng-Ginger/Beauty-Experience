import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  checkAdminRateLimit,
  clearAdminAuthFails,
  getClientIp,
  recordAdminAuthFail,
  verifyAdminPassword,
} from '@/lib/adminRateLimit'

const ALLOWED_TYPES = {
  booking: { table: 'bookings', column: 'booking_id' },
  customer: { table: 'customers', column: 'customer_id' },
  mirror_booking: { table: 'mirror_bookings', column: 'booking_id' },
  loyalty_member: { table: 'loyalty_members', column: 'membership_id' },
} as const

type DeleteType = keyof typeof ALLOWED_TYPES

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const limit = checkAdminRateLimit(ip)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter ?? 60) } }
    )
  }

  const { type, id, adminPassword } = (await req.json().catch(() => ({}))) as {
    type?: DeleteType
    id?: string
    adminPassword?: string
  }

  if (!verifyAdminPassword(adminPassword)) {
    recordAdminAuthFail(ip)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  clearAdminAuthFails(ip)

  if (!type || !(type in ALLOWED_TYPES) || !id) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (type === 'loyalty_member') {
    await supabaseAdmin
      .from('customers')
      .update({ membership_id: null })
      .eq('membership_id', id)
  }

  const target = ALLOWED_TYPES[type]
  const { error } = await supabaseAdmin.from(target.table).delete().eq(target.column, id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
