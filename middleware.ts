import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/profile')) {
    const token = request.cookies.get('be_session')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/?signin=true', request.url))
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    } catch {
      return NextResponse.redirect(new URL('/?signin=true', request.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/profile/:path*'] }
