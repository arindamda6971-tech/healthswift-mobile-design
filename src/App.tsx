import React, { Suspense, lazy } from "react";
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
// Screens (lazy-loaded where appropriate)
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import LoginScreen from "./pages/LoginScreen";
import InstallScreen from "./pages/InstallScreen";
const HomeScreen = lazy(() => import("./pages/HomeScreen"));
const CategoriesScreen = lazy(() => import("./pages/CategoriesScreen"));
const TestDetailScreen = lazy(() => import("./pages/TestDetailScreen"));
const TestSelectionScreen = lazy(() => import("./pages/TestSelectionScreen"));
const CartScreen = lazy(() => import("./pages/CartScreen"));
const PaymentScreen = lazy(() => import("./pages/PaymentScreen"));
const BookingsScreen = lazy(() => import("./pages/BookingsScreen"));
const ReportsScreen = lazy(() => import("./pages/ReportsScreen"));
const ReportDetailScreen = lazy(() => import("./pages/ReportDetailScreen"));
const ProfileScreen = lazy(() => import("./pages/ProfileScreen"));
const EditProfileScreen = lazy(() => import("./pages/EditProfileScreen"));
const NotificationsScreen = lazy(() => import("./pages/NotificationsScreen"));
const SubscriptionScreen = lazy(() => import("./pages/SubscriptionScreen"));
const SavedAddressesScreen = lazy(() => import("./pages/SavedAddressesScreen"));
const DoctorConsultScreen = lazy(() => import("./pages/DoctorConsultScreen"));
const PartnerLabsScreen = lazy(() => import("./pages/PartnerLabsScreen"));
const LabDetailScreen = lazy(() => import("./pages/LabDetailScreen"));
const PackagesScreen = lazy(() => import("./pages/PackagesScreen"));
const PackageDetailScreen = lazy(() => import("./pages/PackageDetailScreen"));
const UploadPrescriptionScreen = lazy(() => import("./pages/UploadPrescriptionScreen"));
const SupportScreen = lazy(() => import("./pages/SupportScreen"));
const PhysioConsultScreen = lazy(() => import("./pages/PhysioConsultScreen"));
const PhysioBookingScreen = lazy(() => import("./pages/PhysioBookingScreen"));
const ECGTestScreen = lazy(() => import("./pages/ECGTestScreen"));
const ECGBookingScreen = lazy(() => import("./pages/ECGBookingScreen"));
const ConsultationCallScreen = lazy(() => import("./pages/ConsultationCallScreen"));
const ConsultationBookingScreen = lazy(() => import("./pages/ConsultationBookingScreen"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
                  <Route path="/home" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><HomeScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/categories" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><CategoriesScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/test/select/:id" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><TestSelectionScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/test/select" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><TestSelectionScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/test/:id" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><TestDetailScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><CartScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/payment" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><PaymentScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/bookings" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><BookingsScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ReportsScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/report-detail" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ReportDetailScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/ai-report" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ReportDetailScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ProfileScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/edit-profile" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><EditProfileScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/saved-addresses" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><SavedAddressesScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><NotificationsScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/subscription" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><SubscriptionScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/doctor-consult" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><DoctorConsultScreen /></Suspense></ProtectedRoute>} />
                  {/* Family screen removed */}
                  <Route path="/partner-labs" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><PartnerLabsScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/lab/:labId" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><LabDetailScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/package/:packageId" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><PackageDetailScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/packages" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><PackagesScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/upload-prescription" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><UploadPrescriptionScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/support" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><SupportScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/physio-consult" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><PhysioConsultScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/physio-booking" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><PhysioBookingScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/ecg-test" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ECGTestScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/ecg-booking" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ECGBookingScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/consultation-call" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ConsultationCallScreen /></Suspense></ProtectedRoute>} />
                  <Route path="/consultation-booking" element={<ProtectedRoute><Suspense fallback={<div className="p-6 text-center">Loading...</div>}><ConsultationBookingScreen /></Suspense></ProtectedRoute>} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<Suspense fallback={<div className="p-6 text-center">Loading...</div>}><NotFound /></Suspense>} />
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
