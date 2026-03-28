import { NextRequest, NextResponse } from 'next/server'

const CORRECT_PASSWORD = '861135'
const COOKIE_NAME = 'vidpipe_admin_auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== CORRECT_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, CORRECT_PASSWORD, {
    httpOnly: true,       // Not accessible by JavaScript
    secure: true,         // HTTPS only
    sameSite: 'strict',   // CSRF protection
    maxAge: 60 * 60 * 8,  // 8 hours session
    path: '/',
  })
  return res
}
