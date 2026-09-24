import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export const dynamic = 'force-dynamic';

function formatMoney(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function ReportsPage() {
  const scope = await getScope();
  if (!scope) return null;

  const reports = await prisma.royaltyReport.findMany({
    where: scopeWhere(scope),
    include: { partner: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Отчёты</h1>
        <Link
          href="/reports/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Новый расчёт роялти
        </Link>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900 text-sm">
        💡 Здесь вы рассчитываете роялти с чистой прибыли партнёров.
        Выручка подтягивается автоматически из воронки за выбранный период.
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-500 mb-4">Отчётов пока нет</p>
          <Link
            href="/reports/new"
            className="text-green-600 hover:underline font-medium"
          >
            Создать первый →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/reports/${r.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition p-5 block"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">
                    Период: {formatDate(r.periodStart)} —{' '}
                    {formatDate(r.periodEnd)}
                  </div>
                  <div className="text-sm text-slate-500">
                    Создан:{' '}
                    {new Date(r.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">Роялти</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatMoney(r.royaltyAmount)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {r.royaltyPercent}% от чистой прибыли
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm border-t border-slate-100 pt-3">
                <div>
                  <div className="text-slate-500">Выручка</div>
                  <div className="font-medium">{formatMoney(r.revenue)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Расходы</div>
                  <div className="font-medium">
                    {formatMoney(r.totalExpenses)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Чистая прибыль</div>
                  <div className="font-medium">{formatMoney(r.netProfit)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Налог</div>
                  <div className="font-medium">
                    {r.taxRate}% · {formatMoney(r.taxAmount)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}