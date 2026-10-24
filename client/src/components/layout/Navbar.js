import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiTrendingUp,
  FiLogOut,
  FiUser,
  FiDollarSign,
  FiMenu,
  FiShield,
  FiSearch,
  FiBell,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { loadUser } from '../../redux/slices/authSlice';
import { formatCurrency } from '../../utils/formatters';

const Navbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleRefreshBalance = () => {
    dispatch(loadUser());
  };

  return (
    <nav className="navbar navbar-expand-lg tradex-navbar sticky-top">
      <div className="container-fluid px-2 px-lg-3 d-flex align-items-center justify-content-between" style={{ height: 'var(--header-height)' }}>
        {/* Left: Brand + Mobile Toggle */}
        <div className="d-flex align-items-center gap-2">
          {isAuthenticated && (
            <button
              className="btn btn-icon d-lg-none p-1"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation"
            >
              <FiMenu size={18} />
            </button>
          )}

          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none m-0">
            <div className="brand-logo-icon">
              <FiTrendingUp className="text-primary-accent" size={18} />
            </div>
            <span className="brand-text">
              Trade<span className="text-primary-accent">X</span>
            </span>
          </Link>

          {/* Divider */}
          {isAuthenticated && (
            <span style={{ width: '1px', height: '20px', background: 'var(--card-border)', margin: '0 4px' }} />
          )}

          {/* Search Bar (Desktop) */}
          {isAuthenticated && (
            <div className="d-none d-md-flex align-items-center gap-2 px-2 py-1 rounded" 
                 style={{ background: 'var(--bg-dark)', border: '1px solid var(--card-border)', minWidth: '200px' }}>
              <FiSearch size={13} className="text-secondary" />
              <Link to="/stocks" className="text-secondary fs-8 text-decoration-none" style={{ lineHeight: 1 }}>
                Search symbols, stocks...
              </Link>
            </div>
          )}
        </div>

        {/* Center: Market Status */}
        {isAuthenticated && (
          <div className="d-none d-lg-flex align-items-center gap-3">
            <span className="badge-live-pulse">MARKETS OPEN</span>
          </div>
        )}

        {/* Right side items */}
        {isAuthenticated && user ? (
          <div className="d-flex align-items-center gap-1">
            {/* Balance Badge */}
            <div
              className="balance-pill d-flex align-items-center px-2 py-1"
              title="Click to refresh balance"
              onClick={handleRefreshBalance}
              style={{ borderRadius: '4px' }}
            >
              <div className="balance-icon-circle me-1">
                <FiDollarSign size={11} className="text-success" />
              </div>
              <div className="d-flex flex-column text-start">
                <span className="balance-label d-none d-sm-block">Balance</span>
                <span className="balance-amount font-mono">
                  {formatCurrency(user.balance ?? 100000)}
                </span>
              </div>
            </div>

            {/* Notification bell */}
            <button className="btn btn-icon p-1 ms-1" title="Notifications">
              <FiBell size={16} />
            </button>

            {/* User Profile Badge */}
            <div className="d-none d-md-flex align-items-center gap-2 px-2 py-1 user-profile-badge ms-1">
              <div className="avatar-circle">
                {user.role === 'admin' ? (
                  <FiShield className="text-warning" size={13} />
                ) : (
                  <FiUser size={13} style={{ color: 'var(--primary-accent)' }} />
                )}
              </div>
              <div className="d-flex flex-column text-start">
                <span className="fw-semibold fs-8" style={{ color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  {user.name || 'Trader'}
                </span>
                <span className="fs-9 text-capitalize" style={{ color: 'var(--text-muted)' }}>
                  {user.role || 'Investor'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn btn-logout d-flex align-items-center gap-1 px-2 py-1 ms-1"
              title="Sign Out"
            >
              <FiLogOut size={14} />
              <span className="d-none d-lg-inline fs-8 fw-medium">Exit</span>
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-dark-outline btn-sm px-3 py-1">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm px-3 py-1">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
