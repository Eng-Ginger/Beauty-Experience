import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { signSession, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
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
    const { name, email, password, phone, dob } = parsed.data

    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const customerId = `BE-C-${randomSix()}`

    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert({
        customer_id: customerId,
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        phone: phone || null,
        dob: dob || null,
      })
      .select('customer_id, name, email, phone, dob, membership_id')
      .single()

    if (error || !data) {
      console.error('SUPABASE INSERT ERROR:', error)
      return NextResponse.json({ error: 'Could not create account' }, { status: 500 })
    }

    const token = await signSession({ customerId: data.customer_id, email: data.email })
    const res = NextResponse.json({
      customerId: data.customer_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      membershipId: data.membership_id,
      membership: null,
    })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
    return res
  } catch (err) {
    console.error('REGISTER ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
