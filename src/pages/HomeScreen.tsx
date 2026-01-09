import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  FlaskConical,
  Sparkles,
  ChevronRight,
  HeartPulse,
  Activity,
  Beaker,
  Shield,
  Building2,
  Star,
  X,
  RefreshCw,
  FileUp,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { toast } from "sonner";

// Get greeting based on current time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

const diagnosticCenters = [
  { id: "lal-pathlabs", name: "Dr. Lal PathLabs", rating: 4.8, tests: 500 },
  { id: "metropolis", name: "Metropolis Healthcare", rating: 4.7, tests: 450 },
  { id: "srl", name: "SRL Diagnostics", rating: 4.6, tests: 400 },
  { id: "thyrocare", name: "Thyrocare", rating: 4.5, tests: 350 },
  { id: "apollo", name: "Apollo Diagnostics", rating: 4.7, tests: 380 },
  { id: "max-lab", name: "Max Lab", rating: 4.6, tests: 320 },
];

const quickActions = [
  { icon: FileUp, label: "Upload Prescription", path: "/upload-prescription", color: "bg-primary/10 text-primary" },
  { icon: Stethoscope, label: "Consult Doctor", path: "/doctor-consult", color: "bg-success/10 text-success" },
];

const trendingTests = [
  { name: "Complete Blood Count", price: 299, originalPrice: 499, discount: "40%", time: "6 hours" },
  { name: "Thyroid Profile", price: 399, originalPrice: 699, discount: "43%", time: "24 hours" },
  { name: "Vitamin D & B12", price: 799, originalPrice: 1299, discount: "38%", time: "24 hours" },
  { name: "Liver Function Test", price: 449, originalPrice: 799, discount: "44%", time: "12 hours" },
];

const healthPlans = [
  { icon: HeartPulse, name: "Sexual Health Test", tests: 15, price: 1499, color: "from-primary to-primary/60" },
  { icon: Activity, name: "Thyroid Care", tests: 12, price: 1299, color: "from-success to-success/60" },
  { icon: Shield, name: "Allergy Checkup", tests: 25, price: 1899, color: "from-secondary to-secondary/60" },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState(getGreeting());
  const [allTests, setAllTests] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch all tests for search
  const fetchTests = useCallback(async () => {
    const { data } = await supabase
      .from("tests")
      .select("id, name, price, original_price, discount_percent")
      .eq("is_active", true);
    if (data) setAllTests(data);
  }, []);

  // Refresh handler for pull-to-refresh
  const handleRefresh = useCallback(async () => {
    await fetchTests();
    toast.success("Data refreshed!");
  }, [fetchTests]);

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

  // Fetch tests on mount
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

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

      {/* Diagnostic Centers */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 mt-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Diagnostic Centers</h3>
          </div>
          <button 
            onClick={() => navigate('/partner-labs')}
            className="flex items-center gap-1 text-primary text-sm font-medium"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {diagnosticCenters.map((center, index) => (
            <motion.div
              key={center.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => navigate(`/lab/${center.id}`)}
              className="soft-card min-w-[160px] flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center p-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground text-sm mb-1">{center.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span>{center.rating}</span>
                  <span>•</span>
                  <span>{center.tests}+ tests</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

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

      {/* AI Feature Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-4 mt-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary to-secondary/80 p-5">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
              <Badge variant="ai">AI Powered</Badge>
            </div>
            <h3 className="text-lg font-bold text-secondary-foreground mb-1">
              Smart Health Reports
            </h3>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Get AI-powered explanations for your test results in simple language
            </p>
            <Button variant="glass" size="sm" onClick={() => navigate("/ai-report")}>
              Learn more
            </Button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <Beaker className="absolute right-4 bottom-4 w-16 h-16 text-secondary-foreground/10" />
        </div>
      </motion.section>

      {/* Health Plans */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-4 mt-8 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Health Plans</h2>
          <button className="flex items-center gap-1 text-primary text-sm font-medium">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {healthPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              onClick={() => navigate("/subscription")}
              className="soft-card flex items-center gap-4 cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                <plan.icon className="w-7 h-7 text-primary-foreground" />
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
          ))}
        </div>
      </motion.section>

    </MobileLayout>
    </div>
  );
};

export default HomeScreen;
