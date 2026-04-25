export const CART_STORAGE_KEY_PREFIX = 'om-satarkar-store-cart';

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
