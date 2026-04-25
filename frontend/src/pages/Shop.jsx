import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { clearStoredCart, loadStoredCart, persistStoredCart } from '../lib/session';

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatCurrency(value) {
  return INR_FORMATTER.format(Number(value) || 0);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : DATE_FORMATTER.format(date);
}

function toNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeProduct(product) {
  return {
    id: product?._id || product?.id || '',
    name: product?.name || 'Untitled product',
    price: toNumber(product?.price),
    image: product?.image || '',
    description: product?.description || '',
    category: product?.category || 'General',
    stock: toNumber(product?.stock),
  };
}

function normalizeOrder(order) {
  return {
    id: order?._id || order?.id || '',
    status: order?.status || 'placed',
    total: toNumber(order?.total),
    createdAt: order?.createdAt || new Date().toISOString(),
    items: Array.isArray(order?.items) ? order.items : [],
  };
}

function Notice({ type, message }) {
  if (!message) {
    return null;
  }

  return <div className={`status-message status-message--${type}`}>{message}</div>;
}

export default function Shop({ auth, onLogout = () => {} }) {
  const userId = auth?.user?.userId || 'guest';
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState(() => loadStoredCart(userId));
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState({ type: '', message: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    persistStoredCart(userId, cart);
  }, [cart, userId]);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError('');

      try {
        const data = await apiRequest('/api/products');
        const rawProducts = Array.isArray(data) ? data : data?.products || [];

        if (!cancelled) {
          setProducts(rawProducts.map(normalizeProduct));
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          setProductsError(error.message || 'Unable to load products.');
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      if (!auth?.token) {
        setOrders([]);
        setOrdersLoading(false);
        setOrdersError('');
        return;
      }

      setOrdersLoading(true);
      setOrdersError('');

      try {
        const data = await apiRequest('/api/orders/me', {
          token: auth.token,
        });

        const rawOrders = Array.isArray(data) ? data : data?.orders || [];

        if (!cancelled) {
          setOrders(rawOrders.map(normalizeOrder));
        }
      } catch (error) {
        if (!cancelled) {
          setOrders([]);
          setOrdersError(error.message || 'Unable to load your orders.');
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [auth?.token]);

  const addToCart = (product) => {
    setCheckoutNotice({ type: '', message: '' });

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (!existing) {
        return [...current, { ...product, quantity: 1 }];
      }

      const nextQuantity = Math.min(existing.quantity + 1, Math.max(product.stock, 1));

      return current.map((item) => (item.id === product.id ? { ...item, quantity: nextQuantity } : item));
    });
  };

  const changeQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const product = products.find((entry) => entry.id === item.id);
          const nextQuantity = item.quantity + delta;
          const maxQuantity = Math.max(product?.stock ?? item.quantity, 1);

          if (nextQuantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity: Math.min(nextQuantity, maxQuantity),
          };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    clearStoredCart(userId);
    setCheckoutNotice({ type: '', message: '' });
  };

  const handleCheckout = async () => {
    if (!cart.length) {
      setCheckoutNotice({
        type: 'error',
        message: 'Your cart is empty.',
      });
      return;
    }

    setCheckoutLoading(true);
    setCheckoutNotice({ type: '', message: '' });

    try {
      const data = await apiRequest('/api/orders/checkout', {
        method: 'POST',
        token: auth.token,
        body: {
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      });

      setCart([]);
      clearStoredCart(userId);
      setCheckoutNotice({
        type: 'success',
        message: data?.message || 'Order placed successfully.',
      });

      const nextOrders = await apiRequest('/api/orders/me', {
        token: auth.token,
      });

      setOrders((Array.isArray(nextOrders) ? nextOrders : nextOrders?.orders || []).map(normalizeOrder));
    } catch (error) {
      setCheckoutNotice({
        type: 'error',
        message: error.message || 'Unable to complete checkout.',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="app-shell shop-page">
      <div className="app-shell__container">
        <header className="app-bar">
          <div className="app-bar__brand">
            <Link to="/shop" className="app-bar__title">
              Om Satarkar Store
            </Link>
            <p className="app-bar__subtitle">
              Welcome {auth?.user?.name || 'back'} . Browse products, manage your cart, and review your latest orders.
            </p>
          </div>

          <div className="app-bar__actions">
            {auth?.role === 'admin' ? (
              <Link to="/admin" className="button button--secondary">
                Admin dashboard
              </Link>
            ) : null}
            <div className="app-chip">
              <span>{auth?.user?.email || 'Signed in'}</span>
            </div>
            <button type="button" className="button button--ghost" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="store-hero">
          <div className="store-hero__copy">
            <p className="store-hero__eyebrow">React storefront</p>
            <h1 className="store-hero__title">Clean shopping flow with login, cart, and checkout history.</h1>
            <p className="store-hero__text">
              This version is built to be easy to maintain and easy to deploy, without dragging the failed project
              structure forward.
            </p>
          </div>
          <div className="store-hero__stats">
            <div className="store-stat">
              <span>Products</span>
              <strong>{productsLoading ? '...' : products.length}</strong>
            </div>
            <div className="store-stat">
              <span>Cart items</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="store-stat">
              <span>Orders</span>
              <strong>{ordersLoading ? '...' : orders.length}</strong>
            </div>
          </div>
        </section>

        <div className="shop-layout">
          <section className="shop-main">
            <section className="shop-section">
              <div className="shop-section__header">
                <div>
                  <h2 className="shop-section__title">Products</h2>
                  <p className="shop-section__meta">Everything is priced in INR and available through the live API.</p>
                </div>
              </div>

              {productsLoading ? (
                <div className="loading-state">Loading products...</div>
              ) : productsError ? (
                <div className="status-message status-message--error">{productsError}</div>
              ) : products.length === 0 ? (
                <div className="empty-state">No products are available right now.</div>
              ) : (
                <div className="shop-grid">
                  {products.map((product) => (
                    <article className="product-card" key={product.id || product.name}>
                      {product.image ? (
                        <img className="product-card__image" src={product.image} alt={product.name} />
                      ) : (
                        <div className="product-card__image product-card__image--placeholder">No image</div>
                      )}

                      <div className="product-card__body">
                        <div className="product-card__meta">
                          <h3 className="product-card__title">{product.name}</h3>
                          <p className="product-card__price">{formatCurrency(product.price)}</p>
                        </div>

                        <p className="product-card__description">{product.description}</p>

                        <div className="product-card__actions">
                          <span className="pill">{product.category}</span>
                          <span className="pill pill--subtle">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="button button--primary button--full"
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          {product.stock <= 0 ? 'Sold out' : 'Add to cart'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>

          <aside className="shop-sidebar">
            <section className="shop-section">
              <div className="shop-section__header">
                <div>
                  <h2 className="shop-section__title">Cart</h2>
                  <p className="shop-section__meta">{totalItems} item(s) ready for checkout</p>
                </div>
                {cart.length > 0 ? (
                  <button type="button" className="button button--ghost button--small" onClick={clearCart}>
                    Clear cart
                  </button>
                ) : null}
              </div>

              {cart.length === 0 ? (
                <div className="empty-state">Your cart is empty. Add products to see them here.</div>
              ) : (
                <div className="cart-list">
                  {cart.map((item) => (
                    <article className="cart-item" key={item.id}>
                      {item.image ? (
                        <img className="cart-item__image" src={item.image} alt={item.name} />
                      ) : (
                        <div className="cart-item__image cart-item__image--placeholder">No image</div>
                      )}

                      <div className="cart-item__body">
                        <h3 className="cart-item__title">{item.name}</h3>
                        <p className="cart-item__meta">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                        <div className="cart-item__controls">
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            onClick={() => changeQuantity(item.id, -1)}
                          >
                            -
                          </button>
                          <span className="cart-item__quantity">{item.quantity}</span>
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            onClick={() => changeQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item__summary">
                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                        <button type="button" className="cart-item__remove" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>
                <div className="cart-summary__row cart-summary__total">
                  <span>Total</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>

                <Notice type={checkoutNotice.type} message={checkoutNotice.message} />

                <button
                  type="button"
                  className="button button--primary button--full"
                  onClick={handleCheckout}
                  disabled={!cart.length || checkoutLoading}
                >
                  {checkoutLoading ? 'Processing checkout...' : 'Checkout'}
                </button>
              </div>
            </section>

            <section className="shop-section">
              <div className="shop-section__header">
                <div>
                  <h2 className="shop-section__title">Order history</h2>
                  <p className="shop-section__meta">Your latest purchases, newest first.</p>
                </div>
              </div>

              {ordersLoading ? (
                <div className="loading-state">Loading order history...</div>
              ) : ordersError ? (
                <div className="status-message status-message--error">{ordersError}</div>
              ) : orders.length === 0 ? (
                <div className="empty-state">No orders yet. Complete a checkout to build your history.</div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <article className="order-card" key={order.id}>
                      <div className="order-card__header">
                        <div>
                          <h3 className="order-card__title">Order placed</h3>
                          <p className="order-card__meta">
                            {formatDate(order.createdAt)} . {order.items.length} item(s)
                          </p>
                        </div>
                        <span className={`order-chip order-chip--${order.status}`}>{order.status}</span>
                      </div>

                      <ul className="order-card__items">
                        {order.items.map((item, index) => (
                          <li className="order-card__item" key={`${item.productId || item.name}-${index}`}>
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <strong>{formatCurrency(item.price * item.quantity)}</strong>
                          </li>
                        ))}
                      </ul>

                      <div className="order-card__footer">
                        <span>Total</span>
                        <strong>{formatCurrency(order.total)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
