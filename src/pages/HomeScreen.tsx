import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronRight,
  HeartPulse,
  Activity,
  Shield,
  X,
  RefreshCw,
  FileUp,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { toast } from "sonner";
import DiagnosticCentersCarousel from "@/components/home/DiagnosticCentersCarousel";

// Get greeting based on current time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

// Removed hardcoded diagnosticCenters - now fetched from database

const quickActions = [
  { icon: FileUp, label: "Upload Prescription", path: "/upload-prescription", color: "bg-primary/10 text-primary" },
  { icon: Stethoscope, label: "Consult Doctor", path: "/doctor-consult", color: "bg-success/10 text-success" },
  { icon: Activity, label: "Consult Physiotherapist", path: "/physio-consult", color: "bg-secondary/10 text-secondary" },
  { icon: HeartPulse, label: "ECG Test", path: "/ecg-test", color: "bg-destructive/10 text-destructive" },
];

const trendingTests = [
  { name: "Complete Blood Count", price: 299, originalPrice: 499, discount: "40%", time: "6 hours" },
  { name: "Thyroid Profile", price: 399, originalPrice: 699, discount: "43%", time: "24 hours" },
  { name: "Vitamin D & B12", price: 799, originalPrice: 1299, discount: "38%", time: "24 hours" },
  { name: "Liver Function Test", price: 449, originalPrice: 799, discount: "44%", time: "12 hours" },
];

// Health packages will be fetched from database

const HomeScreen = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState(getGreeting());
  const [allTests, setAllTests] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [diagnosticCenters, setDiagnosticCenters] = useState<{id: string; name: string; rating: number; tests: number; logo?: string}[]>([]);
  const [healthPackages, setHealthPackages] = useState<{id: string; name: string; tests_count: number; price: number; original_price?: number; discount_percent?: number; icon?: string; color?: string}[]>([]);

  // Fetch all tests for search
  const fetchTests = useCallback(async () => {
    const { data } = await supabase
      .from("tests")
      .select("id, name, price, original_price, discount_percent")
      .eq("is_active", true);
    if (data) setAllTests(data);
  }, []);

  // Fetch diagnostic centers
  const fetchDiagnosticCenters = useCallback(async () => {
    const { data } = await supabase
      .from("diagnostic_centers")
      .select("id, name, rating, reviews_count, logo_url")
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(10);
    if (data) {
      setDiagnosticCenters(data.map(center => ({
        id: center.id,
        name: center.name,
        rating: center.rating || 4.5,
        tests: center.reviews_count || 100,
        logo: center.logo_url || undefined
      })));
    }
  }, []);

  // Fetch health packages from test_packages table
  const fetchHealthPackages = useCallback(async () => {
    const { data } = await supabase
      .from("test_packages")
      .select("id, name, tests_count, price, original_price, discount_percent, icon, color")
      .eq("is_active", true)
      .order("is_popular", { ascending: false })
      .limit(5);
    if (data) {
      setHealthPackages(data.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        tests_count: pkg.tests_count || 0,
        price: pkg.price,
        original_price: pkg.original_price || undefined,
        discount_percent: pkg.discount_percent || undefined,
        icon: pkg.icon || undefined,
        color: pkg.color || undefined
      })));
    }
  }, []);

  // Refresh handler for pull-to-refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchTests(), fetchDiagnosticCenters(), fetchHealthPackages()]);
    toast.success("Data refreshed!");
  }, [fetchTests, fetchDiagnosticCenters, fetchHealthPackages]);

  const {
    isRefreshing,
    pullDistance,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh({ onRefresh: handleRefresh, threshold: 80 });

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tests, centers and packages on mount
  useEffect(() => {
    fetchTests();
    fetchDiagnosticCenters();
    fetchHealthPackages();
  }, [fetchTests, fetchDiagnosticCenters, fetchHealthPackages]);

  // Filter tests based on search query. Use supabase results when available,
  // otherwise fall back to the local `trendingTests` list so search works offline.
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    // Build a searchable pool from fetched tests or fallback to trending tests
    const pool = (allTests && allTests.length > 0)
      ? allTests.map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price ?? t.price,
          original_price: t.original_price ?? t.originalPrice,
          discount_percent: t.discount_percent ?? t.discountPercent,
          category: t.category,
        }))
      : trendingTests.map((t, i) => ({
          id: `trending-${i}`,
          name: t.name,
          price: t.price,
          original_price: t.originalPrice,
          discount_percent: parseInt(t.discount),
        }));

    return pool.filter((item: any) => {
      const name = (item.name || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      return name.includes(q) || category.includes(q);
    }).slice(0, 7);
  }, [searchQuery, allTests]);

  const handleSearchKeyDown = (e: any) => {
    if (e.key === "Enter") {
      if (searchResults.length > 0) {
        const test = searchResults[0];
        setShowSearchResults(false);
        setSearchQuery("");
        if (String(test.id).startsWith("trending-")) {
          navigate("/test/select", { state: { test } });
        } else {
          navigate(`/test/select/${test.id}`);
        }
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            style={{ 
              height: Math.max(pullDistance, isRefreshing ? 60 : 0),
              paddingTop: "env(safe-area-inset-top, 0px)"
            }}
          >
            <motion.div
              animate={{ 
                rotate: isRefreshing ? 360 : (pullDistance / 80) * 180,
              }}
              transition={isRefreshing ? { 
                repeat: Infinity, 
                duration: 1, 
                ease: "linear" 
              } : { duration: 0 }}
            >
              <RefreshCw 
                className={`w-6 h-6 ${pullDistance >= 80 || isRefreshing ? 'text-primary' : 'text-muted-foreground'}`} 
              />
            </motion.div>
            {pullDistance >= 80 && !isRefreshing && (
              <span className="ml-2 text-sm text-primary font-medium">Release to refresh</span>
            )}
            {isRefreshing && (
              <span className="ml-2 text-sm text-primary font-medium">Refreshing...</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <MobileLayout>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 pt-4 pb-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 16px)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{greeting}</p>
            <h1 className="text-xl font-bold text-foreground">Welcome back! 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="icon-btn relative"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tests, packages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={handleSearchKeyDown}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                {searchResults.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery("");
                      if (String(test.id).startsWith("trending-")) {
                        navigate("/test/select", { state: { test } });
                      } else {
                        navigate(`/test/select/${test.id}`);
                      }
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{test.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {test.discount_percent > 0 && `${test.discount_percent}% off`}
                      </p>
                    </div>
                    <span className="font-semibold text-primary">₹{test.price}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Diagnostic Centers Carousel */}
      <DiagnosticCentersCarousel centers={diagnosticCenters} />

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 mt-6"
      >
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => navigate(action.path)}
              className="soft-card flex items-center gap-3 p-4"
            >
              <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center transition-transform active:scale-95`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Trending Tests */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-bold text-foreground">Trending Tests</h2>
          <button 
            onClick={() => navigate('/categories')}
            className="flex items-center gap-1 text-primary text-sm font-medium"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 hide-scrollbar">
          {trendingTests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => navigate("/test/select", { 
                state: { 
                  test: { 
                    id: `trending-${index}`,
                    name: test.name, 
                    price: test.price, 
                    original_price: test.originalPrice,
                    discount_percent: parseInt(test.discount),
                    report_time_hours: parseInt(test.time),
                    sample_type: "Blood"
                  } 
                } 
              })}
              className="test-card min-w-[180px] flex-shrink-0 cursor-pointer"
            >
              <div className="p-4">
                <Badge variant="softSuccess" className="mb-3 text-xs">
                  {test.discount} OFF
                </Badge>
                <h3 className="font-semibold text-foreground text-sm mb-1">{test.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">Reports in {test.time}</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">₹{test.price}</span>
                  <span className="text-xs text-muted-foreground line-through">₹{test.originalPrice}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Health Packages */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-4 mt-8 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Health Packages</h2>
          <button 
            onClick={() => navigate('/categories')}
            className="flex items-center gap-1 text-primary text-sm font-medium"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {healthPackages.length > 0 ? (
            healthPackages.map((pkg, index) => {
              const gradientColors = [
                "from-primary to-primary/60",
                "from-success to-success/60", 
                "from-secondary to-secondary/60",
                "from-destructive to-destructive/60",
                "from-accent to-accent/60"
              ];
              const IconComponent = pkg.icon === "HeartPulse" ? HeartPulse : 
                                   pkg.icon === "Activity" ? Activity : 
                                   pkg.icon === "Shield" ? Shield : HeartPulse;
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => navigate(`/test/select/${pkg.id}`, { state: { isPackage: true } })}
                  className="soft-card flex items-center gap-4 cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pkg.color || gradientColors[index % gradientColors.length]} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{pkg.name}</h3>
                    <p className="text-xs text-muted-foreground">{pkg.tests_count} tests included</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{pkg.price}</p>
                    {pkg.discount_percent && pkg.discount_percent > 0 && (
                      <p className="text-xs text-success">{pkg.discount_percent}% off</p>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            // Fallback if no packages loaded
            [
              { name: "Full Body Checkup", tests: 70, price: 1499, color: "from-primary to-primary/60" },
              { name: "Comprehensive Health Package", tests: 85, price: 2499, color: "from-success to-success/60" },
              { name: "Wellness Package", tests: 45, price: 999, color: "from-secondary to-secondary/60" },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => navigate("/categories")}
                className="soft-card flex items-center gap-4 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                  <HeartPulse className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tests} tests included</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₹{plan.price}</p>
                  <p className="text-xs text-muted-foreground">onwards</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

    </MobileLayout>
    </div>
  );
};

export default HomeScreen;
