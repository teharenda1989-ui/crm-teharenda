import https from 'https';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export interface SendResult {
  ok: boolean;
  error?: string;
  messageId?: string;
}

// Обёртка над https.request с принудительным IPv4
function httpsPost(urlStr: string, bodyObj: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const body = JSON.stringify(bodyObj);

    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        family: 4, // принудительно IPv4
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Невалидный JSON: ' + data.slice(0, 200)));
          }
        });
      },
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout: Telegram не ответил за 15 секунд'));
    });

    req.write(body);
    req.end();
  });
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
    const data = await httpsPost(url, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

    if (!data.ok) {
      return { ok: false, error: data.description || 'Ошибка Telegram API' };
    }

    return { ok: true, messageId: String(data.result.message_id) };
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
    const data = await httpsPost(url, {
      chat_id: chatId,
      message_id: Number(messageId),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

    if (!data.ok) {
      return { ok: false, error: data.description || 'Ошибка Telegram API' };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '•••';
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
  if (order.city) lines.push(`<b>Город:</b> ${order.city}`);
  lines.push(`<b>Когда:</b> ${order.when}`);
  if (order.description) lines.push(`<b>Детали:</b> ${order.description}`);
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
  if (order.city) lines.push(`<b>Город:</b> ${order.city}`);
  lines.push(`<b>Когда:</b> ${order.when}`);
  if (order.description) lines.push(`<b>Детали:</b> ${order.description}`);
  lines.push('');
  lines.push(`📞 <b>Диспетчер:</b> ${order.dispatcher}`);
  lines.push(`☎️ ${maskPhone(order.dispatcherPhone)}`);
  return lines.join('\n');
}
