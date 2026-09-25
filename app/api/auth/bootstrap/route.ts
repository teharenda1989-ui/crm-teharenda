import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  const expectedSecret = process.env.BOOTSTRAP_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Администратор';

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Неверный секрет' }, { status: 403 });
  }

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: 'ADMIN_EMAIL или ADMIN_PASSWORD не заданы в переменных' },
      { status: 400 },
    );
  }

  if (adminPassword.length < 6) {
    return NextResponse.json(
      { error: 'Пароль минимум 6 символов' },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Ищем по роли SUPER_ADMIN — не важно, какой был email
    const existing = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: adminEmail,
          name: adminName,
          passwordHash,
          isActive: true,
        },
      });
      return NextResponse.json({
        ok: true,
        message: 'Главный админ обновлён',
        email: adminEmail,
      });
    }

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Главный админ создан',
      email: adminEmail,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}