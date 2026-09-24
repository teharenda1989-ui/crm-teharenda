import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const email = 'admin@teharenda.pro';
    const password = 'password';
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: { passwordHash, role: 'SUPER_ADMIN', isActive: true },
      });
      return NextResponse.json({
        ok: true,
        message: 'Пароль обновлён',
        email,
        password,
      });
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Михаил',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Админ создан',
      email,
      password,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 },
    );
  }
}