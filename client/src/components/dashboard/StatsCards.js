import React from 'react';
import {
  FiDollarSign,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiRepeat,
} from 'react-icons/fi';
import {
  formatCurrency,
  formatPercent,
} from '../../utils/formatters';

const StatsCards = ({ user, summary, stats, totalTradesCount = 0 }) => {
  const balance = user?.balance ?? 100000;
  const portfolioValue = summary?.totalValue ?? 0;
  const totalPnL = summary?.totalPnL ?? 0;
  const totalInvested = summary?.totalInvested ?? 0;
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const isProfit = totalPnL >= 0;
  const tradesCount = stats?.totalTrades ?? totalTradesCount ?? 0;

  const cards = [
    {
      title: 'Account Balance',
      value: formatCurrency(balance),
      subtitle: 'Available Cash',
      icon: <FiDollarSign size={22} className="text-primary" />,
      iconBg: 'bg-primary-subtle',
    },
    {
      title: 'Portfolio Value',
      value: formatCurrency(portfolioValue),
      subtitle: `${summary?.holdings?.length || 0} active positions`,
      icon: <FiPieChart size={22} className="text-info" />,
      iconBg: 'bg-info-subtle',
    },
    {
      title: 'Total P&L',
      value: formatCurrency(totalPnL),
      badge: formatPercent(pnlPercent),
      isProfit: isProfit,
      subtitle: 'Unrealized + Realized',
      icon: isProfit ? (
        <FiTrendingUp size={22} className="text-success" />
      ) : (
        <FiTrendingDown size={22} className="text-danger" />
      ),
      iconBg: isProfit ? 'bg-success-subtle' : 'bg-danger-subtle',
      valueClass: isProfit ? 'text-success' : 'text-danger',
    },
    {
      title: 'Total Trades',
      value: tradesCount.toString(),
      subtitle: stats ? `${stats.buyTrades || 0} buys / ${stats.sellTrades || 0} sells` : 'Lifetime orders',
      icon: <FiRepeat size={22} className="text-warning" />,
      iconBg: 'bg-warning-subtle',
    },
  ];

  return (
    <div className="row g-3">
      {cards.map((card, idx) => (
        <div className="col-12 col-sm-6 col-xl-3" key={idx}>
          <div className="tradex-card stat-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
                  {card.title}
                </span>
                <h3 className={`fw-bold mt-2 mb-1 font-mono fs-4 ${card.valueClass || 'text-white'}`}>
                  {card.value}
                </h3>
              </div>
              <div className={`stat-icon-box ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-dark-subtle">
              {card.badge && (
                <span
                  className={`badge font-mono fs-8 ${
                    card.isProfit ? 'trend-positive' : 'trend-negative'
                  }`}
                >
                  {card.badge}
                </span>
              )}
              <span className="text-secondary fs-8">{card.subtitle}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
