import React, { useState, useMemo } from 'react';
import { FiSearch, FiSliders, FiFilter } from 'react-icons/fi';
import StockCard from '../common/StockCard';
import Loader from '../common/Loader';
import TradeModal from './TradeModal';
import { SECTORS } from '../../utils/constants';

const StockList = ({
  stocks = [],
  loading = false,
  watchlist = [],
  onWatchlistToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState('symbol'); // 'symbol', 'price-high', 'price-low', 'change-high', 'change-low'
  const [activeTradeStock, setActiveTradeStock] = useState(null);
  const [tradeType, setTradeType] = useState('BUY');

  // Set of watchlisted IDs for fast lookup
  const watchlistedSet = useMemo(() => {
    const ids = new Set();
    watchlist.forEach((item) => {
      const id = item._id || item.id || (item.stock && (item.stock._id || item.stock.id));
      if (id) ids.add(id);
    });
    return ids;
  }, [watchlist]);

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.sector && s.sector.toLowerCase().includes(q))
      );
    }

    // Sector
    if (selectedSector && selectedSector !== 'All') {
      result = result.filter(
        (s) => (s.sector || '').toLowerCase() === selectedSector.toLowerCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'change-high') {
        const changeA = a.changePercent ?? a.percentChange ?? 0;
        const changeB = b.changePercent ?? b.percentChange ?? 0;
        return changeB - changeA;
      }
      if (sortBy === 'change-low') {
        const changeA = a.changePercent ?? a.percentChange ?? 0;
        const changeB = b.changePercent ?? b.percentChange ?? 0;
        return changeA - changeB;
      }
      // default: symbol A-Z
      return (a.symbol || '').localeCompare(b.symbol || '');
    });

    return result;
  }, [stocks, searchTerm, selectedSector, sortBy]);

  const handleOpenTrade = (stock, type) => {
    setActiveTradeStock(stock);
    setTradeType(type);
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Search and Filters Header */}
      <div className="tradex-card p-3">
        <div className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-dark-surface border-dark-subtle text-secondary">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control tradex-input"
                placeholder="Search symbol or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-dark-outline btn-sm"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sector Pills / Dropdown */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-dark-surface border-dark-subtle text-secondary">
                <FiFilter size={15} />
              </span>
              <select
                className="form-select tradex-select"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                {SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector === 'All' ? 'All Sectors' : sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-dark-surface border-dark-subtle text-secondary">
                <FiSliders size={15} />
              </span>
              <select
                className="form-select tradex-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="symbol">Sort: Symbol (A-Z)</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="change-high">Top Gainers</option>
                <option value="change-low">Top Losers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sector Quick Pills Bar */}
        <div className="d-flex gap-2 overflow-auto pt-3 mt-3 border-top border-dark-subtle scrollbar-none">
          {SECTORS.map((sec) => (
            <button
              key={sec}
              type="button"
              className={`btn btn-sm px-3 py-1 rounded-pill text-nowrap fs-8 ${
                selectedSector === sec ? 'btn-primary' : 'btn-dark-outline'
              }`}
              onClick={() => setSelectedSector(sec)}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      {loading ? (
        <Loader message="Fetching live market assets..." />
      ) : filteredStocks.length === 0 ? (
        <div className="tradex-card p-5 text-center">
          <p className="text-secondary fs-6 mb-2">No stocks found matching your filters.</p>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedSector('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filteredStocks.map((stock) => {
            const stockId = stock._id || stock.id;
            return (
              <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={stockId}>
                <StockCard
                  stock={stock}
                  onTradeClick={handleOpenTrade}
                  isWatchlisted={watchlistedSet.has(stockId)}
                  onWatchlistToggle={onWatchlistToggle}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Trade Modal */}
      {activeTradeStock && (
        <TradeModal
          show={!!activeTradeStock}
          onHide={() => setActiveTradeStock(null)}
          stock={activeTradeStock}
          initialType={tradeType}
        />
      )}
    </div>
  );
};

export default StockList;
