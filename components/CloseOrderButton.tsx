'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  disabled?: boolean;
}

export default function CloseOrderButton({ orderId, disabled }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${orderId}/close`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClose}
      disabled={loading || disabled}
      className="text-sm px-3 py-1 rounded bg-yellow-50 text-yellow-800 hover:bg-yellow-100 disabled:opacity-50"
      title={disabled ? 'Сначала укажите исполнителя' : ''}
    >
      {loading ? 'Закрываем...' : '🔒 Закрыть поиск'}
    </button>
  );
}