const DEFAULT_LOCAL_API_URL = 'http://localhost:4000';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? DEFAULT_LOCAL_API_URL : 'https://e-commerce-webapplication-production.up.railway.app');

console.log('[API] Using base URL:', API_BASE_URL);

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest(path, options = {}) {
  const { body, headers = {}, token, ...rest } = options;
  const requestHeaders = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const url = buildApiUrl(path);
  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[API] Request failed:', url, error.message);
    throw error;
  }
}
