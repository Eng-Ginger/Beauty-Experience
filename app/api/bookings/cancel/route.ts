import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromCookies } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const schema = z.object({ bookingId: z.string().min(1) })

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { bookingId } = parsed.data

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('booking_id, customer_id, status')
      .eq('booking_id', bookingId)
      .eq('customer_id', session.customerId)
      .maybeSingle()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.status === 'completed') {
      return NextResponse.json({ error: 'Cannot cancel a completed booking' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('booking_id', bookingId)

    if (error) {
      console.error('Cancel failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Cancel route exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
