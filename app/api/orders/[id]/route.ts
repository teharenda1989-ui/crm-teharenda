import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
    include: {
      groups: { include: { group: true } },
      logs: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const existing = await prisma.order.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  const body = await req.json();

  const data: any = {};

  if (body.category !== undefined) data.category = body.category;
  if (body.city !== undefined) data.city = body.city || null;
  if (body.description !== undefined)
    data.description = body.description || null;
  if (body.dispatcher !== undefined) data.dispatcher = body.dispatcher;
  if (body.dispatcherPhone !== undefined)
    data.dispatcherPhone = body.dispatcherPhone;

  if (body.orderAmount !== undefined) {
    const n = Number(body.orderAmount);
    if (!n || n <= 0)
      return NextResponse.json(
        { error: 'Сумма оборота должна быть больше 0' },
        { status: 400 },
      );
    data.orderAmount = n;
  }

  if (body.commissionAmount !== undefined) {
    const n = Number(body.commissionAmount);
    if (!n || n <= 0)
      return NextResponse.json(
        { error: 'Диспетчерские должны быть больше 0' },
        { status: 400 },
      );
    data.commissionAmount = n;
  }

  if (body.assigneeName !== undefined)
    data.assigneeName = body.assigneeName || null;
  if (body.assigneePhone !== undefined)
    data.assigneePhone = body.assigneePhone || null;

  if (body.startAt !== undefined) {
    const d = new Date(body.startAt);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: 'Неверная дата' }, { status: 400 });
    }
    data.startAt = d;
    data.when = d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data,
    include: {
      groups: { include: { group: true } },
    },
  });

  return NextResponse.json(order);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const existing = await prisma.order.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  // Сначала удаляем связанные записи
  await prisma.messageLog.deleteMany({ where: { orderId: params.id } });
  await prisma.orderGroup.deleteMany({ where: { orderId: params.id } });

  // Потом саму заявку
  await prisma.order.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
