import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import { AddressProvider } from "@/contexts/AddressContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstallPrompt from "@/components/InstallPrompt";
import ScrollToTop from "@/components/ScrollToTop";
// Screens
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import LoginScreen from "./pages/LoginScreen";
import InstallScreen from "./pages/InstallScreen";
import HomeScreen from "./pages/HomeScreen";
import CategoriesScreen from "./pages/CategoriesScreen";
import TestDetailScreen from "./pages/TestDetailScreen";
import TestSelectionScreen from "./pages/TestSelectionScreen";
import CartScreen from "./pages/CartScreen";
import PaymentScreen from "./pages/PaymentScreen";
import ReportsScreen from "./pages/ReportsScreen";
import ReportDetailScreen from "./pages/ReportDetailScreen";
import ProfileScreen from "./pages/ProfileScreen";
import EditProfileScreen from "./pages/EditProfileScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import SubscriptionScreen from "./pages/SubscriptionScreen";
import SavedAddressesScreen from "./pages/SavedAddressesScreen";
import DoctorConsultScreen from "./pages/DoctorConsultScreen";
import RewardsScreen from "./pages/RewardsScreen";
import PartnerLabsScreen from "./pages/PartnerLabsScreen";
import LabDetailScreen from "./pages/LabDetailScreen";
import UploadPrescriptionScreen from "./pages/UploadPrescriptionScreen";
import SupportScreen from "./pages/SupportScreen";
import PhysioConsultScreen from "./pages/PhysioConsultScreen";
import ECGTestScreen from "./pages/ECGTestScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AddressProvider>
            <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/onboarding" element={<OnboardingScreen />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/install" element={<InstallScreen />} />
                  
                  {/* Protected Routes */}
                  <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
                  <Route path="/categories" element={<ProtectedRoute><CategoriesScreen /></ProtectedRoute>} />
                  <Route path="/test/select/:id" element={<ProtectedRoute><TestSelectionScreen /></ProtectedRoute>} />
                  <Route path="/test/select" element={<ProtectedRoute><TestSelectionScreen /></ProtectedRoute>} />
                  <Route path="/test/:id" element={<ProtectedRoute><TestDetailScreen /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><CartScreen /></ProtectedRoute>} />
                  <Route path="/payment" element={<ProtectedRoute><PaymentScreen /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><ReportsScreen /></ProtectedRoute>} />
                  <Route path="/report-detail" element={<ProtectedRoute><ReportDetailScreen /></ProtectedRoute>} />
                  <Route path="/ai-report" element={<ProtectedRoute><ReportDetailScreen /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
                  <Route path="/edit-profile" element={<ProtectedRoute><EditProfileScreen /></ProtectedRoute>} />
                  <Route path="/saved-addresses" element={<ProtectedRoute><SavedAddressesScreen /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
                  <Route path="/subscription" element={<ProtectedRoute><SubscriptionScreen /></ProtectedRoute>} />
                  <Route path="/doctor-consult" element={<ProtectedRoute><DoctorConsultScreen /></ProtectedRoute>} />
                  <Route path="/rewards" element={<ProtectedRoute><RewardsScreen /></ProtectedRoute>} />
                  {/* Family screen removed */}
                  <Route path="/partner-labs" element={<ProtectedRoute><PartnerLabsScreen /></ProtectedRoute>} />
                  <Route path="/lab/:labId" element={<ProtectedRoute><LabDetailScreen /></ProtectedRoute>} />
                  <Route path="/upload-prescription" element={<ProtectedRoute><UploadPrescriptionScreen /></ProtectedRoute>} />
                  <Route path="/support" element={<ProtectedRoute><SupportScreen /></ProtectedRoute>} />
                  <Route path="/physio-consult" element={<ProtectedRoute><PhysioConsultScreen /></ProtectedRoute>} />
                  <Route path="/ecg-test" element={<ProtectedRoute><ECGTestScreen /></ProtectedRoute>} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <InstallPrompt />
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
          </AddressProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
