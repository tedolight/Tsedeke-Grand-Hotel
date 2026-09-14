import { useCallback } from 'react';
import useAuthStore from '../../store/auth/authStore.js';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();

  const loginAndRedirect = useCallback(async (email, password, redirectTo = '/') => {
    const success = await store.login(email, password);
    if (success) navigate(redirectTo);
    return success;
  }, [store, navigate]);

  const registerAndRedirect = useCallback(async (name, email, password, redirectTo = '/') => {
    const success = await store.register(name, email, password);
    if (success) navigate(redirectTo);
    return success;
  }, [store, navigate]);

  const logoutAndRedirect = useCallback(() => {
    store.logout();
    navigate('/');
  }, [store, navigate]);

  return {
    ...store,
    loginAndRedirect,
    registerAndRedirect,
    logoutAndRedirect,
  };
};

export default useAuth;
