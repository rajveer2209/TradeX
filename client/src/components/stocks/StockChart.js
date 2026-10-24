import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

// Register Chart.js line elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ stock }) => {
  const [timeframe, setTimeframe] = useState('1M');

  const currentPrice = stock?.price || 100;

  // Generate or extract historical data based on timeframe
  const chartData = useMemo(() => {
    let days = 30;
    if (timeframe === '1D') days = 7;
    else if (timeframe === '1W') days = 7;
    else if (timeframe === '1M') days = 30;
    else if (timeframe === '1Y') days = 60;
    else days = 90;

    const labels = [];
    const prices = [];

    if (stock?.history && Array.isArray(stock.history) && stock.history.length > 0) {
      // Use stock's own history
      const historySubset = stock.history.slice(-days);
      historySubset.forEach((item) => {
        labels.push(
          typeof item.date === 'string'
            ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : item.label || 'Day'
        );
        prices.push(item.price || item.close || currentPrice);
      });
    } else {
      // Synthesize realistic price curve anchored to current price & change
      const now = new Date();
      let simPrice = currentPrice - (stock?.change || 0);
      const volatility = currentPrice * 0.015;

      for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        labels.push(
          d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );

        if (i === 0) {
          prices.push(currentPrice);
        } else {
          // slight random walk towards current price
          const noise = (Math.random() - 0.48) * volatility;
          const trendFactor = ((days - i) / days) * (stock?.change || 0);
          const val = Math.max(1, +(simPrice + trendFactor + noise).toFixed(2));
          prices.push(val);
        }
      }
    }

    const firstPrice = prices[0] || currentPrice;
    const lastPrice = prices[prices.length - 1] || currentPrice;
    const isPeriodPositive = lastPrice >= firstPrice;

    const lineColor = isPeriodPositive ? '#10b981' : '#ef4444';
    const gradientStart = isPeriodPositive
      ? 'rgba(16, 185, 129, 0.25)'
      : 'rgba(239, 68, 68, 0.25)';
    const gradientEnd = isPeriodPositive
      ? 'rgba(16, 185, 129, 0.0)'
      : 'rgba(239, 68, 68, 0.0)';

    return {
      labels,
      datasets: [
        {
          label: `${stock?.symbol || 'Stock'} Price`,
          data: prices,
          borderColor: lineColor,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          fill: true,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, gradientStart);
            gradient.addColorStop(1, gradientEnd);
            return gradient;
          },
          tension: 0.25,
        },
      ],
    };
  }, [stock, currentPrice, timeframe]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: '#1e293b',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          weight: 'bold',
          size: 14,
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Price: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#1e293b',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: '#1e293b',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
            family: "'JetBrains Mono', monospace",
          },
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  const timeframes = ['1D', '1W', '1M', '1Y', 'ALL'];

  return (
    <div className="tradex-card p-3">
      {/* Timeframe Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-7 fw-bold text-white">Price History</span>
          <span className="text-secondary fs-8">&bull; 30-Day Trend</span>
        </div>

        <div className="btn-group btn-group-sm bg-dark-surface p-1 rounded-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              className={`btn btn-sm timeframe-btn ${
                timeframe === tf ? 'active-tf' : 'text-secondary'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '320px', width: '100%' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StockChart;
