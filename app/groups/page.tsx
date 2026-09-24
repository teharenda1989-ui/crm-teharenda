'use client';

import { useEffect, useState } from 'react';

interface Group {
  id: string;
  title: string;
  chatId: string;
  category: string | null;
  isActive: boolean;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [chatId, setChatId] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/groups')
      .then((r) => r.json())
      .then((data) => setGroups(data))
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
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          chatId,
          category: category || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Ошибка');

      setTitle('');
      setChatId('');
      setCategory('');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить группу?')) return;
    await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    load();
  };

  const handleToggle = async (g: Group) => {
    await fetch(`/api/groups/${g.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !g.isActive }),
    });
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Telegram-группы</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Форма добавления */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Добавить группу</h2>

          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Экскаваторы Москва"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Chat ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                required
                placeholder="-1001234567890"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Как узнать chatId — написано ниже формы
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Рубрика (опционально)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Экскаватор колёсный"
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Сохраняем...' : 'Добавить'}
            </button>
          </form>
        </div>

        {/* Список групп */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Добавленные группы ({groups.length})
          </h2>

          {loading ? (
            <p className="text-slate-500">Загрузка...</p>
          ) : groups.length === 0 ? (
            <p className="text-slate-500">
              Пока нет добавленных групп. Добавьте первую слева.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="border border-slate-200 rounded p-4 flex justify-between items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{g.title}</span>
                      {!g.isActive && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          выкл
                        </span>
                      )}
                      {g.category && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {g.category}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      chatId: <code className="text-xs">{g.chatId}</code>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(g)}
                      className="text-sm px-3 py-1 rounded border border-slate-300 hover:bg-slate-100"
                    >
                      {g.isActive ? 'Выключить' : 'Включить'}
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-sm px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Инструкция */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          📖 Как добавить Telegram-группу
        </h3>
        <ol className="list-decimal list-inside text-blue-900 space-y-2 text-sm">
          <li>
            Создайте бота через <b>@BotFather</b> в Telegram (команда{' '}
            <code className="bg-white px-1 rounded">/newbot</code>).
          </li>
          <li>
            Скопируйте <b>токен</b> и вставьте его в файл{' '}
            <code className="bg-white px-1 rounded">.env</code> в строку{' '}
            <code className="bg-white px-1 rounded">TELEGRAM_BOT_TOKEN</code>.
          </li>
          <li>
            Добавьте бота в нужную группу как участника.
          </li>
          <li>
            Отправьте в группу любое сообщение, затем откройте в браузере:
            <br />
            <code className="bg-white px-1 rounded text-xs break-all">
              https://api.telegram.org/bot&lt;ТОКЕН&gt;/getUpdates
            </code>
          </li>
          <li>
            Найдите в ответе поле <b>chat.id</b> — это и есть chatId группы.
            Обычно начинается с <code className="bg-white px-1 rounded">-100</code>.
          </li>
          <li>Вставьте chatId в форму слева.</li>
        </ol>
      </div>
    </div>
  );
}