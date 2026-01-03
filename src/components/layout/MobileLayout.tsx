import { ReactNode } from "react";
import { motion } from "framer-motion";
import BottomNavigation from "./BottomNavigation";
import FloatingAddButton from "./FloatingAddButton";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showFloatingAdd?: boolean;
  className?: string;
}

const MobileLayout = ({ children, showNav = true, showFloatingAdd = true, className = "" }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative overflow-hidden">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`${showNav ? "pb-36" : ""} ${className}`}
      >
        {children}
      </motion.main>
      {showNav && <BottomNavigation />}
      {showFloatingAdd && <FloatingAddButton />}
    </div>
  );
};

export default MobileLayout;
