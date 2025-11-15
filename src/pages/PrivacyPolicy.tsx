import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

export default function PrivacyPolicy() {
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
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>

          <div className="text-gray-300 space-y-6 prose prose-invert max-w-none">
            <p className="text-sm text-gray-400">
              <strong>Last Updated:</strong> November 13, 2024
            </p>

            <p>
              DropGood (A Workbird LLC Company) ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our donation pickup service.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                <li><strong>Pickup Information:</strong> Pickup address, item descriptions, preferred dates and times</li>
                <li><strong>Payment Information:</strong> Credit card information (processed through Stripe - we do not store full card details)</li>
                <li><strong>Company Information:</strong> Employer name, work email, employee ID (for company benefit programs)</li>
                <li><strong>Charity Information:</strong> Organization name, EIN, contact details, address (for charity partners)</li>
                <li><strong>Communications:</strong> Messages sent through our support chat or contact forms</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.2 Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages viewed, features used, time spent on pages, referral sources</li>
                <li><strong>Location Data:</strong> GPS coordinates (when you enable location services) for route optimization</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to remember preferences and analyze usage</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Payment Processors:</strong> Transaction confirmation and fraud prevention data from Stripe</li>
                <li><strong>Company Partners:</strong> Employment verification from corporate benefit programs</li>
                <li><strong>Social Media:</strong> If you connect your account to social media platforms</li>
                <li><strong>Analytics Providers:</strong> Website usage statistics from Google Analytics or similar services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Service Delivery</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill donation pickup requests</li>
                <li>Schedule and coordinate pickups with drivers</li>
                <li>Facilitate delivery to selected charitable organizations</li>
                <li>Generate tax-deductible donation receipts</li>
                <li>Process payments and manage billing</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Communication</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send booking confirmations, reminders, and status updates</li>
                <li>Respond to customer service inquiries</li>
                <li>Send administrative messages about account or policy changes</li>
                <li>Provide customer support through chat and email</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Improvement and Analytics</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analyze usage patterns to improve our service</li>
                <li>Conduct research and testing of new features</li>
                <li>Monitor service performance and troubleshoot issues</li>
                <li>Generate aggregate statistics and reports</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.4 Marketing (With Your Consent)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send promotional emails about new features or services</li>
                <li>Provide personalized recommendations</li>
                <li>Display targeted advertisements (you can opt out)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.5 Legal and Security</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with legal obligations and law enforcement requests</li>
                <li>Detect and prevent fraud, abuse, and security incidents</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect the rights and safety of DropGood, users, and third parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. How We Share Your Information</h2>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Payment Processing:</strong> Stripe for payment transactions</li>
                <li><strong>Cloud Hosting:</strong> Supabase for database and authentication</li>
                <li><strong>Communications:</strong> Email and SMS providers for notifications</li>
                <li><strong>Analytics:</strong> Google Analytics, Mixpanel, or similar services</li>
                <li><strong>Customer Support:</strong> Third-party tools for managing support tickets</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Charitable Organizations</h3>
              <p>
                We share your donation details (but not payment information) with the charity you select to receive your items, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Donor name (for tax receipts)</li>
                <li>Item descriptions</li>
                <li>Estimated delivery time</li>
                <li>Contact information (if needed for coordination)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Company Partners</h3>
              <p>
                For employees participating in company benefit programs, we share:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Aggregated usage statistics with employers</li>
                <li>Individual donation summaries (as required by benefit programs)</li>
                <li>This data is shared only with your employer and only if you use company benefits</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4 Legal Requirements</h3>
              <p>We may disclose information when required by law or to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with legal processes or government requests</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect the rights, property, or safety of DropGood or others</li>
                <li>Investigate potential violations or fraud</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.5 Business Transfers</h3>
              <p>
                If DropGood is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change and your choices regarding your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Data Security</h2>
              <p>We implement security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data transmitted to and from our servers is encrypted using SSL/TLS</li>
                <li><strong>Secure Storage:</strong> Personal data is stored in encrypted databases with access controls</li>
                <li><strong>Payment Security:</strong> We are PCI-DSS compliant through our payment processor (Stripe)</li>
                <li><strong>Access Controls:</strong> Employee access to data is limited to those who need it for their job functions</li>
                <li><strong>Regular Audits:</strong> We conduct regular security assessments and updates</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for 3 years after closure</li>
                <li><strong>Transaction Records:</strong> Kept for 7 years for tax and accounting purposes</li>
                <li><strong>Tax Receipts:</strong> Maintained for 7 years as required by IRS regulations</li>
                <li><strong>Support Communications:</strong> Retained for 2 years for quality assurance</li>
                <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Your Privacy Rights</h2>
              <p>You have the following rights regarding your personal information:</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Access and Portability</h3>
              <p>
                Request a copy of your personal data in a portable format.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Correction</h3>
              <p>
                Update or correct inaccurate information in your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Deletion</h3>
              <p>
                Request deletion of your account and personal data, subject to legal retention requirements.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.4 Opt-Out</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unsubscribe from marketing emails via the link in each email</li>
                <li>Disable cookies through your browser settings</li>
                <li>Opt out of targeted advertising through industry tools (NAI, DAA)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.5 Do Not Track</h3>
              <p>
                Some browsers have "Do Not Track" features. We do not currently respond to Do Not Track signals.
              </p>

              <p className="mt-4">
                To exercise these rights, email us at <a href="mailto:privacy@dropgood.co" className="text-blue-400 hover:text-blue-300 underline">privacy@dropgood.co</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. State-Specific Privacy Rights</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 California Residents (CCPA/CPRA)</h3>
              <p>California residents have additional rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to know what personal information we collect and how it's used</li>
                <li>Right to delete personal information (with exceptions)</li>
                <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
                <li>Right to correct inaccurate information</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Virginia Residents (VCDPA)</h3>
              <p>Virginia residents have rights to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirm whether we process their personal data</li>
                <li>Access and obtain a copy of personal data</li>
                <li>Correct inaccuracies in personal data</li>
                <li>Delete personal data</li>
                <li>Opt out of targeted advertising and profiling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Children's Privacy</h2>
              <p>
                Our Service is not directed to children under 18. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from your country. By using our Service, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Third-Party Links</h2>
              <p>
                Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the new Privacy Policy on our website</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
              </ul>
              <p className="mt-4">
                Your continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contact Us</h2>
              <p>
                For questions or concerns about this Privacy Policy or our data practices, contact us:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email:</strong> <a href="mailto:privacy@dropgood.co" className="text-blue-400 hover:text-blue-300 underline">privacy@dropgood.co</a></li>
                <li><strong>Phone:</strong> (804) 555-DROP</li>
                <li><strong>Mail:</strong> DropGood (A Workbird LLC Company), Privacy Team, Richmond, VA</li>
              </ul>
            </section>

            <section className="border-t border-gray-600 pt-6 mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Related Documents</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms-of-service" className="text-blue-400 hover:text-blue-300 underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/charity-terms" className="text-blue-400 hover:text-blue-300 underline">
                    Charity Partner Terms
                  </Link>
                </li>
                <li>
                  <Link to="/company-terms" className="text-blue-400 hover:text-blue-300 underline">
                    Company Partner Terms
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
