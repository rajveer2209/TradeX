import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import { login, clearError } from '../redux/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Please fill in both email and password.');
      return;
    }

    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) {
      toast.success('Welcome back to TradeX!');
      navigate('/dashboard', { replace: true });
    }
  };

  // Demo user autofill
  const handleQuickDemo = (role = 'trader') => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@tradex.com',
        password: 'admin123',
      });
    } else {
      setFormData({
        email: 'demo@tradex.com',
        password: 'demo123',
      });
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100 py-5 px-3">
      <div className="auth-card tradex-card p-4 p-md-5 w-100" style={{ maxWidth: '460px' }}>
        {/* Brand header */}
        <div className="text-center mb-4">
          <div className="brand-logo-icon mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
            <FiTrendingUp className="text-primary-accent" size={26} />
          </div>
          <h2 className="text-white fw-bold mb-1">
            Trade<span className="text-primary-accent">X</span>
          </h2>
          <p className="text-secondary fs-7">
            Sign in to access your simulated trading portfolio
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-2 d-block">
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text bg-dark-surface border-dark-subtle text-secondary">
                <FiMail />
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                className="form-control tradex-input"
                placeholder="trader@tradex.com"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-0">
                Password
              </label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-dark-surface border-dark-subtle text-secondary">
                <FiLock />
              </span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                className="form-control tradex-input"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 fw-bold text-uppercase tracking-wider fs-7 d-flex align-items-center justify-content-center gap-2 mb-3"
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <>
                Sign In <FiArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="p-3 rounded-2 bg-dark-surface border border-dark-subtle mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
              Quick Demo Login:
            </span>
            <span className="badge bg-primary-subtle text-primary fs-8">1-Click</span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-xs btn-dark-outline flex-fill"
              onClick={() => handleQuickDemo('trader')}
            >
              Demo Trader
            </button>
            <button
              type="button"
              className="btn btn-xs btn-dark-outline flex-fill d-flex align-items-center justify-content-center gap-1"
              onClick={() => handleQuickDemo('admin')}
            >
              <FiShield size={12} className="text-warning" />
              Demo Admin
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center pt-2 border-top border-dark-subtle">
          <span className="text-secondary fs-7">Don't have an account yet? </span>
          <Link to="/register" className="text-primary-accent fw-bold fs-7 text-decoration-none">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
