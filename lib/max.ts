import https from 'https';

const TOKEN = process.env.MAX_BOT_TOKEN;

export interface MaxSendResult {
  ok: boolean;
  error?: string;
  messageId?: string;
}

function httpsRequest(
  method: string,
  path: string,
  bodyObj: any | null,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = bodyObj ? JSON.stringify(bodyObj) : '';

    const options: https.RequestOptions = {
      hostname: 'platform-api2.max.ru',
      port: 443,
      path,
      method,
      headers: {
        Authorization: TOKEN || '',
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
      family: 4,
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          reject(new Error('Невалидный JSON: ' + data.slice(0, 200)));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout: MAX не ответил за 15 секунд'));
    });

    if (body) req.write(body);
    req.end();
  });
}

export async function sendToMax(
  chatId: string,
  text: string,
): Promise<MaxSendResult> {
  if (!TOKEN) {
    return { ok: false, error: 'MAX_BOT_TOKEN не задан' };
  }

  try {
    const data = await httpsRequest(
      'POST',
      `/messages?chat_id=${encodeURIComponent(chatId)}`,
      { text },
    );

    if (data.code) {
      return { ok: false, error: `${data.code}: ${data.message}` };
    }

    return {
      ok: true,
      messageId: data?.message?.body?.mid || undefined,
    };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function editMaxMessage(
  chatId: string,
  messageId: string,
  text: string,
): Promise<MaxSendResult> {
  if (!TOKEN) {
    return { ok: false, error: 'MAX_BOT_TOKEN не задан' };
  }

  try {
    const data = await httpsRequest(
      'PUT',
      `/messages?message_id=${encodeURIComponent(messageId)}`,
      { text },
    );

    if (data.code) {
      return { ok: false, error: `${data.code}: ${data.message}` };
    }

    if (data.success !== true) {
      return {
        ok: false,
        error: data.message || 'Не удалось отредактировать',
      };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export function buildOrderMessageMax(order: {
  category: string;
  city?: string | null;
  when: string;
  description?: string | null;
  dispatcher: string;
  dispatcherPhone: string;
}): string {
  const lines: string[] = [];
  lines.push('🚜 Новая заявка');
  lines.push('');
  lines.push(`Тип: ${order.category}`);
  if (order.city) lines.push(`Город: ${order.city}`);
  lines.push(`Когда: ${order.when}`);
  if (order.description) lines.push(`Детали: ${order.description}`);
  lines.push('');
  lines.push(`📞 Диспетчер: ${order.dispatcher}`);
  lines.push(`☎️ ${order.dispatcherPhone}`);
  lines.push('');
  lines.push('Кто свободен — звоните.');
  return lines.join('\n');
}

export function buildClosedOrderMessageMax(order: {
  category: string;
  city?: string | null;
  when: string;
  description?: string | null;
  dispatcher: string;
  dispatcherPhone: string;
}): string {
  const lines: string[] = [];
  lines.push('🔒 ЗАЯВКА ЗАКРЫТА');
  lines.push('');
  lines.push(`Тип: ${order.category}`);
  if (order.city) lines.push(`Город: ${order.city}`);
  lines.push(`Когда: ${order.when}`);
  if (order.description) lines.push(`Детали: ${order.description}`);
  lines.push('');
  lines.push(`📞 Диспетчер: ${order.dispatcher}`);
  return lines.join('\n');
}
