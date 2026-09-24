import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OwnerEditForm from '@/components/OwnerEditForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function OwnerPage({ params }: Props) {
  const owner = await prisma.owner.findUnique({
    where: { id: params.id },
    include: { vehicles: true },
  });

  if (!owner) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/owners" className="text-slate-500 hover:text-slate-900">
          ← Назад к списку
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{owner.name}</h1>
            {owner.company && (
              <p className="text-slate-500 mb-3">{owner.company}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={`tel:${owner.phone}`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-flex items-center gap-2"
              >
                📞 {owner.phone}
              </a>

              <a
                href={`https://t.me/+${owner.phone.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center gap-2"
              >
                ✈️ Telegram
              </a>
            </div>
          </div>

          <div className="text-right text-sm text-slate-500">
            {owner.city && (
              <div>
                Город:{' '}
                <span className="text-slate-900 font-medium">
                  {owner.city}
                </span>
              </div>
            )}
            {owner.address && (
              <div className="mt-1">
                Адрес: <span className="text-slate-900">{owner.address}</span>
              </div>
            )}
            <div className="mt-1">
              Добавлен:{' '}
              <span className="text-slate-900">
                {new Date(owner.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
            {!owner.isActive && (
              <div className="mt-2">
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                  НЕ РАБОТАЕТ
                </span>
              </div>
            )}
          </div>
        </div>

        {owner.comment && (
          <div className="mt-4 p-3 bg-slate-50 rounded text-slate-700">
            💬 {owner.comment}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          🚜 Техника ({owner.vehicles.length})
        </h2>

        {owner.vehicles.length === 0 ? (
          <p className="text-slate-500">Техника не добавлена.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {owner.vehicles.map((v) => (
              <div key={v.id} className="border border-slate-200 rounded p-4">
                <div className="font-medium text-slate-900 mb-1">
                  {v.category}
                </div>
                {v.comment && (
                  <div className="text-sm text-slate-500">{v.comment}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Редактирование</h2>
        <OwnerEditForm
          owner={{
            id: owner.id,
            name: owner.name,
            phone: owner.phone,
            company: owner.company,
            city: owner.city,
            address: owner.address,
            lat: owner.lat,
            lng: owner.lng,
            comment: owner.comment,
            notes: owner.notes,
            isActive: owner.isActive,
          }}
        />
      </div>
    </div>
  );
}