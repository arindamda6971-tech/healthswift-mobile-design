import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  User,
  ChevronRight,
  FileText,
  Heart,
  Users,
  Crown,
  Gift,
  HelpCircle,
  LogOut,
  Moon,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { icon: FileText, label: "Medical History", path: "/medical-history", badge: null },
  { icon: Heart, label: "Health Score", path: "/health-score", badge: "New" },
  { icon: Users, label: "Family Members", path: "/family", badge: "3" },
  { icon: Crown, label: "Subscription Plans", path: "/subscription", badge: null },
  { icon: Gift, label: "Rewards & Referrals", path: "/rewards", badge: "₹500" },
  { icon: HelpCircle, label: "Help & Support", path: "/support", badge: null },
];

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user?.photoURL || null);

  useEffect(() => {
    const loadProfileImage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("profile_image_url")
          .eq("id", session.user.id)
          .maybeSingle();
        if (data?.profile_image_url) {
          setProfileImageUrl(data.profile_image_url);
        }
      }
    };
    loadProfileImage();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const contactInfo = user?.phoneNumber || user?.email || "";

  return (
    <MobileLayout>
      <ScreenHeader title="Profile" showBack={false} />

      <div className="px-4 pb-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card mt-4 flex items-center gap-4"
        >
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt={displayName}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={displayName}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{contactInfo}</p>
            <Badge variant="soft" className="mt-1">Gold Member</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/edit-profile")}>
            Edit
          </Button>
        </motion.div>

        {/* Health score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/health-score")}
          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-success/20 to-primary/20 border border-success/20 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Health Score</p>
              <p className="text-3xl font-bold text-foreground">78<span className="text-lg font-normal">/100</span></p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-success/60 flex items-center justify-center">
              <Heart className="w-8 h-8 text-success-foreground" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[78%] bg-gradient-to-r from-success to-primary rounded-full" />
            </div>
            <span className="text-xs text-muted-foreground">Good</span>
          </div>
        </motion.div>

        {/* Quick settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="soft-card mt-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-medium text-foreground">Dark Mode</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">Notifications</span>
            </div>
            <Switch defaultChecked />
          </div>
        </motion.div>

        {/* Menu items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 space-y-2"
        >
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => navigate(item.path)}
              className="w-full soft-card flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
              {item.badge && (
                <Badge variant={item.badge === "New" ? "soft" : item.badge.includes("₹") ? "softSuccess" : "secondary"}>
                  {item.badge}
                </Badge>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          HealthSwift v2.1.0 • Made with ❤️
        </motion.p>
      </div>
    </MobileLayout>
  );
};

export default ProfileScreen;
