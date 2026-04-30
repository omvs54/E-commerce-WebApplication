import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser, isEmailAvailable } from '../lib/userDb';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    if (!isEmailAvailable(formData.email)) {
      setError('An account with this email already exists');
      setLoading(false);
      return;
    }

    try {
      const newUser = createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'user',
      });

      sessionStorage.setItem('om-satarkar-store-user', JSON.stringify(newUser));
      
      setLoading(false);
      navigate('/shop');
    } catch (err) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="auth-logo__text">OM SATARKAR</span>
            </Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us for a better shopping experience</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span className="form-checkbox__mark"></span>
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="auth-link--inline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="auth-link--inline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="button button--primary button--large"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
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
