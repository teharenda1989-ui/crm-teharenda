import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';
import ReportActions from '@/components/ReportActions';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('ru-RU');
}

export default async function ReportPage({ params }: Props) {
  const scope = await getScope();
  if (!scope) notFound();

  const report = await prisma.royaltyReport.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
    include: { partner: true },
  });

  if (!report) notFound();

  const orders = await prisma.order.findMany({
    where: {
      ...scopeWhere(scope),
      status: 'CLOSED',
      result: 'SUCCESS',
      closedAt: {
        gte: report.periodStart,
        lte: report.periodEnd,
      },
    },
    orderBy: { closedAt: 'asc' },
  });

  return (
    <div>
      <div className="mb-4 flex justify-between items-center gap-4 flex-wrap">
        <Link href="/reports" className="text-slate-500 hover:text-slate-900">
          ← Назад к отчётам
        </Link>

        <ReportActions
          reportId={report.id}
          summary={{
            periodStart: report.periodStart.toISOString(),
            periodEnd: report.periodEnd.toISOString(),
          }}
        />
      </div>

      <div id="report-content" className="bg-white p-2">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-1">Отчёт по роялти</h1>
              <p className="text-slate-500">
                Период: {formatDate(report.periodStart)} —{' '}
                {formatDate(report.periodEnd)}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Создан: {new Date(report.createdAt).toLocaleString('ru-RU')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Роялти к оплате</div>
              <div className="text-4xl font-bold text-green-700">
                {formatMoney(report.royaltyAmount)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {report.royaltyPercent}% от чистой прибыли
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Доходы</h2>
            <div className="space-y-2 text-sm">
              <Row
                label="Выручка диспетчера"
                value={formatMoney(report.revenue)}
                bold
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Расходы</h2>
            <div className="space-y-2 text-sm">
              <Row
                label={`Налог (${report.taxRate}%)`}
                value={formatMoney(report.taxAmount)}
              />
              <Row label="Зарплаты" value={formatMoney(report.salaries)} />
              <Row
                label="Аренда офиса"
                value={formatMoney(report.officeRent)}
              />
              <Row
                label="Связь и интернет"
                value={formatMoney(report.communications)}
              />
              <Row
                label={`Прочие расходы${
                  report.otherNote ? ` (${report.otherNote})` : ''
                }`}
                value={formatMoney(report.otherExpenses)}
              />
              <div className="border-t border-slate-200 pt-2 mt-2">
                <Row
                  label="Всего расходов"
                  value={formatMoney(report.totalExpenses)}
                  bold
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-slate-400 text-sm mb-1">Выручка</div>
              <div className="text-2xl font-bold">
                {formatMoney(report.revenue)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Расходы</div>
              <div className="text-2xl font-bold">
                {formatMoney(report.totalExpenses)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">
                Чистая прибыль
              </div>
              <div className="text-2xl font-bold text-green-400">
                {formatMoney(report.netProfit)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Успешные заявки периода ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <p className="text-slate-500">Заявок не найдено.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-left text-slate-500">
                  <tr>
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Дата</th>
                    <th className="pb-2 pr-4">Тип техники</th>
                    <th className="pb-2 pr-4">Город</th>
                    <th className="pb-2 pr-4">Диспетчер</th>
                    <th className="pb-2 pr-4">Телефон</th>
                    <th className="pb-2 pr-4 text-right">Оборот</th>
                    <th className="pb-2 text-right">Дисп.</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-400">{i + 1}</td>
                      <td className="py-2 pr-4 text-slate-500">
                        {o.closedAt ? formatDate(o.closedAt) : '—'}
                      </td>
                      <td className="py-2 pr-4">{o.category}</td>
                      <td className="py-2 pr-4 text-slate-500">
                        {o.city || '—'}
                      </td>
                      <td className="py-2 pr-4">{o.dispatcher}</td>
                      <td className="py-2 pr-4 text-slate-500">
                        {o.dispatcherPhone}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {o.orderAmount ? formatMoney(o.orderAmount) : '—'}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {o.commissionAmount
                          ? formatMoney(o.commissionAmount)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 font-semibold">
                  <tr>
                    <td colSpan={6} className="py-2 pr-4 text-right">
                      Итого:
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {formatMoney(
                        orders.reduce((s, o) => s + (o.orderAmount || 0), 0),
                      )}
                    </td>
                    <td className="py-2 text-right text-green-700">
                      {formatMoney(
                        orders.reduce(
                          (s, o) => s + (o.commissionAmount || 0),
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-slate-600">{label}</span>
      <span className={bold ? 'font-bold text-slate-900' : 'text-slate-900'}>
        {value}
      </span>
    </div>
  );
}