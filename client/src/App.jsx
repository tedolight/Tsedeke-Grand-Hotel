import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';
import useUiStore from './store/ui/themeStore.js';

const App = () => {
  const { initTheme } = useUiStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <RouterProvider router={router} />;
};

export default App;
