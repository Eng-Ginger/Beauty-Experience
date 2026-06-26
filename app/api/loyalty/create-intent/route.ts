import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createZiinaPaymentIntent } from '@/lib/ziina'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromCookies } from '@/lib/auth'
import { LOYALTY_TIERS, LoyaltyTierKey } from '@/lib/loyaltyTiers'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(4),
  dob: z.string().optional().nullable(),
  tier: z.enum(['gold', 'platinum']),
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
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { name, email, phone, dob, tier } = parsed.data
    const tierData = LOYALTY_TIERS[tier as LoyaltyTierKey]

    const siteUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000'
    const membershipId = `BE-M-${randomSix()}`

    let intent
    try {
      intent = await createZiinaPaymentIntent({
        amount: tierData.amountFils,
        currency_code: 'AED',
        message: `Beauty Experience ${tierData.name}`,
        success_url: `${siteUrl}/profile?membership=${membershipId}#membership`,
        cancel_url: `${siteUrl}/?loyalty=cancel`,
        failure_url: `${siteUrl}/?loyalty=failure`,
        test: process.env.NODE_ENV !== 'production',
      })
    } catch (err: any) {
      console.error('Ziina intent failed:', err?.message)
      const msg = encodeURIComponent(
        `Hi, I'd like to join the ${tierData.name} but the online payment failed.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`
      )
      return NextResponse.json(
        {
          error: `Online payment unavailable: ${err?.message ?? 'unknown'}. Please use WhatsApp.`,
          whatsappUrl: `https://api.whatsapp.com/send?phone=971522325578&text=${msg}`,
        },
        { status: 502 }
      )
    }

    await supabaseAdmin.from('loyalty_members').insert({
      membership_id: membershipId,
      ziina_intent_id: intent.id,
      name,
      email,
      phone,
      dob: dob || null,
      tier,
      discount_percent: tierData.discountPercent,
      status: 'pending',
    })

    return NextResponse.json({
      payment_url: intent.redirect_url || intent.embedded_url,
      intentId: intent.id,
      membershipId,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
