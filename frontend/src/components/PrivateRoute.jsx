import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../services/authService';

const PrivateRoute = ({ children }) => {
  const token = getAuthToken();

  if (!token) {
    // Redirect to login if there is no token
    return <Navigate to="/login" replace />;
  }

  // Render children (the protected component) if the user is authenticated
  return children;
};

export default PrivateRoute;
