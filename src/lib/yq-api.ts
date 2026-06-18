const YQ_BASE = 'https://oem-api.yqservice.eu';

const ACCEPT_LANGUAGE_LOCALES: Record<string, string> = {
  bg: 'bg_BG',
  en: 'en_EN',
};

export async function yqFetch<T>(
  path: string,
  body?: object,
  lang = 'en'
): Promise<T> {
  const key = process.env.YQ_API_KEY;
  if (!key) throw new Error('YQ_API_KEY is not set');

  const res = await fetch(`${YQ_BASE}${path}`, {
    method: body !== undefined ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${key}`,
      'Accept-Language': ACCEPT_LANGUAGE_LOCALES[lang] ?? lang,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`YQ API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
