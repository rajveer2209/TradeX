import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { register, clearError } from '../redux/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, password, confirmPassword } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    if (!name || !email || !password) {
      toast.warn('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.warn('Password should be at least 6 characters.');
      return;
    }

    const res = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(res)) {
      toast.success('Registration successful! You have been credited $100,000 in virtual funds.');
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100 py-5 px-3">
      <div className="auth-card tradex-card p-4 p-md-5 w-100" style={{ maxWidth: '480px' }}>
        {/* Brand header */}
        <div className="text-center mb-4">
          <div className="brand-logo-icon mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
            <FiTrendingUp className="text-primary-accent" size={26} />
          </div>
          <h2 className="text-white fw-bold mb-1">
            Create Trade<span className="text-primary-accent">X</span> Account
          </h2>
          <p className="text-secondary fs-7">
            Start with $100,000 in simulated trading cash
          </p>
        </div>

        {/* Register form */}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-2 d-block">
              Full Name
            </label>
            <div className="input-group">
              <span className="input-group-text bg-dark-surface border-dark-subtle text-secondary">
                <FiUser />
              </span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                className="form-control tradex-input"
                placeholder="Jane Doe"
                required
              />
            </div>
          </div>

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

          <div className="mb-3">
            <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-2 d-block">
              Password
            </label>
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
                placeholder="At least 6 characters"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-2 d-block">
              Confirm Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-dark-surface border-dark-subtle text-secondary">
                <FiLock />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                className="form-control tradex-input"
                placeholder="Repeat password"
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
                Open Simulation Account <FiArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-2 border-top border-dark-subtle">
          <span className="text-secondary fs-7">Already have an account? </span>
          <Link to="/login" className="text-primary-accent fw-bold fs-7 text-decoration-none">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
