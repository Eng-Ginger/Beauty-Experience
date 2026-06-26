import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  checkAdminRateLimit,
  clearAdminAuthFails,
  getClientIp,
  recordAdminAuthFail,
  verifyAdminPassword,
} from '@/lib/adminRateLimit'

const ALLOWED_TABLES = ['bookings', 'mirror_bookings', 'customers', 'loyalty_members'] as const
type AllowedTable = (typeof ALLOWED_TABLES)[number]

function extractPassword(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rate = checkAdminRateLimit(ip)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.', retryAfter: rate.retryAfter },
      { status: 429 }
    )
  }

  const password = extractPassword(req)
  if (!verifyAdminPassword(password)) {
    recordAdminAuthFail(ip)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  clearAdminAuthFails(ip)

  const table = req.nextUrl.searchParams.get('table') as AllowedTable | null
  if (!table || !ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  }

  const orderColumn =
    table === 'bookings' || table === 'mirror_bookings' ? 'date' : 'created_at'

  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .order(orderColumn, { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rows: data ?? [] })
}
