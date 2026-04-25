const DEFAULT_LOCAL_API_URL = 'http://localhost:4000';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? DEFAULT_LOCAL_API_URL : 'https://e-commerce-webapplication-production.up.railway.app');

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

  const response = await fetch(buildApiUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Something went wrong. Please try again.');
  }

  return data;
}
