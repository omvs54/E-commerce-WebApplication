import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Shop from './pages/Shop';
import './App.css';

const AUTH_STORAGE_KEY = 'jyesta_auth_session';

function getHomePath(role) {
  return role === 'admin' ? '/admin' : '/shop';
}

function loadStoredAuth() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token) {
      return null;
    }

    return {
      token: parsed.token,
      role: parsed.role === 'admin' ? 'admin' : 'user',
      user: {
        userId: parsed.user?.userId || parsed.user?.id || parsed.user?._id || '',
        name: parsed.user?.name || '',
        email: parsed.user?.email || '',
        role: parsed.role === 'admin' ? 'admin' : 'user',
      },
    };
  } catch (error) {
    return null;
  }
}

function normalizeAuth(auth, fallbackRole = 'user') {
  const payload = auth?.user || auth?.data?.user || auth?.data || auth || {};
  const role = payload.role === 'admin' || auth?.role === 'admin' ? 'admin' : fallbackRole === 'admin' ? 'admin' : 'user';
  const token = auth?.token || auth?.accessToken || payload.token || auth?.data?.token || '';
  const user = {
    userId: payload.userId || payload.id || payload._id || '',
    name: payload.name || '',
    email: payload.email || '',
    role,
  };

  return { token, role, user };
}

function AuthGate({ auth, role, children }) {
  if (!auth?.token) {
    return <Navigate replace to="/login" />;
  }

  if (role && auth.role !== role) {
    return <Navigate replace to={getHomePath(auth.role)} />;
  }

  return children;
}

function AppRouter() {
  const [auth, setAuth] = useState(() => loadStoredAuth());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (auth?.token) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const handleAuthSuccess = (nextAuth) => {
    const normalized = normalizeAuth(nextAuth, nextAuth?.role);
    if (!normalized.token) {
      return;
    }

    setAuth(normalized);
  };

  const handleLogout = () => {
    setAuth(null);
  };

  const homePath = useMemo(() => getHomePath(auth?.role), [auth?.role]);

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={auth?.token ? homePath : '/login'} />} />
      <Route
        path="/login"
        element={auth?.token ? <Navigate replace to={homePath} /> : <Login onAuthSuccess={handleAuthSuccess} />}
      />
      <Route
        path="/shop"
        element={
          <AuthGate auth={auth} role="user">
            <Shop auth={auth} onLogout={handleLogout} />
          </AuthGate>
        }
      />
      <Route
        path="/admin"
        element={
          <AuthGate auth={auth} role="admin">
            <Admin auth={auth} onLogout={handleLogout} />
          </AuthGate>
        }
      />
      <Route path="*" element={<Navigate replace to={auth?.token ? homePath : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}