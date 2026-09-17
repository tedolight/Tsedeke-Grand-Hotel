import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './i18n.js';
import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';

// Styling imports
import './styles/base/variables.css';
import './styles/base/globals.css';
import './styles/base/typography.css';
import './styles/animations/animations.css';
import './styles/animations/hover-effects.css';
import './styles/animations/scroll-reveal.css';
import './styles/themes/dark-theme.css';
import './styles/themes/light-theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div className="h-screen w-screen bg-dark flex items-center justify-center text-gold font-cormorant text-2xl">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
