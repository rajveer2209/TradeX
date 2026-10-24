import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  FiShield,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiZap,
  FiDatabase,
  FiDollarSign,
} from 'react-icons/fi';
import Loader from '../components/common/Loader';
import {
  getStocks,
  createStock,
  updateStock,
  deleteStock,
  simulateMarketUpdate,
} from '../redux/slices/stockSlice';
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
} from '../utils/formatters';
import { SECTORS } from '../utils/constants';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { stocks, loading, simulateLoading } = useSelector((state) => state.stocks);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    sector: 'Technology',
    price: '',
    description: '',
    dayHigh: '',
    dayLow: '',
    volume: '',
  });

  useEffect(() => {
    dispatch(getStocks());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setEditingStock(null);
    setFormData({
      symbol: '',
      name: '',
      sector: 'Technology',
      price: '',
      description: '',
      dayHigh: '',
      dayLow: '',
      volume: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (stock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol || '',
      name: stock.name || '',
      sector: stock.sector || 'Technology',
      price: stock.price || '',
      description: stock.description || '',
      dayHigh: stock.dayHigh || '',
      dayLow: stock.dayLow || '',
      volume: stock.volume || '',
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!formData.symbol || !formData.name || !formData.price) {
      toast.warn('Symbol, name, and price are required.');
      return;
    }

    const payload = {
      ...formData,
      symbol: formData.symbol.toUpperCase(),
      price: parseFloat(formData.price),
      dayHigh: formData.dayHigh ? parseFloat(formData.dayHigh) : parseFloat(formData.price),
      dayLow: formData.dayLow ? parseFloat(formData.dayLow) : parseFloat(formData.price),
      volume: formData.volume ? parseInt(formData.volume, 10) : 1000000,
    };

    if (editingStock) {
      const stockId = editingStock._id || editingStock.id;
      const res = await dispatch(updateStock({ id: stockId, stockData: payload }));
      if (updateStock.fulfilled.match(res)) {
        toast.success(`Updated stock ${formData.symbol}!`);
        setModalOpen(false);
      } else {
        toast.error(res.payload || 'Failed to update stock');
      }
    } else {
      const res = await dispatch(createStock(payload));
      if (createStock.fulfilled.match(res)) {
        toast.success(`Added new stock ${formData.symbol}!`);
        setModalOpen(false);
      } else {
        toast.error(res.payload || 'Failed to create stock');
      }
    }
  };

  const handleDelete = async (id) => {
    const res = await dispatch(deleteStock(id));
    if (deleteStock.fulfilled.match(res)) {
      toast.success('Stock removed successfully');
      setDeleteConfirmId(null);
    } else {
      toast.error(res.payload || 'Failed to delete stock');
    }
  };

  const handleSimulateUpdate = async () => {
    const res = await dispatch(simulateMarketUpdate());
    if (simulateMarketUpdate.fulfilled.match(res)) {
      toast.success('Market prices simulated & updated successfully!');
      dispatch(getStocks());
    } else {
      toast.error(res.payload || 'Market simulation failed');
    }
  };

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="text-white fw-bold mb-0">System Administration</h2>
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle fs-8 px-2 py-1">
              Admin Access
            </span>
          </div>
          <p className="text-secondary fs-7 mb-0 mt-1">
            Manage equity listings, configure simulated assets, and trigger market price shifts
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Simulate Market Update Button */}
          <button
            onClick={handleSimulateUpdate}
            disabled={simulateLoading}
            className="btn btn-warning d-flex align-items-center gap-2 fw-semibold"
          >
            {simulateLoading ? (
              <div className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <FiZap size={16} />
            )}
            <span>Simulate Market Fluctuation</span>
          </button>

          {/* Add Stock Button */}
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
          >
            <FiPlus size={16} />
            <span>Add New Stock</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="row g-3">
        <div className="col-12 col-sm-4">
          <div className="tradex-card stat-card p-3">
            <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
              Total Listed Equities
            </span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h4 className="fw-bold text-white font-mono mb-0">{stocks.length}</h4>
              <div className="stat-icon-box bg-primary-subtle">
                <FiDatabase size={18} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="tradex-card stat-card p-3">
            <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
              Avg Market Price
            </span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h4 className="fw-bold text-white font-mono mb-0">
                {stocks.length > 0
                  ? formatCurrency(
                      stocks.reduce((acc, s) => acc + (s.price || 0), 0) / stocks.length
                    )
                  : '$0.00'}
              </h4>
              <div className="stat-icon-box bg-success-subtle">
                <FiDollarSign size={18} className="text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="tradex-card stat-card p-3">
            <span className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider">
              System Health
            </span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h4 className="fw-bold text-success font-mono mb-0">Online (100%)</h4>
              <div className="stat-icon-box bg-info-subtle">
                <FiShield size={18} className="text-info" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Management Table */}
      <div className="tradex-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fs-6 fw-bold text-white mb-0">Listed Equities Catalog</h5>
            <span className="text-secondary fs-8">Direct CRUD controls for platform stocks</span>
          </div>
          <span className="badge bg-dark-surface border border-dark-subtle text-secondary font-mono px-3 py-1">
            {stocks.length} Entries
          </span>
        </div>

        {loading && stocks.length === 0 ? (
          <Loader message="Loading catalog..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover tradex-table align-middle mb-0">
              <thead>
                <tr className="text-secondary fs-8 text-uppercase tracking-wider">
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th>Sector</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">24h Change</th>
                  <th className="text-end">Volume</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const stockId = stock._id || stock.id;
                  const isPositive = (stock.change ?? 0) >= 0;
                  const changePercent = stock.changePercent ?? (stock.percentChange ?? 0);

                  return (
                    <tr key={stockId}>
                      <td>
                        <span className="fw-bold text-white font-mono">{stock.symbol}</span>
                      </td>

                      <td>
                        <span className="text-light">{stock.name}</span>
                      </td>

                      <td>
                        <span className="badge-sector">{stock.sector || 'General'}</span>
                      </td>

                      <td className="text-end font-mono text-white fw-bold">
                        {formatCurrency(stock.price)}
                      </td>

                      <td className="text-end">
                        <span
                          className={`font-mono fs-8 fw-semibold px-2 py-0.5 rounded ${
                            isPositive ? 'trend-positive' : 'trend-negative'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatPercent(changePercent)}
                        </span>
                      </td>

                      <td className="text-end font-mono text-secondary fs-8">
                        {formatCompactNumber(stock.volume || 1000000)}
                      </td>

                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-icon btn-sm text-secondary hover-primary"
                            onClick={() => handleOpenEditModal(stock)}
                            title="Edit Stock"
                          >
                            <FiEdit size={16} />
                          </button>

                          <button
                            className="btn btn-icon btn-sm text-secondary hover-danger"
                            onClick={() => setDeleteConfirmId(stockId)}
                            title="Delete Stock"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Stock Modal */}
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        centered
        contentClassName="tradex-modal-content"
      >
        <Modal.Header closeButton className="border-bottom border-dark-subtle pb-3">
          <Modal.Title className="fs-5 fw-bold text-white">
            {editingStock ? `Edit ${editingStock.symbol}` : 'Add New Equity'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <form onSubmit={handleSaveStock}>
            <div className="row g-3">
              <div className="col-6">
                <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-1 d-block">
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  className="form-control tradex-input text-uppercase font-mono fw-bold"
                  placeholder="e.g. AAPL"
                  value={formData.symbol}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="col-6">
                <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-1 d-block">
                  Sector
                </label>
                <select
                  name="sector"
                  className="form-select tradex-select"
                  value={formData.sector}
                  onChange={handleFormChange}
                >
                  {SECTORS.filter((s) => s !== 'All').map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-1 d-block">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control tradex-input"
                  placeholder="e.g. Apple Inc."
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="col-6">
                <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-1 d-block">
                  Initial Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  className="form-control tradex-input font-mono"
                  placeholder="150.00"
                  value={formData.price}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="col-6">
                <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-1 d-block">
                  Daily Volume
                </label>
                <input
                  type="number"
                  name="volume"
                  className="form-control tradex-input font-mono"
                  placeholder="25000000"
                  value={formData.volume}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-12">
                <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-1 d-block">
                  Business Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control tradex-input"
                  placeholder="Brief overview of the corporation..."
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-dark-subtle">
              <button
                type="button"
                className="btn btn-dark-outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fw-semibold px-4">
                {editingStock ? 'Save Changes' : 'Create Stock'}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={!!deleteConfirmId}
        onHide={() => setDeleteConfirmId(null)}
        centered
        contentClassName="tradex-modal-content"
      >
        <Modal.Header closeButton className="border-bottom border-dark-subtle">
          <Modal.Title className="fs-6 fw-bold text-white">Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="text-secondary fs-7 mb-0">
            Are you sure you want to permanently delete this stock from the simulated market?
            This will also affect transactions associated with it.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-top border-dark-subtle">
          <button
            className="btn btn-dark-outline btn-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger btn-sm px-3"
            onClick={() => handleDelete(deleteConfirmId)}
          >
            Delete Stock
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPanel;
