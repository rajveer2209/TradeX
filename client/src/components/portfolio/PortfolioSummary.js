import React from 'react';
import {
  FiDollarSign,
  FiBriefcase,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';
import {
  formatCurrency,
  formatPercent,
} from '../../utils/formatters';

const PortfolioSummary = ({ summary, user }) => {
  const totalInvested = summary?.totalInvested ?? 0;
  const currentTotalValue = summary?.totalValue ?? 0;
  const totalPnL = summary?.totalPnL ?? (currentTotalValue - totalInvested);
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const isProfit = totalPnL >= 0;
  const cashBalance = user?.balance ?? 100000;
  const netWorth = currentTotalValue + cashBalance;

  const items = [
    {
      title: 'Total Net Worth',
      value: formatCurrency(netWorth),
      subtitle: `Cash + Assets`,
      icon: <FiBriefcase size={20} className="text-primary-accent" />,
      highlight: true,
    },
    {
      title: 'Current Holdings Value',
      value: formatCurrency(currentTotalValue),
      subtitle: 'Market Value of Stocks',
      icon: <FiDollarSign size={20} className="text-info" />,
    },
    {
      title: 'Total Invested',
      value: formatCurrency(totalInvested),
      subtitle: 'Cost Basis',
      icon: <FiDollarSign size={20} className="text-secondary" />,
    },
    {
      title: 'Total Return (P&L)',
      value: formatCurrency(totalPnL),
      badge: formatPercent(pnlPercent),
      isProfit,
      subtitle: 'All-time performance',
      icon: isProfit ? (
        <FiTrendingUp size={20} className="text-success" />
      ) : (
        <FiTrendingDown size={20} className="text-danger" />
      ),
      valueColor: isProfit ? 'text-success' : 'text-danger',
    },
  ];

  return (
    <div className="row g-3">
      {items.map((item, idx) => (
        <div className="col-12 col-sm-6 col-xl-3" key={idx}>
          <div className="tradex-card stat-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
                  {item.title}
                </span>
                <h4 className={`fw-bold mt-2 mb-1 font-mono fs-4 ${item.valueColor || 'text-white'}`}>
                  {item.value}
                </h4>
              </div>
              <div className="stat-icon-box bg-dark-surface border border-dark-subtle">
                {item.icon}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-dark-subtle">
              {item.badge && (
                <span
                  className={`badge font-mono fs-8 ${
                    item.isProfit ? 'trend-positive' : 'trend-negative'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              <span className="text-secondary fs-8">{item.subtitle}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioSummary;
