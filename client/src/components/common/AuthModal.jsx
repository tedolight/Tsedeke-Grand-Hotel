import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/auth/authStore.js';
import useUiStore from '../../store/ui/themeStore.js';

/* ── helpers ──────────────────────────────────────── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-[10px] text-red-400 font-montserrat mt-1 animate-[fadeIn_0.2s_ease]">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
        <circle cx="5" cy="5" r="4.5" stroke="#f87171" strokeWidth="1" />
        <path d="M5 3v2.5M5 7v.4" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {msg}
    </p>
  ) : null;

const InputField = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-[9px] tracking-[2px] uppercase text-text-dim font-montserrat">
      {label} {required && <span className="text-gold">*</span>}
    </label>
    {children}
    <FieldError msg={error} />
  </div>
);

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const strength = password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-[9px] font-montserrat ${colors[strength].replace('bg-', 'text-').replace('400', '400').replace('500', '400')}`}>
        {labels[strength]} password
      </p>
    </div>
  );
};

/* ── main component ───────────────────────────────── */
const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { t } = useTranslation();
  const { login, register, forgotPassword, loading, error, clearError } = useAuthStore();
  const { addToast, setCursorHovered } = useUiStore();

  const [tab, setTab] = useState(initialTab);
  const [shake, setShake] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regErrors, setRegErrors] = useState({});
  const [showRegPw, setShowRegPw] = useState(false);

  // Forgot
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const hover = {
    onMouseEnter: () => setCursorHovered(true),
    onMouseLeave: () => setCursorHovered(false),
  };

  useEffect(() => {
    if (isOpen) { setTab(initialTab); clearError(); setRegistered(false); }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const triggerShake = () => {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    setTimeout(() => setShake(false), 600);
  };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginEmail) errs.email = 'Email is required';
    else if (!isValidEmail(loginEmail)) errs.email = 'Enter a valid email address';
    if (!loginPassword) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setLoginErrors(errs); triggerShake(); return; }
    setLoginErrors({});

    const ok = await login(loginEmail, loginPassword);
    if (ok) {
      addToast('Welcome back! You are now signed in.', 'success');
      onClose();
    } else {
      const errMsg = useAuthStore.getState().error || 'Incorrect email or password. Please try again.';
      const isNoAccount = errMsg.toLowerCase().includes('no account') || errMsg.toLowerCase().includes('not found');
      setLoginErrors(isNoAccount
        ? { email: 'No account found with that email address.' }
        : { password: errMsg }
      );
      triggerShake();
      addToast(errMsg, 'error');
    }
  };

  /* ── Register ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!regName.trim()) errs.name = 'Full name is required';
    if (!regEmail) errs.email = 'Email is required';
    else if (!isValidEmail(regEmail)) errs.email = 'Enter a valid email address';
    if (!regPassword) errs.password = 'Password is required';
    else if (regPassword.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!regConfirm) errs.confirm = 'Please confirm your password';
    else if (regPassword !== regConfirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setRegErrors(errs); triggerShake(); return; }
    setRegErrors({});

    const ok = await register(regName, regEmail, regPassword);
    if (ok) {
      setRegistered(true);
      addToast('Welcome to Tsedeke Grand Hotel! Your account is ready.', 'success');
    } else {
      const errMsg = useAuthStore.getState().error || 'Registration failed. Please try again.';
      // Target the right field based on the error message
      const isEmailConflict = errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('already registered');
      setRegErrors(isEmailConflict
        ? { email: 'An account with this email already exists. Please sign in instead.' }
        : { email: errMsg }
      );
      triggerShake();
      addToast(
        isEmailConflict ? 'This email is already registered. Please sign in.' : errMsg,
        'error'
      );
    }
  };

  /* ── Forgot password ── */
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotError('Email is required'); triggerShake(); return; }
    if (!isValidEmail(forgotEmail)) { setForgotError('Enter a valid email address'); triggerShake(); return; }
    setForgotError('');
    const ok = await forgotPassword(forgotEmail);
    if (ok) { setForgotSuccess(true); addToast('Reset link sent! Check your inbox.', 'success'); }
    else {
      const errMsg = useAuthStore.getState().error || 'Failed to send reset link. Please try again.';
      setForgotError(errMsg);
      triggerShake();
    }
  };

  if (!isOpen) return null;

  const inputCls = (hasErr) =>
    `bg-dark-3 border text-white text-[13px] p-3.5 outline-none w-full transition-all duration-200 rounded-sm font-montserrat
    ${hasErr ? 'border-red-500/70 focus:border-red-400 input-error' : 'border-border-gold/25 focus:border-gold input-focus-ring'}`;

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" tabIndex={-1} onClick={toggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white-dim/50 hover:text-gold transition-colors">
      {show
        ? <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/><line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        : <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
      }
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full max-w-md bg-dark-2 border border-border-gold/25 shadow-2xl rounded-sm overflow-hidden
          animate-[fadeInScale_0.25s_ease] ${shake ? 'animate-shake' : ''}`}
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

        {/* Header */}
        <div className="p-7 pb-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-[9px] tracking-[3px] uppercase text-gold font-semibold font-montserrat block mb-1.5">
                ✦ Tsedeke Grand Hotel & Suites
              </span>
              <h2 className="font-cormorant text-3xl font-light text-white leading-tight">
                {tab === 'login' && 'Welcome Back'}
                {tab === 'register' && (registered ? 'Account Created!' : 'Create Account')}
                {tab === 'forgot' && 'Reset Password'}
              </h2>
            </div>
            <button onClick={onClose} {...hover}
              className="w-8 h-8 border border-border-gold/25 text-white-dim hover:text-gold hover:border-gold flex items-center justify-center transition-colors rounded-sm mt-1 flex-shrink-0">
              <svg width="11" height="11" fill="none" viewBox="0 0 11 11">
                <path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          {tab !== 'forgot' && !registered && (
            <div className="flex border-b border-border-gold/15 mb-5">
              {['login', 'register'].map((t) => (
                <button key={t} onClick={() => { setTab(t); clearError(); setLoginErrors({}); setRegErrors({}); }} {...hover}
                  className={`flex-1 py-3 text-[9.5px] tracking-[2.5px] uppercase font-semibold font-montserrat transition-all duration-200 border-b-2 -mb-px
                    ${tab === t ? 'text-gold border-gold' : 'text-white-dim border-transparent hover:text-white/70'}`}>
                  {t === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="px-7 pb-7 space-y-4" noValidate>
            <InputField label="Email Address" required error={loginErrors.email}>
              <input type="email" placeholder="you@example.com" value={loginEmail} autoComplete="email"
                onChange={(e) => { setLoginEmail(e.target.value); setLoginErrors(p => ({ ...p, email: '' })); }}
                className={inputCls(loginErrors.email)} />
            </InputField>

            <InputField label="Password" required error={loginErrors.password}>
              <div className="relative">
                <input type={showLoginPw ? 'text' : 'password'} placeholder="••••••••" value={loginPassword}
                  autoComplete="current-password"
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginErrors(p => ({ ...p, password: '' })); }}
                  className={`${inputCls(loginErrors.password)} pr-12`} />
                <EyeBtn show={showLoginPw} toggle={() => setShowLoginPw(s => !s)} />
              </div>
            </InputField>

            <div className="flex justify-end -mt-1">
              <button type="button" onClick={() => { setTab('forgot'); clearError(); setForgotSuccess(false); setForgotError(''); }}
                className="text-[9.5px] text-gold/80 hover:text-gold tracking-[1px] uppercase font-montserrat transition-colors">
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={loading} {...hover}
              className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-bold py-4 transition-all rounded-sm mt-1 shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_28px_rgba(212,175,55,0.35)]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="25" strokeDashoffset="8"/>
                  </svg>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>

            <p className="text-[11px] text-text-dim text-center mt-2 font-montserrat">
              No account?{' '}
              <button type="button" onClick={() => setTab('register')} className="text-gold hover:text-gold-light underline transition-colors">
                Create one here
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && !registered && (
          <form onSubmit={handleRegister} className="px-7 pb-7 space-y-3.5" noValidate>
            <InputField label="Full Name" required error={regErrors.name}>
              <input type="text" placeholder="Abebe Girma" value={regName} autoComplete="name"
                onChange={(e) => { setRegName(e.target.value); setRegErrors(p => ({ ...p, name: '' })); }}
                className={inputCls(regErrors.name)} />
            </InputField>

            <InputField label="Email Address" required error={regErrors.email}>
              <input type="email" placeholder="you@example.com" value={regEmail} autoComplete="email"
                onChange={(e) => { setRegEmail(e.target.value); setRegErrors(p => ({ ...p, email: '' })); }}
                className={inputCls(regErrors.email)} />
            </InputField>

            <InputField label="Phone (Optional)">
              <input type="tel" placeholder="+251 9XX XXX XXXX" value={regPhone} autoComplete="tel"
                onChange={(e) => setRegPhone(e.target.value)}
                className={inputCls(false)} />
            </InputField>

            <InputField label="Password" required error={regErrors.password}>
              <div className="relative">
                <input type={showRegPw ? 'text' : 'password'} placeholder="Min 6 characters" value={regPassword}
                  autoComplete="new-password"
                  onChange={(e) => { setRegPassword(e.target.value); setRegErrors(p => ({ ...p, password: '' })); }}
                  className={`${inputCls(regErrors.password)} pr-12`} />
                <EyeBtn show={showRegPw} toggle={() => setShowRegPw(s => !s)} />
              </div>
              <PasswordStrength password={regPassword} />
            </InputField>

            <InputField label="Confirm Password" required error={regErrors.confirm}>
              <div className="relative">
                <input type="password" placeholder="Repeat password" value={regConfirm}
                  autoComplete="new-password"
                  onChange={(e) => { setRegConfirm(e.target.value); setRegErrors(p => ({ ...p, confirm: '' })); }}
                  className={`${inputCls(regErrors.confirm)} pr-12`} />
                {regConfirm && regPassword === regConfirm && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400">
                    <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                      <path d="M2 7.5L5.5 11L12 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray="20" strokeDashoffset="20" className="check-draw" />
                    </svg>
                  </span>
                )}
              </div>
            </InputField>

            <button type="submit" disabled={loading} {...hover}
              className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-bold py-4 transition-all rounded-sm mt-2 shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_28px_rgba(212,175,55,0.35)]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="25" strokeDashoffset="8"/>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>

            <p className="text-[11px] text-text-dim text-center font-montserrat">
              Already have an account?{' '}
              <button type="button" onClick={() => setTab('login')} className="text-gold hover:text-gold-light underline transition-colors">
                Sign in here
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTRATION SUCCESS ── */}
        {tab === 'register' && registered && (
          <div className="px-7 pb-10 text-center space-y-4 animate-[fadeIn_0.4s_ease]">
            <div className="flex justify-center mt-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center animate-bounce-in">
                <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
                  <path d="M5 14.5L11 20.5L23 8" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="40" strokeDashoffset="40" className="check-draw" />
                </svg>
              </div>
            </div>
            <h3 className="font-cormorant text-2xl text-white">You're all set!</h3>
            <p className="text-[12px] text-white-dim font-montserrat leading-relaxed">
              Your Tsedeke Grand Hotel account has been created. Enjoy exclusive member rates and easy booking management.
            </p>
            <button onClick={onClose} {...hover}
              className="w-full bg-gold hover:bg-gold-light text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-bold py-4 transition-all rounded-sm shadow-[0_4px_20px_rgba(212,175,55,0.25)]">
              Start Exploring
            </button>
          </div>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {tab === 'forgot' && (
          <div className="px-7 pb-7">
            {forgotSuccess ? (
              <div className="text-center space-y-4 animate-[fadeIn_0.35s_ease]">
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto animate-bounce-in">
                  <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                    <path d="M3 11l5 5L19 6" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      strokeDasharray="35" strokeDashoffset="35" className="check-draw" />
                  </svg>
                </div>
                <p className="text-[13px] text-white font-montserrat">Email Sent!</p>
                <p className="text-[11.5px] text-white-dim font-montserrat leading-relaxed">
                  We've sent a reset link to <span className="text-gold font-semibold">{forgotEmail}</span>. Check your inbox.
                </p>
                <button type="button" onClick={() => setTab('login')} {...hover}
                  className="w-full border border-border-gold hover:border-gold text-gold font-cinzel text-[10px] tracking-[2.5px] uppercase font-semibold py-3.5 transition-colors rounded-sm mt-2">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4" noValidate>
                <p className="text-[11.5px] text-text-dim font-montserrat leading-relaxed mb-2">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
                <InputField label="Email Address" required error={forgotError}>
                  <input type="email" placeholder="you@example.com" value={forgotEmail} autoComplete="email"
                    onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                    className={inputCls(!!forgotError)} />
                </InputField>
                <button type="submit" disabled={loading} {...hover}
                  className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-bold py-4 transition-all rounded-sm shadow-[0_4px_20px_rgba(212,175,55,0.2)]">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="25" strokeDashoffset="8"/>
                      </svg>
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => setTab('login')}
                    className="text-[11px] text-text-dim hover:text-white transition-colors font-montserrat">
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
