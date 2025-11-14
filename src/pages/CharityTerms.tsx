import { Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

export default function CharityTerms() {
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
          to="/donation-centers"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Charities
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Charity Partner Terms</h1>
          </div>

          <div className="text-gray-300 space-y-6 prose prose-invert max-w-none">
            <p className="text-sm text-gray-400">
              <strong>Last Updated:</strong> November 14, 2024
            </p>

            <p>
              These Charity Partner Terms ("Terms") govern the relationship between DropGood (a Workbird LLC Company) ("DropGood," "we," "us," or "our") and charitable organizations ("Charity," "you," or "your") participating in our donation pickup platform.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Partnership Overview</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.1 Service Description</h3>
              <p>
                DropGood operates a platform that connects donors with charitable organizations by facilitating the pickup and delivery of donated items. As a Charity Partner, you will be listed on our platform and receive donated items from individuals in your service area.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.2 Partnership Tiers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Listed Partner:</strong> Free listing with standard visibility</li>
                <li><strong>Verified Partner:</strong> Enhanced profile with tax receipt capabilities (requires 501(c)(3) status verification)</li>
                <li><strong>Sponsored Partner:</strong> Priority placement and optional subsidy programs for donors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Eligibility Requirements</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 General Requirements</h3>
              <p>To participate as a Charity Partner, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be a legitimate charitable organization, nonprofit, or donation center</li>
                <li>Have a physical location to receive donated items</li>
                <li>Accept donations during regular business hours</li>
                <li>Comply with all applicable federal, state, and local laws</li>
                <li>Maintain appropriate insurance coverage for your operations</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Verified Partner Requirements</h3>
              <p>For Verified Partner status (with tax receipt issuance), you must additionally:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be a registered 501(c)(3) tax-exempt organization with the IRS</li>
                <li>Provide your EIN (Employer Identification Number)</li>
                <li>Designate an authorized signer for donation receipts</li>
                <li>Maintain current 501(c)(3) status throughout the partnership</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Donation Acceptance</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Acceptance Obligations</h3>
              <p>
                You agree to accept all donated items delivered through DropGood that meet your stated acceptance criteria. You must clearly communicate any items you cannot accept (e.g., furniture, electronics, hazardous materials) in your partner profile.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Item Handling</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Items will be delivered to your designated receiving location</li>
                <li>You must be available to receive donations during your listed hours</li>
                <li>You are responsible for sorting, processing, and distributing received items</li>
                <li>You retain full ownership and responsibility for all donated items upon delivery</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Rejected Donations</h3>
              <p>
                If you receive items that violate your acceptance criteria or are damaged/unusable, you must notify DropGood within 24 hours. We will work with you to resolve such situations, but you may be responsible for disposing of inappropriate items.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Tax Receipt Issuance (Verified Partners Only)</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Automated Receipts</h3>
              <p>
                If you elect to enable automated tax receipt issuance, DropGood will generate and send donation receipts on your behalf using your provided EIN and authorized signer information. You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You have authority to issue tax-deductible donation receipts</li>
                <li>The authorized signer information is accurate and current</li>
                <li>You will promptly notify us of any changes to your EIN or authorized signer</li>
                <li>You will maintain records of all donations as required by IRS regulations</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Manual Receipts</h3>
              <p>
                If you choose not to enable automated receipts, donors will receive a donation summary that they can forward to you for manual receipt issuance. You agree to issue receipts to donors in a timely manner upon request.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Compliance Responsibility</h3>
              <p>
                You are solely responsible for ensuring all donation receipts comply with IRS Publication 1771 and other applicable tax regulations. DropGood provides receipt generation as a service but makes no representations about tax compliance or deductibility.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Fees and Payment</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Free Listing</h3>
              <p>
                There is no cost to be listed as a basic Charity Partner on DropGood. We do not charge charities to receive donated items through our platform.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Sponsored Partnerships</h3>
              <p>
                Optional sponsored partnerships with enhanced visibility and donor subsidies are available for a monthly fee. Pricing and terms for sponsored partnerships are provided separately and subject to a separate agreement.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Donor Fees</h3>
              <p>
                Donors pay DropGood directly for pickup and delivery services. You do not receive any portion of these fees, nor are you responsible for any costs associated with pickup and transportation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Charity Obligations</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Profile Accuracy</h3>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and current information about your organization</li>
                <li>Maintain up-to-date hours of operation and contact information</li>
                <li>Promptly notify us of any changes to your receiving location or procedures</li>
                <li>Respond to DropGood communications within 2 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Professional Conduct</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treat donors, drivers, and DropGood staff with respect and professionalism</li>
                <li>Maintain a safe and accessible receiving location</li>
                <li>Comply with all applicable laws regarding charitable donations</li>
                <li>Not discriminate based on race, religion, national origin, disability, or other protected characteristics</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Prohibited Activities</h3>
              <p>You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sell or profit from donated items in a manner inconsistent with your charitable mission</li>
                <li>Contact donors directly to solicit additional donations outside the DropGood platform</li>
                <li>Refuse donations based on the donor's personal characteristics</li>
                <li>Misrepresent your organization's status, activities, or use of donations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 License to Use Marks</h3>
              <p>
                You grant DropGood a limited, non-exclusive license to use your organization's name, logo, and other identifying marks for the purpose of listing your charity on our platform and marketing our services.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 DropGood Marks</h3>
              <p>
                You may reference your partnership with DropGood in your own marketing materials, but may not use the DropGood name or logo without prior written approval.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Data and Privacy</h2>

              <p>
                We will share donor information with you only to the extent necessary for donation processing and receipt issuance. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use donor information solely for donation-related purposes</li>
                <li>Maintain the confidentiality and security of donor data</li>
                <li>Comply with all applicable privacy laws (including GDPR, CCPA, VCDPA)</li>
                <li>Not sell or share donor information with third parties</li>
                <li>Allow DropGood to collect and use anonymized data about donations for analytics and platform improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Liability and Insurance</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.1 Your Liability</h3>
              <p>
                You are responsible for all donated items once delivered to your location. DropGood is not liable for any damage, loss, theft, or injury occurring after delivery.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.2 Insurance Requirements</h3>
              <p>
                You must maintain appropriate general liability insurance coverage for your charitable operations. DropGood may request proof of insurance at any time.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.3 Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless DropGood from any claims, damages, or expenses arising from: (a) your handling of donated items, (b) your issuance of tax receipts, (c) your violation of these Terms, or (d) your violation of any law or regulation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Term and Termination</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.1 Term</h3>
              <p>
                This agreement begins when you are accepted as a Charity Partner and continues until terminated by either party.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.2 Termination by You</h3>
              <p>
                You may terminate this partnership at any time by providing 30 days' written notice to DropGood. You remain responsible for accepting any donations scheduled before the termination date.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.3 Termination by DropGood</h3>
              <p>
                We may suspend or terminate your partnership immediately if you:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate these Terms or any applicable laws</li>
                <li>Lose your 501(c)(3) status (for Verified Partners)</li>
                <li>Refuse to accept scheduled donations without valid reason</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Fail to maintain required insurance coverage</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.4 Effect of Termination</h3>
              <p>
                Upon termination, your charity listing will be removed from the platform, and you will no longer receive new donation deliveries. All obligations related to previously received donations continue.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Dispute Resolution</h2>

              <p>
                Any disputes arising from this agreement will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, rather than in court.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. General Provisions</h2>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Governing Law:</strong> These Terms are governed by the laws of the State of Delaware</li>
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and DropGood</li>
                <li><strong>Amendments:</strong> We may update these Terms with 30 days' notice to active Charity Partners</li>
                <li><strong>Assignment:</strong> You may not assign this agreement without our written consent</li>
                <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in effect</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Contact Information</h2>
              <p>
                For questions about these Charity Partner Terms, please contact us at:
              </p>
              <p className="mt-4">
                <strong>DropGood (A Workbird LLC Company)</strong><br />
                Email: <a href="mailto:charities@dropgood.co" className="text-blue-400 hover:text-blue-300 underline">charities@dropgood.co</a><br />
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
                  <Link to="/donation-centers" className="text-blue-400 hover:text-blue-300 underline">
                    Become a Charity Partner
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
