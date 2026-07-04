import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/src/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
