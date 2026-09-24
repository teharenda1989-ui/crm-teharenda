'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ResultRow {
  sheet: string;
  category: string;
  rows: number;
  ownersCreated: number;
  ownersUpdated: number;
  vehiclesCreated: number;
  vehiclesSkipped: number;
  errors: string[];
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ResultRow[] | null>(null);
  const [result, setResult] = useState<ResultRow[] | null>(null);
  const [cleared, setCleared] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [clearAll, setClearAll] = useState(false);

  const upload = async (isPreview: boolean) => {
    if (!file) {
      setError('Выбери файл');
      return;
    }

    if (
      !isPreview &&
      clearAll &&
      !confirm(
        'Точно удалить ВСЕХ владельцев и всю технику из базы? Действие необратимо.',
      )
    ) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (isPreview) formData.append('preview', 'true');
      if (clearAll) formData.append('clearAll', 'true');

      const res = await fetch('/api/owners/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      if (isPreview) {
        setPreview(data.results);
      } else {
        setResult(data.results);
        setCleared(data.cleared || 0);
        setPreview(null);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRows = preview?.reduce((s, r) => s + r.rows, 0) ?? 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Link href="/owners" className="text-slate-500 hover:text-slate-900">
          ← Назад к списку
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Импорт владельцев из Excel</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-900 text-sm">
        <p className="mb-2">
          <b>Как работает:</b>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Каждый лист Excel — отдельная рубрика техники.</li>
          <li>
            Основные колонки: <b>Номер</b>, <b>Имя</b>, характеристики,{' '}
            <b>Цена</b>, <b>Комментарий</b>.
          </li>
          <li>
            Дополнительные колонки (если есть): <b>Город</b>, <b>Адрес</b>,{' '}
            <b>Широта</b>, <b>Долгота</b>. Координаты подтянутся в карточку.
          </li>
          <li>
            Телефон — это ключ. Если он уже в базе, техника добавится
            существующему владельцу.
          </li>
          <li>
            <b>Дедупликация:</b> если точно такая же единица техники уже есть —
            не создаётся второй раз.
          </li>
          <li>Лист «Лист1» игнорируется.</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm text-slate-600 mb-2 font-medium">
          Файл Excel (.xlsx, .xls)
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setPreview(null);
            setResult(null);
          }}
          className="w-full border border-slate-300 rounded px-3 py-2"
        />

        {file && (
          <div className="mt-3 text-sm text-slate-500">
            Выбран файл: <b>{file.name}</b> (
            {(file.size / 1024).toFixed(1)} КБ)
          </div>
        )}

        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={clearAll}
              onChange={(e) => setClearAll(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-red-700">
              ⚠️ <b>Очистить всю базу владельцев и технику перед импортом</b>
            </span>
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => upload(true)}
            disabled={loading || !file}
            className="bg-slate-900 text-white px-5 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Читаем...' : '👁 Предпросмотр'}
          </button>

          <button
            onClick={() => upload(false)}
            disabled={loading || !file}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Импортируем...' : '📥 Импортировать'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
            {error}
          </div>
        )}
      </div>

      {preview && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Предпросмотр — всего строк: {totalRows}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <th className="pb-2 pr-4">Лист (рубрика)</th>
                  <th className="pb-2 pr-4 text-right">Строк</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r) => (
                  <tr key={r.sheet} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{r.sheet}</td>
                    <td className="py-2 pr-4 text-right font-medium">
                      {r.rows}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Если всё верно — жми «📥 Импортировать».
          </p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">✅ Импорт завершён</h2>

          {cleared > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
              🗑 Удалено владельцев перед импортом: <b>{cleared}</b>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <th className="pb-2 pr-3">Лист</th>
                  <th className="pb-2 pr-3 text-right">Строк</th>
                  <th className="pb-2 pr-3 text-right">Новые</th>
                  <th className="pb-2 pr-3 text-right">Сущ.</th>
                  <th className="pb-2 pr-3 text-right">Техники</th>
                  <th className="pb-2 text-right">Дубли</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r) => (
                  <tr key={r.sheet} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{r.sheet}</td>
                    <td className="py-2 pr-3 text-right">{r.rows}</td>
                    <td className="py-2 pr-3 text-right text-green-700 font-medium">
                      {r.ownersCreated}
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-500">
                      {r.ownersUpdated}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium">
                      {r.vehiclesCreated}
                    </td>
                    <td className="py-2 text-right text-slate-400">
                      {r.vehiclesSkipped}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push('/owners')}
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
            >
              Перейти к владельцам
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setCleared(0);
              }}
              className="border border-slate-300 px-5 py-2 rounded hover:bg-slate-100"
            >
              Загрузить ещё файл
            </button>
          </div>
        </div>
      )}
    </div>
  );
}