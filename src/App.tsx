import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Screens
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import LoginScreen from "./pages/LoginScreen";
import HomeScreen from "./pages/HomeScreen";
import CategoriesScreen from "./pages/CategoriesScreen";
import TestDetailScreen from "./pages/TestDetailScreen";
import CartScreen from "./pages/CartScreen";
import BookingScreen from "./pages/BookingScreen";
import TrackingScreen from "./pages/TrackingScreen";
import ReportsScreen from "./pages/ReportsScreen";
import ReportDetailScreen from "./pages/ReportDetailScreen";
import ProfileScreen from "./pages/ProfileScreen";
import SubscriptionScreen from "./pages/SubscriptionScreen";
import HealthScoreScreen from "./pages/HealthScoreScreen";
import DoctorConsultScreen from "./pages/DoctorConsultScreen";
import RewardsScreen from "./pages/RewardsScreen";
import FamilyScreen from "./pages/FamilyScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesScreen /></ProtectedRoute>} />
            <Route path="/test/detail" element={<ProtectedRoute><TestDetailScreen /></ProtectedRoute>} />
            <Route path="/test/:id" element={<ProtectedRoute><TestDetailScreen /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartScreen /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><BookingScreen /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute><TrackingScreen /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsScreen /></ProtectedRoute>} />
            <Route path="/report-detail" element={<ProtectedRoute><ReportDetailScreen /></ProtectedRoute>} />
            <Route path="/ai-report" element={<ProtectedRoute><ReportDetailScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><SubscriptionScreen /></ProtectedRoute>} />
            <Route path="/health-score" element={<ProtectedRoute><HealthScoreScreen /></ProtectedRoute>} />
            <Route path="/doctor-consult" element={<ProtectedRoute><DoctorConsultScreen /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><RewardsScreen /></ProtectedRoute>} />
            <Route path="/family" element={<ProtectedRoute><FamilyScreen /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
