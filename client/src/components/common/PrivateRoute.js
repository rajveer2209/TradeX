import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading && !token) {
    return <Loader fullScreen message="Authenticating session..." />;
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
