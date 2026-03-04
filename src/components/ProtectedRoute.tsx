import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-[430px] mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if location has been verified (skip for the location-check page itself)
  if (location.pathname !== "/location-check") {
    const locationChecked = localStorage.getItem(`location_checked_${user.id}`);
    if (locationChecked !== "true") {
      return <Navigate to="/location-check" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
