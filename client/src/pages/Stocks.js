import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiRefreshCw } from 'react-icons/fi';
import StockList from '../components/stocks/StockList';
import { getStocks } from '../redux/slices/stockSlice';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../redux/slices/watchlistSlice';

const Stocks = () => {
  const dispatch = useDispatch();
  const { stocks, loading } = useSelector((state) => state.stocks);
  const { watchlist } = useSelector((state) => state.watchlist);

  useEffect(() => {
    dispatch(getStocks());
    dispatch(getWatchlist());
  }, [dispatch]);

  const handleWatchlistToggle = async (stockId) => {
    const isWatchlisted = watchlist.some((item) => {
      const id = item._id || item.id || (item.stock && (item.stock._id || item.stock.id));
      return id === stockId;
    });

    if (isWatchlisted) {
      const res = await dispatch(removeFromWatchlist(stockId));
      if (removeFromWatchlist.fulfilled.match(res)) {
        toast.info('Removed from watchlist');
      }
    } else {
      const res = await dispatch(addToWatchlist(stockId));
      if (addToWatchlist.fulfilled.match(res)) {
        toast.success('Added to watchlist');
      }
    }
  };

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="text-white fw-bold mb-0">Stock Market Directory</h2>
            <span className="badge-sector">Equities</span>
          </div>
          <p className="text-secondary fs-7 mb-0 mt-1">
            Browse and simulate live orders across global market sectors
          </p>
        </div>

        <button
          onClick={() => dispatch(getStocks())}
          className="btn btn-sm btn-dark-outline d-flex align-items-center gap-2"
        >
          <FiRefreshCw size={14} />
          <span>Refresh Quotes</span>
        </button>
      </div>

      {/* Main Stock List & Filtering Component */}
      <StockList
        stocks={stocks}
        loading={loading}
        watchlist={watchlist}
        onWatchlistToggle={handleWatchlistToggle}
      />
    </div>
  );
};

export default Stocks;
