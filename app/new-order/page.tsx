'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Owner {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  city: string | null;
  vehicles: { id: string; category: string }[];
}

interface Group {
  id: string;
  title: string;
  category: string | null;
}

export default function NewOrderPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>([]);
  const [allOwners, setAllOwners] = useState<Owner[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [startAt, setStartAt] = useState('');
  const [description, setDescription] = useState('');
  const [dispatcher, setDispatcher] = useState('');
  const [dispatcherPhone, setDispatcherPhone] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/owners')
      .then((r) => r.json())
      .then((data: Owner[]) => {
        setAllOwners(data);
        const cats = new Set<string>();
        data.forEach((o) => o.vehicles.forEach((v) => cats.add(v.category)));
        setCategories(Array.from(cats).sort());
      });

    fetch('/api/groups')
      .then((r) => r.json())
      .then((data: Group[]) => setGroups(data))
      .catch(() => setGroups([]));
  }, []);

  const matchingOwners = category
    ? allOwners.filter((o) =>
        o.vehicles.some((v) => v.category === category),
      )
    : [];

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderAmount || Number(orderAmount) <= 0) {
      setError('Укажите сумму оборота');
      return;
    }
    if (!commissionAmount || Number(commissionAmount) <= 0) {
      setError('Укажите диспетчерские');
      return;
    }
    if (selectedGroups.length === 0) {
      setError('Выберите хотя бы одну группу для отправки');
      return;
    }

    setSending(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          city,
          startAt,
          description,
          dispatcher,
          dispatcherPhone,
          groupIds: selectedGroups,
          orderAmount: Number(orderAmount),
          commissionAmount: Number(commissionAmount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка отправки');
      }

      setSuccess(true);
      setTimeout(() => router.push('/orders'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Заявка создана</h1>
        <p className="text-slate-500">Перенаправляем к списку...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Новая заявка</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Что нужно</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Рубрика <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border border-slate-300 rounded px-3 py-2"
              >
                <option value="">— Выберите рубрику —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Город</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Москва"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">
                Дата и время <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">
                Детали
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Работа на день, оплата по договорённости..."
                rows={3}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Финансы</h2>
          <p className="text-sm text-slate-500 mb-4">
            Обязательные поля. В Telegram не отправляются.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                💰 Сумма оборота, ₽ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                required
                min="1"
                placeholder="20000"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                📊 Диспетчерские, ₽ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={commissionAmount}
                onChange={(e) => setCommissionAmount(e.target.value)}
                required
                min="1"
                placeholder="2000"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Диспетчер</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dispatcher}
                onChange={(e) => setDispatcher(e.target.value)}
                required
                placeholder="Иван"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dispatcherPhone}
                onChange={(e) => setDispatcherPhone(e.target.value)}
                required
                placeholder="+7 999 123-45-67"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Куда отправить (Telegram-группы){' '}
            <span className="text-red-500">*</span>
          </h2>

          {groups.length === 0 ? (
            <p className="text-slate-500 text-sm">
              Нет добавленных групп. Добавьте их в разделе «Группы».
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {groups.map((g) => (
                <label
                  key={g.id}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(g.id)}
                    onChange={() => toggleGroup(g.id)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">{g.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {category && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">
              Подходящие владельцы ({matchingOwners.length})
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Справочно. При отправке в группу они увидят заявку сами.
            </p>

            {matchingOwners.length === 0 ? (
              <p className="text-slate-500">Нет владельцев с такой рубрикой.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {matchingOwners.map((o) => (
                  <div
                    key={o.id}
                    className="border border-slate-200 rounded p-3 text-sm"
                  >
                    <div className="font-medium">{o.name}</div>
                    {o.company && (
                      <div className="text-slate-500">{o.company}</div>
                    )}
                    <div className="text-slate-500">📞 {o.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sending}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {sending ? 'Отправляем...' : '📨 Создать и отправить'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/orders')}
            className="px-6 py-3 rounded border border-slate-300 hover:bg-slate-100"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}