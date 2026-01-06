import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const SplashScreen = React.lazy(() => import("./pages/SplashScreen"));
const ProfileScreen = React.lazy(() => import("./pages/ProfileScreen"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
                  <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              {/* Incremental route chunk: cart & booking (to detect compile errors) */}
              <Route path="/cart" element={React.createElement(React.lazy(() => import("./pages/CartScreen")))} />
              <Route path="/booking" element={React.createElement(React.lazy(() => import("./pages/BookingScreen")))} />
              {/* Add orders/history route chunk */}
              <Route path="/orders" element={React.createElement(React.lazy(() => import("./pages/OrderHistoryScreen")))} />
              {/* Add tests & categories chunk */}
              <Route path="/categories" element={React.createElement(React.lazy(() => import("./pages/CategoriesScreen")))} />
              <Route path="/categories/:id" element={React.createElement(React.lazy(() => import("./pages/CategoryDetailScreen")))} />
              <Route path="/test/select" element={React.createElement(React.lazy(() => import("./pages/TestSelectionScreen")))} />
              <Route path="/test/select/:id" element={React.createElement(React.lazy(() => import("./pages/TestSelectionScreen")))} />
              <Route path="/tests/:id" element={React.createElement(React.lazy(() => import("./pages/TestDetailScreen")))} />
              <Route path="/home" element={React.createElement(React.lazy(() => import("./pages/HomeScreen")))} />
              {/* Add reports & notifications */}
              <Route path="/reports" element={React.createElement(React.lazy(() => import("./pages/ReportsScreen")))} />
              <Route path="/notifications" element={React.createElement(React.lazy(() => import("./pages/NotificationsScreen")))} />
              <Route path="/tracking/:orderId" element={React.createElement(React.lazy(() => import("./pages/TrackingScreen")))} />
              {/* Misc pages */}
              <Route path="/login" element={React.createElement(React.lazy(() => import("./pages/LoginScreen")))} />
              <Route path="/onboarding" element={React.createElement(React.lazy(() => import("./pages/OnboardingScreen")))} />
              <Route path="/install" element={React.createElement(React.lazy(() => import("./pages/InstallScreen")))} />
              <Route path="*" element={React.createElement(React.lazy(() => import("./pages/NotFound")))} />
            </Routes>
          </Suspense>
        </BrowserRouter>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
