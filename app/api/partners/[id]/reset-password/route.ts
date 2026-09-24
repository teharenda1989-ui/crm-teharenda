import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  }

  const body = await req.json();
  const { newPassword } = body;

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'Пароль минимум 6 символов' },
      { status: 400 },
    );
  }

  const users = await prisma.user.findMany({
    where: { partnerId: params.id },
  });

  if (users.length === 0) {
    return NextResponse.json(
      { error: 'У партнёра нет учётной записи' },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.updateMany({
    where: { partnerId: params.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}