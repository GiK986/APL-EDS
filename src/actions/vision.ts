'use server';

const VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

/** Runs Google Cloud Vision TEXT_DETECTION on a base64-encoded image and
 * returns the full detected text block (same shape as Tesseract's output),
 * so callers can reuse the same VIN-extraction logic for either engine. */
export async function scanVinWithVision(imageBase64: string): Promise<string> {
  const key = process.env.GOOGLE_VISION_API_KEY;
  if (!key) throw new Error('GOOGLE_VISION_API_KEY is not set');

  const res = await fetch(`${VISION_ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Vision API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const response = data.responses?.[0];
  if (response?.error) {
    throw new Error(`Vision API error: ${response.error.message}`);
  }

  return response?.textAnnotations?.[0]?.description ?? '';
}
