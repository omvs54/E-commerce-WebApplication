import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateUser } from '../lib/userDb';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'user',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.identifier.trim() || !formData.password) {
      setError('Please enter your email/username and password');
      setLoading(false);
      return;
    }

    const user = validateUser(formData.identifier, formData.password, formData.role);

    if (!user) {
      setError('Invalid credentials. Please check and try again.');
      setLoading(false);
      return;
    }

    const storage = formData.rememberMe ? localStorage : sessionStorage;
    storage.setItem('om-satarkar-store-user', JSON.stringify(user));
    
    setLoading(false);
    navigate('/shop');
  };

  const handleDemoLogin = (demoRole) => {
    const demoUser = {
      id: 'demo-' + demoRole,
      name: demoRole === 'admin' ? 'Admin User' : 'Demo User',
      email: 'demo@example.com',
      role: demoRole,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem('om-satarkar-store-user', JSON.stringify(demoUser));
    navigate('/shop');
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="auth-logo__text">OM SATARKAR</span>
            </Link>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue shopping</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="identifier">
                Email or Username
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                className="form-input"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your email or username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="form-checkbox__mark"></span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link--small">
                Forgot password?
              </Link>
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-button ${formData.role === 'user' ? 'role-button--active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'user' }))}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={`role-button ${formData.role === 'admin' ? 'role-button--active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'admin' }))}
                >
                  Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="button button--primary button--large"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Quick Demo</span>
          </div>

          <div className="demo-login">
            <button
              type="button"
              className="button button--demo button--full"
              onClick={() => handleDemoLogin('user')}
            >
              Try as Customer
            </button>
            <button
              type="button"
              className="button button--demo button--outline button--full"
              onClick={() => handleDemoLogin('admin')}
            >
              Try as Admin
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create one - it's free
              </Link>
            </p>
          </div>

          <div className="auth-home">
            <Link to="/" className="auth-link--secondary">
              Back to store
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
