import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Shop from './pages/Shop';
import { AUTH_STORAGE_KEY, getHomePath, loadStoredAuth, normalizeStoredAuth } from './lib/session';
import './App.css';

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
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const destination = getHomePath(auth.role);

    if (location.pathname === '/login' || location.pathname === '/') {
      navigate(destination, { replace: true });
    }
  }, [auth?.role, auth?.token, location.pathname, navigate]);

  const handleAuthSuccess = (nextAuth) => {
    const normalized = normalizeStoredAuth(nextAuth, nextAuth?.role);
    if (!normalized.token) {
      return;
    }

    setAuth(normalized);
  };

  const handleLogout = () => {
    setAuth(null);
  };
  const homePath = getHomePath(auth?.role);

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
          <AuthGate auth={auth}>
            <Shop key={auth?.user?.userId || auth?.role || 'shop'} auth={auth} onLogout={handleLogout} />
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
