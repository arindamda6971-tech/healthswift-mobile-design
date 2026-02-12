import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Report = {
  id: string;
  name: string;
  date: string;
  status: string;
  riskLevel: string;
  parameters?: number;
  abnormal?: number;
  category: string;
};

const ReportsScreen = () => {
  const navigate = useNavigate();
  const { supabaseUserId } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetchReports = async () => {
      try {
        setLoading(true);
        if (!supabaseUserId) {
          setLoading(false);
          return;
        }

        // Fetch user reports with related test name
        const { data, error } = await supabase
          .from("reports")
          .select(`id, status, risk_level, abnormal_count, ai_summary, generated_at, created_at, tests (name, category)`)
          .eq("user_id", supabaseUserId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!cancelled && data) {
          const mapped = data.map((r: any) => ({
            id: r.id,
            name: r.tests?.[0]?.name || r.ai_summary || "Report",
            date: r.generated_at
              ? new Date(r.generated_at).toLocaleDateString()
              : new Date(r.created_at).toLocaleDateString(),
            status: r.status || "processing",
            riskLevel: r.risk_level || "low",
            parameters: Array.isArray(r.parameters) ? r.parameters.length : undefined,
            abnormal: r.abnormal_count || 0,
            category: r.tests?.[0]?.category || "Health Tests",
          }));
          setReports(mapped as Report[]);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to load reports");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReports();
    return () => {
      cancelled = true;
    };
  }, [supabaseUserId]);

  // continue component below (rendering) -- keep same name for component
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return CheckCircle;
      case "medium":
      case "high":
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  return (
    <MobileLayout>
      <ScreenHeader title="Health Reports" showBack={false} />

      {/* Top Menu Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {["All", ...Array.from(new Set(reports.map((r) => r.category)))].map((c) => (
              <motion.button
                key={c}
                onClick={() => setSelectedCategory(c)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedCategory === c
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c !== "All" && (
                  <CategoryIcon 
                    category={c} 
                    className={`w-3.5 h-3.5 ${selectedCategory === c ? "text-primary-foreground" : "text-muted-foreground"}`} 
                  />
                )}
                <span>{c}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        <Tabs defaultValue="reports" className="mt-4">
              <TabsContent value="reports" className="space-y-4">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading reports...</div>
            ) : (() => {
              if (selectedCategory !== "All") {
                const items = reports.filter((r) => r.category === selectedCategory);
                return (
                  <div className="space-y-3">
                    {items.map((report, idx) => {
                      const RiskIcon = getRiskIcon(report.riskLevel);
                      return (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="soft-card cursor-pointer"
                          onClick={() => navigate("/report-detail")}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                report.riskLevel === "low"
                                  ? "bg-success/10"
                                  : report.riskLevel === "medium"
                                  ? "bg-warning/10"
                                  : "bg-destructive/10"
                              }`}>
                                <RiskIcon className={`w-5 h-5 ${
                                  report.riskLevel === "low"
                                    ? "text-success"
                                    : report.riskLevel === "medium"
                                    ? "text-warning"
                                    : "text-destructive"
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-sm">{report.name}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {report.date}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              }

              const order = ["Health Tests", "ECG Tests", "Physiotherapy", "Consultations"];
              const grouped: Record<string, Report[]> = {};
              reports.forEach((r) => {
                if (!grouped[r.category]) grouped[r.category] = [];
                grouped[r.category].push(r);
              });

              return order.map((cat) => {
                const items = grouped[cat] || [];
                if (items.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                      <CategoryIcon category={cat} className="w-4 h-4 text-foreground/80" />
                      {cat}
                    </h4>
                    <div className="space-y-3">
                      {items.map((report, idx) => {
                        const RiskIcon = getRiskIcon(report.riskLevel);
                        return (
                          <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="soft-card cursor-pointer"
                            onClick={() => navigate("/report-detail")}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  report.riskLevel === "low"
                                    ? "bg-success/10"
                                    : report.riskLevel === "medium"
                                    ? "bg-warning/10"
                                    : "bg-destructive/10"
                                }`}>
                                  <RiskIcon className={`w-5 h-5 ${
                                    report.riskLevel === "low"
                                      ? "text-success"
                                      : report.riskLevel === "medium"
                                      ? "text-warning"
                                      : "text-destructive"
                                  }`} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-sm">{report.name}</h3>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    {report.date}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default ReportsScreen;
