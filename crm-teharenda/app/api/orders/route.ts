import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';
import { sendToTelegram, buildOrderMessage } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'active';

  let where: any = { ...scopeWhere(scope) };

  if (filter === 'active') {
    where = { ...where, status: 'ACTIVE' };
  } else if (filter === 'success') {
    where = { ...where, status: 'CLOSED', result: 'SUCCESS' };
  } else if (filter === 'fail') {
    where = { ...where, status: 'CLOSED', result: 'FAIL' };
  } else if (filter === 'closed') {
    where = { ...where, status: 'CLOSED' };
  }
  // filter === 'all' — без доп. условий

  const orders = await prisma.order.findMany({
    where,
    include: {
      groups: { include: { group: true } },
      logs: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json();

  const {
    category,
    city,
    startAt,
    description,
    dispatcher,
    dispatcherPhone,
    groupIds,
    orderAmount,
    commissionAmount,
  } = body;

  // Валидация обязательных полей
  if (!category) {
    return NextResponse.json({ error: 'Укажите рубрику' }, { status: 400 });
  }
  if (!startAt) {
    return NextResponse.json(
      { error: 'Укажите дату и время' },
      { status: 400 },
    );
  }
  if (!dispatcher || !dispatcherPhone) {
    return NextResponse.json(
      { error: 'Укажите диспетчера' },
      { status: 400 },
    );
  }
  if (!orderAmount || Number(orderAmount) <= 0) {
    return NextResponse.json(
      { error: 'Укажите сумму оборота' },
      { status: 400 },
    );
  }
  if (!commissionAmount || Number(commissionAmount) <= 0) {
    return NextResponse.json(
      { error: 'Укажите диспетчерские' },
      { status: 400 },
    );
  }

  const startAtDate = new Date(startAt);
  if (isNaN(startAtDate.getTime())) {
    return NextResponse.json({ error: 'Неверная дата' }, { status: 400 });
  }

  // Человекочитаемая строка времени для Telegram
  const whenText = startAtDate.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Проверяем, что группы принадлежат пользователю
  let validGroupIds: string[] = [];
  if (groupIds?.length) {
    const allowed = await prisma.telegramGroup.findMany({
      where: {
        id: { in: groupIds },
        ...scopeWhere(scope),
      },
      select: { id: true },
    });
    validGroupIds = allowed.map((g) => g.id);
  }

  const order = await prisma.order.create({
    data: {
      category,
      city: city || null,
      startAt: startAtDate,
      when: whenText,
      description: description || null,
      dispatcher,
      dispatcherPhone,
      orderAmount: Number(orderAmount),
      commissionAmount: Number(commissionAmount),
      partnerId: scope.partnerId,
      groups: validGroupIds.length
        ? { create: validGroupIds.map((groupId) => ({ groupId })) }
        : undefined,
    },
    include: {
      groups: { include: { group: true } },
    },
  });

  const messageText = buildOrderMessage({
    category,
    city,
    when: whenText,
    description,
    dispatcher,
    dispatcherPhone,
  });

  const sendResults: { title: string; ok: boolean; error?: string }[] = [];

  for (const og of order.groups) {
    const group = og.group;
    if (!group.isActive) {
      sendResults.push({
        title: group.title,
        ok: false,
        error: 'Группа выключена',
      });
      continue;
    }

    const result = await sendToTelegram(group.chatId, messageText);

    await prisma.messageLog.create({
      data: {
        orderId: order.id,
        channel: 'telegram',
        target: group.title,
        chatId: group.chatId,
        messageId: result.messageId || null,
        text: messageText,
        status: result.ok ? 'sent' : 'error',
        error: result.error,
      },
    });

    sendResults.push({
      title: group.title,
      ok: result.ok,
      error: result.error,
    });
  }

  return NextResponse.json({ order, sendResults });
}