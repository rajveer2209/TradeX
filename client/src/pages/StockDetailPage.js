import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import StockDetail from '../components/stocks/StockDetail';
import StockChart from '../components/stocks/StockChart';
import Loader from '../components/common/Loader';
import { getStockById, clearCurrentStock } from '../redux/slices/stockSlice';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../redux/slices/watchlistSlice';

const StockDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentStock, loading, error } = useSelector((state) => state.stocks);
  const { watchlist } = useSelector((state) => state.watchlist);

  useEffect(() => {
    if (id) {
      dispatch(getStockById(id));
      dispatch(getWatchlist());
    }

    return () => {
      dispatch(clearCurrentStock());
    };
  }, [id, dispatch]);

  const stockId = currentStock?._id || currentStock?.id || id;
  const isWatchlisted = watchlist.some((item) => {
    const itemStockId =
      item._id || item.id || (item.stock && (item.stock._id || item.stock.id));
    return itemStockId === stockId;
  });

  const handleWatchlistToggle = async (targetId) => {
    if (isWatchlisted) {
      const res = await dispatch(removeFromWatchlist(targetId));
      if (removeFromWatchlist.fulfilled.match(res)) {
        toast.info('Removed from watchlist');
      }
    } else {
      const res = await dispatch(addToWatchlist(targetId));
      if (addToWatchlist.fulfilled.match(res)) {
        toast.success('Added to watchlist');
      }
    }
  };

  if (loading || !currentStock) {
    return <Loader fullScreen message="Loading stock analysis & telemetry..." />;
  }

  if (error) {
    return (
      <div className="tradex-card p-5 text-center my-5">
        <h4 className="text-white fw-bold mb-2">Unable to Load Stock</h4>
        <p className="text-secondary fs-7 mb-4">{error}</p>
        <Link to="/stocks" className="btn btn-primary btn-sm">
          Return to Market Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* Back button */}
      <div>
        <Link
          to="/stocks"
          className="btn btn-sm btn-dark-outline d-inline-flex align-items-center gap-2"
        >
          <FiArrowLeft size={16} />
          <span>Back to All Stocks</span>
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Column: Stock Detail Overview & Key Metrics */}
        <div className="col-12 col-lg-7 col-xl-8">
          <StockDetail
            stock={currentStock}
            isWatchlisted={isWatchlisted}
            onWatchlistToggle={handleWatchlistToggle}
          />
        </div>

        {/* Right Column: Historical Price Chart */}
        <div className="col-12 col-lg-5 col-xl-4">
          <StockChart stock={currentStock} />
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
