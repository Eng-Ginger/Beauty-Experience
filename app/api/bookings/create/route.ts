import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromCookies } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const schema = z.object({
  service: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  specialist: z.string().min(1),
  addOns: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
})

function randomSix() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      console.error('Booking validation failed:', parsed.error.flatten())
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { service, date, time, specialist, addOns, notes, price } = parsed.data
    const bookingId = `BE-B-${randomSix()}`

    const { data: specialistConflict } = await supabaseAdmin
      .from('bookings')
      .select('booking_id')
      .eq('date', date)
      .eq('time', time)
      .eq('specialist', specialist)
      .neq('status', 'cancelled')
      .limit(1)
    if ((specialistConflict?.length ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            'This specialist is already booked at this time. Please choose a different time, date, or specialist.',
        },
        { status: 409 }
      )
    }

    const { data: serviceConflict } = await supabaseAdmin
      .from('bookings')
      .select('booking_id')
      .eq('date', date)
      .eq('time', time)
      .eq('service', service)
      .neq('status', 'cancelled')
      .limit(1)
    if ((serviceConflict?.length ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            'This service is already booked at this time. Please choose a different time or date.',
        },
        { status: 409 }
      )
    }

    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('name, email, phone')
      .eq('customer_id', session.customerId)
      .maybeSingle()

    const addOnList = notes ? [...addOns, `note: ${notes}`] : addOns

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_id: bookingId,
        customer_id: session.customerId,
        customer_name: customer?.name ?? null,
        customer_email: customer?.email ?? null,
        customer_phone: customer?.phone ?? null,
        service,
        date,
        time,
        specialist,
        add_ons: addOnList,
        price: price ?? null,
        status: 'upcoming',
      })
      .select('booking_id')
      .single()

    if (error) {
      console.error('Booking insert failed:', error)
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, bookingId: data?.booking_id ?? bookingId })
  } catch (err: any) {
    console.error('Booking route exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
