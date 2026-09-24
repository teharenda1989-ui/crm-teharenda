import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  }

  const partners = await prisma.partner.findMany({
    include: {
      users: {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          lastLoginAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  }

  const body = await req.json();
  const { name, city, phone, royaltyPercent, comment, createUser, userEmail, userPassword, userName } = body;

  if (!name) {
    return NextResponse.json({ error: 'Укажите название партнёра' }, { status: 400 });
  }

  // Проверяем email, если создаём учётку
  if (createUser) {
    if (!userEmail || !userPassword || !userName) {
      return NextResponse.json(
        { error: 'Заполните email, пароль и имя пользователя' },
        { status: 400 },
      );
    }
    if (userPassword.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть минимум 6 символов' },
        { status: 400 },
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: String(userEmail).toLowerCase().trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 },
      );
    }
  }

  try {
    // Создаём партнёра
    const partner = await prisma.partner.create({
      data: {
        name,
        email: createUser ? String(userEmail).toLowerCase().trim() : null,
        phone: phone || null,
        city: city || null,
        royaltyPercent: royaltyPercent ? Number(royaltyPercent) : 3,
        comment: comment || null,
      },
    });

    // Создаём учётку, если нужно
    if (createUser) {
      const passwordHash = await bcrypt.hash(userPassword, 10);
      await prisma.user.create({
        data: {
          email: String(userEmail).toLowerCase().trim(),
          passwordHash,
          name: userName,
          role: 'PARTNER',
          isActive: true,
          partnerId: partner.id,
        },
      });
    }

    return NextResponse.json(partner);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Ошибка создания: ' + e.message },
      { status: 400 },
    );
  }
}