import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-70">
              <DropGoodLogo size={32} />
              <span className="text-xl font-bold text-white">DropGood</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>

          <div className="text-gray-300 space-y-6 prose prose-invert max-w-none">
            <p className="text-sm text-gray-400">
              <strong>Last Updated:</strong> November 13, 2024
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using DropGood's donation pickup service ("Service"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
              <p>
                DropGood reserves the right to modify these Terms at any time. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Service Description</h2>
              <p>
                DropGood provides a platform connecting donors with local charitable organizations by facilitating the pickup and delivery of donated items. Our Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Scheduling donation pickup appointments</li>
                <li>Transportation of donated items to selected charitable organizations</li>
                <li>Processing of service fees and payments</li>
                <li>Issuance of tax-deductible donation receipts (when applicable)</li>
                <li>Company employee benefit programs for subsidized donations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Accounts and Eligibility</h2>
              <p>
                <strong>3.1 Age Requirement:</strong> You must be at least 18 years old to use this Service.
              </p>
              <p>
                <strong>3.2 Account Types:</strong> DropGood offers accounts for individual donors, company employees, charitable organizations, and corporate partners.
              </p>
              <p>
                <strong>3.3 Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
              <p>
                <strong>3.4 Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update it as necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Booking and Pickup Services</h2>
              <p>
                <strong>4.1 Scheduling:</strong> Pickup appointments must be scheduled through our platform at least 24 hours in advance.
              </p>
              <p>
                <strong>4.2 Cancellation Policy:</strong> You may cancel or reschedule pickups up to 12 hours before the scheduled time without penalty. Late cancellations may incur a $10 cancellation fee.
              </p>
              <p>
                <strong>4.3 Acceptable Items:</strong> We accept general household goods, clothing, furniture, and electronics in good condition. We do not accept hazardous materials, weapons, perishable food, or items prohibited by law.
              </p>
              <p>
                <strong>4.4 Item Condition:</strong> Donated items must be in usable condition. We reserve the right to refuse items that are damaged, soiled, or unusable.
              </p>
              <p>
                <strong>4.5 Access Requirements:</strong> You must ensure reasonable access to pickup locations. Items should be ready for pickup at the scheduled time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Pricing and Payment</h2>
              <p>
                <strong>5.1 Service Fees:</strong> Fees are calculated based on distance, item count, and complexity of pickup. Pricing is displayed before booking confirmation.
              </p>
              <p>
                <strong>5.2 Payment Processing:</strong> Payment is processed through Stripe. We do not store credit card information on our servers.
              </p>
              <p>
                <strong>5.3 Company Benefits:</strong> Eligible company employees may receive subsidized pricing as determined by their employer's benefit program.
              </p>
              <p>
                <strong>5.4 Refunds:</strong> Refunds are issued for cancelled services in accordance with our cancellation policy and are processed within 5-10 business days.
              </p>
              <p>
                <strong>5.5 Pricing Changes:</strong> We reserve the right to modify our pricing structure with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Charitable Donations</h2>
              <p>
                <strong>6.1 Tax Receipts:</strong> Tax receipts are provided for donations to qualified 501(c)(3) organizations. The valuation of donated items is the donor's responsibility.
              </p>
              <p>
                <strong>6.2 Charity Selection:</strong> You select the recipient charity organization. DropGood facilitates delivery but does not control or guarantee acceptance by the charity.
              </p>
              <p>
                <strong>6.3 No Guarantee of Value:</strong> DropGood does not appraise or guarantee the monetary value of donated items for tax purposes.
              </p>
              <p>
                <strong>6.4 Charity Responsibility:</strong> Selected charities are responsible for final acceptance and use of donated items according to their policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Company Employee Benefits Program</h2>
              <p>
                <strong>7.1 Eligibility:</strong> Employee benefits are provided at the discretion of participating companies and subject to their internal policies.
              </p>
              <p>
                <strong>7.2 Verification:</strong> Employees must verify their employment status using company email addresses or invitation codes.
              </p>
              <p>
                <strong>7.3 Subsidy Terms:</strong> Company-provided subsidies are applied at checkout and are subject to each company's budget and policies.
              </p>
              <p>
                <strong>7.4 Termination:</strong> Benefits may be terminated if employment ends or if the company discontinues the program.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Limitation of Liability</h2>
              <p>
                <strong>8.1 Service "As Is":</strong> The Service is provided "as is" without warranties of any kind, express or implied.
              </p>
              <p>
                <strong>8.2 Damage or Loss:</strong> While we take care in handling items, DropGood is not liable for damage or loss of donated items during pickup or transport, except in cases of gross negligence.
              </p>
              <p>
                <strong>8.3 Maximum Liability:</strong> Our total liability for any claim arising from the Service shall not exceed the amount paid for the specific service giving rise to the claim.
              </p>
              <p>
                <strong>8.4 Third-Party Actions:</strong> We are not responsible for actions or omissions of charitable organizations or third-party service providers.
              </p>
              <p>
                <strong>8.5 Force Majeure:</strong> We are not liable for delays or failures due to circumstances beyond our reasonable control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Upload malicious code or content</li>
                <li>Harass or abuse DropGood staff or drivers</li>
                <li>Provide false or misleading information</li>
                <li>Attempt to defraud or abuse company benefit programs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Intellectual Property</h2>
              <p>
                <strong>10.1 Ownership:</strong> All content, trademarks, and intellectual property on the DropGood platform are owned by or licensed to DropGood.
              </p>
              <p>
                <strong>10.2 Limited License:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes.
              </p>
              <p>
                <strong>10.3 Restrictions:</strong> You may not copy, modify, distribute, sell, or reverse engineer any part of our Service without prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Privacy and Data Protection</h2>
              <p>
                Your use of the Service is also governed by our <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Termination</h2>
              <p>
                <strong>12.1 By You:</strong> You may terminate your account at any time by contacting us.
              </p>
              <p>
                <strong>12.2 By Us:</strong> We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our discretion.
              </p>
              <p>
                <strong>12.3 Effect of Termination:</strong> Upon termination, your right to use the Service ceases immediately. Scheduled pickups and pending payments remain subject to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Dispute Resolution</h2>
              <p>
                <strong>13.1 Governing Law:</strong> These Terms are governed by the laws of the Commonwealth of Virginia, without regard to conflict of law principles.
              </p>
              <p>
                <strong>13.2 Arbitration:</strong> Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in Richmond, Virginia, rather than in court, except you may assert claims in small claims court if they qualify.
              </p>
              <p>
                <strong>13.3 Class Action Waiver:</strong> You agree to resolve disputes individually and waive any right to participate in class actions or class arbitrations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">14. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless DropGood and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any items you provide for donation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">15. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">16. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> legal@dropgood.co</li>
                <li><strong>Phone:</strong> (804) 555-DROP</li>
                <li><strong>Address:</strong> DropGood (A Workbird LLC Company), Richmond, VA</li>
              </ul>
            </section>

            <section className="border-t border-gray-600 pt-6 mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Additional Terms</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/charity-terms" className="text-blue-400 hover:text-blue-300 underline">
                    Charity Partner Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/company-terms" className="text-blue-400 hover:text-blue-300 underline">
                    Company Partner Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <DropGoodLogo size={24} />
              <span className="text-white font-bold">DropGood</span>
            </div>
            <p className="text-gray-500 text-sm">(A Workbird LLC Company)</p>
            <p className="text-gray-500 text-sm">&copy; 2025 DropGood. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
