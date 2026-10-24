import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
];

const PortfolioChart = ({ holdings = [], cashBalance = 0 }) => {
  const hasHoldings = holdings && holdings.length > 0;

  // Build labels and values
  let labels = [];
  let dataValues = [];
  let backgroundColors = [];

  if (hasHoldings) {
    labels = holdings.map((h) => h.stock?.symbol || h.symbol || 'Stock');
    dataValues = holdings.map(
      (h) => (h.quantity || h.shares || 0) * (h.stock?.price || h.currentPrice || h.averageBuyPrice || 1)
    );

    // Also include cash if available
    if (cashBalance > 0) {
      labels.push('Cash');
      dataValues.push(cashBalance);
    }

    backgroundColors = labels.map((_, i) => PALETTE[i % PALETTE.length]);
  } else {
    // Only cash
    labels = ['Cash Balance'];
    dataValues = [cashBalance > 0 ? cashBalance : 100000];
    backgroundColors = ['#3b82f6'];
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: '#111827',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          boxWidth: 12,
          boxHeight: 12,
          padding: 12,
          font: {
            size: 11,
            family: "'Plus Jakarta Sans', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return ` ${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="tradex-card p-3 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fs-6 fw-bold text-white mb-0">Portfolio Allocation</h5>
          <span className="text-secondary fs-8">Asset distribution by value</span>
        </div>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-8 px-2 py-1">
          {hasHoldings ? `${holdings.length} Assets` : '100% Cash'}
        </span>
      </div>

      <div className="position-relative flex-grow-1" style={{ minHeight: '220px' }}>
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PortfolioChart;
