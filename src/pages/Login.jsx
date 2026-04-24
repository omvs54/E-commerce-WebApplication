import { useEffect, useState } from 'react';

const API_BASE_URL =
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5174'
    ? 'http://localhost:4000'
    : '') || import.meta.env.VITE_API_URL || '';

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
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

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Something went wrong. Please try again.');
  }

  return data;
}

function normalizeAuthResponse(data, fallbackRole) {
  const payload = data?.user || data?.data?.user || data?.data || data || {};
  const role = payload.role === 'admin' || data?.role === 'admin' || fallbackRole === 'admin' ? 'admin' : 'user';
  const token = data?.token || data?.accessToken || payload.token || data?.data?.token || '';

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

function FormAlert({ type, message }) {
  if (!message) {
    return null;
  }

  return <div className={`auth-alert auth-alert--${type}`}>{message}</div>;
}

function Login({ onAuthSuccess = () => {} }) {
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

  useEffect(() => {
    setNotice({ type: '', message: '' });
    if (role === 'admin' && mode !== 'login') {
      setMode('login');
    }
  }, [mode, role]);

  const updateLoginValue = (field) => (event) => {
    const value = event.target.value;
    setLoginValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateRegisterValue = (field) => (event) => {
    const value = event.target.value;
    setRegisterValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    const identifier = loginValues.identifier.trim();
    const password = loginValues.password;

    if (!identifier || !password) {
      setNotice({
        type: 'error',
        message: 'Please enter your email or username and password.',
      });
      return;
    }

    setLoading(true);
    setNotice({ type: '', message: '' });

    try {
      const data = await requestJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          role,
          email: identifier,
          identifier,
          username: identifier,
          password,
        }),
      });

      const auth = normalizeAuthResponse(data, role);
      if (!auth.token) {
        throw new Error('Login succeeded, but no token was returned by the server.');
      }

      onAuthSuccess(auth);
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Unable to log in right now.',
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
        message: 'Please provide your name, email, and password to create an account.',
      });
      return;
    }

    setLoading(true);
    setNotice({ type: '', message: '' });

    try {
      const data = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'user',
        }),
      });

      const auth = normalizeAuthResponse(data, 'user');

      if (auth.token) {
        onAuthSuccess(auth);
        return;
      }

      const loginData = await requestJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          role: 'user',
          email,
          identifier: email,
          username: email,
          password,
        }),
      });

      const loginAuth = normalizeAuthResponse(loginData, 'user');
      if (!loginAuth.token) {
        throw new Error('Account created, but automatic sign-in failed.');
      }

      onAuthSuccess(loginAuth);
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Unable to register right now.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__aside">
          <p className="auth-card__eyebrow">Jyesta storefront</p>
          <h1 className="auth-card__title">Sign in to continue shopping or manage the catalog.</h1>
          <p className="auth-card__subtitle">
            One account screen for both customers and admins, with secure login, new user signup, and persistent sessions.
          </p>

          <div className="auth-card__notes">
            <div className="auth-note">
              <span className="auth-note__label">Admin access</span>
              <strong className="auth-note__value">om / password#123</strong>
            </div>
            <div className="auth-note">
              <span className="auth-note__label">User accounts</span>
              <strong className="auth-note__value">Register with name, email, and password</strong>
            </div>
          </div>
        </div>

        <div className="auth-card__content">
          <div className="auth-tabs" role="tablist" aria-label="Select account type">
            <button
              type="button"
              className={`auth-tab ${role === 'admin' ? 'auth-tab--active' : ''}`}
              onClick={() => setRole('admin')}
            >
              Admin Login
            </button>
            <button
              type="button"
              className={`auth-tab ${role === 'user' ? 'auth-tab--active' : ''}`}
              onClick={() => setRole('user')}
            >
              User Login
            </button>
          </div>

          {role === 'user' ? (
            <div className="auth-toggle" aria-label="Choose login or sign up">
              <button
                type="button"
                className={`auth-toggle__button ${mode === 'login' ? 'auth-toggle__button--active' : ''}`}
                onClick={() => setMode('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className={`auth-toggle__button ${mode === 'register' ? 'auth-toggle__button--active' : ''}`}
                onClick={() => setMode('register')}
              >
                Sign up
              </button>
            </div>
          ) : (
            <div className="auth-credential">
              Use the admin credentials <strong>om</strong> and <strong>password#123</strong>.
            </div>
          )}

          <FormAlert type={notice.type} message={notice.message} />

          {role === 'admin' || mode === 'login' ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="identifier">
                  {role === 'admin' ? 'Admin username or email' : 'Email address'}
                </label>
                <input
                  id="identifier"
                  className="auth-form__input"
                  type="text"
                  autoComplete="username"
                  placeholder={role === 'admin' ? 'om' : 'you@example.com'}
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
                {loading ? 'Signing in...' : role === 'admin' ? 'Admin login' : 'Log in'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className="auth-form__input"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
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
                  placeholder="Create a secure password"
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

export default Login;