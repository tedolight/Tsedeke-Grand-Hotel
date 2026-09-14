import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';

const useProtectedRoute = (redirectTo = '/') => {
  const { isAuthenticated, loading, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated && !token) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, token, navigate, redirectTo]);

  return { isAuthenticated, loading };
};

export default useProtectedRoute;
