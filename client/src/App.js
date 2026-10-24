import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import StockDetailPage from './pages/StockDetailPage';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Watchlist from './pages/Watchlist';
import AdminPanel from './pages/AdminPanel';

import { loadUser } from './redux/slices/authSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="app-main">
        {/* Sidebar only rendered for authenticated app view */}
        {isAuthenticated && !isAuthPage && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Routed Content Area */}
        <main className={!isAuthPage && isAuthenticated ? 'main-content' : 'w-100'}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/stocks"
              element={
                <PrivateRoute>
                  <Stocks />
                </PrivateRoute>
              }
            />
            <Route
              path="/stocks/:id"
              element={
                <PrivateRoute>
                  <StockDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <PrivateRoute>
                  <Portfolio />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/watchlist"
              element={
                <PrivateRoute>
                  <Watchlist />
                </PrivateRoute>
              }
            />

            {/* Admin only route */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />

            {/* Root / Default Redirect */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Footer */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
