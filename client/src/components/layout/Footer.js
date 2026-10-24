import React from 'react';
import { FiTrendingUp, FiShield, FiGlobe } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="tradex-footer mt-auto">
      <div className="container-fluid px-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-1">
        <div className="d-flex align-items-center gap-2 text-secondary fs-9">
          <FiTrendingUp className="text-primary-accent" size={12} />
          <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>TradeX</span>
          <span style={{ color: 'var(--card-border)' }}>|</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className="d-flex align-items-center gap-3 text-secondary fs-9">
          <span className="d-flex align-items-center gap-1">
            <FiShield size={11} className="text-success" />
            <span>Simulation Mode</span>
          </span>
          <span style={{ color: 'var(--card-border)' }}>|</span>
          <span className="d-flex align-items-center gap-1">
            <FiGlobe size={11} />
            <span>No Real Money</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
