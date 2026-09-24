'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  clientId: string;
  clientName: string;
}

export default function DeleteClientButton({
  clientId,
  clientName,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;

    if (
      !confirm(
        `Удалить клиента «${clientName}»? Действие необратимо.`,
      )
    )
      return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');

      router.push('/clients');
      router.refresh();
    } catch (e: any) {
      alert(e.message);
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="bg-red-50 text-red-700 px-4 py-2 rounded hover:bg-red-100 disabled:opacity-50 inline-flex items-center gap-2"
    >
      {deleting ? 'Удаляем...' : '🗑 Удалить клиента'}
    </button>
  );
}