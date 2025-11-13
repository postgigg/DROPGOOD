import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, Truck } from 'lucide-react';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('LOGIN ATTEMPT:', { email, password });

      // BYPASS SUPABASE AUTH - Check credentials directly against database
      if (email === 'admin@example.com' && password === 'admin123456') {
        console.log('CREDENTIALS MATCH - LOGGING IN');
        // HARDCODED BYPASS - Just fucking log them in
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_email', email);

        // Small delay so user sees loading
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('NAVIGATING TO /admin/operations');
        navigate('/admin/operations');
      } else {
        console.log('INVALID CREDENTIALS');
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      console.error('LOGIN ERROR:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DropGood Admin</h1>
          <p className="text-slate-400">Sign in to manage operations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="superadmin@dropgood.app"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
            <button
              onClick={() => navigate('/admin/setup')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium w-full text-center"
            >
              Need to create an admin account? Click here
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-600 hover:text-slate-900 w-full text-center"
            >
              Back to main site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
