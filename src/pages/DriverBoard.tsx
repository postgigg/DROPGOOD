import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Truck, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';
import { useNavigate } from 'react-router-dom';

export default function DriverBoard() {
  const navigate = useNavigate();
  const [showSignupForm, setShowSignupForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    state: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Insert driver signup
      const { error } = await supabase
        .from('driver_signups')
        .insert([
          {
            name: formData.name,
            email: formData.email.toLowerCase(),
            city: formData.city,
            state: formData.state,
            email_verified: false, // They'll need to verify
            is_active: true,
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('This email is already registered. Check your inbox for job notifications!');
        }
        throw error;
      }

      setFormSuccess(true);
      setFormData({ name: '', email: '', city: '', state: '' });

      // Hide form after 3 seconds
      setTimeout(() => {
        setShowSignupForm(false);
        setFormSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Signup error:', error);
      setFormError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <nav className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-70">
              <DropGoodLogo size={32} />
              <span className="ml-2 text-2xl font-bold text-white">DropGood</span>
            </button>
            <div className="flex items-center gap-4">
              <Truck className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-semibold text-white">Driver Board</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Earn Money Delivering Donations
          </h1>
          <p className="text-lg mb-6 text-blue-50">
            Sign up to receive email notifications when delivery jobs become available in your area.
          </p>
          <button
            onClick={() => setShowSignupForm(!showSignupForm)}
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            <Mail className="h-5 w-5" />
            Get Job Alerts via Email
          </button>
        </div>

        {/* Signup Form */}
        {showSignupForm && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/30 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Get Notified About New Jobs</h2>
                <p className="text-gray-300 text-base">
                  Join our driver network and receive instant email alerts when delivery jobs become available within 15 miles of your city.
                </p>
              </div>
            </div>

            {formSuccess ? (
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 flex items-start gap-4 shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">You're all set!</p>
                  <p className="text-blue-50 text-base mt-1">
                    We'll email you as soon as jobs become available in your area. Keep an eye on your inbox!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2.5 flex items-center gap-2">
                      <span className="text-blue-400">•</span> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2.5 flex items-center gap-2">
                      <span className="text-blue-400">•</span> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2.5 flex items-center gap-2">
                      <span className="text-blue-400">•</span> City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Austin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2.5 flex items-center gap-2">
                      <span className="text-blue-400">•</span> State
                    </label>
                    <select
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    >
                      <option value="">Select state</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-red-100 font-semibold text-sm">Error</p>
                      <p className="text-red-200 text-sm mt-0.5">{formError}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    {formSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Signing you up...
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        Get Job Notifications
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <div className="w-5 h-5 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Free to join • Instant notifications • Jobs within 15 miles • Unsubscribe anytime
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
