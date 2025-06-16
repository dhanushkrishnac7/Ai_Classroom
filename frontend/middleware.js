import { NextResponse } from "next/server";
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT)

export async function middleware(req) {
  const token = req.cookies.get('token')?.value
  console.log("Received token:", token)
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    console.log(" Token is valid:", payload)
    return NextResponse.next()
  } catch (err) {
    console.error(" Invalid token:", err.message)
    return NextResponse.redirect(new URL('/', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
