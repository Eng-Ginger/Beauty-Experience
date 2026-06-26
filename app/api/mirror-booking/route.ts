import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(4),
  email: z.string().email(),
  date: z.string().min(1),
  time: z.string().min(1),
  concerns: z.array(z.string()).default([]),
  referral: z.string().min(1),
})

function randomSix() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const data = parsed.data
    const bookingId = `BE-M-${randomSix()}`

    const [{ data: conflictBooking }, { data: conflictMirror }] = await Promise.all([
      supabaseAdmin
        .from('bookings')
        .select('booking_id')
        .eq('date', data.date)
        .eq('time', data.time)
        .neq('status', 'cancelled')
        .limit(1),
      supabaseAdmin
        .from('mirror_bookings')
        .select('booking_id')
        .eq('date', data.date)
        .eq('time', data.time)
        .limit(1),
    ])
    if ((conflictBooking?.length ?? 0) > 0 || (conflictMirror?.length ?? 0) > 0) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose a different time.' },
        { status: 409 }
      )
    }

    const { error } = await supabaseAdmin.from('mirror_bookings').insert({
      booking_id: bookingId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      date: data.date,
      time: data.time,
      skin_concerns: data.concerns,
      referral_source: data.referral,
    })

    if (error) {
      return NextResponse.json({ error: 'Could not save booking' }, { status: 500 })
    }

    const msg = encodeURIComponent(
      `Hi! I just booked an AI Smart Mirror session.\n\nName: ${data.name}\nDate: ${data.date} at ${data.time}\nRef: ${bookingId}`
    )
    const whatsappUrl = `https://api.whatsapp.com/send?phone=971522325578&text=${msg}`

    return NextResponse.json({ success: true, bookingId, whatsappUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
