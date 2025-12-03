import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Splash & Onboarding */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          
          {/* Main App */}
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/categories" element={<CategoriesScreen />} />
          <Route path="/test/detail" element={<TestDetailScreen />} />
          <Route path="/test/:id" element={<TestDetailScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/book" element={<BookingScreen />} />
          <Route path="/tracking" element={<TrackingScreen />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/report-detail" element={<ReportDetailScreen />} />
          <Route path="/ai-report" element={<ReportDetailScreen />} />
          
          {/* Profile & Settings */}
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/subscription" element={<SubscriptionScreen />} />
          <Route path="/health-score" element={<HealthScoreScreen />} />
          <Route path="/doctor-consult" element={<DoctorConsultScreen />} />
          <Route path="/rewards" element={<RewardsScreen />} />
          <Route path="/family" element={<FamilyScreen />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
