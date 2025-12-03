import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  FlaskConical,
  Home as HomeIcon,
  Calendar,
  Sparkles,
  ChevronRight,
  Droplets,
  HeartPulse,
  Activity,
  Beaker,
  Users,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";

const quickActions = [
  { icon: FlaskConical, label: "Book Test", path: "/categories", color: "bg-primary/10 text-primary" },
  { icon: HeartPulse, label: "Full Body", path: "/test/full-body", color: "bg-success/10 text-success" },
  { icon: HomeIcon, label: "Home Collection", path: "/book", color: "bg-warning/10 text-warning" },
  { icon: Calendar, label: "Schedule", path: "/book", color: "bg-secondary/10 text-secondary" },
];

const trendingTests = [
  { name: "Complete Blood Count", price: 299, originalPrice: 499, discount: "40%", time: "6 hours" },
  { name: "Thyroid Profile", price: 399, originalPrice: 699, discount: "43%", time: "24 hours" },
  { name: "Vitamin D & B12", price: 799, originalPrice: 1299, discount: "38%", time: "24 hours" },
  { name: "Liver Function Test", price: 449, originalPrice: 799, discount: "44%", time: "12 hours" },
];

const healthPlans = [
  { icon: Droplets, name: "Diabetes Care", tests: 15, price: 1499, color: "from-primary to-primary/60" },
  { icon: Activity, name: "Thyroid Care", tests: 12, price: 1299, color: "from-success to-success/60" },
  { icon: Users, name: "Senior Citizen", tests: 60, price: 2999, color: "from-secondary to-secondary/60" },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
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
            <p className="text-sm text-muted-foreground">Good morning</p>
            <h1 className="text-xl font-bold text-foreground">Welcome back! 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="icon-btn relative">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </motion.header>

      {/* Live availability indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 mt-4 p-4 soft-card flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Phlebotomists Available</p>
            <p className="text-xs text-muted-foreground">12 verified experts near you</p>
          </div>
        </div>
        <Badge variant="live">Live</Badge>
      </motion.div>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 mt-6"
      >
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center transition-transform active:scale-95`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
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
          <button className="flex items-center gap-1 text-primary text-sm font-medium">
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
              onClick={() => navigate("/test/detail")}
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
  );
};

export default HomeScreen;
