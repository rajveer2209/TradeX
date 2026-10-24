/**
 * Global constants for TradeX
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const SECTORS = [
  'All',
  'Technology',
  'Finance',
  'Healthcare',
  'Consumer',
  'Energy',
  'Industrial',
  'Telecommunications',
];

export const TRANSACTION_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL',
  ALL: 'ALL',
};

export const DEFAULT_PAGE_LIMIT = 10;

export const THEME_COLORS = {
  bgDark: '#0a0e17',
  cardBg: '#111827',
  cardBorder: '#1e293b',
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  sidebarBg: '#0f1419',
};
