import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && currentUser.user_type !== requiredRole) {
    return <Navigate to={`/${currentUser.user_type.toLowerCase()}`} />;
  }
  
  return children;
};

export default PrivateRoute;