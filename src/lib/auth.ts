import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SessionPayload } from '@/src/types';

const SESSION_COOKIE = 'freya_session';
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-secret-change-me-32chars!!'
);

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(SECRET);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function setSessionCookie<T extends NextResponse>(
  response: T,
  payload: SessionPayload
): Promise<T> {
  const token = await encrypt(payload);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });
  return response;
}

export async function clearSessionCookie<T extends NextResponse>(response: T): Promise<T> {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export async function updateSessionCookie(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies();
  const token = await encrypt(payload);
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });
}
