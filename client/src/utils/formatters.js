/**
 * Formatting utility functions for TradeX
 */

export const formatCurrency = (amount, decimals = 2) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  const num = Number(amount);
  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);
  return `${sign}$${absNum.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatPercent = (value, showSign = true) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  const num = Number(value);
  const sign = num > 0 && showSign ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

export const formatNumber = (value, decimals = 0) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  const num = Number(value);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCompactNumber = (value) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  const num = Number(value);
  const abs = Math.abs(num);

  if (abs >= 1e12) {
    return `${(num / 1e12).toFixed(2)}T`;
  }
  if (abs >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (abs >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (abs >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`;
  }
  return num.toFixed(2);
};

export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };

  return date.toLocaleDateString('en-US', options);
};

export const getTrendClass = (value) => {
  const num = Number(value);
  if (isNaN(num) || num === 0) return 'text-secondary';
  return num > 0 ? 'text-success' : 'text-danger';
};

export const getTrendBadgeClass = (value) => {
  const num = Number(value);
  if (isNaN(num) || num === 0) return 'badge-neutral';
  return num > 0 ? 'badge-profit' : 'badge-loss';
};
