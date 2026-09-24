const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export interface SendResult {
  ok: boolean;
  error?: string;
  messageId?: string;
}

export async function sendToTelegram(
  chatId: string,
  text: string,
): Promise<SendResult> {
  if (!TOKEN) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN не задан в .env' };
  }

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      return { ok: false, error: data.description || 'Ошибка Telegram API' };
    }

    return {
      ok: true,
      messageId: String(data.result.message_id),
    };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function editTelegramMessage(
  chatId: string,
  messageId: string,
  text: string,
): Promise<SendResult> {
  if (!TOKEN) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN не задан в .env' };
  }

  const url = `https://api.telegram.org/bot${TOKEN}/editMessageText`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: Number(messageId),
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      return { ok: false, error: data.description || 'Ошибка Telegram API' };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// Скрывает номер телефона: +7 999 ***-**-67
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 6) {
    return '•••';
  }

  const cc = digits.slice(0, 1);
  const op = digits.slice(1, 4);
  const last = digits.slice(-2);

  return `+${cc} ${op} ***-**-${last}`;
}

export function buildOrderMessage(order: {
  category: string;
  city?: string | null;
  when: string;
  description?: string | null;
  dispatcher: string;
  dispatcherPhone: string;
}): string {
  const lines: string[] = [];

  lines.push('🚜 <b>Новая заявка</b>');
  lines.push('');
  lines.push(`<b>Тип:</b> ${order.category}`);

  if (order.city) {
    lines.push(`<b>Город:</b> ${order.city}`);
  }

  lines.push(`<b>Когда:</b> ${order.when}`);

  if (order.description) {
    lines.push(`<b>Детали:</b> ${order.description}`);
  }

  lines.push('');
  lines.push(`📞 <b>Диспетчер:</b> ${order.dispatcher}`);
  lines.push(`☎️ ${order.dispatcherPhone}`);
  lines.push('');
  lines.push('Кто свободен — звоните.');

  return lines.join('\n');
}

export function buildClosedOrderMessage(order: {
  category: string;
  city?: string | null;
  when: string;
  description?: string | null;
  dispatcher: string;
  dispatcherPhone: string;
}): string {
  const lines: string[] = [];

  lines.push('🔒 <b>ЗАЯВКА ЗАКРЫТА</b>');
  lines.push('');
  lines.push(`<b>Тип:</b> ${order.category}`);

  if (order.city) {
    lines.push(`<b>Город:</b> ${order.city}`);
  }

  lines.push(`<b>Когда:</b> ${order.when}`);

  if (order.description) {
    lines.push(`<b>Детали:</b> ${order.description}`);
  }

  lines.push('');
  lines.push(`📞 <b>Диспетчер:</b> ${order.dispatcher}`);
  lines.push(`☎️ ${maskPhone(order.dispatcherPhone)}`);

  return lines.join('\n');
}