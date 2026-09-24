import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const allOrders = await prisma.order.findMany({
    include: { logs: { orderBy: { createdAt: 'asc' } } },
  });

  let deleted = 0;

  for (const order of allOrders) {
    if (order.logs.length <= 2) continue;

    // Оставляем первый лог (отправка) и последний (последнее действие)
    const first = order.logs[0];
    const last = order.logs[order.logs.length - 1];

    const toDelete = order.logs.filter(
      (l) => l.id !== first.id && l.id !== last.id,
    );

    if (toDelete.length > 0) {
      await prisma.messageLog.deleteMany({
        where: { id: { in: toDelete.map((l) => l.id) } },
      });
      deleted += toDelete.length;
    }
  }

  return NextResponse.json({ ok: true, deleted });
}