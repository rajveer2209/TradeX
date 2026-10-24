import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiArrowDownLeft, FiExternalLink } from 'react-icons/fi';
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from '../../utils/formatters';

const RecentTransactions = ({ transactions = [], maxItems = 5 }) => {
  const displayItems = transactions.slice(0, maxItems);

  return (
    <div className="tradex-card p-3 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fs-6 fw-bold text-white mb-0">Recent Activity</h5>
          <span className="text-secondary fs-8">Latest trading executions</span>
        </div>
        <Link
          to="/transactions"
          className="btn btn-sm btn-link text-primary text-decoration-none d-flex align-items-center gap-1 p-0 fs-8 fw-semibold hover-underline"
        >
          View All <FiExternalLink size={12} />
        </Link>
      </div>

      {displayItems.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-4 text-center">
          <p className="text-secondary fs-7 mb-2">No transaction history yet.</p>
          <Link to="/stocks" className="btn btn-sm btn-outline-primary">
            Browse Stocks
          </Link>
        </div>
      ) : (
        <div className="table-responsive flex-grow-1">
          <table className="table table-dark table-hover tradex-table align-middle mb-0">
            <thead>
              <tr className="text-secondary fs-8 text-uppercase tracking-wider">
                <th>Type</th>
                <th>Asset</th>
                <th className="text-end">Shares</th>
                <th className="text-end">Price</th>
                <th className="text-end">Total</th>
                <th className="text-end d-none d-md-table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((tx, idx) => {
                const isBuy = tx.type === 'BUY';
                const symbol = tx.stock?.symbol || tx.symbol || 'N/A';
                const name = tx.stock?.name || tx.stockName || '';
                const total = tx.totalAmount ?? (tx.quantity * tx.price);

                return (
                  <tr key={tx._id || tx.id || idx}>
                    <td>
                      <span
                        className={`badge d-inline-flex align-items-center gap-1 font-mono fs-8 ${
                          isBuy ? 'badge-profit' : 'badge-loss'
                        }`}
                      >
                        {isBuy ? <FiArrowDownLeft size={12} /> : <FiArrowUpRight size={12} />}
                        {tx.type}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-white">{symbol}</div>
                      {name && (
                        <div className="text-secondary fs-8 text-truncate" style={{ maxWidth: '120px' }}>
                          {name}
                        </div>
                      )}
                    </td>
                    <td className="text-end font-mono text-white">
                      {formatNumber(tx.quantity)}
                    </td>
                    <td className="text-end font-mono text-secondary">
                      {formatCurrency(tx.price)}
                    </td>
                    <td className="text-end font-mono fw-bold text-white">
                      {formatCurrency(total)}
                    </td>
                    <td className="text-end font-mono text-secondary fs-8 d-none d-md-table-cell">
                      {formatDate(tx.createdAt || tx.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
