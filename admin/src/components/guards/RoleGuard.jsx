import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';

const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[60vh] bg-dark-1 flex flex-col items-center justify-center p-6 text-center border border-border-gold-soft rounded-lg">
        <div className="w-16 h-16 border border-danger/30 rounded-full flex items-center justify-center mb-4 text-danger bg-danger/5">
          <i className="fas fa-shield-alt text-2xl" />
        </div>
        <h2 className="font-cinzel text-xl text-gold tracking-[2px] mb-2">Access Denied</h2>
        <p className="text-text-muted text-sm max-w-md mb-6">
          Your account type ({user?.role || 'Guest'}) does not have permission to access this resource. Please contact the administrator.
        </p>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
