import { ReactNode, useCallback } from "react";
import { motion } from "framer-motion";
import BottomNavigation from "./BottomNavigation";
import FloatingAddButton from "./FloatingAddButton";
import PullToRefresh from "@/components/ui/PullToRefresh";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showFloatingAdd?: boolean;
  className?: string;
  onRefresh?: () => Promise<void>;
  enablePullToRefresh?: boolean;
}

const MobileLayout = ({ 
  children, 
  showNav = true, 
  showFloatingAdd = true, 
  className = "",
  onRefresh,
  enablePullToRefresh = true,
}: MobileLayoutProps) => {
  const defaultRefresh = useCallback(async () => {
    // Default refresh - simulate a refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  }, []);

  const handleRefresh = onRefresh || defaultRefresh;

  const content = (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${showNav ? "pb-36" : ""} ${className}`}
    >
      {children}
    </motion.main>
  );

  return (
    <div className="min-h-screen h-screen bg-background max-w-[430px] mx-auto relative overflow-hidden">
      {enablePullToRefresh ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {content}
        </PullToRefresh>
      ) : (
        <div className="h-full overflow-y-auto">
          {content}
        </div>
      )}
      {showNav && <BottomNavigation />}
      {showFloatingAdd && <FloatingAddButton />}
    </div>
  );
};

export default MobileLayout;
