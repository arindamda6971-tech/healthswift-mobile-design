import { Home, Grid3X3, FileText, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Grid3X3, label: "Tests", path: "/categories" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-1 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-[380px]">
      <div 
        className="flex items-center justify-around px-1 py-1.5 rounded-2xl backdrop-blur-xl bg-background/70 border border-border/30 shadow-md"
        style={{
          WebkitBackdropFilter: 'blur(16px)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center gap-0 py-0.5 px-2.5"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-primary/15" 
                    : "hover:bg-muted/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[9px] font-medium transition-colors duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-0 w-1 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
