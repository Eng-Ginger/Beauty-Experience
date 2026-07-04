import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getClientIp, checkAdminRateLimit } from '@/lib/adminRateLimit'

const ALLOWED_TABLES = ['bookings', 'mirror_bookings'] as const
type AllowedTable = (typeof ALLOWED_TABLES)[number]

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const limit = checkAdminRateLimit(ip)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })
  }

  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '').trim()
  const staffPassword = process.env.STAFF_PASSWORD
  if (!staffPassword || token !== staffPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const table = req.nextUrl.searchParams.get('table') as AllowedTable
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  }

  const dbTable = table === 'mirror_bookings' ? 'mirror_bookings' : 'bookings'
  const { data, error } = await supabaseAdmin
    .from(dbTable)
    .select('*')
    .order(table === 'mirror_bookings' ? 'date' : 'date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data ?? [] })
}
