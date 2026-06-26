import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const specialist = searchParams.get('specialist')

  if (!date) {
    return NextResponse.json({ bookedTimes: [] })
  }

  let query = supabaseAdmin
    .from('bookings')
    .select('time')
    .eq('date', date)
    .neq('status', 'cancelled')

  if (specialist) {
    query = query.eq('specialist', specialist)
  }

  const { data } = await query

  const times = (data ?? []).map((r) => r.time).filter(Boolean)

  return NextResponse.json({ bookedTimes: Array.from(new Set(times)) })
}
