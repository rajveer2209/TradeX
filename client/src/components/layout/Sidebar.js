import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiPieChart,
  FiBarChart2,
  FiBriefcase,
  FiList,
  FiEye,
  FiSettings,
  FiX,
  FiActivity,
  FiTrendingUp,
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user.role === 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiPieChart size={16} /> },
    { name: 'Markets', path: '/stocks', icon: <FiBarChart2 size={16} /> },
    { name: 'Portfolio', path: '/portfolio', icon: <FiBriefcase size={16} /> },
    { name: 'Orders', path: '/transactions', icon: <FiList size={16} /> },
    { name: 'Watchlist', path: '/watchlist', icon: <FiEye size={16} /> },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'Admin',
      path: '/admin',
      icon: <FiSettings size={16} />,
      badge: 'Admin',
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`tradex-sidebar ${isOpen ? 'show' : ''}`}>
        {/* Mobile Header */}
        <div className="sidebar-header d-flex align-items-center justify-content-between p-3 d-lg-none border-bottom border-dark-subtle">
          <div className="d-flex align-items-center gap-2">
            <FiTrendingUp className="text-primary-accent" size={16} />
            <span className="fw-bold fs-7" style={{ color: 'var(--text-strong)' }}>TradeX</span>
          </div>
          <button
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-menu py-3">
          <div className="px-3 mb-2">
            <span className="text-uppercase fs-9 fw-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Navigation
            </span>
          </div>
          <ul className="nav flex-column px-2">
            {navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (isOpen) onClose();
                  }}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center justify-content-between ${
                      isActive ? 'active-link' : 'inactive-link'
                    }`
                  }
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text fw-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="fs-9 fw-semibold px-2 rounded-pill"
                      style={{
                        background: 'var(--danger-bg)',
                        color: 'var(--danger-color)',
                        border: '1px solid var(--danger-border)',
                        padding: '1px 6px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Status Card */}
        <div className="sidebar-bottom-card mx-3 p-3 mt-auto mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <FiActivity className="text-primary-accent" size={14} />
            <span className="fs-8 fw-bold" style={{ color: 'var(--text-strong)' }}>Simulation Engine</span>
          </div>
          <p className="fs-9 mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Real-time price simulation active. Zero financial risk.
          </p>
          <div className="d-flex align-items-center gap-2">
            <span className="pulse-indicator"></span>
            <span className="fs-9 fw-semibold" style={{ color: 'var(--success-color)' }}>All Systems Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
