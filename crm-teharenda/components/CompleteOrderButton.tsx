'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  result: 'SUCCESS' | 'FAIL';
}

export default function CompleteOrderButton({ orderId, result }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isSuccess = result === 'SUCCESS';
  const label = isSuccess ? '✅ Завершить успешно' : '❌ Без сделки';
  const color = isSuccess
    ? 'bg-green-600 text-white hover:bg-green-700'
    : 'bg-red-50 text-red-700 hover:bg-red-100';

  const handleComplete = async () => {
    if (loading) return;
    const confirmText = isSuccess
      ? 'Завершить заявку как УСПЕШНУЮ?'
      : 'Завершить заявку как БЕЗ СДЕЛКИ?';
    if (!confirm(confirmText)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className={`text-sm px-3 py-1 rounded ${color} disabled:opacity-50`}
    >
      {loading ? 'Завершаем...' : label}
    </button>
  );
}