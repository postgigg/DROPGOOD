import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Save, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DropGoodLogo from '../components/DropGoodLogo';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function AddLocationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    streetAddress: '',
    city: '',
    state: 'TX',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    acceptedItems: [] as string[],
    specialInstructions: '',
    // Tax receipt fields
    isPartner: false,
    canAutoIssueReceipts: false,
    ein: '',
    authorizedSignerName: '',
    receiptEmail: ''
  });

  const itemTypes = [
    'Clothing',
    'Shoes',
    'Books',
    'Electronics',
    'Household items',
    'Toys',
    'Furniture',
    'Kitchenware'
  ];

  async function geocodeAddress() {
    if (!formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in the complete address first');
      return;
    }

    setGeocoding(true);
    setError('');

    try {
      const address = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCoordinates({ latitude: lat, longitude: lng });
      } else {
        throw new Error('Address not found. Please check and try again.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeocoding(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!coordinates) {
      setError('Please verify the address location first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: dcUser } = await supabase
        .from('donation_center_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dcUser) throw new Error('Donation center user not found');

      const { error: insertError } = await supabase
        .from('donation_centers')
        .insert({
          owner_user_id: dcUser.id,
          name: formData.name,
          description: formData.description,
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          accepted_items: formData.acceptedItems,
          special_instructions: formData.specialInstructions,
          is_active: true,
          created_by_owner: true,
          is_verified: false,
          // Tax receipt fields
          is_partner: formData.isPartner,
          can_auto_issue_receipts: formData.canAutoIssueReceipts,
          ein: formData.ein || null,
          authorized_signer_name: formData.authorizedSignerName || null,
          receipt_email: formData.receiptEmail || null,
          partnership_agreement_signed_date: formData.isPartner ? new Date().toISOString().split('T')[0] : null
        });

      if (insertError) throw insertError;

      navigate('/donation-center/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(item: string) {
    setFormData(prev => ({
      ...prev,
      acceptedItems: prev.acceptedItems.includes(item)
        ? prev.acceptedItems.filter(i => i !== item)
        : [...prev.acceptedItems, item]
    }));
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <DropGoodLogo size={32} />
              <span className="text-xl font-bold text-white">DropGood</span>
            </div>
            <button
              onClick={() => navigate('/donation-center/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Add New Location</h1>
          <p className="text-gray-400">Add a donation center location to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Goodwill - Downtown Austin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe what makes your location unique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Austin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State *
                </label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TX">Texas</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => {
                    setFormData({ ...formData, zipCode: e.target.value });
                    setCoordinates(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="78701"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@charity.org"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://charity.org"
                />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={geocoding || !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {geocoding ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Verifying Address...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    Verify Address Location
                  </>
                )}
              </button>

              {coordinates && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-semibold">Address Verified!</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              {!coordinates && formData.zipCode && (
                <p className="mt-4 text-gray-400 text-sm text-center">
                  Please verify your address before saving
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Accepted Items *</h2>
            <p className="text-gray-400 text-sm">Select all types of items you accept</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {itemTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    formData.acceptedItems.includes(item)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Special Instructions</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery instructions for couriers (optional)
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Use loading dock in back, Ring doorbell, etc."
              />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Tax Receipt Settings</h2>
              <p className="text-gray-400 text-sm">Configure how donors receive tax-deductible receipts</p>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPartner}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      isPartner: e.target.checked,
                      canAutoIssueReceipts: e.target.checked ? formData.canAutoIssueReceipts : false
                    });
                  }}
                  className="mt-1 h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-blue-300">Partner Organization</div>
                  <p className="text-sm text-gray-400 mt-1">
                    I represent a 501(c)(3) organization and want to become a DropGood partner.
                    Partners can subsidize pickups and provide automated tax receipts.
                  </p>
                </div>
              </label>
            </div>

            {formData.isPartner && (
              <div className="space-y-4 pl-8 border-l-2 border-blue-600">
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canAutoIssueReceipts}
                      onChange={(e) => setFormData({ ...formData, canAutoIssueReceipts: e.target.checked })}
                      className="mt-1 h-5 w-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div>
                      <div className="font-semibold text-green-300">Enable Auto-Generated Tax Receipts</div>
                      <p className="text-sm text-gray-400 mt-1">
                        Allow DropGood to auto-generate and send IRS-compliant tax receipts on behalf of your organization.
                        Requires partnership agreement and authorization.
                      </p>
                    </div>
                  </label>
                </div>

                {formData.canAutoIssueReceipts && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Federal EIN (Required for tax receipts) *
                      </label>
                      <input
                        type="text"
                        required={formData.canAutoIssueReceipts}
                        value={formData.ein}
                        onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12-3456789"
                      />
                      <p className="text-xs text-gray-500 mt-1">Your organization's Federal Employer Identification Number</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Authorized Signer Name (Required for tax receipts) *
                      </label>
                      <input
                        type="text"
                        required={formData.canAutoIssueReceipts}
                        value={formData.authorizedSignerName}
                        onChange={(e) => setFormData({ ...formData, authorizedSignerName: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jane Smith, Executive Director"
                      />
                      <p className="text-xs text-gray-500 mt-1">Name and title of authorized representative who can sign receipts</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Receipt Email {formData.canAutoIssueReceipts ? '(CC receipts)' : '(For receipt requests)'}
                  </label>
                  <input
                    type="email"
                    value={formData.receiptEmail}
                    onChange={(e) => setFormData({ ...formData, receiptEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="receipts@charity.org"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.canAutoIssueReceipts
                      ? 'Get a copy of all auto-generated tax receipts sent to donors'
                      : 'Where donors should forward their donation summary to request a receipt'}
                  </p>
                </div>
              </div>
            )}

            {!formData.isPartner && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                <p className="text-sm text-amber-300">
                  <strong>Non-Partner Centers:</strong> Donors will receive a donation summary they can forward to you for manual tax receipt issuance.
                  This is fully IRS-compliant and puts the receipt responsibility where it legally belongs - with your organization.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/donation-center/dashboard')}
              className="flex-1 bg-gray-700 text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.acceptedItems.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
