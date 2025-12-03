import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Droplets,
  Activity,
  Brain,
  Bone,
  Eye,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";

const healthMetrics = [
  { icon: Droplets, name: "Blood Health", score: 85, status: "excellent", trend: "up" },
  { icon: Activity, name: "Heart Health", score: 78, status: "good", trend: "stable" },
  { icon: Brain, name: "Metabolic Health", score: 72, status: "good", trend: "up" },
  { icon: Bone, name: "Bone Health", score: 88, status: "excellent", trend: "stable" },
  { icon: Eye, name: "Vitamin Levels", score: 65, status: "fair", trend: "down" },
];

const improvements = [
  { title: "Increase Vitamin D", description: "Your vitamin D is below optimal. Consider 20 mins of morning sunlight." },
  { title: "Monitor Cholesterol", description: "LDL slightly elevated. Reduce fried foods and increase fiber intake." },
  { title: "Stay Hydrated", description: "Drink 8-10 glasses of water daily for better kidney function." },
];

const HealthScoreScreen = () => {
  const navigate = useNavigate();
  const overallScore = 78;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return "softSuccess";
      case "good":
        return "soft";
      case "fair":
        return "softWarning";
      default:
        return "softDestructive";
    }
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Health Score" />

      <div className="px-4 pb-8">
        {/* Main score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 flex flex-col items-center"
        >
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overallScore * 2.51} 251`}
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${overallScore * 2.51} 251` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--success))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-bold text-foreground"
              >
                {overallScore}
              </motion.p>
              <p className="text-sm text-muted-foreground">out of 100</p>
            </div>
          </div>
          <Badge variant="softSuccess" className="mt-4">
            Good Health
          </Badge>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Based on your last 5 test reports
          </p>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">AI Health Insights</p>
              <p className="text-xs text-muted-foreground">Personalized for you</p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Your overall health is good! Focus on improving vitamin levels and maintaining heart health. 
            Your blood metrics have improved by 8% in the last 3 months.
          </p>
        </motion.div>

        {/* Health metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Health Breakdown</h2>
          <div className="space-y-3">
            {healthMetrics.map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="soft-card flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  metric.status === "excellent"
                    ? "bg-success/10"
                    : metric.status === "good"
                    ? "bg-primary/10"
                    : "bg-warning/10"
                }`}>
                  <metric.icon className={`w-6 h-6 ${
                    metric.status === "excellent"
                      ? "text-success"
                      : metric.status === "good"
                      ? "text-primary"
                      : "text-warning"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground text-sm">{metric.name}</p>
                    <div className="flex items-center gap-2">
                      {metric.trend === "up" && <TrendingUp className="w-4 h-4 text-success" />}
                      {metric.trend === "down" && <TrendingDown className="w-4 h-4 text-warning" />}
                      <span className={`font-bold ${getScoreColor(metric.score)}`}>{metric.score}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className={`h-full rounded-full ${
                        metric.status === "excellent"
                          ? "bg-success"
                          : metric.status === "good"
                          ? "bg-primary"
                          : "bg-warning"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Improvement suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Ways to Improve</h2>
          <div className="space-y-3">
            {improvements.map((item, index) => (
              <div
                key={index}
                className="soft-card flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-warning font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Button variant="hero" className="w-full" size="lg" onClick={() => navigate("/categories")}>
            Book Tests to Improve Score
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default HealthScoreScreen;
