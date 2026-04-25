export const AUTH_STORAGE_KEY = 'om-satarkar-store-auth';
export const CART_STORAGE_KEY_PREFIX = 'om-satarkar-store-cart';

export function getHomePath(role) {
  return role === 'admin' ? '/admin' : '/shop';
}

export function normalizeStoredAuth(auth, fallbackRole = 'user') {
  const payload = auth?.user || auth?.data?.user || auth?.data || auth || {};
  const role =
    payload.role === 'admin' || auth?.role === 'admin' || fallbackRole === 'admin' ? 'admin' : 'user';
  const token = auth?.token || auth?.accessToken || payload.token || auth?.data?.token || '';

  return {
    token,
    role,
    user: {
      userId: payload.userId || payload.id || payload._id || '',
      name: payload.name || '',
      email: payload.email || '',
      role,
    },
  };
}

export function loadStoredAuth() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed?.token ? normalizeStoredAuth(parsed, parsed?.role) : null;
  } catch {
    return null;
  }
}

function getCartStorageKey(userId) {
  return `${CART_STORAGE_KEY_PREFIX}:${userId || 'guest'}`;
}

export function loadStoredCart(userId) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getCartStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistStoredCart(userId, cart) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getCartStorageKey(userId), JSON.stringify(Array.isArray(cart) ? cart : []));
}

export function clearStoredCart(userId) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getCartStorageKey(userId));
}
