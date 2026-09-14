import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import useUiStore from '../../store/ui/themeStore.js';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuthStore();
  const { addToast } = useUiStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    const isSuccess = await resetPassword(token, password);
    if (isSuccess) {
      setSuccess(true);
      addToast('Password reset successful. You can now login.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-dark-1 pt-32 pb-20 px-4 flex items-center justify-center font-montserrat">
      <div className="max-w-md w-full bg-dark-2 border border-border-gold/25 p-8 rounded-sm shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        
        <div className="text-center mb-8">
          <span className="text-[9px] tracking-[3px] uppercase text-gold font-semibold block mb-2">
            Tsedeke Grand Hotel
          </span>
          <h1 className="font-cormorant text-3xl font-light text-white mb-2">
            Reset Password
          </h1>
          <p className="text-[12px] text-white-dim">
            Enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center mx-auto text-gold text-2xl">
              ✓
            </div>
            <p className="text-[13px] text-white">
              Your password has been reset successfully.
            </p>
            <Link 
              to="/"
              className="inline-block w-full bg-gold hover:bg-gold-light text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold py-4 transition-colors rounded-sm"
            >
              Return Home to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-text-dim">
                New Password <span className="text-gold">*</span>
              </label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-dark-3 border border-border-gold/25 text-white text-[13px] p-3.5 outline-none focus:border-gold w-full transition-colors rounded-sm"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-text-dim">
                Confirm Password <span className="text-gold">*</span>
              </label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-dark-3 border border-border-gold/25 text-white text-[13px] p-3.5 outline-none focus:border-gold w-full transition-colors rounded-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold py-4 transition-colors rounded-sm mt-2"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
