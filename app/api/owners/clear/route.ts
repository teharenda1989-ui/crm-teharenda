import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

export async function POST() {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const where = scopeWhere(scope);

  const ownersCount = await prisma.owner.count({ where });
  const vehiclesCount = await prisma.vehicle.count({
    where: { owner: where },
  });

  await prisma.owner.deleteMany({ where });

  return NextResponse.json({
    ok: true,
    deletedOwners: ownersCount,
    deletedVehicles: vehiclesCount,
  });
}