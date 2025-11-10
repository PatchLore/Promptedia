import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const target = new URL('/sitemap.xml', request.url);
  return NextResponse.redirect(target, 308);
}

