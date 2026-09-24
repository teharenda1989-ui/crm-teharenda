import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  // Проверяем, что группа принадлежит текущему пользователю
  const existing = await prisma.telegramGroup.findFirst({
    where: {
      id: params.id,
      ...scopeWhere(scope),
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Группа не найдена' }, { status: 404 });
  }

  const body = await req.json();

  const group = await prisma.telegramGroup.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(group);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const existing = await prisma.telegramGroup.findFirst({
    where: {
      id: params.id,
      ...scopeWhere(scope),
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Группа не найдена' }, { status: 404 });
  }

  await prisma.telegramGroup.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}