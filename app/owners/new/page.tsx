'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  'Автокран',
  'Автовышка',
  'Автобетононасос',
  'Бортовой грузовик',
  'Бульдозер',
  'Гидромолот',
  'Длинномер',
  'Каток дорожный',
  'Контейнеровоз',
  'Манипулятор (самогруз)',
  'Минипогрузчик',
  'Миниэкскаватор',
  'Самосвал',
  'Трал',
  'Фронтальный погрузчик',
  'Экскаватор',
  'Экскаватор-погрузчик',
  'Ямобур',
  'Другое',
];

export default function NewOwnerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    company: '',
    city: '',
    address: '',
    comment: '',
    notes: '',
  });

  const [vehicles, setVehicles] = useState<
    { category: string; comment: string }[]
  >([{ category: '', comment: '' }]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vehicles: vehicles.filter((v) => v.category),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      router.push(`/owners/${data.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateVehicle = (
    i: number,
    field: 'category' | 'comment',
    value: string,
  ) => {
    const next = [...vehicles];
    next[i][field] = value;
    setVehicles(next);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link href="/owners" className="text-slate-500 hover:text-slate-900">
          ← Назад к списку
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Новый владелец</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Контакты</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Николай"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="89288818997"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Компания
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="ООО Ромашка"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Город</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Владивосток"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">
                Адрес базы
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="ул. Промышленная, 5"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Адрес будет автоматически найден на карте после сохранения.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Техника</h2>
            <button
              type="button"
              onClick={() =>
                setVehicles([...vehicles, { category: '', comment: '' }])
              }
              className="text-sm text-green-600 hover:underline"
            >
              + Добавить единицу
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {vehicles.map((v, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start"
              >
                <select
                  value={v.category}
                  onChange={(e) =>
                    updateVehicle(i, 'category', e.target.value)
                  }
                  className="border border-slate-300 rounded px-3 py-2"
                >
                  <option value="">— Рубрика —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={v.comment}
                  onChange={(e) => updateVehicle(i, 'comment', e.target.value)}
                  placeholder="Характеристики: ковш 0.8 · цена 3000/час"
                  className="border border-slate-300 rounded px-3 py-2"
                />

                {vehicles.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setVehicles(vehicles.filter((_, idx) => idx !== i))
                    }
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Дополнительно</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Комментарий (служебный)
              </label>
              <input
                type="text"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Например, работает только по выходным"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Дополнительная информация
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                placeholder="Доп. оборудование на технике, особенности работы, условия..."
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Сохраняем (ищем адрес на карте)...' : '💾 Сохранить'}
          </button>
          <Link
            href="/owners"
            className="px-6 py-3 rounded border border-slate-300 hover:bg-slate-100 inline-flex items-center"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}