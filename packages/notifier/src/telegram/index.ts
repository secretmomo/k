// 转义 Telegram MarkdownV2
export function e(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

interface TelegramResponse {
  ok: boolean;
  error_code: number;
  description: string;
  result: {
    message_id: number;
    from: {
      id: number;
    };
  };
}

export async function sendMessage(text: string): Promise<TelegramResponse> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_GROUP_ID,
      text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
      disable_notification: true,
    }),
  });
  const { ok, status, statusText } = res;

  if (!ok) {
    console.warn(`send message(${text}) failed: ${status} ${statusText}`);
  }

  return res.json() as Promise<TelegramResponse>;
}
