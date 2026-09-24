import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { address } = await req.json();

  if (!address || address.length < 3) {
    return NextResponse.json(
      { error: 'Укажите адрес (минимум 3 символа)' },
      { status: 400 },
    );
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    address,
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Teharenda/1.0 (contact@teharenda.pro)',
      },
    });

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Адрес не найден. Попробуй уточнить.' },
        { status: 404 },
      );
    }

    const first = data[0];

    return NextResponse.json({
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      address: first.display_name,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Ошибка геокодирования: ' + e.message },
      { status: 500 },
    );
  }
}