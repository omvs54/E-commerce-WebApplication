import { useState } from 'react';
import { apiRequest } from '../lib/api';
import { normalizeStoredAuth } from '../lib/session';

function FormAlert({ type, message }) {
  if (!message) {
    return null;
  }

  return <div className={`auth-alert auth-alert--${type}`}>{message}</div>;
}

export default function Login({ onAuthSuccess = () => {} }) {
  const [role, setRole] = useState('user');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });
  const [loginValues, setLoginValues] = useState({
    identifier: '',
    password: '',
  });
  const [registerValues, setRegisterValues] = useState({
    name: '',
    email: '',
    password: '',
  });

  const updateLoginValue = (field) => (event) => {
    setLoginValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const updateRegisterValue = (field) => (event) => {
    setRegisterValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const activateRole = (nextRole) => {
    setRole(nextRole);
    setNotice({ type: '', message: '' });

    if (nextRole === 'admin') {
      setMode('login');
    }
  };

  const activateMode = (nextMode) => {
    setMode(nextMode);
    setNotice({ type: '', message: '' });
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    const identifier = loginValues.identifier.trim();
    const password = loginValues.password;

    if (!identifier || !password) {
      setNotice({
        type: 'error',
        message: 'Please enter your account email or username and password.',
      });
      return;
    }

    setLoading(true);
    setNotice({ type: '', message: '' });

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          role,
          identifier,
          email: identifier,
          username: identifier,
          password,
        },
      });

      const auth = normalizeStoredAuth(data, role);

      if (!auth.token) {
        throw new Error('Login succeeded, but the server did not return a token.');
      }

      onAuthSuccess(auth);
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Unable to sign in right now.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    const name = registerValues.name.trim();
    const email = registerValues.email.trim();
    const password = registerValues.password;

    if (!name || !email || !password) {
      setNotice({
        type: 'error',
        message: 'Please provide your name, email, and password.',
      });
      return;
    }

    setLoading(true);
    setNotice({ type: '', message: '' });

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name,
          email,
          password,
        },
      });

      const auth = normalizeStoredAuth(data, 'user');

      if (!auth.token) {
        throw new Error('Account created, but automatic sign-in did not complete.');
      }

      onAuthSuccess(auth);
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Unable to create your account right now.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__aside">
          <div>
            <p className="auth-card__eyebrow">Om Satarkar Store</p>
            <h1 className="auth-card__title">A simple ecommerce website with real login, cart, and admin control.</h1>
            <p className="auth-card__subtitle">
              Customers can sign up and shop. Admins can manage the catalog and track orders. The app is structured to
              split cleanly into separate frontend and backend repos for Render deployment.
            </p>
          </div>

          <div className="auth-card__notes">
            <div className="auth-note">
              <span className="auth-note__label">Customer flow</span>
              <strong className="auth-note__value">Sign up, browse products, add to cart, and place orders.</strong>
            </div>
            <div className="auth-note">
              <span className="auth-note__label">Admin flow</span>
              <strong className="auth-note__value">Log in with the seeded admin account from backend environment variables.</strong>
            </div>
            <div className="auth-note">
              <span className="auth-note__label">Deployment</span>
              <strong className="auth-note__value">Frontend static site + backend API, ready for separate Render services.</strong>
            </div>
          </div>
        </div>

        <div className="auth-card__content">
          <div className="auth-tabs" role="tablist" aria-label="Select account type">
            <button
              type="button"
              className={`auth-tab ${role === 'user' ? 'auth-tab--active' : ''}`}
              onClick={() => activateRole('user')}
            >
              Customer
            </button>
            <button
              type="button"
              className={`auth-tab ${role === 'admin' ? 'auth-tab--active' : ''}`}
              onClick={() => activateRole('admin')}
            >
              Admin
            </button>
          </div>

          {role === 'user' ? (
            <div className="auth-toggle" aria-label="Choose login or sign up">
              <button
                type="button"
                className={`auth-toggle__button ${mode === 'login' ? 'auth-toggle__button--active' : ''}`}
                onClick={() => activateMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-toggle__button ${mode === 'register' ? 'auth-toggle__button--active' : ''}`}
                onClick={() => activateMode('register')}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="auth-credential">
              Use the admin username or email and password that you configure in the backend environment variables.
            </div>
          )}

          <FormAlert type={notice.type} message={notice.message} />

          {role === 'admin' || mode === 'login' ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="identifier">
                  {role === 'admin' ? 'Admin email or username' : 'Email address'}
                </label>
                <input
                  id="identifier"
                  className="auth-form__input"
                  type="text"
                  autoComplete="username"
                  placeholder={role === 'admin' ? 'admin or admin@example.com' : 'you@example.com'}
                  value={loginValues.identifier}
                  onChange={updateLoginValue('identifier')}
                />
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="auth-form__input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginValues.password}
                  onChange={updateLoginValue('password')}
                />
              </div>

              <button className="button button--primary button--full" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : role === 'admin' ? 'Admin login' : 'Login'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  className="auth-form__input"
                  type="text"
                  autoComplete="name"
                  placeholder="Om Satarkar"
                  value={registerValues.name}
                  onChange={updateRegisterValue('name')}
                />
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="register-email">
                  Email
                </label>
                <input
                  id="register-email"
                  className="auth-form__input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={registerValues.email}
                  onChange={updateRegisterValue('email')}
                />
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  className="auth-form__input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={registerValues.password}
                  onChange={updateRegisterValue('password')}
                />
              </div>

              <button className="button button--primary button--full" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
