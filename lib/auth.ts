import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE_NAME = 'be_session'

export async function signSession(payload: { customerId: string; email: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET())
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET())
    return payload as { customerId: string; email: string }
  } catch {
    return null
  }
}

export async function getSessionFromCookies() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}

export const SESSION_COOKIE = COOKIE_NAME
