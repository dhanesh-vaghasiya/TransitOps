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
      <div className="hidden lg:flex w-[40%] flex-col justify-between p-12 relative overflow-hidden bg-black/20 backdrop-blur-md border-r border-white/5 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">TransitOps</h1>
          <p className="text-primary font-medium tracking-wide uppercase text-sm">Command Center v2.0</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Streamline your<br />fleet operations
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">✓</div>
              <span>Real-time fleet tracking</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">✓</div>
              <span>Automated dispatching</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">✓</div>
              <span>Maintenance predictive alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel - 60% */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-black/30 backdrop-blur-2xl relative">
        {/* Subtle inner border for glass effect */}
        <div className="absolute inset-0 border-l border-white/10 pointer-events-none" />
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white text-center">Welcome Back</h2>
            <p className="mt-2 text-center text-white/60">Sign in to your account to continue</p>
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
                <label className="block text-sm font-medium text-white/90 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/70 transition-all placeholder:text-white/30 shadow-inner"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/70 transition-all placeholder:text-white/30 shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 text-primary focus:ring-primary bg-black/40" />
                  <span className="text-sm text-white/60">Remember this device</span>
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
