import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Download, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { seoPages } from '../components/SEO/seoConfig';
import { supabase } from '../lib/supabase';

interface Receipt {
  id: string;
  receipt_number: string;
  receipt_type: 'tax_receipt' | 'donation_summary';
  donor_name: string;
  donor_email: string | null;
  donor_phone: string;
  donor_address: string;
  donation_date: string;
  donation_items: {
    types: string[];
    count: number;
    description: string;
  };
  estimated_value: number;
  goods_or_services_provided: boolean;
  goods_or_services_description: string | null;
  goods_or_services_value: number | null;
  tax_deductible_amount: number;
  receipt_issued_date: string;
  donation_centers: {
    name: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    tax_id: string;
    is_501c3: boolean;
    phone: string;
    email: string;
    ein?: string;
    receipt_email?: string;
  };
}

export default function ReceiptPage() {
  const { receiptNumber } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (receiptNumber) {
      loadReceipt();
    }
  }, [receiptNumber]);

  async function loadReceipt() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('donation_receipts')
        .select(`
          *,
          donation_centers (
            name,
            street_address,
            city,
            state,
            zip_code,
            tax_id,
            is_501c3,
            phone,
            email,
            ein,
            receipt_email
          )
        `)
        .eq('receipt_number', receiptNumber)
        .single();

      if (fetchError) throw fetchError;
      setReceipt(data);
    } catch (err) {
      console.error('Error loading receipt:', err);
      setError('Receipt not found');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Receipt not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(receipt.receipt_issued_date);

  return (
    <>
      <SEO {...seoPages.receipt} />
      <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-70">
              <Package className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-2xl font-bold text-white">DropGood</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="h-4 w-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white text-gray-900 rounded-lg shadow-xl p-8 sm:p-12">
          <div className="text-center mb-8 pb-8 border-b-2 border-gray-300">
            {receipt.receipt_type === 'tax_receipt' ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Tax-Deductible Donation Receipt</h1>
                <p className="text-lg text-gray-600">501(c)(3) Charitable Contribution</p>
                <p className="text-sm text-gray-500 mt-2">Receipt #{receipt.receipt_number}</p>
              </>
            ) : (
              <>
                <Mail className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Donation Summary</h1>
                <p className="text-lg text-gray-600">Forward to charity for official tax receipt</p>
                <p className="text-sm text-gray-500 mt-2">Summary #{receipt.receipt_number}</p>
                {receipt.donation_centers.receipt_email && (
                  <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-amber-900 font-semibold mb-1">Forward this summary to:</p>
                    <p className="text-amber-700 font-medium">{receipt.donation_centers.receipt_email}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Organization Information</h2>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{receipt.donation_centers.name}</p>
                <p className="text-gray-700">{receipt.donation_centers.street_address}</p>
                <p className="text-gray-700">
                  {receipt.donation_centers.city}, {receipt.donation_centers.state} {receipt.donation_centers.zip_code}
                </p>
                {receipt.donation_centers.tax_id && (
                  <p className="text-gray-700 font-medium">
                    Tax ID (EIN): {receipt.donation_centers.tax_id}
                  </p>
                )}
                <p className="text-gray-700">Phone: {receipt.donation_centers.phone}</p>
                <p className="text-gray-700">Email: {receipt.donation_centers.email}</p>
              </div>
              {receipt.donation_centers.is_501c3 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">
                    ✓ This organization is recognized as a tax-exempt 501(c)(3) charitable organization by the IRS.
                  </p>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Donor Information</h3>
                <div className="text-gray-700 space-y-1">
                  <p>{receipt.donor_name}</p>
                  <p>{receipt.donor_address}</p>
                  <p>{receipt.donor_phone}</p>
                  {receipt.donor_email && <p>{receipt.donor_email}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Donation Details</h3>
                <div className="text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Date of Donation:</span>{' '}
                    {new Date(receipt.donation_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Receipt Issued:</span>{' '}
                    {issuedDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Items Donated</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 mb-2">{receipt.donation_items.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {receipt.donation_items.types.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Tax Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Estimated Fair Market Value:</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${receipt.estimated_value.toFixed(2)}
                  </span>
                </div>
                {receipt.goods_or_services_provided && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Goods/Services Received: {receipt.goods_or_services_description}
                      </span>
                      <span className="text-gray-900 font-medium">
                        -${receipt.goods_or_services_value?.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <div className="pt-3 border-t-2 border-green-400 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">
                    Tax-Deductible Amount:
                  </span>
                  <span className="text-2xl font-bold text-green-700">
                    ${receipt.tax_deductible_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {receipt.receipt_type === 'tax_receipt' ? (
              <>
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3">IRS Acknowledgment</h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    {!receipt.goods_or_services_provided ? (
                      <p className="font-medium">
                        ✓ No goods or services were provided in exchange for this contribution.
                      </p>
                    ) : (
                      <p className="font-medium">
                        The organization provided goods or services as described above in exchange for this contribution. The tax-deductible amount reflects the fair market value minus the value of goods/services received.
                      </p>
                    )}
                    <p className="mt-4">
                      This receipt meets IRS requirements for substantiating charitable contributions.
                      Please consult with your tax advisor regarding the deductibility of your donation.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-xs text-gray-600">
                  <h4 className="font-bold text-gray-900 mb-2">Important Tax Information</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      For donations of $250 or more, this receipt is required to claim a tax deduction.
                    </li>
                    <li>
                      For non-cash donations valued at more than $500, you must file Form 8283 with your tax return.
                    </li>
                    <li>
                      For property valued at more than $5,000, you must obtain a qualified appraisal.
                    </li>
                    <li>
                      The estimated value provided is a good faith estimate. You are responsible for determining the fair market value of donated items.
                    </li>
                    <li>
                      Keep this receipt with your tax records. IRS Publication 526 provides additional guidance on charitable contributions.
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Next Steps for Tax Receipt</h3>
                <div className="text-sm text-gray-700 space-y-3">
                  <p className="font-medium">
                    This is a donation summary, not an official tax receipt.
                  </p>
                  <p>
                    To receive an IRS-compliant tax receipt for your donation, please forward this summary to <span className="font-semibold text-amber-800">{receipt.donation_centers.receipt_email || receipt.donation_centers.email}</span>.
                  </p>
                  <p>
                    The organization will issue you an official 501(c)(3) tax receipt that meets all IRS requirements for claiming your deduction.
                  </p>
                  <div className="mt-4 pt-4 border-t border-amber-300">
                    <p className="text-xs text-gray-600">
                      Keep this summary for your records. Once you receive the official tax receipt from {receipt.donation_centers.name}, use that for your tax filing.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t-2 border-gray-300 text-center text-sm text-gray-600">
            <p>Thank you for your generous donation!</p>
            <p className="mt-2">
              Questions? Contact {receipt.donation_centers.name} at {receipt.donation_centers.phone}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400 print:hidden">
          <p>
            For best results when saving as PDF, use your browser's Print function and select "Save as PDF"
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
