import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { period?: string; from?: string; to?: string };
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}

function getPeriodRange(period: string, from?: string, to?: string) {
  const now = new Date();

  if (period === 'custom' && from && to) {
    return {
      start: new Date(from),
      end: new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000),
      label: `${from} — ${to}`,
    };
  }

  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { start, end: now, label: 'Последние 7 дней' };
  }

  if (period === 'quarter') {
    const start = new Date(now);
    start.setDate(now.getDate() - 90);
    return { start, end: now, label: 'Последние 90 дней' };
  }

  if (period === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end: now, label: 'Текущий год' };
  }

  if (period === 'all') {
    return { start: new Date(0), end: now, label: 'Всё время' };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end: now, label: 'Текущий месяц' };
}

export default async function FunnelPage({ searchParams }: Props) {
  const scope = await getScope();
  if (!scope) return null;

  const period = searchParams.period || 'month';
  const { start, end, label } = getPeriodRange(
    period,
    searchParams.from,
    searchParams.to,
  );

  const orders = await prisma.order.findMany({
    where: {
      ...scopeWhere(scope),
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  const total = orders.length;
  const active = orders.filter((o) => o.status === 'ACTIVE').length;
  const closed = orders.filter((o) => o.status === 'CLOSED').length;
  const success = orders.filter((o) => o.result === 'SUCCESS').length;
  const fail = orders.filter((o) => o.result === 'FAIL').length;

  const turnover = orders
    .filter((o) => o.result === 'SUCCESS')
    .reduce((s, o) => s + (o.orderAmount || 0), 0);

  const commission = orders
    .filter((o) => o.result === 'SUCCESS')
    .reduce((s, o) => s + (o.commissionAmount || 0), 0);

  const conversion = closed > 0 ? Math.round((success / closed) * 100) : 0;

  const periods = [
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'quarter', label: 'Квартал' },
    { key: 'year', label: 'Год' },
    { key: 'all', label: 'Всё время' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Воронка продаж</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-2 items-center">
        <span className="text-sm text-slate-500 mr-2">Период:</span>
        {periods.map((p) => (
          <Link
            key={p.key}
            href={`/funnel?period=${p.key}`}
            className={`px-4 py-2 rounded text-sm ${
              period === p.key
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 hover:bg-slate-100'
            }`}
          >
            {p.label}
          </Link>
        ))}
        <span className="ml-auto text-sm text-slate-500">{label}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Всего заявок"
          value={String(total)}
          icon="📋"
          color="bg-slate-50"
        />
        <MetricCard
          title="В работе"
          value={String(active)}
          icon="⏳"
          color="bg-yellow-50"
        />
        <MetricCard
          title="Успешных"
          value={String(success)}
          icon="✅"
          color="bg-green-50"
          subtitle={`из ${closed} закрытых`}
        />
        <MetricCard
          title="Без сделки"
          value={String(fail)}
          icon="❌"
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Конверсия"
          value={`${conversion}%`}
          icon="📈"
          color="bg-blue-50"
          subtitle="успешных из закрытых"
        />
        <MetricCard
          title="Оборот"
          value={formatMoney(turnover)}
          icon="💰"
          color="bg-emerald-50"
          subtitle="по успешным заявкам"
        />
        <MetricCard
          title="Диспетчерская выручка"
          value={formatMoney(commission)}
          icon="📊"
          color="bg-indigo-50"
          subtitle="по успешным заявкам"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Последние заявки периода</h2>

        {orders.length === 0 ? (
          <p className="text-slate-500">Заявок за этот период нет.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <th className="pb-2 pr-4">Дата</th>
                  <th className="pb-2 pr-4">Тип</th>
                  <th className="pb-2 pr-4">Город</th>
                  <th className="pb-2 pr-4">Статус</th>
                  <th className="pb-2 pr-4 text-right">Оборот</th>
                  <th className="pb-2 text-right">Дисп.</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((o) => (
                    <tr key={o.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="py-2 pr-4">{o.category}</td>
                      <td className="py-2 pr-4 text-slate-500">
                        {o.city || '—'}
                      </td>
                      <td className="py-2 pr-4">
                        {o.result === 'SUCCESS' && (
                          <span className="text-green-700">✅ Успешно</span>
                        )}
                        {o.result === 'FAIL' && (
                          <span className="text-red-700">❌ Без сделки</span>
                        )}
                        {!o.result && o.status === 'ACTIVE' && (
                          <span className="text-yellow-700">⏳ В работе</span>
                        )}
                        {!o.result && o.status === 'CLOSED' && (
                          <span className="text-slate-500">🔒 Закрыта</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {o.orderAmount ? formatMoney(o.orderAmount) : '—'}
                      </td>
                      <td className="py-2 text-right">
                        {o.commissionAmount
                          ? formatMoney(o.commissionAmount)
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className={`rounded-lg shadow p-5 ${color}`}>
      <div className="text-sm text-slate-600 mb-1">
        {icon} {title}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subtitle && (
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}