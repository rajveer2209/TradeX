import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiFilter,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiRepeat,
} from 'react-icons/fi';
import Loader from '../components/common/Loader';
import {
  getTransactions,
  getTransactionStats,
  setCurrentPage,
} from '../redux/slices/transactionSlice';
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from '../utils/formatters';

const Transactions = () => {
  const dispatch = useDispatch();
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    transactions,
    stats,
    loading,
    totalPages,
    currentPage,
    totalTransactions,
  } = useSelector((state) => state.transactions);

  useEffect(() => {
    dispatch(getTransactions({ page, limit, type: filterType }));
    dispatch(getTransactionStats());
  }, [dispatch, page, filterType]);

  const handleTypeChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      dispatch(setCurrentPage(newPage));
    }
  };

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* Header */}
      <div>
        <h2 className="text-white fw-bold mb-0">Transaction History</h2>
        <p className="text-secondary fs-7 mb-0 mt-1">
          Complete audit trail of all executed stock orders
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-4">
          <div className="tradex-card stat-card p-3">
            <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
              Total Executions
            </span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h4 className="fw-bold text-white font-mono mb-0">
                {stats?.totalTrades ?? totalTransactions ?? transactions.length}
              </h4>
              <div className="stat-icon-box bg-dark-surface border border-dark-subtle">
                <FiRepeat size={18} className="text-primary-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="tradex-card stat-card p-3">
            <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
              Buy Orders
            </span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h4 className="fw-bold text-success font-mono mb-0">
                {stats?.buyTrades ?? transactions.filter((t) => t.type === 'BUY').length}
              </h4>
              <div className="stat-icon-box bg-success-subtle">
                <FiArrowDownLeft size={18} className="text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="tradex-card stat-card p-3">
            <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
              Sell Orders
            </span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h4 className="fw-bold text-danger font-mono mb-0">
                {stats?.sellTrades ?? transactions.filter((t) => t.type === 'SELL').length}
              </h4>
              <div className="stat-icon-box bg-danger-subtle">
                <FiArrowUpRight size={18} className="text-danger" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tradex-card p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <FiFilter size={16} className="text-secondary" />
          <span className="text-secondary fs-7 fw-semibold">Filter Type:</span>
          <div className="btn-group btn-group-sm">
            {['ALL', 'BUY', 'SELL'].map((t) => (
              <button
                key={t}
                className={`btn btn-sm ${
                  filterType === t ? 'btn-primary' : 'btn-dark-outline'
                }`}
                onClick={() => handleTypeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <span className="text-secondary fs-8">
          Showing page {currentPage} of {totalPages || 1}
        </span>
      </div>

      {/* Transaction Table */}
      <div className="tradex-card p-4">
        {loading ? (
          <Loader message="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-secondary fs-6 mb-0">
              No transactions matching the selected criteria.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover tradex-table align-middle mb-0">
              <thead>
                <tr className="text-secondary fs-8 text-uppercase tracking-wider">
                  <th>Type</th>
                  <th>Stock</th>
                  <th className="text-end">Quantity</th>
                  <th className="text-end">Execution Price</th>
                  <th className="text-end">Total Amount</th>
                  <th className="text-end">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => {
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
                        <div className="fw-bold text-white font-mono">{symbol}</div>
                        {name && <div className="text-secondary fs-8">{name}</div>}
                      </td>

                      <td className="text-end font-mono text-white fw-semibold">
                        {formatNumber(tx.quantity)}
                      </td>

                      <td className="text-end font-mono text-secondary">
                        {formatCurrency(tx.price)}
                      </td>

                      <td className="text-end font-mono text-white fw-bold">
                        {formatCurrency(total)}
                      </td>

                      <td className="text-end font-mono text-secondary fs-8">
                        {formatDate(tx.createdAt || tx.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-dark-subtle">
            <button
              className="btn btn-sm btn-dark-outline d-flex align-items-center gap-1"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <FiChevronLeft size={16} /> Previous
            </button>

            <div className="d-flex align-items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`btn btn-sm ${
                    p === page ? 'btn-primary' : 'btn-dark-outline'
                  }`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="btn btn-sm btn-dark-outline d-flex align-items-center gap-1"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
