import { NextRequest, NextResponse } from 'next/server';
import { extractText, getDocumentProxy } from 'unpdf';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    const rawText = Array.isArray(text) ? text.join('\n') : text;

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        { error: 'PDF пустой или это скан без текстового слоя.' },
        { status: 400 },
      );
    }

    const parsed = parseRequisites(rawText);

    return NextResponse.json({ ok: true, rawText, parsed });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Не удалось прочитать PDF: ' + e.message },
      { status: 500 },
    );
  }
}

function parseRequisites(text: string) {
  // 1. Склеиваем всё в одну длинную строку
  let s = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

  // 2. Разделяем слипшиеся слова: "МанахимовДавид" → "Манахимов Давид"
  s = s.replace(/([а-яё])([А-ЯЁ])/g, '$1 $2');
  s = s.replace(/([a-z])([A-Z])/g, '$1 $2');

  // 3. Ключи в порядке убывания длины (важно: "Наименование банка" должно проверяться раньше "Наименование")
  const KEYS = [
    'Юридический адрес банка',
    'Корреспондентский счёт',
    'Корреспондентский счет',
    'Наименование банка',
    'Расчётный счёт',
    'Расчетный счет',
    'Юридический адрес',
    'ИНН банка',
    'БИК банка',
    'ОГРНИП',
    'Наименование',
    'ОГРН',
    'КПП',
    'ИНН',
    'БИК',
    'Телефон',
    'Тел',
    'E-mail',
    'Email',
  ];

  const escapedKeys = KEYS.map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ).join('|');

  // 4. Находим все ключи и их позиции
  const re = new RegExp(`(${escapedKeys})(?=\\s|:|$)`, 'gi');
  const matches: { key: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    matches.push({
      key: m[1],
      start: m.index,
      end: m.index + m[1].length,
    });
  }

  // 5. Для каждого ключа берём значение до следующего ключа
  const result: Record<string, string> = {};

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const valueStart = current.end;
    const valueEnd = next ? next.start : s.length;

    let value = s.substring(valueStart, valueEnd).trim();
    value = value.replace(/^[:\-\s]+/, '').trim();

    if (!value) continue;

    const lower = current.key.toLowerCase();
    // Сохраняем первое найденное значение для каждого ключа
    if (!result[lower]) {
      result[lower] = value;
    }
  }

  return {
    name: result['наименование'] || '',
    company: result['наименование'] || '',
    inn: result['инн'] || '',
    kpp: result['кпп'] || '',
    ogrn: result['огрнип'] || result['огрн'] || '',
    address: result['юридический адрес'] || '',
    phone: result['телефон'] || result['тел'] || '',
    email: result['e-mail'] || result['email'] || '',
    bankName: result['наименование банка'] || '',
    bankAccount:
      result['расчётный счёт'] || result['расчетный счет'] || '',
    bankBik: result['бик банка'] || result['бик'] || '',
    bankCorrAccount:
      result['корреспондентский счёт'] ||
      result['корреспондентский счет'] ||
      '',
  };
}