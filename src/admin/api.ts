import type { Content } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', ...init });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error page */
  }
  if (!response.ok) {
    const message = (body as { error?: string } | null)?.error ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return body as T;
}

const json = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const api = {
  session: () =>
    request<{ ok: boolean }>('/api/aboli/session').then(
      () => true,
      () => false,
    ),
  login: (username: string, password: string) => request('/api/aboli/login', json('POST', { username, password })),
  logout: () => request('/api/aboli/logout', { method: 'POST' }),
  load: () => request<Content>('/api/content', { cache: 'no-store' }),
  save: (content: Content) => request('/api/aboli/content', json('PUT', content)),
  reset: () => request<{ content: Content }>('/api/aboli/reset', { method: 'POST' }),
  upload: (blob: Blob) =>
    request<{ url: string }>('/api/aboli/upload', {
      method: 'POST',
      headers: { 'Content-Type': blob.type },
      body: blob,
    }),
};

/** Shrinks a photo in the browser so uploads stay small and the page stays fast. */
export async function prepareImage(file: File, maxSide = 1400): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process that image'))), 'image/jpeg', 0.86),
  );
}
