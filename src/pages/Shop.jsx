import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL =
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5174'
    ? 'http://localhost:4000'
    : '') || import.meta.env.VITE_API_URL || '';

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return INR_FORMATTER.format(amount);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return DATE_FORMATTER.format(date);
}

function toNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeProduct(product) {
  const id = product?._id || product?.id || product?.productId || '';
  const price = toNumber(product?.price ?? product?.amount ?? 0);
  const stock = toNumber(product?.stock ?? product?.countInStock ?? product?.quantity ?? 0);

  return {
    id,
    name: product?.name || product?.title || 'Untitled product',
    price,
    image: product?.image || product?.imageUrl || '',
    description: product?.description || product?.details || '',
    category: product?.category || '',
    stock,
  };
}

function normalizeOrderItem(item) {
  return {
    productId: item?.productId || item?.id || item?._id || '',
    name: item?.name || item?.title || 'Item',
    price: toNumber(item?.price ?? item?.amount ?? 0),
    quantity: Math.max(1, toNumber(item?.quantity ?? item?.qty ?? 1)),
    image: item?.image || item?.imageUrl || '',
  };
}

function normalizeOrder(order) {
  const rawItems = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.products)
      ? order.products
      : Array.isArray(order?.cart)
        ? order.cart
        : [];

  return {
    id: order?._id || order?.id || '',
    status: order?.status || 'placed',
    total: toNumber(order?.total ?? order?.amount ?? order?.grandTotal ?? 0),
    createdAt: order?.createdAt || order?.updatedAt || order?.date || new Date().toISOString(),
    items: rawItems.map(normalizeOrderItem),
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);
  return { response, data };
}

function isProductAvailable(product) {
  return product.stock === 0 ? false : true;
}

function Shop({ auth, onLogout = () => {} }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState({ type: '', message: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError('');

    try {
      const { response, data } = await requestJson('/api/products');
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Unable to load products.');
      }

      const rawProducts = Array.isArray(data) ? data : data?.products || data?.data || [];
      setProducts(rawProducts.map(normalizeProduct));
    } catch (error) {
      setProducts([]);
      setProductsError(error.message || 'Unable to load products.');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!auth?.token) {
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError('');
      return;
    }

    setOrdersLoading(true);
    setOrdersError('');

    try {
      const { response, data } = await requestJson('/api/orders/me', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Unable to load your orders.');
      }

      const rawOrders = Array.isArray(data) ? data : data?.orders || data?.data || [];
      const normalized = rawOrders.map(normalizeOrder).sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
      setOrders(normalized);
    } catch (error) {
      setOrders([]);
      setOrdersError(error.message || 'Unable to load your orders.');
    } finally {
      setOrdersLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const addToCart = (product) => {
    setCheckoutNotice({ type: '', message: '' });
    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.id === product.id);
      if (existingIndex === -1) {
        return [...current, { ...product, quantity: 1 }];
      }

      return current.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  };

  const increaseQuantity = (productId) => {
    setCart((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const nextQuantity = item.quantity - 1;
          return nextQuantity <= 0 ? null : { ...item, quantity: nextQuantity };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
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

    if (!auth?.token) {
      setCheckoutNotice({
        type: 'error',
        message: 'You must be signed in to complete checkout.',
      });
      return;
    }

    setCheckoutLoading(true);
    setCheckoutNotice({ type: '', message: '' });

    const snapshotItems = cart.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const payload = {
      items: snapshotItems,
      products: snapshotItems,
      cart: snapshotItems,
      total: cartTotal,
      amount: cartTotal,
      userId: auth.user?.userId,
      role: auth.role,
    };

    try {
      let checkoutResult = await requestJson('/api/orders/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (checkoutResult.response.status === 404) {
        checkoutResult = await requestJson('/api/checkout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!checkoutResult.response.ok) {
        throw new Error(
          checkoutResult.data?.message || checkoutResult.data?.error || 'Unable to complete checkout.'
        );
      }

      setCart([]);
      setCheckoutNotice({
        type: 'success',
        message: checkoutResult.data?.message || 'Order placed successfully.',
      });

      await loadOrders();
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
              Jyesta Store
            </Link>
            <p className="app-bar__subtitle">
              Welcome back, {auth?.user?.name || 'customer'} — browse products, manage your cart, and review orders.
            </p>
          </div>

          <div className="app-bar__actions">
            {auth?.role === 'admin' ? (
              <Link to="/admin" className="button button--secondary">
                Open admin dashboard
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

        <div className="shop-layout">
          <section className="shop-main">
            <div className="shop-section">
              <div className="shop-section__header">
                <div>
                  <h2 className="shop-section__title">Products</h2>
                  <p className="shop-section__meta">Add products to your cart and checkout in rupees.</p>
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

                        {product.description ? (
                          <p className="product-card__description">{product.description}</p>
                        ) : null}

                        <div className="product-card__actions">
                          <span className="pill">{product.category || 'General'}</span>
                          {typeof product.stock === 'number' ? (
                            <span className="pill pill--subtle">
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          className="button button--primary button--full"
                          onClick={() => addToCart(product)}
                          disabled={!isProductAvailable(product)}
                        >
                          {product.stock === 0 ? 'Sold out' : 'Add to cart'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
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
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        <div className="cart-item__controls">
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            -
                          </button>
                          <span className="cart-item__quantity">{item.quantity}</span>
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            onClick={() => increaseQuantity(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item__summary">
                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                        <button
                          type="button"
                          className="cart-item__remove"
                          onClick={() => removeFromCart(item.id)}
                        >
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

                <FormNotice type={checkoutNotice.type} message={checkoutNotice.message} />

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
                  {orders.map((order, index) => (
                    <article className="order-card" key={order.id || `${order.createdAt}-${index}`}>
                      <div className="order-card__header">
                        <div>
                          <h3 className="order-card__title">Order placed</h3>
                          <p className="order-card__meta">
                            {formatDate(order.createdAt)} • {order.items.length} item(s)
                          </p>
                        </div>
                        <span className={`order-chip order-chip--${order.status}`}>{order.status}</span>
                      </div>

                      <ul className="order-card__items">
                        {order.items.map((item, itemIndex) => (
                          <li className="order-card__item" key={item.productId || `${item.name}-${itemIndex}`}>
                            <span>
                              {item.name} × {item.quantity}
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

function FormNotice({ type, message }) {
  if (!message) {
    return null;
  }

  return <div className={`status-message status-message--${type}`}>{message}</div>;
}

export default Shop;