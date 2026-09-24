import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = body.result === 'FAIL' ? 'FAIL' : 'SUCCESS';

  const order = await prisma.order.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });

  if (!order) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  if (order.status === 'CLOSED') {
    return NextResponse.json({ error: 'Заявка уже закрыта' }, { status: 400 });
  }

  // Если поиск в ТГ не закрыт — закрываем принудительно? Нет, требуем сначала закрыть поиск
  if (!order.closedInTelegram) {
    return NextResponse.json(
      {
        error:
          'Сначала закройте поиск в Telegram (кнопка «Закрыть поиск»)',
      },
      { status: 400 },
    );
  }

  await prisma.order.update({
    where: { id: params.id },
    data: {
      status: 'CLOSED',
      result,
      closedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, result });
}