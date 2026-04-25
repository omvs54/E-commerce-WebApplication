import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

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

function normalizeProduct(product) {
  return {
    id: product?._id || product?.id || '',
    name: product?.name || '',
    description: product?.description || '',
    image: product?.image || '',
    category: product?.category || 'General',
    stock: Number(product?.stock) || 0,
    price: Number(product?.price) || 0,
  };
}

function Notice({ type, message }) {
  if (!message) {
    return null;
  }

  return <div className={`status-message status-message--${type}`}>{message}</div>;
}

export default function Admin({ auth, onLogout = () => {} }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [metrics, setMetrics] = useState({
    productCount: 0,
    userCount: 0,
    orderCount: 0,
    revenue: 0,
    recentOrders: [],
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', message: '' });
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    price: '',
    stock: '',
  });

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

    const loadMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError('');

      try {
        const data = await apiRequest('/api/admin/metrics', {
          token: auth.token,
        });

        if (!cancelled) {
          setMetrics({
            productCount: Number(data?.productCount) || 0,
            userCount: Number(data?.userCount) || 0,
            orderCount: Number(data?.orderCount) || 0,
            revenue: Number(data?.revenue) || 0,
            recentOrders: Array.isArray(data?.recentOrders) ? data.recentOrders : [],
          });
        }
      } catch (error) {
        if (!cancelled) {
          setMetricsError(error.message || 'Unable to load admin metrics.');
        }
      } finally {
        if (!cancelled) {
          setMetricsLoading(false);
        }
      }
    };

    void loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [auth.token]);

  const refreshProducts = async () => {
    const data = await apiRequest('/api/products');
    const rawProducts = Array.isArray(data) ? data : data?.products || [];
    setProducts(rawProducts.map(normalizeProduct));
  };

  const refreshMetrics = async () => {
    const data = await apiRequest('/api/admin/metrics', {
      token: auth.token,
    });

    setMetrics({
      productCount: Number(data?.productCount) || 0,
      userCount: Number(data?.userCount) || 0,
      orderCount: Number(data?.orderCount) || 0,
      revenue: Number(data?.revenue) || 0,
      recentOrders: Array.isArray(data?.recentOrders) ? data.recentOrders : [],
    });
  };

  const updateFormValue = (field) => (event) => {
    setFormValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      description: '',
      category: '',
      image: '',
      price: '',
      stock: '',
    });
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      category: formValues.category.trim(),
      image: formValues.image.trim(),
      price: Number(formValues.price),
      stock: Number(formValues.stock),
    };

    if (!payload.name || !payload.description || !payload.image || !Number.isFinite(payload.price)) {
      setFormMessage({
        type: 'error',
        message: 'Please fill in name, description, image, and a valid price.',
      });
      return;
    }

    setSaving(true);
    setFormMessage({ type: '', message: '' });

    try {
      const data = await apiRequest('/api/products', {
        method: 'POST',
        token: auth.token,
        body: {
          ...payload,
          stock: Number.isFinite(payload.stock) ? payload.stock : 0,
        },
      });

      setFormMessage({
        type: 'success',
        message: data?.message || 'Product created successfully.',
      });

      resetForm();
      await refreshProducts();
      await refreshMetrics();
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
    if (!productId || !window.confirm('Delete this product from the catalog?')) {
      return;
    }

    try {
      const data = await apiRequest(`/api/products/${productId}`, {
        method: 'DELETE',
        token: auth.token,
      });

      setFormMessage({
        type: 'success',
        message: data?.message || 'Product deleted successfully.',
      });

      await refreshProducts();
      await refreshMetrics();
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
              Om Satarkar Admin
            </Link>
            <p className="app-bar__subtitle">
              Manage products, review order activity, and keep the storefront ready for customers.
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
            <strong className="stat-card__value">{metricsLoading ? '...' : metrics.productCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Users</span>
            <strong className="stat-card__value">{metricsLoading ? '...' : metrics.userCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Orders</span>
            <strong className="stat-card__value">{metricsLoading ? '...' : metrics.orderCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Revenue</span>
            <strong className="stat-card__value">{metricsLoading ? '...' : formatCurrency(metrics.revenue)}</strong>
          </article>
        </section>

        {metricsError ? <div className="status-message status-message--error">{metricsError}</div> : null}
        <Notice type={formMessage.type} message={formMessage.message} />

        <div className="admin-layout">
          <section className="admin-panel">
            <div className="shop-section__header">
              <div>
                <h2 className="shop-section__title">Create a product</h2>
                <p className="shop-section__meta">Add new catalog items with stock tracking and category labels.</p>
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
                    Price (INR)
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
                    placeholder="Fashion"
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
                  placeholder="Write a short description"
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
                <p className="shop-section__meta">Review and remove products currently available in the store.</p>
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
                  <article className="admin-product" key={product.id}>
                    {product.image ? (
                      <img className="admin-product__image" src={product.image} alt={product.name} />
                    ) : (
                      <div className="admin-product__image admin-product__image--placeholder">No image</div>
                    )}

                    <div className="admin-product__body">
                      <div className="admin-product__heading">
                        <div>
                          <h3 className="admin-product__title">{product.name}</h3>
                          <p className="admin-product__meta">{product.category}</p>
                        </div>
                        <strong className="admin-product__price">{formatCurrency(product.price)}</strong>
                      </div>

                      <p className="admin-product__description">{product.description}</p>

                      <div className="admin-product__footer">
                        <span className="pill pill--subtle">{product.stock} in stock</span>
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
              <p className="shop-section__meta">See the newest orders and totals at a glance.</p>
            </div>
          </div>

          {metricsLoading ? (
            <div className="loading-state">Loading recent orders...</div>
          ) : metrics.recentOrders.length === 0 ? (
            <div className="empty-state">No recent orders to display.</div>
          ) : (
            <div className="recent-orders">
              {metrics.recentOrders.map((order) => (
                <article className="recent-order" key={order.id}>
                  <div className="recent-order__header">
                    <div>
                      <h3 className="recent-order__title">Order</h3>
                      <p className="recent-order__meta">
                        {formatDate(order.createdAt)} . {order.items?.length || order.itemCount || 0} item(s)
                      </p>
                    </div>
                    <span className={`order-chip order-chip--${order.status}`}>{order.status}</span>
                  </div>

                  <div className="recent-order__customer">
                    <span>{order.userName || order.userEmail || 'Customer details unavailable'}</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
