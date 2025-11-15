import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Truck,
  DollarSign,
  Heart,
  Clock,
  CheckCircle,
  Mail,
  AlertCircle,
  ArrowRight,
  MapPin,
  TrendingUp
} from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

export default function ForDrivers() {
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase
        .from('driver_signups')
        .insert([
          {
            name: formData.name,
            email: formData.email.toLowerCase(),
            city: formData.city,
            state: formData.state,
            email_verified: false,
            is_active: true,
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email is already registered. Check your inbox for job notifications!');
        }
        throw error;
      }

      setFormSuccess(true);
      setFormData({ name: '', email: '', city: '', state: '' });
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

  const scrollToSignup = () => {
    setShowSignupForm(true);
    setTimeout(() => {
      document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const stats = [
    { value: '30-60 min', label: 'Average time', icon: <Clock className="h-5 w-5" /> },
    { value: '5-15 mi', label: 'Local routes', icon: <MapPin className="h-5 w-5" /> },
    { value: '$10 tip', label: 'Guaranteed', icon: <DollarSign className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 sm:gap-3 group">
              <DropGoodLogo className="group-hover:opacity-90 transition" size={32} />
              <span className="text-xl sm:text-2xl font-black text-white">DropGood</span>
            </button>
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={() => navigate('/')}
                className="text-sm sm:text-base text-gray-300 hover:text-white transition font-medium hidden sm:block"
              >
                Home
              </button>
              <button
                onClick={scrollToSignup}
                className="bg-white text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold hover:bg-gray-100 transition text-sm sm:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16 sm:pt-20">
        <div className="bg-gray-900 py-20 sm:py-32 md:py-40 relative overflow-hidden">
          {/* Background with photo */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url('/dropgood_header.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(2px)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight">
                Turn downtime into income
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 sm:mb-12 font-medium leading-relaxed">
                Deliver donations. Help communities. Earn extra money.
              </p>

              <button
                onClick={scrollToSignup}
                className="group bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-blue-700 transition shadow-xl inline-flex items-center justify-center gap-3 whitespace-nowrap mb-6 sm:mb-8"
              >
                Start earning today
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-white/70 text-base sm:text-lg">
                Use Uber Direct · Same app you know · No commitments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Stats Bar */}
      <div className="bg-gray-900 py-8 sm:py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-blue-500">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                    {stat.value}
                  </div>
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">

          {/* How It Works */}
          <div className="text-center mb-20 sm:mb-32">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">
              Four simple steps
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-12 sm:mb-16 max-w-2xl mx-auto">
              Same app you already use, new way to earn
            </p>

            <div className="grid md:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/20 rounded-2xl sm:rounded-3xl mb-6 border border-blue-600/30">
                  <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Sign up</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Get email alerts when jobs are available in your area
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/20 rounded-2xl sm:rounded-3xl mb-6 border border-blue-600/30">
                  <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Enable Uber Direct</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Turn on delivery mode in your Uber Driver app
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/20 rounded-2xl sm:rounded-3xl mb-6 border border-blue-600/30">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Accept jobs</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Pick up from homes, deliver to local charities
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/20 rounded-2xl sm:rounded-3xl mb-6 border border-blue-600/30">
                  <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Get paid</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Money deposited to your Uber account as usual
                </p>
              </div>
            </div>
          </div>

          {/* Why Drive with DropGood */}
          <div className="text-center mb-20 sm:mb-32">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">
              Why drive with us?
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-12 sm:mb-16 max-w-2xl mx-auto">
              Earn more while making a difference
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {/* Guaranteed Tips - FEATURED */}
              <div className="bg-gradient-to-br from-green-900/40 to-blue-900/40 rounded-3xl p-8 border-2 border-green-600/50 shadow-xl">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/30 rounded-2xl mb-6 border border-green-500/50">
                  <DollarSign className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-4">$10 Guaranteed Tip</h3>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Every delivery includes a $10 tip already paid by the customer. You know exactly what you'll earn before accepting.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 rounded-2xl mb-6 border border-blue-600/30">
                  <MapPin className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Short distances</h3>
                <p className="text-gray-400 leading-relaxed">
                  Most jobs are 5-15 miles. Local routes mean more deliveries per hour.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 rounded-2xl mb-6 border border-blue-600/30">
                  <Clock className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Total flexibility</h3>
                <p className="text-gray-400 leading-relaxed">
                  Work when you want. No minimums, no commitments. Complete freedom.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 rounded-2xl mb-6 border border-blue-600/30">
                  <Heart className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Help communities</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every delivery helps someone donate to local charities. Feel good about your work.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 rounded-2xl mb-6 border border-blue-600/30">
                  <Truck className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Same app</h3>
                <p className="text-gray-400 leading-relaxed">
                  Use your existing Uber Driver app. No new apps to learn or download.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 rounded-2xl mb-6 border border-blue-600/30">
                  <MapPin className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Local jobs</h3>
                <p className="text-gray-400 leading-relaxed">
                  Most deliveries are 5-15 miles. Stay in your area, know the routes.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 rounded-2xl mb-6 border border-blue-600/30">
                  <TrendingUp className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Growing demand</h3>
                <p className="text-gray-400 leading-relaxed">
                  Get in early as DropGood expands to more cities nationwide.
                </p>
              </div>
            </div>
          </div>

          {/* Signup Section */}
          <div id="signup-section" className="max-w-3xl mx-auto">
            <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 border border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Ready to start earning?
                </h2>
                <p className="text-lg text-gray-400">
                  Sign up to receive job notifications near you
                </p>
              </div>

              {formSuccess ? (
                <div className="bg-blue-600/20 border border-blue-600/30 rounded-2xl p-6 flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-bold text-lg">You're all set!</p>
                    <p className="text-gray-300 mt-1">
                      We'll email you when jobs become available in your area.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full name"
                        className="w-full px-4 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-600/30 focus:border-blue-600/50 transition"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email address"
                        className="w-full px-4 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-600/30 focus:border-blue-600/50 transition"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-4 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-600/30 focus:border-blue-600/50 transition"
                      />
                    </div>
                    <div>
                      <select
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-4 bg-black border border-gray-800 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-blue-600/30 focus:border-blue-600/50 transition"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formError && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-200 text-sm">{formError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full bg-blue-600 text-white py-4 sm:py-5 rounded-2xl text-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Signing you up...
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        Get job notifications
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Free to join · Instant notifications · No commitments
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 sm:mt-32 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-12 text-center">
              Common questions
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Do I work for DropGood?</h3>
                <p className="text-gray-400 leading-relaxed">
                  No. You stay independent and use Uber Direct. DropGood connects you with delivery opportunities through Uber's platform.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">How do I get paid?</h3>
                <p className="text-gray-400 leading-relaxed">
                  Through Uber's payment system, just like your regular deliveries. Same payout schedule you're used to.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">What if items don't fit?</h3>
                <p className="text-gray-400 leading-relaxed">
                  You see delivery details before accepting. Most items are bags or boxes. Decline if it doesn't fit your vehicle.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Can I do this part-time?</h3>
                <p className="text-gray-400 leading-relaxed">
                  Yes. Accept jobs when you want, decline when you don't. Zero minimums or requirements.
                </p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">When do I get the $10 tip?</h3>
                <p className="text-gray-400 leading-relaxed">
                  The $10 guaranteed tip is paid out after successful delivery and photo confirmation, just like your regular Uber Direct earnings. It's automatically included in your payout - you don't need to do anything special.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Final CTA */}
      <div className="bg-gray-900 border-t border-gray-800 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">
            Start making a difference
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join drivers earning extra income while helping communities
          </p>
          <button
            onClick={scrollToSignup}
            className="group bg-white text-black px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg font-bold hover:bg-gray-100 transition inline-flex items-center gap-3"
          >
            Sign up now
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
