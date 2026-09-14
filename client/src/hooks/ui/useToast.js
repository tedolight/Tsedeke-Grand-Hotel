import { useCallback } from 'react';
import useUiStore from '../../store/ui/themeStore.js';

const useToast = () => {
  const { addToast, removeToast, toasts } = useUiStore();

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error   = useCallback((message) => addToast(message, 'error'),   [addToast]);
  const info    = useCallback((message) => addToast(message, 'info'),    [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

  return { success, error, info, warning, removeToast, toasts };
};

export default useToast;
