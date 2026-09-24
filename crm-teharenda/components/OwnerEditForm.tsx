'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Owner {
  id: string;
  name: string;
  phone: string;
  company: string | null;
  city: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  comment: string | null;
  notes: string | null;
  isActive: boolean;
}

export default function OwnerEditForm({ owner }: { owner: Owner }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: owner.name,
    company: owner.company || '',
    city: owner.city || '',
    address: owner.address || '',
    comment: owner.comment || '',
    notes: owner.notes || '',
    isActive: owner.isActive,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const hasCoords =
    typeof owner.lat === 'number' && typeof owner.lng === 'number';
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        owner.lng! - 0.01
      }%2C${owner.lat! - 0.01}%2C${owner.lng! + 0.01}%2C${
        owner.lat! + 0.01
      }&layer=mapnik&marker=${owner.lat}%2C${owner.lng}`
    : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);

    try {
      const res = await fetch(`/api/owners/${owner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Удалить владельца? Вместе с ним удалятся все его единицы техники. Действие необратимо.',
      )
    )
      return;

    setDeleting(true);
    try {
      await fetch(`/api/owners/${owner.id}`, { method: 'DELETE' });
      router.push('/owners');
    } catch (e: any) {
      setError(e.message);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Контакты</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-slate-600">
              Работает
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Имя</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Телефон
            </label>
            <input
              type="text"
              value={owner.phone}
              disabled
              className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Телефон изменить нельзя
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Компания
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Город</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
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
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              💡 При сохранении адрес будет автоматически найден на карте.
            </p>
          </div>

          {mapSrc && (
            <div className="md:col-span-2 rounded overflow-hidden border border-slate-200">
              <iframe
                src={mapSrc}
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          )}

          {!mapSrc && form.address && (
            <div className="md:col-span-2 text-sm text-slate-500">
              Карта появится после сохранения, если адрес найдётся.
            </div>
          )}
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
              placeholder="Доп. оборудование, особенности, что сказали при звонке..."
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

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {saving
            ? 'Сохраняем (ищем адрес)...'
            : saved
            ? '✅ Сохранено'
            : '💾 Сохранить'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-6 py-3 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? 'Удаляем...' : '🗑 Удалить владельца'}
        </button>
      </div>
    </form>
  );
}