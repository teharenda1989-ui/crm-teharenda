import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function GET() {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const groups = await prisma.telegramGroup.findMany({
    where: scopeWhere(scope),
    orderBy: [{ messenger: 'asc' }, { title: 'asc' }],
  });

  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json();

  if (!body.title || !body.chatId) {
    return NextResponse.json(
      { error: 'Укажите название и chatId' },
      { status: 400 },
    );
  }

  const messenger = body.messenger === 'max' ? 'max' : 'telegram';

  const partnerId = scope.isSuperAdmin
    ? body.partnerId || null
    : scope.partnerId;

  try {
    const group = await prisma.telegramGroup.create({
      data: {
        title: body.title,
        chatId: String(body.chatId),
        category: body.category || null,
        isActive: body.isActive ?? true,
        messenger,
        partnerId,
      },
    });
    return NextResponse.json(group);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Такая группа уже добавлена (chatId должен быть уникальным)' },
      { status: 400 },
    );
  }
}
