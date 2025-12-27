import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { HomePage } from "./components/HomePage";
import { ArtworksPage } from "./pages/ArtworksPage";
import { ArtistsPage } from "./pages/ArtistsPage";
import { ArtistSignupPage } from "./pages/ArtistSignupPage";
import { ArtistWelcomePage } from "./pages/ArtistWelcomePage";
import { ArtistDashboard } from "./pages/ArtistDashboard";
import { ArtistProfileEditPage } from "./pages/ArtistProfileEditPage";
import { ArtistArtworksPage } from "./pages/ArtistArtworksPage";
import { ArtistContractPage } from "./pages/ArtistContractPage";
import { ArtworkEditPage } from "./pages/ArtworkEditPage";
import { ArtworkRecallPage } from "./pages/ArtworkRecallPage";
import { ArtworkSelectionPage } from "./pages/ArtworkSelectionPage";
import { ArtworkPublishPage } from "./pages/ArtworkPublishPage";
import { BankAccountEditPage } from "./pages/BankAccountEditPage";
import { ContactPage } from "./pages/ContactPage";
import { CorporatePage } from "./pages/CorporatePage";
import { CorporateSignupPage } from "./pages/CorporateSignupPage";
import { CorporateDashboard } from "./pages/CorporateDashboard";
import { CorporateSalesHistoryPage } from "./pages/CorporateSalesHistoryPage";
import { CorporateArtworkDetailPage } from "./pages/CorporateArtworkDetailPage";
import { CorporateSpaceDetailPage } from "./pages/CorporateSpaceDetailPage";
import { CorporateProfilePage } from "./pages/CorporateProfilePage";
import { ArtworkIssueReportPage } from "./pages/ArtworkIssueReportPage";
import { ArtworkIssueReportConfirmationPage } from "./pages/ArtworkIssueReportConfirmationPage";
import { ArtworkReturnRequestPage } from "./pages/ArtworkReturnRequestPage";
import { ArtworkReturnConfirmationPage } from "./pages/ArtworkReturnConfirmationPage";
import { PaymentHistoryPage } from "./pages/PaymentHistoryPage";
import { CorporateFAQPage } from "./pages/CorporateFAQPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LogoutConfirmationPage } from "./pages/LogoutConfirmationPage";
import { LoginSelectionPage } from "./pages/LoginSelectionPage";
import { ArtistLoginPage } from "./pages/ArtistLoginPage";
import { CustomerLoginPage } from "./pages/CustomerLoginPage";
import { CustomerSignupPage } from "./pages/CustomerSignupPage";
import { CorporateLoginPage } from "./pages/CorporateLoginPage";
import { AIArtworkPreviewPage } from "./pages/AIArtworkPreviewPage";
import { MyPage } from "./pages/MyPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ArtworkConfirmationPage } from "./pages/ArtworkConfirmationPage";
import { PurchasePage } from "./pages/PurchasePage";
import { ArtworkViewPage } from "./pages/ArtworkViewPage";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/artworks" element={<ArtworksPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/signup/artist" element={<ArtistSignupPage />} />
          <Route path="/signup/artist/welcome" element={<ArtistWelcomePage />} />
          <Route path="/signup/artist/profile" element={<ArtistProfileEditPage />} />
          <Route path="/signup/artist/artworks" element={<ArtistArtworksPage />} />
          <Route path="/signup/artist/contract" element={<ArtistContractPage />} />
          <Route path="/dashboard" element={<ArtistDashboard />} />
          <Route path="/artwork-edit/:artworkId" element={<ArtworkEditPage />} />
          <Route path="/artwork-recall/:artworkId" element={<ArtworkRecallPage />} />
          <Route path="/artwork-selection" element={<ArtworkSelectionPage />} />
          <Route path="/artwork-publish" element={<ArtworkPublishPage />} />
          <Route path="/bank-account-edit" element={<BankAccountEditPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="/signup/corporate" element={<CorporateSignupPage />} />
          <Route path="/corporate-dashboard" element={<CorporateDashboard />} />
          <Route path="/corporate-sales-history" element={<CorporateSalesHistoryPage />} />
          <Route path="/corporate-artwork/:id" element={<CorporateArtworkDetailPage />} />
          <Route path="/corporate-space/:spaceId" element={<CorporateSpaceDetailPage />} />
          <Route path="/corporate-profile" element={<CorporateProfilePage />} />
          <Route path="/artwork-issue-report/:spaceId" element={<ArtworkIssueReportPage />} />
          <Route path="/artwork-issue-report-confirmation/:spaceId" element={<ArtworkIssueReportConfirmationPage />} />
          <Route path="/artwork-return-request/:spaceId" element={<ArtworkReturnRequestPage />} />
          <Route path="/artwork-return-confirmation/:spaceId" element={<ArtworkReturnConfirmationPage />} />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/corporate-faq" element={<CorporateFAQPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/logout-confirmation" element={<LogoutConfirmationPage />} />
          <Route path="/login-selection" element={<LoginSelectionPage />} />
          <Route path="/login/artist" element={<ArtistLoginPage />} />
          <Route path="/login/customer" element={<CustomerLoginPage />} />
          <Route path="/login/corporate" element={<CorporateLoginPage />} />
          <Route path="/signup/customer" element={<CustomerSignupPage />} />
          <Route path="/ai-artwork-preview" element={<AIArtworkPreviewPage />} />
          <Route path="/my-page" element={<MyPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/artwork-confirmation" element={<ArtworkConfirmationPage />} />
          <Route path="/purchase/:artworkId" element={<PurchasePage />} />
          <Route path="/artwork/:artworkId" element={<ArtworkViewPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
