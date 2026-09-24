'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
}

export default function ReopenOrderButton({ orderId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReopen = async () => {
    if (loading) return;
    if (!confirm('Открыть поиск заново? Сообщения в группах снова станут активными.')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/reopen`, {
        method: 'POST',
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
      onClick={handleReopen}
      disabled={loading}
      className="text-sm px-3 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
    >
      {loading ? 'Открываем...' : '🔓 Открыть поиск'}
    </button>
  );
}