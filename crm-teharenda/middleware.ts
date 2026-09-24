import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me',
);

const COOKIE_NAME = 'teharenda_session';

// Страницы, доступные без входа
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Пропускаем публичные пути и статику
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Проверяем cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // Нет токена — отправляем на /login
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    // Токен невалидный — на /login
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

// Применяем ко всем страницам, кроме статики
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};