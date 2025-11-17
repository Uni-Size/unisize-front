import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 쿠키에서 accessToken 확인
  const accessToken = request.cookies.get('accessToken')?.value;

  // /staff 페이지 접근 시 인증 체크 (단, /staff/signup은 제외)
  if (request.nextUrl.pathname.startsWith('/staff')) {
    // 로그인/회원가입 페이지는 인증 불필요
    if (request.nextUrl.pathname === '/staff/signup') {
      const response = NextResponse.next();
      // pathname을 헤더에 추가
      response.headers.set('x-invoke-path', request.nextUrl.pathname);
      return response;
    }

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/staff/signup';
      return NextResponse.redirect(url);
    }
  }

  // pathname을 헤더에 추가
  const response = NextResponse.next();
  response.headers.set('x-invoke-path', request.nextUrl.pathname);
  return response;
}

// middleware가 실행될 경로 설정
export const config = {
  matcher: ['/staff', '/staff/:path*'],
};
