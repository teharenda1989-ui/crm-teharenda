'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: string;
  category: string;
  city: string | null;
  when: string | null;
  startAt: string | null;
  description: string | null;
  dispatcher: string;
  dispatcherPhone: string;
  status: string;
  result: string | null;
  closedInTelegram: boolean;
  assigneeName: string | null;
  assigneePhone: string | null;
  orderAmount: number | null;
  commissionAmount: number | null;
  createdAt: string;
  groups: { group: { title: string; chatId: string } }[];
}

interface Owner {
  id: string;
  name: string;
  phone: string;
  company: string | null;
}

function toLocalDatetime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function OrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerSuggest, setOwnerSuggest] = useState<Owner | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data))
      .finally(() => setLoading(false));

    fetch('/api/owners')
      .then((r) => r.json())
      .then((data) => setOwners(data))
      .catch(() => {});
  }, [id]);

  // Подтягиваем владельца по телефону исполнителя
  useEffect(() => {
    if (!order?.assigneePhone) {
      setOwnerSuggest(null);
      return;
    }
    const digits = order.assigneePhone.replace(/\D/g, '');
    if (digits.length < 10) {
      setOwnerSuggest(null);
      return;
    }
    const found = owners.find((o) => o.phone.replace(/\D/g, '') === digits);
    setOwnerSuggest(found || null);
  }, [order?.assigneePhone, owners]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setError('');
    setSaved(false);
    setSaving(true);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: order.category,
          city: order.city,
          description: order.description,
          dispatcher: order.dispatcher,
          dispatcherPhone: order.dispatcherPhone,
          assigneeName: order.assigneeName,
          assigneePhone: order.assigneePhone,
          orderAmount: order.orderAmount,
          commissionAmount: order.commissionAmount,
          startAt: order.startAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSearch = async () => {
    if (!order) return;

    // Мягкое предупреждение, если исполнителя нет
    if (!order.assigneeName || !order.assigneePhone) {
      const ok = confirm(
        'Исполнитель не указан. Всё равно закрыть поиск в группах?\n\n' +
          'Сообщения в Telegram будут помечены как закрытые. Заявка перейдёт в статус "В работе".',
      );
      if (!ok) return;
    } else {
      if (
        !confirm(
          'Закрыть поиск в группах? Заявка перейдёт в статус "В работе".',
        )
      )
        return;
    }

    // Сначала сохраняем текущие изменения
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: order.category,
          city: order.city,
          description: order.description,
          dispatcher: order.dispatcher,
          dispatcherPhone: order.dispatcherPhone,
          assigneeName: order.assigneeName,
          assigneePhone: order.assigneePhone,
          orderAmount: order.orderAmount,
          commissionAmount: order.commissionAmount,
          startAt: order.startAt,
        }),
      });
    } catch {
      // Если не удалось сохранить — всё равно пробуем закрыть
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}/close`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      router.refresh();
      const r = await fetch(`/api/orders/${id}`).then((r) => r.json());
      setOrder(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReopen = async () => {
    if (!confirm('Открыть поиск заново?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}/reopen`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      const r = await fetch(`/api/orders/${id}`).then((r) => r.json());
      setOrder(r);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (result: 'SUCCESS' | 'FAIL') => {
    const text =
      result === 'SUCCESS'
        ? 'Завершить заявку как УСПЕШНУЮ?'
        : 'Завершить заявку как БЕЗ СДЕЛКИ?';
    if (!confirm(text)) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      const r = await fetch(`/api/orders/${id}`).then((r) => r.json());
      setOrder(r);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить заявку? Действие необратимо.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      router.push('/orders');
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500">Загрузка...</div>;
  if (!order) return <div className="text-slate-500">Заявка не найдена</div>;

  const isFullyClosed = order.status === 'CLOSED';

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-between items-center gap-4 flex-wrap">
        <Link href="/orders" className="text-slate-500 hover:text-slate-900">
          ← Назад к заявкам
        </Link>
        <button
          onClick={handleDelete}
          disabled={saving}
          className="text-sm px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
        >
          🗑 Удалить заявку
        </button>
      </div>

      {/* Шапка со статусом */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-2">{order.category}</h1>
            <div className="flex gap-2 flex-wrap">
              {order.status === 'ACTIVE' && !order.closedInTelegram && (
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium">
                  🆕 Новая — поиск открыт
                </span>
              )}
              {order.status === 'ACTIVE' &&
                order.closedInTelegram &&
                order.assigneeName && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-medium">
                    ⏳ В работе
                  </span>
                )}
              {order.status === 'ACTIVE' &&
                order.closedInTelegram &&
                !order.assigneeName && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded font-medium">
                    ⏳ В работе · исполнитель не указан
                  </span>
                )}
              {order.result === 'SUCCESS' && (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-medium">
                  ✅ Успешно
                </span>
              )}
              {order.result === 'FAIL' && (
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-medium">
                  ❌ Без сделки
                </span>
              )}
            </div>
          </div>

          <div className="text-sm text-slate-500 text-right">
            <div>
              Создана: {new Date(order.createdAt).toLocaleString('ru-RU')}
            </div>
            {order.groups.length > 0 && (
              <div className="mt-1">
                Отправлено в:{' '}
                {order.groups.map((g) => g.group.title).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Форма редактирования */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Данные заявки</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Рубрика *
              </label>
              <input
                type="text"
                value={order.category}
                onChange={(e) =>
                  setOrder({ ...order, category: e.target.value })
                }
                required
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Город
              </label>
              <input
                type="text"
                value={order.city || ''}
                onChange={(e) => setOrder({ ...order, city: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">
                Дата и время *
              </label>
              <input
                type="datetime-local"
                value={toLocalDatetime(order.startAt)}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    startAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">
                Детали
              </label>
              <textarea
                value={order.description || ''}
                onChange={(e) =>
                  setOrder({ ...order, description: e.target.value })
                }
                rows={3}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Исполнитель */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Исполнитель</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Имя</label>
              <input
                type="text"
                value={order.assigneeName || ''}
                onChange={(e) =>
                  setOrder({ ...order, assigneeName: e.target.value })
                }
                placeholder="Иван Петров"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Телефон
              </label>
              <input
                type="text"
                value={order.assigneePhone || ''}
                onChange={(e) =>
                  setOrder({ ...order, assigneePhone: e.target.value })
                }
                placeholder="+7 999 123-45-67"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            {ownerSuggest && (
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <div className="text-blue-900 font-medium mb-1">
                  🔍 Найден в базе владельцев:
                </div>
                <div className="text-slate-700">
                  <b>{ownerSuggest.name}</b>
                  {ownerSuggest.company && ` · ${ownerSuggest.company}`}
                  <button
                    type="button"
                    onClick={() =>
                      setOrder({ ...order, assigneeName: ownerSuggest.name })
                    }
                    className="ml-3 text-blue-600 hover:underline text-xs"
                  >
                    Подставить имя
                  </button>
                </div>
              </div>
            )}

            {order.assigneePhone &&
              order.assigneePhone.replace(/\D/g, '').length >= 10 &&
              !ownerSuggest && (
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-600">
                  Владелец с таким телефоном не найден в базе
                </div>
              )}
          </div>
        </div>

        {/* Финансы */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Финансы</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                💰 Сумма оборота, ₽ *
              </label>
              <input
                type="number"
                value={order.orderAmount ?? ''}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    orderAmount: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                required
                min="1"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                📊 Диспетчерские, ₽ *
              </label>
              <input
                type="number"
                value={order.commissionAmount ?? ''}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    commissionAmount: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                required
                min="1"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Диспетчер */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Диспетчер</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Имя</label>
              <input
                type="text"
                value={order.dispatcher}
                onChange={(e) =>
                  setOrder({ ...order, dispatcher: e.target.value })
                }
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Телефон
              </label>
              <input
                type="text"
                value={order.dispatcherPhone}
                onChange={(e) =>
                  setOrder({ ...order, dispatcherPhone: e.target.value })
                }
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3">
            {error}
          </div>
        )}

        {/* Кнопки действий */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving || isFullyClosed}
            className="bg-slate-900 text-white px-6 py-3 rounded hover:bg-slate-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Сохраняем...' : saved ? '✅ Сохранено' : '💾 Сохранить'}
          </button>

          {order.status === 'ACTIVE' && !order.closedInTelegram && (
            <button
              type="button"
              onClick={handleCloseSearch}
              disabled={saving}
              className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded hover:bg-yellow-200 font-medium"
            >
              🔒 Закрыть поиск в Telegram
            </button>
          )}

          {order.status === 'ACTIVE' && order.closedInTelegram && (
            <>
              <button
                type="button"
                onClick={() => handleComplete('SUCCESS')}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-medium"
              >
                ✅ Завершить успешно
              </button>
              <button
                type="button"
                onClick={() => handleComplete('FAIL')}
                disabled={saving}
                className="bg-red-50 text-red-700 px-6 py-3 rounded hover:bg-red-100 font-medium"
              >
                ❌ Без сделки
              </button>
              <button
                type="button"
                onClick={handleReopen}
                disabled={saving}
                className="bg-white border border-slate-300 px-6 py-3 rounded hover:bg-slate-100"
              >
                🔓 Переоткрыть поиск
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}