'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  phone: string | null;
  company: string | null;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  address: string | null;
  comment: string | null;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    company: '',
    phone: '',
    email: '',
    inn: '',
    kpp: '',
    ogrn: '',
    address: '',
    comment: '',
    bankName: '',
    bankAccount: '',
    bankBik: '',
    bankCorrAccount: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = (q?: string) => {
    setLoading(true);
    const url = q
      ? `/api/clients?search=${encodeURIComponent(q)}`
      : '/api/clients';
    fetch(url)
      .then((r) => r.json())
      .then((data) => setClients(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: form.company,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      setForm({
        company: '',
        phone: '',
        email: '',
        inn: '',
        kpp: '',
        ogrn: '',
        address: '',
        comment: '',
        bankName: '',
        bankAccount: '',
        bankBik: '',
        bankCorrAccount: '',
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
        <h1 className="text-3xl font-bold">Мои клиенты</h1>
        <div className="flex gap-2">
          <Link
            href="/clients/import"
            className="border border-slate-300 px-4 py-2 rounded hover:bg-slate-100 inline-flex items-center"
          >
            📄 Загрузить из PDF
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showForm ? 'Отмена' : '+ Добавить клиента'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col gap-4"
        >
          <h2 className="text-lg font-semibold">Новый клиент</h2>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Название компании <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
              placeholder='ООО "Ромашка" или ИП Иванов Иван Иванович'
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">ИНН</label>
              <input
                type="text"
                value={form.inn}
                onChange={(e) => setForm({ ...form, inn: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">КПП</label>
              <input
                type="text"
                value={form.kpp}
                onChange={(e) => setForm({ ...form, kpp: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                ОГРН / ОГРНИП
              </label>
              <input
                type="text"
                value={form.ogrn}
                onChange={(e) => setForm({ ...form, ogrn: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Юридический адрес
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Телефон
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                E-mail
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <h3 className="text-md font-semibold text-slate-800 mt-2">
            Банковские реквизиты
          </h3>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Наименование банка
            </label>
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Расчётный счёт
            </label>
            <input
              type="text"
              value={form.bankAccount}
              onChange={(e) =>
                setForm({ ...form, bankAccount: e.target.value })
              }
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                БИК банка
              </label>
              <input
                type="text"
                value={form.bankBik}
                onChange={(e) => setForm({ ...form, bankBik: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Корр. счёт
              </label>
              <input
                type="text"
                value={form.bankCorrAccount}
                onChange={(e) =>
                  setForm({ ...form, bankCorrAccount: e.target.value })
                }
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Комментарий
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={2}
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию, телефону, ИНН"
          className="flex-1 border border-slate-300 rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-slate-900 text-white px-5 py-2 rounded hover:bg-slate-700"
        >
          Найти
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              load();
            }}
            className="px-5 py-2 rounded border border-slate-300 hover:bg-slate-100"
          >
            Сбросить
          </button>
        )}
      </form>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Загрузка...
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          {search
            ? 'Ничего не найдено'
            : 'Пока нет клиентов. Добавьте первого.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition p-5 block"
            >
              <div className="font-semibold text-lg mb-1">{client.name}</div>

              {client.phone && (
                <div className="text-slate-700 text-sm mb-1">
                  📞 {client.phone}
                </div>
              )}

              {client.inn && (
                <div className="text-slate-500 text-xs">
                  ИНН: {client.inn}
                </div>
              )}

              {client.address && (
                <div className="text-slate-500 text-xs mt-1 truncate">
                  📍 {client.address}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}