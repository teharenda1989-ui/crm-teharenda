'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const res = await fetch('/api/owners/clear', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      alert(
        `Удалено: владельцев — ${data.deletedOwners}, техники — ${data.deletedVehicles}`,
      );
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="border border-red-300 text-red-700 px-4 py-2 rounded hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? 'Удаляем...' : '🗑 Очистить базу'}
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Очистить базу?</h3>
            <p className="text-slate-600 text-sm mb-6">
              Будут удалены все ваши владельцы техники и вся их техника. Это
              действие необратимо.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-100"
              >
                Отмена
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}