import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Укажите email и пароль' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
    include: { partner: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Неверный email или пароль' },
      { status: 401 },
    );
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Аккаунт отключён. Обратитесь к администратору.' },
      { status: 403 },
    );
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: 'Неверный email или пароль' },
      { status: 401 },
    );
  }

  // Обновляем lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    partnerId: user.partnerId,
  });

  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      partnerId: user.partnerId,
      partnerName: user.partner?.name || null,
    },
  });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 дней
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}