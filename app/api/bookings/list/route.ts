import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const { data } = await supabaseAdmin
    .from('bookings')
    .select('booking_id, service, date, time, specialist, status, created_at')
    .eq('customer_id', session.customerId)
    .order('created_at', { ascending: false })

  const bookings = (data || []).map((b) => ({
    bookingId: b.booking_id,
    service: b.service,
    date: b.date,
    time: b.time,
    specialist: b.specialist,
    status: b.status,
    createdAt: b.created_at,
  }))
  return NextResponse.json({ bookings })
}
