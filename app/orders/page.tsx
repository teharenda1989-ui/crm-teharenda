import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';
import AutoRefresh from '@/components/AutoRefresh';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: { filter?: string };
}

function formatMoney(n?: number | null) {
  if (!n) return '—';
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}

export default async function OrdersPage({ searchParams }: Props) {
  const scope = await getScope();
  if (!scope) return null;

  const filter = searchParams.filter || 'active';

  let statusFilter: any = {};
  if (filter === 'active') statusFilter = { status: 'ACTIVE' };
  else if (filter === 'success')
    statusFilter = { status: 'CLOSED', result: 'SUCCESS' };
  else if (filter === 'fail')
    statusFilter = { status: 'CLOSED', result: 'FAIL' };

  const orders = await prisma.order.findMany({
    where: { ...scopeWhere(scope), ...statusFilter },
    include: { groups: { include: { group: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const tabs = [
    { key: 'active', label: '🟢 Активные' },
    { key: 'success', label: '✅ Успешные' },
    { key: 'fail', label: '❌ Без сделки' },
    { key: 'all', label: '📋 Все' },
  ];

  return (
    <div>
      <AutoRefresh interval={4000} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Заявки</h1>
        <Link
          href="/new-order"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Новая заявка
        </Link>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/orders?filter=${t.key}`}
            className={`px-4 py-2 rounded text-sm ${
              filter === t.key
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Заявок нет
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const isFullyClosed = order.status === 'CLOSED';
            const isInWork =
              order.status === 'ACTIVE' && order.closedInTelegram;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className={`rounded-lg shadow hover:shadow-md transition p-5 block ${
                  isFullyClosed ? 'bg-slate-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className={`font-semibold text-lg ${
                          isFullyClosed ? 'text-slate-500' : ''
                        }`}
                      >
                        {order.category}
                      </span>
                      {order.city && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {order.city}
                        </span>
                      )}

                      {order.status === 'ACTIVE' && !order.closedInTelegram && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                          🆕 Новая
                        </span>
                      )}
                      {isInWork && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                          ⏳ В работе
                        </span>
                      )}
                      {order.result === 'SUCCESS' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                          ✅ Успешно
                        </span>
                      )}
                      {order.result === 'FAIL' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                          ❌ Без сделки
                        </span>
                      )}
                    </div>

                    <div className="text-slate-700 mb-1">
                      🕐 {order.when || '—'}
                    </div>

                    {order.description && (
                      <div className="text-sm text-slate-500 mb-2">
                        {order.description}
                      </div>
                    )}

                    <div className="text-sm text-slate-500">
                      Диспетчер: {order.dispatcher} · {order.dispatcherPhone}
                    </div>

                    {order.assigneeName && (
                      <div className="text-sm text-slate-700 mt-1">
                        🚜 Исполнитель: <b>{order.assigneeName}</b> ·{' '}
                        {order.assigneePhone}
                      </div>
                    )}

                    <div className="text-sm mt-2 flex gap-4 flex-wrap">
                      <span className="text-slate-700">
                        💰 Оборот: <b>{formatMoney(order.orderAmount)}</b>
                      </span>
                      <span className="text-slate-700">
                        📊 Диспетчерские:{' '}
                        <b>{formatMoney(order.commissionAmount)}</b>
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
