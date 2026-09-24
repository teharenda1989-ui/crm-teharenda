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

  const report = await prisma.royaltyReport.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
    include: { partner: true },
  });

  if (!report) {
    return NextResponse.json({ error: 'Отчёт не найден' }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const existing = await prisma.royaltyReport.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Отчёт не найден' }, { status: 404 });
  }

  await prisma.royaltyReport.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}