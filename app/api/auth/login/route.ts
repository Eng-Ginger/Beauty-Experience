import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { signSession, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { email, password } = parsed.data

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('id, customer_id, name, email, password_hash, phone, dob, membership_id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (error || !customer) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, customer.password_hash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    let membership = null
    if (customer.membership_id) {
      const { data: m } = await supabaseAdmin
        .from('loyalty_members')
        .select('membership_id, tier, status, discount_percent, expires_at')
        .eq('membership_id', customer.membership_id)
        .maybeSingle()
      if (m) {
        membership = {
          membershipId: m.membership_id,
          tier: m.tier,
          status: m.status,
          discountPercent: m.discount_percent,
          expiresAt: m.expires_at,
        }
      }
    }

    const token = await signSession({ customerId: customer.customer_id, email: customer.email })
    const res = NextResponse.json({
      customerId: customer.customer_id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      dob: customer.dob,
      membershipId: customer.membership_id,
      membership,
    })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
    return res
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
