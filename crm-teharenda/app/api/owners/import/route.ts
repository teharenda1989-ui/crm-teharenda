import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';
import * as XLSX from 'xlsx';

function normalizePhone(raw: string | number): string {
  return String(raw).replace(/\D/g, '');
}

function findCol(headers: string[], names: string[]): number {
  for (const name of names) {
    const lower = name.toLowerCase();
    const idx = headers.findIndex((h) =>
      String(h).toLowerCase().includes(lower),
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

export async function POST(req: NextRequest) {
  const scope = await getScope();
  if (!scope) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const preview = formData.get('preview') === 'true';
  const clearAll = formData.get('clearAll') === 'true';

  if (!file) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const results: any[] = [];

  if (preview) {
    for (const sheetName of workbook.SheetNames) {
      if (sheetName === 'Лист1') continue;
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
      });
      if (rows.length < 2) continue;
      const validRows = rows
        .slice(1)
        .filter((r) => normalizePhone(r[0] || '').length >= 10);
      results.push({
        sheet: sheetName,
        category: sheetName,
        rows: validRows.length,
        ownersCreated: 0,
        ownersUpdated: 0,
        vehiclesCreated: 0,
        vehiclesSkipped: 0,
        errors: [],
      });
    }
    return NextResponse.json({ preview: true, results, cleared: 0 });
  }

  // Очистка — только своих
  let cleared = 0;
  if (clearAll) {
    const where = scopeWhere(scope);
    cleared = await prisma.owner.count({ where });
    await prisma.owner.deleteMany({ where });
  }

  const partnerId = scope.isSuperAdmin ? null : scope.partnerId;

  for (const sheetName of workbook.SheetNames) {
    if (sheetName === 'Лист1') continue;

    const sheet = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
    });
    if (rows.length < 2) continue;

    const headers = rows[0].map((h) => String(h));
    const phoneCol = findCol(headers, ['номер', 'телефон']);
    const nameCol = findCol(headers, ['имя', 'название']);
    const priceCol = findCol(headers, ['цена']);
    const commentCol = findCol(headers, ['коммент', 'статус']);
    const cityCol = findCol(headers, ['город']);
    const addressCol = findCol(headers, ['адрес']);

    const charCols = headers
      .map((_, i) => i)
      .filter(
        (i) =>
          i !== phoneCol &&
          i !== nameCol &&
          i !== priceCol &&
          i !== commentCol &&
          i !== cityCol &&
          i !== addressCol,
      );

    let ownersCreated = 0;
    let ownersUpdated = 0;
    let vehiclesCreated = 0;
    let vehiclesSkipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const phone = normalizePhone(row[phoneCol]);
      if (phone.length < 10) continue;

      const name = String(row[nameCol] || '').trim() || 'Без имени';
      const price = priceCol >= 0 ? String(row[priceCol] || '').trim() : '';
      const comment =
        commentCol >= 0 ? String(row[commentCol] || '').trim() : '';
      const city = cityCol >= 0 ? String(row[cityCol] || '').trim() : '';
      const address =
        addressCol >= 0 ? String(row[addressCol] || '').trim() : '';

      const chars: string[] = [];
      for (const ci of charCols) {
        const val = String(row[ci] || '').trim();
        if (val && headers[ci]) chars.push(`${headers[ci]}: ${val}`);
      }
      if (price) chars.push(`Цена: ${price}`);
      if (comment) chars.push(`Статус: ${comment}`);
      const vehicleComment = chars.join(' · ');

      try {
        // Ищем владельца в рамках текущего партнёра
        let owner = await prisma.owner.findFirst({
          where: {
            phone,
            partnerId: partnerId,
          },
        });

        if (!owner) {
          owner = await prisma.owner.create({
            data: {
              phone,
              name,
              city: city || null,
              address: address || null,
              partnerId,
            },
          });
          ownersCreated++;
        } else {
          ownersUpdated++;
        }

        const existing = await prisma.vehicle.findFirst({
          where: {
            ownerId: owner.id,
            category: sheetName,
            comment: vehicleComment || null,
          },
        });

        if (existing) {
          vehiclesSkipped++;
          continue;
        }

        await prisma.vehicle.create({
          data: {
            ownerId: owner.id,
            category: sheetName,
            comment: vehicleComment || null,
          },
        });
        vehiclesCreated++;
      } catch (e: any) {
        errors.push(`Строка ${i + 1}: ${e.message}`);
      }
    }

    results.push({
      sheet: sheetName,
      category: sheetName,
      rows: rows.length - 1,
      ownersCreated,
      ownersUpdated,
      vehiclesCreated,
      vehiclesSkipped,
      errors,
    });
  }

  return NextResponse.json({ preview: false, results, cleared });
}