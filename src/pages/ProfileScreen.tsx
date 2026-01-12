import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  User,
  ChevronRight,
  MapPin,
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
import { useAddresses } from "@/contexts/AddressContext";

const menuItems = [
  { icon: MapPin, label: "Saved Addresses", path: "/saved-addresses", badge: null },
  { icon: Crown, label: "Subscription Plans", path: "/subscription", badge: null },
  { icon: Gift, label: "Rewards & Referrals", path: "/rewards", badge: "₹500" },
  { icon: HelpCircle, label: "Help & Support", path: "/support", badge: null },
];

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  useEffect(() => {
    const loadProfileImage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .maybeSingle();
        if (data?.avatar_url) {
          setProfileImageUrl(data.avatar_url);
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

  const { addresses, defaultAddressId } = useAddresses();

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const contactInfo = user?.phone || user?.email || "";

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
          ) : user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
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
              {item.label === "Saved Addresses" ? (
                <Badge variant={addresses.length > 0 ? "softSuccess" : "secondary"}>
                  {addresses.length > 0 ? `${addresses.length} saved` : "No saved"}
                </Badge>
              ) : (
                item.badge && (
                  <Badge variant={item.badge === "New" ? "soft" : item.badge.includes("₹") ? "softSuccess" : "secondary"}>
                    {item.badge}
                  </Badge>
                )
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
