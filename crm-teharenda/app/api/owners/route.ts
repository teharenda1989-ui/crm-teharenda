import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';

async function geocodeAddress(
  city: string,
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const query = [city, address].filter(Boolean).join(', ');
  if (query.length < 3) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      query,
    )}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Teharenda/1.0 (contact@teharenda.pro)' },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const city = searchParams.get('city') || undefined;
  const search = searchParams.get('search') || undefined;
  const active = searchParams.get('active');

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

  return NextResponse.json(owners);
}

export async function POST(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json();

  if (!body.name || !body.phone) {
    return NextResponse.json(
      { error: 'Укажите имя и телефон' },
      { status: 400 },
    );
  }

  const normalizedPhone = body.phone.replace(/\D/g, '');

  let lat: number | null = null;
  let lng: number | null = null;

  if (body.address || body.city) {
    const coords = await geocodeAddress(body.city || '', body.address || '');
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  try {
    const owner = await prisma.owner.create({
      data: {
        name: body.name,
        phone: normalizedPhone,
        company: body.company || null,
        city: body.city || null,
        address: body.address || null,
        lat,
        lng,
        comment: body.comment || null,
        notes: body.notes || null,
        partnerId: scope.isSuperAdmin ? body.partnerId || null : scope.partnerId,
        vehicles: body.vehicles?.length
          ? {
              create: body.vehicles.map((v: any) => ({
                category: v.category,
                comment: v.comment || null,
              })),
            }
          : undefined,
      },
      include: { vehicles: true },
    });

    return NextResponse.json(owner);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Владелец с таким телефоном уже есть' },
      { status: 400 },
    );
  }
}