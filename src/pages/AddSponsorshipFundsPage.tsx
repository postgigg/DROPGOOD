import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DollarSign, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DropGoodLogo from '../components/DropGoodLogo';

export default function AddSponsorshipFundsPage() {
  const navigate = useNavigate();
  const { sponsorshipId } = useParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [amount, setAmount] = useState(500);
  const [error, setError] = useState('');

  const platformFeePercent = 5;
  const stripeFeePercent = 2.9;
  const stripeFeeFixed = 0.30;

  // Calculate fees and total
  const platformFee = (amount * platformFeePercent) / 100;
  const subtotal = amount + platformFee;
  const stripeFee = (subtotal * stripeFeePercent) / 100 + stripeFeeFixed;
  const totalCharge = subtotal + stripeFee;

  useEffect(() => {
    loadSponsorship();
  }, [sponsorshipId]);

  async function loadSponsorship() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sponsorships')
        .select(`
          *,
          donation_centers (
            name,
            city,
            state
          )
        `)
        .eq('id', sponsorshipId)
        .single();

      if (error) throw error;
      setSponsorship(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // In production, this would integrate with Stripe
      // For now, just update the credit balance
      const { error: updateError } = await supabase
        .from('sponsorships')
        .update({
          current_credit_balance: sponsorship.current_credit_balance + amount,
          total_credits_added: (sponsorship.total_credits_added || 0) + amount
        })
        .eq('id', sponsorshipId);

      if (updateError) throw updateError;

      alert(`Successfully added $${amount.toFixed(2)} to sponsorship!`);
      navigate('/donation-center/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!sponsorship) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Sponsorship not found</p>
          <button
            onClick={() => navigate('/donation-center/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/donation-center/dashboard')} className="flex items-center hover:opacity-70">
              <DropGoodLogo size={32} />
              <span className="ml-2 text-2xl font-bold text-white">DropGood</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/donation-center/dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Add Funds to Sponsorship</h1>
          <p className="text-gray-400 mb-4">{sponsorship.name}</p>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-500">Location:</span>
              <span className="text-white ml-2">{sponsorship.donation_centers.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Current Balance:</span>
              <span className="text-green-400 ml-2 font-semibold">
                ${sponsorship.current_credit_balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Amount to Add
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                min="10"
                step="10"
                className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="mt-2 flex gap-2">
              {[100, 250, 500, 1000, 2500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1 rounded text-sm ${
                    amount === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-3">Payment Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subsidy Credits</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Platform Fee ({platformFeePercent}%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Payment Processing ({stripeFeePercent}% + ${stripeFeeFixed.toFixed(2)})</span>
                <span>${stripeFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-bold text-lg text-white">
                <span>Total Charge</span>
                <span>${totalCharge.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">How Your Funds Work</p>
                <p className="text-blue-200">
                  ${amount.toFixed(2)} will be added to your sponsorship balance and used to subsidize
                  pickup costs for customers within your target area. The {platformFeePercent}% platform
                  fee helps us maintain and improve our service.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/donation-center/dashboard')}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || amount < 10}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Add ${totalCharge.toFixed(2)}
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Lock className="inline h-3 w-3 mr-1" />
            Secured by Stripe
          </p>
        </form>
      </div>
    </div>
  );
}

function Lock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
