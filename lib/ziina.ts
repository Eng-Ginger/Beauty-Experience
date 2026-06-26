export const ZIINA_API_BASE = 'https://api-v2.ziina.com/api'

export async function createZiinaPaymentIntent(payload: {
  amount: number
  currency_code: string
  message: string
  success_url: string
  cancel_url: string
  failure_url: string
  test?: boolean
}) {
  const token = process.env.ZIINA_API_TOKEN?.trim() ?? ''
  if (!token) {
    throw new Error('Ziina token missing — set ZIINA_API_TOKEN in .env.local')
  }
  const res = await fetch(`${ZIINA_API_BASE}/payment_intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const responseBody = await res.text()
  if (!res.ok) {
    console.error('Ziina API error:', res.status, responseBody)
    throw new Error(`Ziina ${res.status}: ${responseBody}`)
  }
  return JSON.parse(responseBody)
}

export async function getZiinaPaymentIntent(id: string) {
  const token = process.env.ZIINA_API_TOKEN?.trim() ?? ''
  const res = await fetch(`${ZIINA_API_BASE}/payment_intent/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.text()
  if (!res.ok) {
    console.error('Ziina GET error:', res.status, body)
    throw new Error(`Ziina ${res.status}: ${body}`)
  }
  return JSON.parse(body)
}
