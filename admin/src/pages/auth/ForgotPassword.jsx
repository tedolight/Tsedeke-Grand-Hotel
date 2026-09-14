import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth/authService.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-dark-1 font-montserrat text-white select-none">
      
      {/* Visual Left Panel */}
      <div className="flex-1 bg-dark-2 flex flex-col items-center justify-center p-12 relative overflow-hidden hidden lg:flex before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(201,168,76,0.08)_0%,transparent_70%)] before:z-0">
        
        {/* Background Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] z-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_60px,#C9A84C_60px,#C9A84C_61px),repeating-linear-gradient(90deg,transparent,transparent_60px,#C9A84C_60px,#C9A84C_61px)]" />

        <div className="relative z-10 text-center max-w-md">
          {/* Brand Icon */}
          <div className="w-[120px] h-[70px] border border-gold/40 rounded-lg overflow-hidden flex items-center justify-center mx-auto mb-7 bg-white/10 p-2 shadow-[0_0_20px_rgba(201,168,76,0.2)]">
            <img src="/logo.png" alt="Hotel Logo" className="max-h-full max-w-full object-contain" />
          </div>
          
          <h1 className="font-cinzel text-[36px] font-semibold text-gold tracking-[6px] mb-1.5 leading-none">TSEDEKE GRAND</h1>
          <h2 className="font-cinzel text-[13px] tracking-[5px] text-text-muted mb-12">HOTEL · HOSSANA</h2>
        </div>

        {/* Footer */}
        <div className="absolute bottom-7 text-[11px] text-text-muted tracking-[1px]">
          TSEDEKE GRAND HOTEL MANAGEMENT SYSTEM · v2.1
        </div>
      </div>

      {/* Forgot Password Right Panel */}
      <div className="w-full lg:w-[460px] lg:min-w-[460px] bg-dark-3 flex flex-col justify-center px-8 sm:px-12 md:px-14 py-16 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-gold before:to-transparent before:hidden lg:before:block">
        
        <div className="max-w-[400px] mx-auto w-full">
          <h3 className="font-cinzel text-[26px] text-white leading-none mb-1.5 font-medium">Reset Password</h3>
          <h4 className="text-[12px] text-text-muted tracking-[1px] mb-10 font-semibold">RECOVER YOUR ADMIN ACCOUNT</h4>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded p-4 mb-6 text-xs flex items-center gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 border border-gold/30 bg-gold-glow rounded-full flex items-center justify-center mx-auto text-gold text-xl">
                <i className="fas fa-paper-plane" />
              </div>
              <div className="space-y-2">
                <h5 className="font-cinzel text-md text-white">Verification Link Sent</h5>
                <p className="text-xs text-text-muted leading-relaxed">
                  We've sent a password recovery email to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-transparent border border-border-gold hover:border-gold text-gold rounded p-4 font-cinzel text-[13px] tracking-[3px] font-semibold cursor-pointer transition-all duration-300"
              >
                BACK TO SIGN IN
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-text-muted leading-relaxed">
                Enter the email address associated with your administrator account, and we will send you instructions to reset your password.
              </p>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-[11px] tracking-[2px] uppercase text-text-muted font-semibold">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mynameisteddy28@gmail.com"
                    className="w-full bg-dark-4 border border-border-gold rounded p-3 px-4 font-montserrat text-sm text-white outline-none focus:border-gold focus:ring-3 focus:ring-gold-glow transition-all duration-300"
                    required
                  />
                  <i className="fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-light text-black border-none rounded p-4 font-cinzel text-[13px] tracking-[3px] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <i className="fas fa-share" />
                <span>{loading ? 'SENDING LINK...' : 'SEND RESET LINK'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-gold hover:text-gold-light transition-colors duration-200 bg-transparent border-none cursor-pointer font-semibold"
                >
                  <i className="fas fa-arrow-left mr-2" /> Back to Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-16 text-[10px] text-text-muted tracking-[1px] text-center">
            © 2026 TSEDEKE GRAND HOTEL · HOSSANA, ETHIOPIA
          </div>
        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;
