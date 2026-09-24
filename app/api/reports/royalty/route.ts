import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function GET() {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const reports = await prisma.royaltyReport.findMany({
    where: scopeWhere(scope),
    include: { partner: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json();

  const {
    periodStart,
    periodEnd,
    partnerId,
    taxRate,
    salaries,
    officeRent,
    communications,
    otherExpenses,
    otherNote,
    royaltyPercent,
  } = body;

  if (!periodStart || !periodEnd) {
    return NextResponse.json({ error: 'Укажите период' }, { status: 400 });
  }

  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  end.setHours(23, 59, 59, 999);

  // Выручка — только из заявок текущего пользователя
  const orders = await prisma.order.findMany({
    where: {
      ...scopeWhere(scope),
      status: 'CLOSED',
      result: 'SUCCESS',
      closedAt: { gte: start, lte: end },
    },
  });

  const revenue = orders.reduce(
    (sum, o) => sum + (o.commissionAmount || 0),
    0,
  );

  const taxAmountCalc = Math.round((revenue * (taxRate || 0)) / 100);

  const totalExpenses =
    taxAmountCalc +
    (salaries || 0) +
    (officeRent || 0) +
    (communications || 0) +
    (otherExpenses || 0);

  const netProfit = Math.max(0, revenue - totalExpenses);
  const royaltyAmount = Math.round((netProfit * (royaltyPercent || 0)) / 100);

  const report = await prisma.royaltyReport.create({
    data: {
      periodStart: start,
      periodEnd: end,
      // Партнёр создаёт отчёт для себя, супер-админ — для себя
      partnerId: scope.partnerId,
      revenue,
      taxRate: taxRate || 0,
      taxAmount: taxAmountCalc,
      salaries: salaries || 0,
      officeRent: officeRent || 0,
      communications: communications || 0,
      otherExpenses: otherExpenses || 0,
      otherNote: otherNote || null,
      totalExpenses,
      netProfit,
      royaltyPercent: royaltyPercent || 0,
      royaltyAmount,
    },
  });

  return NextResponse.json(report);
}