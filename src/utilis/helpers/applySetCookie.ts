import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

export function applySetCookie(req: NextRequest, res: NextResponse) {
  const setCookies = new ResponseCookies(res.headers);

  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));

  const dummyRes = NextResponse.next({ request: { headers: newReqHeaders } });

  dummyRes.headers.forEach((value, key) => {
    if (key === 'x-middleware-override-headers' || key.startsWith('x-middleware-request-')) {
      res.headers.set(key, value);
    }
  });
}
