type Bucket = { fails: number; resetAt: number }

const ipBuckets = new Map<string, Bucket>()
const WINDOW_MS = 5 * 60 * 1000
const MAX_FAILS = 5

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

export function checkAdminRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const b = ipBuckets.get(ip)
  if (!b || now > b.resetAt) return { allowed: true }
  if (b.fails >= MAX_FAILS) {
    return { allowed: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) }
  }
  return { allowed: true }
}

export function recordAdminAuthFail(ip: string) {
  const now = Date.now()
  const b = ipBuckets.get(ip)
  if (!b || now > b.resetAt) {
    ipBuckets.set(ip, { fails: 1, resetAt: now + WINDOW_MS })
  } else {
    b.fails += 1
  }
}

export function clearAdminAuthFails(ip: string) {
  ipBuckets.delete(ip)
}

export function verifyAdminPassword(provided: string | undefined | null): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !provided) return false
  if (provided.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ provided.charCodeAt(i)
  }
  return mismatch === 0
}
