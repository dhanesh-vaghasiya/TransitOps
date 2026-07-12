import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-transparent">
      {/* Brand Panel - 40% */}
      <div 
        className="hidden lg:flex w-[40%] flex-col justify-center items-center p-12 relative overflow-hidden bg-[#9A5013] border-r border-white/5 shadow-2xl"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
      >
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
          <div className="bg-[#1C1A17] p-8 rounded-[2rem] shadow-2xl mb-8 border border-white/10">
            <img src="/logo-dark.jpg" alt="TransitOps Logo" className="w-32 h-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">TransitOps</h1>
          <p className="text-white/80 font-medium tracking-wide text-sm mb-16">Smart Transport Operations Platform</p>
          
          <div className="space-y-8 w-full pl-4 text-left">
            <div className="flex items-center space-x-4 text-white font-bold text-sm tracking-wider">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
              <span>REAL-TIME TELEMETRY</span>
            </div>
            <div className="flex items-center space-x-4 text-white font-bold text-sm tracking-wider">
              <span className="material-symbols-outlined text-[24px]">route</span>
              <span>DYNAMIC ROUTING</span>
            </div>
            <div className="flex items-center space-x-4 text-white font-bold text-sm tracking-wider">
              <span className="material-symbols-outlined text-[24px]">shield</span>
              <span>SAFETY COMPLIANCE</span>
            </div>

          </div>
        </div>
      </div>

      {/* Form Panel - 60% */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-surface relative">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-on-surface text-center">Welcome Back</h2>
            <p className="mt-2 text-center text-on-surface-variant">Sign in to your account to continue</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 p-4 border rounded-lg text-sm flex items-center font-medium" style={{ backgroundColor: 'rgba(255, 50, 50, 0.15)', borderColor: 'rgba(255, 50, 50, 0.3)', color: '#ff6b6b' }}>
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-on-surface-variant/50 shadow-sm"
                  placeholder="manager@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-on-surface-variant/50 shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container" />
                  <span className="text-sm text-on-surface-variant">Remember this device</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-primary-hover font-medium">Forgot password?</a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-all shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
