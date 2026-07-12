import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getClientIp, checkAdminRateLimit } from '@/lib/adminRateLimit'

const ALLOWED_TYPES = {
  booking: { table: 'bookings', column: 'booking_id' },
  mirror_booking: { table: 'mirror_bookings', column: 'booking_id' },
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

  const { type, id, staffPassword } = (await req.json().catch(() => ({}))) as {
    type?: DeleteType
    id?: string
    staffPassword?: string
  }

  const expected = process.env.STAFF_PASSWORD
  if (!expected || !staffPassword || staffPassword !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!type || !(type in ALLOWED_TYPES) || !id) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const target = ALLOWED_TYPES[type]
  const { error } = await supabaseAdmin.from(target.table).delete().eq(target.column, id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
