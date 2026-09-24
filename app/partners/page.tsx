'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  royaltyPercent: number;
  isActive: boolean;
  comment: string | null;
  users: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    lastLoginAt: string | null;
  }[];
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    royaltyPercent: '3',
    comment: '',
    createUser: true,
    userEmail: '',
    userPassword: '',
    userName: '',
  });

  const load = () => {
    setLoading(true);
    fetch('/api/partners')
      .then((r) => r.json())
      .then((data) => setPartners(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          royaltyPercent: Number(form.royaltyPercent) || 3,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      // Сброс
      setForm({
        name: '',
        city: '',
        phone: '',
        royaltyPercent: '3',
        comment: '',
        createUser: true,
        userEmail: '',
        userPassword: '',
        userName: '',
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Партнёры</h1>
          <p className="text-sm text-slate-500 mt-1">
            Филиалы сети. Каждый видит только свои данные.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showForm ? 'Отмена' : '+ Добавить партнёра'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col gap-6"
        >
          <div>
            <h2 className="text-lg font-semibold mb-4">Данные партнёра</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder='ООО "Техаrenda Москва" или Филиал СПб'
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Город
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Москва"
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Телефон
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+7 999 123-45-67"
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Процент роялти (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.royaltyPercent}
                  onChange={(e) =>
                    setForm({ ...form, royaltyPercent: e.target.value })
                  }
                  min="0"
                  max="100"
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">
                  Комментарий
                </label>
                <input
                  type="text"
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.createUser}
                onChange={(e) =>
                  setForm({ ...form, createUser: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                Создать учётную запись для входа в систему
              </span>
            </label>

            {form.createUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Имя пользователя{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.userName}
                    onChange={(e) =>
                      setForm({ ...form, userName: e.target.value })
                    }
                    required={form.createUser}
                    placeholder="Диспетчер Москва"
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Email для входа{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.userEmail}
                    onChange={(e) =>
                      setForm({ ...form, userEmail: e.target.value })
                    }
                    required={form.createUser}
                    placeholder="moscow@teharenda.pro"
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">
                    Пароль (минимум 6 символов){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.userPassword}
                    onChange={(e) =>
                      setForm({ ...form, userPassword: e.target.value })
                    }
                    required={form.createUser}
                    minLength={6}
                    placeholder="пароль для входа"
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Сохрани пароль — потом покажешь его партнёру. Менять можно
                    в любой момент.
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Создаём...' : '💾 Создать партнёра'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Загрузка...
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Партнёров пока нет. Добавь первого.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {partners.map((p) => (
            <Link
              key={p.id}
              href={`/partners/${p.id}`}
              className={`rounded-lg shadow hover:shadow-md transition p-5 block ${
                p.isActive ? 'bg-white' : 'bg-slate-100 opacity-70'
              }`}
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-lg">{p.name}</span>
                    {p.city && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {p.city}
                      </span>
                    )}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {p.royaltyPercent}%
                    </span>
                    {!p.isActive && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        выключен
                      </span>
                    )}
                  </div>

                  {p.phone && (
                    <div className="text-sm text-slate-500">📞 {p.phone}</div>
                  )}

                  {p.users.length > 0 ? (
                    <div className="mt-2 text-xs text-slate-500">
                      Учётка: {p.users.map((u) => u.email).join(', ')}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-400">
                      Без учётной записи
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}