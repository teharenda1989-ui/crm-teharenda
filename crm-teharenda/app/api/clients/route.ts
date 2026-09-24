import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function GET(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;

  const clients = await prisma.client.findMany({
    where: {
      ...scopeWhere(scope),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { company: { contains: search } },
          { phone: { contains: search } },
          { inn: { contains: search } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json();
  const name = body.name || body.company;

  if (!name) {
    return NextResponse.json(
      { error: 'Укажите название компании' },
      { status: 400 },
    );
  }

  const client = await prisma.client.create({
    data: {
      name,
      phone: body.phone || null,
      email: body.email || null,
      company: body.company || null,
      inn: body.inn || null,
      kpp: body.kpp || null,
      ogrn: body.ogrn || null,
      address: body.address || null,
      comment: body.comment || null,
      bankName: body.bankName || null,
      bankAccount: body.bankAccount || null,
      bankBik: body.bankBik || null,
      bankCorrAccount: body.bankCorrAccount || null,
      partnerId: scope.partnerId,
    },
  });

  return NextResponse.json(client);
}