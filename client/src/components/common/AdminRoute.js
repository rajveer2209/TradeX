import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading && !user) {
    return <Loader fullScreen message="Checking admin permissions..." />;
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
