import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import AuthModal from '../common/AuthModal.jsx';
import useUiStore from '../../store/ui/themeStore.js';

/**
 * RequireAuth — wraps any page/component that requires authentication.
 * - If the user is authenticated: renders children normally.
 * - If the user is NOT authenticated: renders a premium auth gate screen.
 *   After successful login/register the user lands back on the protected page.
 */
const RequireAuth = ({ children, message = 'Please sign in to continue.' }) => {
  const { isAuthenticated, loading, loadUser } = useAuthStore();
  const { setCursorHovered } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [initialLoad, setInitialLoad] = useState(true);

  const hover = {
    onMouseEnter: () => setCursorHovered(true),
    onMouseLeave: () => setCursorHovered(false),
  };

  // On first mount try to restore session from stored token
  useEffect(() => {
    const restore = async () => {
      if (!isAuthenticated && localStorage.getItem('token')) {
        await loadUser();
      }
      setInitialLoad(false);
    };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show nothing while we're still checking the token
  if (initialLoad || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <span className="text-white-dim text-[11px] tracking-[3px] uppercase font-montserrat">Verifying session…</span>
        </div>
      </div>
    );
  }

  // Authenticated — render the protected page
  if (isAuthenticated) return children;

  // Not authenticated — render the elegant gate
  return (
    <>
      <div
        className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-black"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.7]"
          style={{ backgroundImage: `url('/images/gallery/interior/interior-lobby.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,var(--color-gold)_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* Content */}
        <div className="relative z-10 max-w-lg w-full text-center">
          {/* Gold ornament */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-14 h-[1px] bg-gold/50" />
            <span className="text-gold text-lg">✦</span>
            <span className="block w-14 h-[1px] bg-gold/50" />
          </div>

          <p className="text-[10px] tracking-[5px] uppercase text-gold font-semibold font-montserrat mb-4">
            Tsedeke Grand Hotel — Members Only
          </p>

          <h2 className="font-cormorant text-3xl md:text-5xl font-light text-white leading-tight mb-4">
            Sign In to<br />
            <em className="text-gold-light">Access This Service</em>
          </h2>

          <div className="w-16 h-[1px] bg-gold/40 mx-auto mb-6" />

          <p className="font-montserrat text-[13px] text-white-dim leading-relaxed mb-10 max-w-md mx-auto">
            {message}
            <br />
            <span className="text-white/50 text-[11px]">
              Already have an account? Sign in to continue, or create a free account in under a minute.
            </span>
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              id="auth-gate-signin-btn"
              onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}
              {...hover}
              className="btn-gold font-jost px-10 py-4 text-[11px] tracking-[2.5px] uppercase font-semibold"
            >
              Sign In
            </button>
            <button
              id="auth-gate-register-btn"
              onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true); }}
              {...hover}
              className="btn-outline font-jost px-10 py-4 text-[11px] tracking-[2.5px] uppercase font-semibold"
            >
              Create Free Account
            </button>
          </div>

          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            {...hover}
            className="mt-8 text-[10px] tracking-[2px] uppercase text-white/40 hover:text-gold font-montserrat transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
};

export default RequireAuth;
