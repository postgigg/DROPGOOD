import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

export default function CompanyTerms() {
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
          to="/for-companies"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to For Companies
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Company Partner Terms</h1>
          </div>

          <div className="text-gray-300 space-y-6 prose prose-invert max-w-none">
            <p className="text-sm text-gray-400">
              <strong>Last Updated:</strong> November 14, 2024
            </p>

            <p>
              These Company Partner Terms ("Terms") govern the relationship between DropGood (a Workbird LLC Company) ("DropGood," "we," "us," or "our") and corporate partners ("Company," "you," or "your") providing employee donation benefits through our platform.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Program Overview</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.1 Service Description</h3>
              <p>
                The DropGood Employee Benefit Program allows companies to subsidize donation pickup costs for their employees as a workplace benefit. Employees receive discounted or free donation pickups based on the subsidy level you choose.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.2 Program Benefits</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Employee morale and engagement through charitable giving support</li>
                <li>Corporate social responsibility (CSR) impact reporting</li>
                <li>Tax-deductible business expense for donation subsidies</li>
                <li>Branded employee portal with your company information</li>
                <li>Monthly impact reports showing donations made by employees</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Enrollment and Setup</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Company Requirements</h3>
              <p>To participate as a Company Partner, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be a legitimate business entity in good standing</li>
                <li>Have at least 10 employees (smaller companies may be considered on a case-by-case basis)</li>
                <li>Designate a program administrator from your HR or Benefits team</li>
                <li>Provide a valid payment method for monthly invoicing</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Employee Verification</h3>
              <p>
                You will provide DropGood with a list of eligible employees (name and work email address). Employees verify their identity by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Using their company email address to create an account</li>
                <li>Entering a unique company code provided by you</li>
                <li>Completing any additional verification steps you require</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Onboarding Process</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Initial consultation to determine subsidy structure and budget</li>
                <li>Contract execution and payment setup</li>
                <li>Employee data integration (CSV upload or API connection)</li>
                <li>Branded portal customization with company logo and messaging</li>
                <li>Launch announcement and employee communications</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Subsidy Structure and Pricing</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Subsidy Options</h3>
              <p>You may choose from the following subsidy models:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Percentage Subsidy:</strong> Cover a fixed percentage (e.g., 50%, 75%, 100%) of each employee donation</li>
                <li><strong>Fixed Amount:</strong> Provide a fixed dollar amount per donation (e.g., $10 per pickup)</li>
                <li><strong>Annual Allowance:</strong> Give each employee an annual donation credit (e.g., $100/year) to use as needed</li>
                <li><strong>Hybrid:</strong> Combine percentage and cap (e.g., 75% subsidy up to $15 per donation)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Billing Model</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Monthly Platform Fee:</strong> $99-$499/month based on company size</li>
                <li><strong>Per-Donation Subsidy:</strong> Actual cost of subsidies provided to employees (invoiced monthly in arrears)</li>
                <li><strong>Setup Fee:</strong> One-time $500 onboarding and integration fee</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Usage Caps</h3>
              <p>
                You may set the following limits to control costs:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maximum subsidy per employee per month/quarter/year</li>
                <li>Total company-wide monthly budget cap</li>
                <li>Minimum days between subsidized donations per employee</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Company Obligations</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Employee Communication</h3>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Communicate the benefit program to eligible employees</li>
                <li>Provide instructions for enrollment and account creation</li>
                <li>Promote the program through internal channels (email, intranet, benefits portal)</li>
                <li>Notify DropGood promptly of employee terminations or status changes</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Data Management</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep employee eligibility lists current and accurate</li>
                <li>Notify us within 5 business days of employee departures</li>
                <li>Ensure employee data provided complies with privacy laws</li>
                <li>Obtain necessary employee consent for data sharing with DropGood</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Payment Obligations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pay monthly platform fees by the first day of each month</li>
                <li>Pay subsidy costs within 15 days of invoice receipt</li>
                <li>Maintain a valid payment method on file at all times</li>
                <li>Notify us 30 days in advance of any budget changes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. DropGood Obligations</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Service Delivery</h3>
              <p>DropGood will:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide donation pickup services to verified employees</li>
                <li>Apply subsidies automatically at checkout based on your structure</li>
                <li>Process all donations according to our standard terms of service</li>
                <li>Provide customer support to your employees</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Reporting</h3>
              <p>We will provide you with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Monthly usage reports showing number of donations, items donated, and subsidies provided</li>
                <li>Quarterly impact reports with total pounds diverted from landfills and charities supported</li>
                <li>Annual summary for CSR reporting and tax documentation</li>
                <li>Real-time dashboard access to track program utilization</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Employee Privacy</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Individual employee donation details remain confidential</li>
                <li>Aggregate reporting only (no personally identifiable information)</li>
                <li>Compliance with GDPR, CCPA, VCDPA, and other privacy regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Company Branding</h3>
              <p>
                You grant DropGood a limited license to use your company name, logo, and branding materials for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Creating your branded employee portal</li>
                <li>Including you in our list of Company Partners</li>
                <li>Case studies and marketing materials (with your approval)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 DropGood Branding</h3>
              <p>
                You may reference your partnership with DropGood in employee communications and benefit materials, but may not use our trademarks without prior written approval.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Data and Privacy</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Data Processing</h3>
              <p>
                DropGood acts as a data processor for employee information you provide. We will:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use employee data solely for program administration</li>
                <li>Implement appropriate security measures to protect data</li>
                <li>Not sell or share employee data with third parties</li>
                <li>Delete employee data upon termination of the partnership</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Compliance</h3>
              <p>
                You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You have obtained necessary employee consent for data sharing</li>
                <li>You have authority to provide employee information to DropGood</li>
                <li>You comply with all applicable employment and privacy laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Term and Termination</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.1 Initial Term</h3>
              <p>
                The partnership begins upon contract execution and continues for an initial term of 12 months, then renews automatically on a month-to-month basis unless either party provides 60 days' notice of non-renewal.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.2 Termination for Convenience</h3>
              <p>
                Either party may terminate the partnership for any reason with 60 days' written notice. You remain responsible for payment of all fees incurred prior to termination.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.3 Termination for Cause</h3>
              <p>
                Either party may terminate immediately if the other party:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Materially breaches these Terms and fails to cure within 30 days</li>
                <li>Becomes insolvent or files for bankruptcy</li>
                <li>Engages in fraudulent or illegal conduct</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.4 Effect of Termination</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Employee access to subsidies ends on the termination date</li>
                <li>All outstanding invoices become immediately due</li>
                <li>DropGood removes company branding from the platform</li>
                <li>Final usage report provided within 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Liability and Indemnification</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.1 Limitation of Liability</h3>
              <p>
                DropGood's liability is limited to the amounts paid by you in the 12 months preceding any claim. We are not liable for indirect, consequential, or punitive damages.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.2 Indemnification</h3>
              <p>
                You agree to indemnify DropGood from claims arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your violation of employment or privacy laws</li>
                <li>Your unauthorized use of employee data</li>
                <li>Your breach of these Terms</li>
                <li>Employee disputes related to benefit eligibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Tax Treatment</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.1 Tax Deductibility</h3>
              <p>
                Subsidy payments made to DropGood are typically tax-deductible as a business expense. However, you should consult with your tax advisor to confirm the tax treatment for your specific situation.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.2 Employee Benefits</h3>
              <p>
                Donation subsidies provided to employees are generally not considered taxable income to the employee, but this may vary based on IRS regulations and your specific implementation. Consult your tax advisor.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.3 Documentation</h3>
              <p>
                DropGood will provide monthly invoices and an annual summary suitable for tax documentation and CSR reporting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Dispute Resolution</h2>

              <p>
                Any disputes arising from this agreement will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. General Provisions</h2>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Governing Law:</strong> These Terms are governed by the laws of the State of Delaware</li>
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and DropGood</li>
                <li><strong>Amendments:</strong> We may update these Terms with 30 days' notice to active Company Partners</li>
                <li><strong>Assignment:</strong> You may not assign this agreement without our written consent</li>
                <li><strong>Confidentiality:</strong> Both parties agree to keep proprietary business information confidential</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Contact Information</h2>
              <p>
                For questions about these Company Partner Terms, please contact us at:
              </p>
              <p className="mt-4">
                <strong>DropGood (A Workbird LLC Company)</strong><br />
                Email: <a href="mailto:companies@dropgood.co" className="text-blue-400 hover:text-blue-300 underline">companies@dropgood.co</a><br />
                Support: <a href="mailto:support@dropgood.co" className="text-blue-400 hover:text-blue-300 underline">support@dropgood.co</a>
              </p>
            </section>

            <section className="border-t border-gray-700 pt-6 mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Related Documents</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <Link to="/terms-of-service" className="text-blue-400 hover:text-blue-300 underline">
                    General Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/for-companies" className="text-blue-400 hover:text-blue-300 underline">
                    Learn More About Company Benefits
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
