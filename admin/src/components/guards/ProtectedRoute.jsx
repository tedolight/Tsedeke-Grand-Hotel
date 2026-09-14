import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, loadUser, token, user } = useAuthStore();

  useEffect(() => {
    if (token && !user && !loading) {
      loadUser();
    }
  }, [token, user, loading, loadUser]);

  if (loading || (token && !user && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-dark-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold font-cinzel text-xl tracking-[4px] animate-pulse">Verifying Session...</div>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
