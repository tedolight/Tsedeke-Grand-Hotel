import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import authService from '../../services/auth/authService.js';

const Login = () => {
  const [email, setEmail] = useState('mynameisteddy28@gmail.com');
  const [password, setPassword] = useState('admin123'); // seed password or mock value
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({ rooms: '38', occupancy: '34%', checkIns: '13' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await authService.getLoginStats();
        const data = res.data || res;
        if (data) {
          setStats({
            rooms: String(data.totalRooms || 38),
            occupancy: String(data.occupancyRate || '34%'),
            checkIns: String(data.checkIns || 13)
          });
        }
      } catch (err) {
        console.error('Failed to fetch login live stats:', err);
      }
    };
    fetchLiveStats();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
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

          {/* Quick stats grid */}
          <div className="grid grid-cols-3 gap-4 max-w-[420px] mx-auto">
            {[
              { num: stats.rooms, label: 'Rooms' },
              { num: stats.occupancy, label: 'Occupancy' },
              { num: stats.checkIns, label: 'Check-ins' }
            ].map((stat, i) => (
              <div key={i} className="bg-gold/5 border border-border-gold rounded-lg p-4 text-center hover:bg-gold/10 transition-all duration-300">
                <span className="font-cinzel text-2xl text-gold block mb-1 font-semibold">{stat.num}</span>
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-7 text-[11px] text-text-muted tracking-[1px]">
          TSEDEKE GRAND HOTEL MANAGEMENT SYSTEM · v2.1
        </div>
      </div>

      {/* Login Right Panel */}
      <div className="w-full lg:w-[460px] lg:min-w-[460px] bg-dark-3 flex flex-col justify-center px-8 sm:px-12 md:px-14 py-16 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-gold before:to-transparent before:hidden lg:before:block">
        
        <div className="max-w-[400px] mx-auto w-full">
          <h3 className="font-cinzel text-[26px] text-white leading-none mb-1.5 font-medium">Welcome Back</h3>
          <h4 className="text-[12px] text-text-muted tracking-[1px] mb-10 font-semibold">SIGN IN TO ADMIN PANEL</h4>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded p-4 mb-6 text-xs flex items-center gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[11px] tracking-[2px] uppercase text-text-muted font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-4 border border-border-gold rounded p-3 px-4 font-montserrat text-sm text-white outline-none focus:border-gold focus:ring-3 focus:ring-gold-glow transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold text-sm cursor-pointer transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-gold border-border-gold bg-dark-4 rounded"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-gold hover:text-gold-light transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 text-xs font-montserrat"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-black border-none rounded p-4 font-cinzel text-[13px] tracking-[3px] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <i className="fas fa-sign-in-alt" />
              <span>{loading ? 'LOGGING IN...' : 'SIGN IN'}</span>
            </button>
          </form>

          <div className="text-center text-[11px] text-text-muted my-6 relative before:absolute before:left-0 before:top-1/2 before:w-[42%] before:h-[1px] before:bg-border-gold after:absolute after:right-0 after:top-1/2 after:w-[42%] after:h-[1px] after:bg-border-gold">
            ACCESS LEVELS
          </div>
          
          <div className="bg-dark-4 border border-border-gold-soft rounded p-3 px-3.5 text-[11px] text-text-muted leading-relaxed space-y-1">
            <div><strong>Super Admin</strong> — Full access to all settings &amp; data</div>
            <div><strong>Manager</strong> — Bookings, rooms, restaurant, reports</div>
            <div><strong>Staff</strong> — Bookings and guest management only</div>
          </div>

          <div className="mt-10 text-[10px] text-text-muted tracking-[1px] text-center">
            © 2026 TSEDEKE GRAND HOTEL · HOSSANA, ETHIOPIA
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
