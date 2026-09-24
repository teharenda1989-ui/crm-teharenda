import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';
import {
  editTelegramMessage,
  buildClosedOrderMessage,
} from '@/lib/telegram';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
    include: { logs: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  if (order.closedInTelegram) {
    return NextResponse.json(
      { error: 'Поиск уже закрыт в Telegram' },
      { status: 400 },
    );
  }

  const closedText = buildClosedOrderMessage({
    category: order.category,
    city: order.city,
    when: order.when || '',
    description: order.description,
    dispatcher: order.dispatcher,
    dispatcherPhone: order.dispatcherPhone,
  });

  const seen = new Set<string>();
  const targets: { chatId: string; messageId: string }[] = [];
  for (const log of order.logs) {
    if (!log.chatId || !log.messageId) continue;
    const key = `${log.chatId}:${log.messageId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ chatId: log.chatId, messageId: log.messageId });
  }

  for (const t of targets) {
    const res = await editTelegramMessage(t.chatId, t.messageId, closedText);
    if (res.error && res.error.includes('Too Many Requests')) break;
    await new Promise((r) => setTimeout(r, 300));
  }

  await prisma.order.update({
    where: { id: params.id },
    data: {
      closedInTelegram: true,
      closedInTelegramAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}