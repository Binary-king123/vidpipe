import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PATH = '/alagappan'
const LOGIN_PATH = '/alagappan/login'
const COOKIE_NAME = 'vidpipe_admin_auth'
const CORRECT_PASSWORD = '861135'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /alagappan routes
  if (!pathname.startsWith(ADMIN_PATH)) return NextResponse.next()

  // Let login page through
  if (pathname === LOGIN_PATH) return NextResponse.next()

  // Check auth cookie
  const authCookie = req.cookies.get(COOKIE_NAME)
  if (authCookie?.value === CORRECT_PASSWORD) return NextResponse.next()

  // Not authenticated — redirect to login
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = LOGIN_PATH
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/alagappan/:path*'],
}
