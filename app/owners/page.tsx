import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';
import ClearAllButton from '@/components/ClearAllButton';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: {
    category?: string;
    city?: string;
    search?: string;
    active?: string;
  };
}

export default async function OwnersPage({ searchParams }: Props) {
  const scope = await getScope();
  if (!scope) return null;

  const { category, city, search, active } = searchParams;

  const owners = await prisma.owner.findMany({
    where: {
      ...scopeWhere(scope),
      ...(city && { city }),
      ...(category && { vehicles: { some: { category } } }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { company: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
      ...(active === 'true' && { isActive: true }),
      ...(active === 'false' && { isActive: false }),
    },
    include: { vehicles: true },
    orderBy: { name: 'asc' },
  });

  const allVehicles = await prisma.vehicle.findMany({
    where: { owner: scopeWhere(scope) },
    select: { category: true },
    distinct: ['category'],
  });
  const allOwners = await prisma.owner.findMany({
    where: scopeWhere(scope),
    select: { city: true },
    distinct: ['city'],
  });

  const categories = allVehicles.map((v) => v.category).sort();
  const cities = allOwners.map((o) => o.city).filter(Boolean).sort() as string[];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Владельцы техники</h1>
          <p className="text-sm text-slate-500 mt-1">
            Всего: {owners.length}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ClearAllButton />
          <Link
            href="/owners/import"
            className="border border-slate-300 px-4 py-2 rounded hover:bg-slate-100"
          >
            📥 Импорт Excel
          </Link>
          <Link
            href="/owners/new"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Добавить владельца
          </Link>
        </div>
      </div>

      <form className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-slate-600 mb-1">Поиск</label>
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Имя, компания или телефон"
            className="w-full border border-slate-300 rounded px-3 py-2"
          />
        </div>

        <div className="min-w-[200px]">
          <label className="block text-sm text-slate-600 mb-1">Рубрика</label>
          <select
            name="category"
            defaultValue={category || ''}
            className="w-full border border-slate-300 rounded px-3 py-2"
          >
            <option value="">Все рубрики</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px]">
          <label className="block text-sm text-slate-600 mb-1">Город</label>
          <select
            name="city"
            defaultValue={city || ''}
            className="w-full border border-slate-300 rounded px-3 py-2"
          >
            <option value="">Все города</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label className="block text-sm text-slate-600 mb-1">Статус</label>
          <select
            name="active"
            defaultValue={active || ''}
            className="w-full border border-slate-300 rounded px-3 py-2"
          >
            <option value="">Все</option>
            <option value="true">Работает</option>
            <option value="false">Не работает</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-slate-900 text-white px-5 py-2 rounded hover:bg-slate-700"
        >
          Найти
        </button>
        <Link
          href="/owners"
          className="px-5 py-2 rounded border border-slate-300 hover:bg-slate-100"
        >
          Сбросить
        </Link>
      </form>

      {owners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          Ничего не найдено.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {owners.map((owner) => (
            <Link
              key={owner.id}
              href={`/owners/${owner.id}`}
              className={`rounded-lg shadow hover:shadow-md transition p-5 block ${
                owner.isActive ? 'bg-white' : 'bg-slate-100 opacity-70'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-lg font-semibold">{owner.name}</h2>
                  {owner.company && (
                    <p className="text-sm text-slate-500">{owner.company}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {owner.city && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {owner.city}
                    </span>
                  )}
                  {!owner.isActive && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      не работает
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-700 mb-3">📞 {owner.phone}</p>

              {owner.address && (
                <p className="text-sm text-slate-500 mb-3">
                  📍 {owner.address}
                </p>
              )}

              <div className="flex flex-wrap gap-1">
                {owner.vehicles.slice(0, 5).map((v) => (
                  <span
                    key={v.id}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                  >
                    {v.category}
                  </span>
                ))}
                {owner.vehicles.length > 5 && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    +{owner.vehicles.length - 5}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}