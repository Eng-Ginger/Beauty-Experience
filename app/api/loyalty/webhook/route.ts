import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activateLoyaltyMembership } from '@/lib/loyaltyActivation'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('x-hmac-signature') || ''
  const secret = process.env.ZIINA_WEBHOOK_SECRET || ''

  if (secret) {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    const expectedBuf = Buffer.from(expected)
    const sigBuf = Buffer.from(sig)
    const isValid =
      sig.length > 0 &&
      expectedBuf.length === sigBuf.length &&
      crypto.timingSafeEqual(expectedBuf, sigBuf)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const intentId = payload?.data?.id || payload?.id
  const status = payload?.data?.status || payload?.status

  if (intentId && (status === 'completed' || status === 'COMPLETED')) {
    await activateLoyaltyMembership(intentId)
  }

  return NextResponse.json({ received: true })
}
