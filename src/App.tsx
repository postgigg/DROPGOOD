import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BookingFlow from './pages/BookingFlow';
import TrackingPage from './pages/TrackingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ReceiptPage from './pages/ReceiptPage';
import CityLandingPage from './pages/CityLandingPage';
import DonationCenterLanding from './pages/DonationCenterLanding';
import DonationCenterAuth from './pages/DonationCenterAuth';
import DonationCenterDashboard from './pages/DonationCenterDashboard';
import AddLocationPage from './pages/AddLocationPage';
import CreateSponsorshipPage from './pages/CreateSponsorshipPage';
import AddSponsorshipFundsPage from './pages/AddSponsorshipFundsPage';
import AdminAuth from './pages/AdminAuth';
import AdminSetup from './pages/AdminSetup';
import AdminOperations from './pages/AdminOperations';
import AdminBookingDetail from './pages/AdminBookingDetail';
import AdminFinancialDashboard from './pages/AdminFinancialDashboard';
import HelpCenter from './pages/HelpCenter';
import ContactPage from './pages/ContactPage';
import ServiceAreas from './pages/ServiceAreas';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import CompanySignup from './pages/CompanySignup';
import JoinCompany from './pages/JoinCompany';
import ForCompanies from './pages/ForCompanies';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyBilling from './pages/CompanyBilling';
import CompanyReports from './pages/CompanyReports';
import CompanyEmployees from './pages/CompanyEmployees';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CharityTerms from './pages/CharityTerms';
import CompanyTerms from './pages/CompanyTerms';
import BrandKit from './pages/BrandKit';
import DriverBoard from './pages/DriverBoard';
import ForDrivers from './pages/ForDrivers';
import BusinessPlan from './pages/BusinessPlan';
import SupportChat from './components/SupportChat';

function App() {
  const location = useLocation();

  // Hide support chat on tracking page (has its own inline chat)
  const hideChat = location.pathname.startsWith('/track/');

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<BookingFlow />} />
        <Route path="/confirmation/:id" element={<ConfirmationPage />} />
        <Route path="/track/:id" element={<TrackingPage />} />
        <Route path="/receipt/:receiptNumber" element={<ReceiptPage />} />
        <Route path="/donate/:citySlug" element={<CityLandingPage />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/service-areas" element={<ServiceAreas />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/donation-centers" element={<DonationCenterLanding />} />
        <Route path="/donation-center/auth" element={<DonationCenterAuth />} />
        <Route path="/donation-center/dashboard" element={<DonationCenterDashboard />} />
        <Route path="/donation-center/locations/add" element={<AddLocationPage />} />
        <Route path="/donation-center/sponsorships/create" element={<CreateSponsorshipPage />} />
        <Route path="/donation-center/sponsorships/:sponsorshipId/add-funds" element={<AddSponsorshipFundsPage />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/operations" element={<AdminOperations />} />
        <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
        <Route path="/admin/financials" element={<AdminFinancialDashboard />} />
        {/* Company B2B Routes */}
        <Route path="/for-companies" element={<ForCompanies />} />
        <Route path="/company-signup" element={<CompanySignup />} />
        <Route path="/join-company" element={<JoinCompany />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/company/billing" element={<CompanyBilling />} />
        <Route path="/company/reports" element={<CompanyReports />} />
        <Route path="/company/employees" element={<CompanyEmployees />} />
        {/* Driver Board */}
        <Route path="/driver-board" element={<DriverBoard />} />
        <Route path="/for-drivers" element={<ForDrivers />} />
        {/* Legal Pages */}
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/charity-terms" element={<CharityTerms />} />
        <Route path="/company-terms" element={<CompanyTerms />} />
        {/* Brand Kit */}
        <Route path="/brand-kit" element={<BrandKit />} />
        {/* Business Plan */}
        <Route path="/business-plan" element={<BusinessPlan />} />
      </Routes>

      {/* Global Support Chat Widget - Hidden on tracking page */}
      {!hideChat && <SupportChat />}
    </>
  );
}

export default App;
