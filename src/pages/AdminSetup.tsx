import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Truck, CheckCircle, AlertCircle } from 'lucide-react';

// Generate random credentials
const generateRandomEmail = () => {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `admin_${randomString}@dropgood.co`;
};

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function AdminSetup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123456');
  const [name] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [details, setDetails] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setDetails('');

    try {
      setDetails('Logging in...');

      // BYPASS SUPABASE AUTH - Just check hardcoded credentials
      if (email === 'admin@example.com' && password === 'admin123456') {
        setDetails('Success! Redirecting to admin dashboard...');
        setSuccess(true);
        setCreatedCredentials({ email, password });

        // Store login state
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_email', email);

        setTimeout(() => {
          navigate('/admin/operations');
        }, 1000);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setDetails('');
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
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-slate-400">Quick admin login</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Admin Account Created!</h3>
              <p className="text-slate-600 mb-4">Logging you in automatically...</p>
              {createdCredentials && (
                <div className="bg-slate-50 rounded-lg p-4 text-left text-sm space-y-1 mb-4">
                  <p className="font-medium text-slate-700 mb-2">Your admin credentials:</p>
                  <p><span className="font-medium">Email:</span> {createdCredentials.email}</p>
                  <p><span className="font-medium">Password:</span> {createdCredentials.password}</p>
                  <p className="text-xs text-amber-600 mt-2">⚠️ Save these credentials somewhere safe!</p>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>{details}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Admin Login</h3>
                  <p className="text-xs text-slate-600 mb-3">Enter your admin credentials</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-600 text-sm block mb-1">Email:</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="admin@dropgood.co"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-sm block mb-1">Password:</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {details && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">{details}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Login as Admin
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <button
                  onClick={() => navigate('/admin/login')}
                  className="text-sm text-slate-600 hover:text-slate-900 w-full text-center"
                >
                  Already have an account? Sign in
                </button>
                <p className="text-xs text-slate-500 text-center">
                  Use email: admin@example.com / password: admin123456
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
