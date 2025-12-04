import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // Redirect www to non-www
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.host = host.replace('www.', '');
    return NextResponse.redirect(url, { status: 301 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
