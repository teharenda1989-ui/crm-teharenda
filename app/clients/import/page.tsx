'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ParsedData {
  company: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  bankAccount: string;
  bankBik: string;
  bankCorrAccount: string;
}

const EMPTY: ParsedData = {
  company: '',
  inn: '',
  kpp: '',
  ogrn: '',
  address: '',
  phone: '',
  email: '',
  bankName: '',
  bankAccount: '',
  bankBik: '',
  bankCorrAccount: '',
};

export default function ImportClientPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const [form, setForm] = useState<ParsedData>(EMPTY);
  const [parsed, setParsed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleParse = async () => {
    if (!file) {
      setError('Выбери PDF-файл');
      return;
    }

    setError('');
    setLoading(true);
    setParsed(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/clients/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      setForm({
        company: data.parsed.company || '',
        inn: data.parsed.inn || '',
        kpp: data.parsed.kpp || '',
        ogrn: data.parsed.ogrn || '',
        address: data.parsed.address || '',
        phone: data.parsed.phone || '',
        email: data.parsed.email || '',
        bankName: data.parsed.bankName || '',
        bankAccount: data.parsed.bankAccount || '',
        bankBik: data.parsed.bankBik || '',
        bankCorrAccount: data.parsed.bankCorrAccount || '',
      });
      setRawText(data.rawText || '');
      setParsed(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
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

      router.push(`/clients/${data.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link href="/clients" className="text-slate-500 hover:text-slate-900">
          ← Назад к клиентам
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Загрузка клиента из PDF</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-900 text-sm">
        <p className="mb-2">
          <b>Как работает:</b>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Загрузи PDF с реквизитами (карточка предприятия, счёт).</li>
          <li>
            Система распознает компанию, ИНН, КПП, ОГРН, адрес, банк, Р/С, БИК,
            корр. счёт, телефон, e-mail.
          </li>
          <li>Найденное показывается в форме — проверь и поправь.</li>
          <li>
            <b>Важно:</b> работает только с PDF, где есть текстовый слой.
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm text-slate-600 mb-2 font-medium">
          PDF-файл с реквизитами
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setParsed(false);
          }}
          className="w-full border border-slate-300 rounded px-3 py-2"
        />

        {file && (
          <div className="mt-3 text-sm text-slate-500">
            Выбран файл: <b>{file.name}</b> (
            {(file.size / 1024).toFixed(1)} КБ)
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={loading || !file}
          className="mt-4 bg-slate-900 text-white px-5 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? '⏳ Читаем PDF...' : '🔍 Распознать реквизиты'}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
            {error}
          </div>
        )}
      </div>

      {parsed && (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Компания</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Название компании{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  required
                  placeholder='ООО "Ромашка" или ИП Иванов Иван Иванович'
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    ИНН
                  </label>
                  <input
                    type="text"
                    value={form.inn}
                    onChange={(e) =>
                      setForm({ ...form, inn: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    КПП
                  </label>
                  <input
                    type="text"
                    value={form.kpp}
                    onChange={(e) =>
                      setForm({ ...form, kpp: e.target.value })
                    }
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
                    onChange={(e) =>
                      setForm({ ...form, ogrn: e.target.value })
                    }
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
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Контакты</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Телефон
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Банковские реквизиты
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Наименование банка
                </label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) =>
                    setForm({ ...form, bankName: e.target.value })
                  }
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
                    onChange={(e) =>
                      setForm({ ...form, bankBik: e.target.value })
                    }
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm text-slate-500 hover:text-slate-900 underline"
            >
              {showRaw ? 'Скрыть' : 'Показать'} распознанный текст из PDF
            </button>

            {showRaw && (
              <pre className="mt-2 bg-slate-50 rounded p-4 text-xs whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-200 text-slate-600">
                {rawText}
              </pre>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Сохраняем...' : '💾 Сохранить клиента'}
            </button>
            <button
              type="button"
              onClick={() => {
                setParsed(false);
                setFile(null);
                setForm(EMPTY);
              }}
              className="px-6 py-3 rounded border border-slate-300 hover:bg-slate-100"
            >
              Загрузить другой файл
            </button>
          </div>
        </form>
      )}
    </div>
  );
}