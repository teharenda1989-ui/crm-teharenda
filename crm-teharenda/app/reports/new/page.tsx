'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Partner {
  id: string;
  name: string;
  royaltyPercent: number;
  isActive: boolean;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}

function getDefaultPeriod() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

export default function NewRoyaltyPage() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [revenue, setRevenue] = useState(0);
  const [turnover, setTurnover] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  const [taxRate, setTaxRate] = useState('6');
  const [salaries, setSalaries] = useState('0');
  const [officeRent, setOfficeRent] = useState('0');
  const [communications, setCommunications] = useState('0');
  const [otherExpenses, setOtherExpenses] = useState('0');
  const [otherNote, setOtherNote] = useState('');
  const [royaltyPercent, setRoyaltyPercent] = useState('3');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const p = getDefaultPeriod();
    setFrom(p.from);
    setTo(p.to);
  }, []);

  useEffect(() => {
    if (!from || !to) return;
    setLoadingRevenue(true);
    fetch(`/api/reports/revenue?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => {
        setRevenue(data.revenue || 0);
        setTurnover(data.turnover || 0);
        setOrdersCount(data.count || 0);
      })
      .finally(() => setLoadingRevenue(false));
  }, [from, to]);

  const taxAmount = Math.round((revenue * (Number(taxRate) || 0)) / 100);
  const totalExpenses =
    taxAmount +
    (Number(salaries) || 0) +
    (Number(officeRent) || 0) +
    (Number(communications) || 0) +
    (Number(otherExpenses) || 0);
  const netProfit = Math.max(0, revenue - totalExpenses);
  const royaltyAmount = Math.round(
    (netProfit * (Number(royaltyPercent) || 0)) / 100,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/reports/royalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodStart: from,
          periodEnd: to,
          taxRate: Number(taxRate) || 0,
          salaries: Number(salaries) || 0,
          officeRent: Number(officeRent) || 0,
          communications: Number(communications) || 0,
          otherExpenses: Number(otherExpenses) || 0,
          otherNote,
          royaltyPercent: Number(royaltyPercent) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      router.push(`/reports/${data.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Расчёт роялти</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Период</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                С даты
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                По дату
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded">
            {loadingRevenue ? (
              <div className="text-slate-500">Загружаем выручку...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-slate-500">
                    Выручка (из воронки)
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatMoney(revenue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">
                    Оборот по заказам
                  </div>
                  <div className="text-lg font-medium">
                    {formatMoney(turnover)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Успешных заявок</div>
                  <div className="text-lg font-medium">{ordersCount}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Налогообложение</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Процент налога
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Сумма налога
              </label>
              <div className="px-3 py-2 bg-slate-50 rounded border border-slate-200 text-slate-700 font-medium">
                {formatMoney(taxAmount)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Расходы</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Зарплаты, ₽
              </label>
              <input
                type="number"
                value={salaries}
                onChange={(e) => setSalaries(e.target.value)}
                min="0"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Аренда офиса, ₽
              </label>
              <input
                type="number"
                value={officeRent}
                onChange={(e) => setOfficeRent(e.target.value)}
                min="0"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Связь и интернет, ₽
              </label>
              <input
                type="number"
                value={communications}
                onChange={(e) => setCommunications(e.target.value)}
                min="0"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Прочие расходы, ₽
              </label>
              <input
                type="number"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(e.target.value)}
                min="0"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">
                Что в «Прочих расходах»
              </label>
              <input
                type="text"
                value={otherNote}
                onChange={(e) => setOtherNote(e.target.value)}
                placeholder="Например, реклама, бухгалтерия, банк"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Роялти</h2>

          <div className="max-w-xs">
            <label className="block text-sm text-slate-600 mb-1">
              Процент роялти (2–5%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(e.target.value)}
                min="0"
                max="100"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <span className="text-slate-500">%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Расчёт</h2>

          <div className="space-y-2 text-sm">
            <Row label="Выручка диспетчера" value={formatMoney(revenue)} />
            <Row
              label={`Налог (${taxRate}%)`}
              value={`− ${formatMoney(taxAmount)}`}
              muted
            />
            <Row
              label="Зарплаты"
              value={`− ${formatMoney(Number(salaries) || 0)}`}
              muted
            />
            <Row
              label="Аренда офиса"
              value={`− ${formatMoney(Number(officeRent) || 0)}`}
              muted
            />
            <Row
              label="Связь и интернет"
              value={`− ${formatMoney(Number(communications) || 0)}`}
              muted
            />
            <Row
              label="Прочие расходы"
              value={`− ${formatMoney(Number(otherExpenses) || 0)}`}
              muted
            />
            <div className="border-t border-slate-700 pt-2 mt-2">
              <Row
                label="Всего расходов"
                value={formatMoney(totalExpenses)}
                bold
              />
            </div>
            <Row label="Чистая прибыль" value={formatMoney(netProfit)} bold />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 flex justify-between items-baseline">
            <div>
              <div className="text-slate-400 text-sm">
                Роялти ({royaltyPercent}%)
              </div>
              <div className="text-slate-400 text-xs">
                от чистой прибыли
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {formatMoney(royaltyAmount)}
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
            disabled={saving || ordersCount === 0}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Сохраняем...' : '💾 Сохранить отчёт'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/reports')}
            className="px-6 py-3 rounded border border-slate-300 hover:bg-slate-100"
          >
            Отмена
          </button>
        </div>

        {ordersCount === 0 && !loadingRevenue && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded p-3 text-sm">
            ⚠️ За выбранный период нет успешных закрытых заявок.
          </div>
        )}
      </form>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={muted ? 'text-slate-400' : 'text-slate-200'}>
        {label}
      </span>
      <span
        className={`${bold ? 'font-semibold text-white' : ''} ${
          muted ? 'text-slate-400' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}