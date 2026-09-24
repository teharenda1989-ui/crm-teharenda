import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function GET(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'Укажите from и to' }, { status: 400 });
  }

  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      ...scopeWhere(scope),
      status: 'CLOSED',
      result: 'SUCCESS',
      closedAt: { gte: start, lte: end },
    },
    orderBy: { closedAt: 'asc' },
  });

  const revenue = orders.reduce(
    (sum, o) => sum + (o.commissionAmount || 0),
    0,
  );

  const turnover = orders.reduce(
    (sum, o) => sum + (o.orderAmount || 0),
    0,
  );

  return NextResponse.json({
    revenue,
    turnover,
    count: orders.length,
    orders: orders.map((o) => ({
      id: o.id,
      category: o.category,
      city: o.city,
      dispatcher: o.dispatcher,
      dispatcherPhone: o.dispatcherPhone,
      orderAmount: o.orderAmount,
      commissionAmount: o.commissionAmount,
      closedAt: o.closedAt,
      createdAt: o.createdAt,
    })),
  });
}