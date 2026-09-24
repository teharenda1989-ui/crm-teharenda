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

  const client = await prisma.client.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });

  if (!client) {
    return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const existing = await prisma.client.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
  }

  const body = await req.json();

  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.company !== undefined && { company: body.company || null }),
      ...(body.inn !== undefined && { inn: body.inn || null }),
      ...(body.kpp !== undefined && { kpp: body.kpp || null }),
      ...(body.ogrn !== undefined && { ogrn: body.ogrn || null }),
      ...(body.address !== undefined && { address: body.address || null }),
      ...(body.comment !== undefined && { comment: body.comment || null }),
      ...(body.bankName !== undefined && { bankName: body.bankName || null }),
      ...(body.bankAccount !== undefined && {
        bankAccount: body.bankAccount || null,
      }),
      ...(body.bankBik !== undefined && { bankBik: body.bankBik || null }),
      ...(body.bankCorrAccount !== undefined && {
        bankCorrAccount: body.bankCorrAccount || null,
      }),
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const existing = await prisma.client.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
  }

  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}