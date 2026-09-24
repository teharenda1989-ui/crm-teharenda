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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const owner = await prisma.owner.findFirst({
    where: {
      id: params.id,
      ...scopeWhere(scope),
    },
    include: { vehicles: true },
  });

  if (!owner) {
    return NextResponse.json({ error: 'Владелец не найден' }, { status: 404 });
  }

  return NextResponse.json(owner);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  // Проверка доступа
  const current = await prisma.owner.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });
  if (!current) {
    return NextResponse.json({ error: 'Владелец не найден' }, { status: 404 });
  }

  const body = await req.json();

  let lat = current.lat;
  let lng = current.lng;

  const newCity = body.city !== undefined ? body.city : current.city;
  const newAddress =
    body.address !== undefined ? body.address : current.address;

  const addressChanged =
    newCity !== current.city || newAddress !== current.address;

  if (addressChanged && (newCity || newAddress)) {
    const coords = await geocodeAddress(newCity || '', newAddress || '');
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  const owner = await prisma.owner.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.company !== undefined && { company: body.company || null }),
      ...(body.city !== undefined && { city: body.city || null }),
      ...(body.address !== undefined && { address: body.address || null }),
      lat,
      lng,
      ...(body.comment !== undefined && { comment: body.comment || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    include: { vehicles: true },
  });

  return NextResponse.json(owner);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const current = await prisma.owner.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });
  if (!current) {
    return NextResponse.json({ error: 'Владелец не найден' }, { status: 404 });
  }

  await prisma.owner.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}