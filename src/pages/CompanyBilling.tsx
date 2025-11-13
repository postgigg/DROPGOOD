import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, TrendingUp, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    Stripe: any;
  }
}

interface Company {
  id: string;
  name: string;
  current_credit_balance: number;
  subsidy_percentage: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'credit_added' | 'booking_charge' | 'refund';
  description: string;
  created_at: string;
}

export default function CompanyBilling() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditAmount, setCreditAmount] = useState(500);
  const [processingPayment, setProcessingPayment] = useState(false);
  const stripeRef = useRef<any>(null);
  const cardElementRef = useRef<any>(null);
  const cardMountRef = useRef<HTMLDivElement>(null);
  const [stripeReady, setStripeReady] = useState(false);

  const PROCESSING_FEE = 0.05; // 5%
  const MIN_CREDIT_AMOUNT = 500;

  useEffect(() => {
    loadData();

    // Initialize Stripe with a delay to ensure script is loaded
    const initStripe = () => {
      console.log('Checking for Stripe.js...', !!window.Stripe);
      console.log('Stripe key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 10));

      if (window.Stripe) {
        try {
          stripeRef.current = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
          setStripeReady(true);
          console.log('✅ Stripe initialized!', stripeRef.current);
        } catch (error) {
          console.error('❌ Error initializing Stripe:', error);
        }
      } else {
        console.error('❌ Stripe.js not loaded! Retrying...');
        // Retry after a short delay
        setTimeout(initStripe, 500);
      }
    };

    // Small delay to ensure Stripe.js script is loaded
    setTimeout(initStripe, 100);
  }, []);

  useEffect(() => {
    // Mount Stripe card element when Stripe is loaded
    if (stripeReady && stripeRef.current && cardMountRef.current && !cardElementRef.current) {
      console.log('🔵 Mounting Stripe card element...');
      try {
        const elements = stripeRef.current.elements();
        const card = elements.create('card', {
          style: {
            base: {
              color: '#ffffff',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              lineHeight: '24px',
              '::placeholder': {
                color: '#9ca3af',
              },
            },
            invalid: {
              color: '#ef4444',
            },
          },
        });

        card.mount(cardMountRef.current);
        cardElementRef.current = card;
        console.log('✅ Card element mounted successfully!');

        // Listen for errors
        card.on('change', (event: any) => {
          if (event.error) {
            console.error('Card validation error:', event.error.message);
          } else {
            console.log('Card input valid');
          }
        });
      } catch (error) {
        console.error('❌ Error mounting card element:', error);
      }
    }
  }, [stripeReady]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/company-signup');
        return;
      }

      // Load company data
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, current_credit_balance, subsidy_percentage')
        .eq('owner_user_id', user.id)
        .single();

      if (companyData) {
        setCompany(companyData);
      }

      // Load recent transactions (you'd need to create this table)
      // const { data: txData } = await supabase
      //   .from('company_transactions')
      //   .select('*')
      //   .eq('company_id', companyData?.id)
      //   .order('created_at', { ascending: false })
      //   .limit(20);

      // setTransactions(txData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (amount: number) => {
    const fee = amount * PROCESSING_FEE;
    return {
      subtotal: amount,
      fee: fee,
      total: amount + fee
    };
  };

  const handleAddCredits = async () => {
    if (creditAmount < MIN_CREDIT_AMOUNT) {
      alert(`Minimum credit amount is $${MIN_CREDIT_AMOUNT}`);
      return;
    }

    if (!stripeRef.current) {
      alert('Stripe is not loaded. Please refresh the page.');
      return;
    }

    if (!cardElementRef.current) {
      alert('Please enter your card information');
      return;
    }

    setProcessingPayment(true);

    try {
      const totals = calculateTotal(creditAmount);

      console.log('💳 Creating payment intent for:', totals.total);

      // Create payment intent
      const { data: paymentIntentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            amount: Math.round(totals.total * 100), // Convert to cents
            currency: 'usd',
            metadata: {
              company_id: company?.id,
              credit_amount: creditAmount,
              processing_fee: totals.fee,
              type: 'company_credit_purchase'
            }
          }
        }
      );

      if (paymentError) {
        throw new Error('Failed to create payment intent: ' + paymentError.message);
      }

      const { client_secret: clientSecret, payment_intent_id } = paymentIntentData;

      console.log('💳 Confirming payment with Stripe instance:', stripeRef.current);
      console.log('💳 Using card element:', cardElementRef.current);

      // Confirm payment with the card - use the SAME stripe instance from ref
      const { error: confirmError, paymentIntent } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElementRef.current,
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not successful');
      }

      // Payment successful! Now update credits
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          current_credit_balance: (company?.current_credit_balance || 0) + creditAmount
        })
        .eq('id', company?.id);

      if (updateError) throw updateError;

      // Record transaction
      await supabase.from('company_transactions').insert({
        company_id: company?.id,
        amount: creditAmount,
        processing_fee: totals.fee,
        total_charged: totals.total,
        type: 'credit_added',
        payment_method: 'stripe',
        stripe_payment_intent_id: payment_intent_id,
        description: `Added $${creditAmount} credits (fee: $${totals.fee.toFixed(2)})`,
        created_at: new Date().toISOString()
      });

      alert(`✅ Payment successful! Added $${creditAmount} in credits.\nTotal charged: $${totals.total.toFixed(2)}`);

      // Reset form
      if (cardElementRef.current) {
        cardElementRef.current.clear();
      }
      setCreditAmount(500);
      loadData();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Payment failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading billing...</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotal(creditAmount);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/company-dashboard')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Billing Management</h1>
          <p className="text-gray-400">Manage credits and view transaction history</p>
        </div>

        {/* Credit Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm opacity-90 mb-2">Available Credits</div>
              <div className="text-5xl font-bold">
                ${company?.current_credit_balance?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm opacity-75 mt-2">
                {company?.subsidy_percentage}% subsidy on employee bookings
              </div>

              {/* Estimated Pickups */}
              {company && company.current_credit_balance > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-sm opacity-90 mb-2">Estimated Coverage</div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Average pickup at $15 */}
                    {(() => {
                      const avgPickupPrice = 15;
                      const companyPaysPerPickup = avgPickupPrice * (company.subsidy_percentage / 100);
                      const estimatedPickups = Math.floor(company.current_credit_balance / companyPaysPerPickup);
                      return (
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-2xl font-bold">{estimatedPickups}</div>
                          <div className="text-xs opacity-75">pickups @ $15 avg</div>
                          <div className="text-xs opacity-60 mt-1">
                            (${companyPaysPerPickup.toFixed(2)} each)
                          </div>
                        </div>
                      );
                    })()}

                    {/* Budget pickup at $6 */}
                    {(() => {
                      const budgetPickupPrice = 6;
                      const companyPaysPerPickup = budgetPickupPrice * (company.subsidy_percentage / 100);
                      const estimatedPickups = Math.floor(company.current_credit_balance / companyPaysPerPickup);
                      return (
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-2xl font-bold">{estimatedPickups}</div>
                          <div className="text-xs opacity-75">pickups @ $6 min</div>
                          <div className="text-xs opacity-60 mt-1">
                            (${companyPaysPerPickup.toFixed(2)} each)
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs opacity-60 mt-3">
                    💡 Company pays {company.subsidy_percentage}%, employees pay {100 - company.subsidy_percentage}%
                  </p>
                </div>
              )}
            </div>
            <CreditCard className="h-20 w-20 opacity-50 flex-shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Credits Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="h-6 w-6 text-green-400" />
              Add Credits
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Credit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Math.max(MIN_CREDIT_AMOUNT, parseInt(e.target.value) || MIN_CREDIT_AMOUNT))}
                    min={MIN_CREDIT_AMOUNT}
                    step={50}
                    className="w-full bg-gray-700 text-white px-4 pl-8 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: ${MIN_CREDIT_AMOUNT}</p>
              </div>

              {/* Quick amounts */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[500, 1000, 2500, 5000, 10000, 25000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCreditAmount(amount)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        creditAmount === amount
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Credits</span>
                  <span className="text-white">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing Fee (5%)</span>
                  <span className="text-white">${totals.fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total Charge</span>
                  <span className="text-white text-lg">${totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Stripe Card Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Card Information
                </label>
                <div
                  ref={cardMountRef}
                  className="bg-gray-700 px-4 py-3 rounded-lg border-2 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition min-h-[50px]"
                  style={{ minHeight: '50px' }}
                />
                {!stripeReady && (
                  <p className="text-yellow-400 text-xs mt-1">Loading payment form...</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Your payment is secured by Stripe. We never store your card details.
                </p>
              </div>

              <button
                onClick={handleAddCredits}
                disabled={processingPayment || creditAmount < MIN_CREDIT_AMOUNT}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Add ${totals.total.toFixed(2)} to Balance
                  </>
                )}
              </button>

              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <div className="font-medium mb-1">How Credits Work</div>
                    <ul className="space-y-1 text-blue-300/80">
                      <li>• Credits never expire</li>
                      <li>• Employees get {company?.subsidy_percentage}% discount on pickups</li>
                      <li>• Company pays remaining balance from credits</li>
                      <li>• Automatic low balance alerts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              Recent Transactions
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-2">Add credits to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{tx.description}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      tx.type === 'credit_added' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'credit_added' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
