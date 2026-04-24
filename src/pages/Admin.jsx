import { useCallback, useEffect, useState } from 'react';
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
  return INR_FORMATTER.format(Number(value) || 0);
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
  return {
    id: product?._id || product?.id || product?.productId || '',
    name: product?.name || product?.title || 'Untitled product',
    price: toNumber(product?.price ?? product?.amount ?? 0),
    image: product?.image || product?.imageUrl || '',
    description: product?.description || product?.details || '',
    category: product?.category || '',
    stock: toNumber(product?.stock ?? product?.countInStock ?? product?.quantity ?? 0),
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
    customerName: order?.user?.name || order?.userName || order?.customerName || '',
    customerEmail: order?.user?.email || order?.userEmail || order?.email || '',
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

function Notice({ type, message }) {
  if (!message) {
    return null;
  }

  return <div className={`status-message status-message--${type}`}>{message}</div>;
}

function Admin({ auth, onLogout = () => {} }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', message: '' });
  const [metrics, setMetrics] = useState({
    productCount: 0,
    userCount: 0,
    orderCount: 0,
    revenue: 0,
    recentOrders: [],
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');
  const [formValues, setFormValues] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    stock: '',
  });

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

  const loadMetrics = useCallback(async () => {
    if (!auth?.token) {
      setMetricsLoading(false);
      return;
    }

    setMetricsLoading(true);
    setMetricsError('');

    try {
      let result = await requestJson('/api/admin/metrics', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (result.response.status === 404) {
        result = await requestJson('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
      }

      if (result.response.status === 404) {
        result = await requestJson('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
      }

      if (!result.response.ok) {
        throw new Error(result.data?.message || result.data?.error || 'Unable to load dashboard metrics.');
      }

      const recentOrdersSource =
        result.data?.recentOrders || result.data?.orders || result.data?.data?.recentOrders || result.data?.data?.orders || [];

      const normalizedRecentOrders = Array.isArray(recentOrdersSource)
        ? recentOrdersSource.map(normalizeOrder).sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        : [];

      setMetrics({
        productCount: toNumber(result.data?.productCount ?? result.data?.productsCount ?? products.length),
        userCount: toNumber(result.data?.userCount ?? result.data?.usersCount ?? 0),
        orderCount: toNumber(result.data?.orderCount ?? result.data?.ordersCount ?? normalizedRecentOrders.length),
        revenue: toNumber(result.data?.revenue ?? result.data?.totalRevenue ?? result.data?.earnings ?? 0),
        recentOrders: normalizedRecentOrders,
      });
    } catch (error) {
      setMetrics({
        productCount: products.length,
        userCount: 0,
        orderCount: 0,
        revenue: 0,
        recentOrders: [],
      });
      setMetricsError(error.message || 'Unable to load dashboard metrics.');
    } finally {
      setMetricsLoading(false);
    }
  }, [auth?.token, products.length]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const updateFormValue = (field) => (event) => {
    const value = event.target.value;
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      price: '',
      image: '',
      description: '',
      category: '',
      stock: '',
    });
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    const name = formValues.name.trim();
    const price = Number(formValues.price);
    const image = formValues.image.trim();
    const description = formValues.description.trim();
    const category = formValues.category.trim();
    const stock = formValues.stock === '' ? undefined : Number(formValues.stock);

    if (!name || !Number.isFinite(price)) {
      setFormMessage({
        type: 'error',
        message: 'Please enter a product name and a valid price.',
      });
      return;
    }

    setSaving(true);
    setFormMessage({ type: '', message: '' });

    try {
      const { response, data } = await requestJson('/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth?.token || ''}`,
        },
        body: JSON.stringify({
          name,
          title: name,
          price,
          image,
          imageUrl: image,
          description,
          category,
          stock: Number.isFinite(stock) ? stock : undefined,
          countInStock: Number.isFinite(stock) ? stock : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Unable to create the product.');
      }

      setFormMessage({
        type: 'success',
        message: data?.message || 'Product created successfully.',
      });
      resetForm();
      await loadProducts();
      await loadMetrics();
    } catch (error) {
      setFormMessage({
        type: 'error',
        message: error.message || 'Unable to create the product.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) {
      return;
    }

    const shouldDelete = window.confirm('Delete this product from the catalog?');
    if (!shouldDelete) {
      return;
    }

    try {
      const { response, data } = await requestJson(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth?.token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Unable to delete the product.');
      }

      setProducts((current) => current.filter((item) => item.id !== productId));
      setFormMessage({
        type: 'success',
        message: data?.message || 'Product deleted successfully.',
      });
      await loadMetrics();
    } catch (error) {
      setFormMessage({
        type: 'error',
        message: error.message || 'Unable to delete the product.',
      });
    }
  };

  return (
    <main className="app-shell admin-page">
      <div className="app-shell__container">
        <header className="app-bar">
          <div className="app-bar__brand">
            <Link to="/admin" className="app-bar__title">
              Admin Dashboard
            </Link>
            <p className="app-bar__subtitle">
              Manage products, monitor user activity, and review order performance in Indian Rupees.
            </p>
          </div>

          <div className="app-bar__actions">
            <Link to="/shop" className="button button--secondary">
              Open shop
            </Link>
            <div className="app-chip">
              <span>{auth?.user?.name || auth?.user?.email || 'Admin'}</span>
            </div>
            <button type="button" className="button button--ghost" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-card__label">Products</span>
            <strong className="stat-card__value">
              {metricsLoading ? '...' : metrics.productCount}
            </strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Users</span>
            <strong className="stat-card__value">
              {metricsLoading ? '...' : metrics.userCount}
            </strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Orders</span>
            <strong className="stat-card__value">
              {metricsLoading ? '...' : metrics.orderCount}
            </strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Revenue</span>
            <strong className="stat-card__value">
              {metricsLoading ? '...' : formatCurrency(metrics.revenue)}
            </strong>
          </article>
        </section>

        {metricsError ? <div className="status-message status-message--error">{metricsError}</div> : null}
        <Notice type={formMessage.type} message={formMessage.message} />

        <div className="admin-layout">
          <section className="admin-panel">
            <div className="shop-section__header">
              <div>
                <h2 className="shop-section__title">Create a product</h2>
                <p className="shop-section__meta">Add new items to the storefront catalog.</p>
              </div>
            </div>

            <form className="admin-form" onSubmit={handleCreateProduct}>
              <div className="admin-form__grid">
                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="product-name">
                    Name
                  </label>
                  <input
                    id="product-name"
                    className="auth-form__input"
                    type="text"
                    placeholder="Product name"
                    value={formValues.name}
                    onChange={updateFormValue('name')}
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="product-price">
                    Price (₹)
                  </label>
                  <input
                    id="product-price"
                    className="auth-form__input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formValues.price}
                    onChange={updateFormValue('price')}
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="product-image">
                    Image URL
                  </label>
                  <input
                    id="product-image"
                    className="auth-form__input"
                    type="url"
                    placeholder="https://..."
                    value={formValues.image}
                    onChange={updateFormValue('image')}
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="product-category">
                    Category
                  </label>
                  <input
                    id="product-category"
                    className="auth-form__input"
                    type="text"
                    placeholder="Category"
                    value={formValues.category}
                    onChange={updateFormValue('category')}
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="product-stock">
                    Stock
                  </label>
                  <input
                    id="product-stock"
                    className="auth-form__input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formValues.stock}
                    onChange={updateFormValue('stock')}
                  />
                </div>
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="product-description">
                  Description
                </label>
                <textarea
                  id="product-description"
                  className="auth-form__input auth-form__input--textarea"
                  rows="4"
                  placeholder="Product details"
                  value={formValues.description}
                  onChange={updateFormValue('description')}
                />
              </div>

              <button className="button button--primary" type="submit" disabled={saving}>
                {saving ? 'Saving product...' : 'Create product'}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="shop-section__header">
              <div>
                <h2 className="shop-section__title">Catalog</h2>
                <p className="shop-section__meta">Review the products currently available in the store.</p>
              </div>
            </div>

            {productsLoading ? (
              <div className="loading-state">Loading products...</div>
            ) : productsError ? (
              <div className="status-message status-message--error">{productsError}</div>
            ) : products.length === 0 ? (
              <div className="empty-state">There are no products in the catalog yet.</div>
            ) : (
              <div className="admin-products">
                {products.map((product) => (
                  <article className="admin-product" key={product.id || product.name}>
                    {product.image ? (
                      <img className="admin-product__image" src={product.image} alt={product.name} />
                    ) : (
                      <div className="admin-product__image admin-product__image--placeholder">No image</div>
                    )}

                    <div className="admin-product__body">
                      <div className="admin-product__heading">
                        <div>
                          <h3 className="admin-product__title">{product.name}</h3>
                          <p className="admin-product__meta">{product.category || 'General'}</p>
                        </div>
                        <strong className="admin-product__price">{formatCurrency(product.price)}</strong>
                      </div>

                      {product.description ? (
                        <p className="admin-product__description">{product.description}</p>
                      ) : null}

                      <div className="admin-product__footer">
                        <span className="pill pill--subtle">
                          {typeof product.stock === 'number' ? `${product.stock} in stock` : 'Stock not set'}
                        </span>
                        <button
                          type="button"
                          className="button button--danger button--small"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="admin-panel admin-panel--full">
          <div className="shop-section__header">
            <div>
              <h2 className="shop-section__title">Recent orders</h2>
              <p className="shop-section__meta">Quickly review the newest purchases and their totals.</p>
            </div>
          </div>

          {metricsLoading ? (
            <div className="loading-state">Loading recent orders...</div>
          ) : metrics.recentOrders.length === 0 ? (
            <div className="empty-state">No recent orders to display.</div>
          ) : (
            <div className="recent-orders">
              {metrics.recentOrders.map((order, index) => (
                <article className="recent-order" key={order.id || `${order.createdAt}-${index}`}>
                  <div className="recent-order__header">
                    <div>
                      <h3 className="recent-order__title">Order</h3>
                      <p className="recent-order__meta">
                        {formatDate(order.createdAt)} • {order.items.length} item(s)
                      </p>
                    </div>
                    <span className={`order-chip order-chip--${order.status}`}>{order.status}</span>
                  </div>

                  <div className="recent-order__customer">
                    <span>
                      {order.customerName || order.customerEmail || order.id || 'Customer details unavailable'}
                    </span>
                    <strong>{formatCurrency(order.total)}</strong>
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
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Admin;