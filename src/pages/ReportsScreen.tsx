import { useState } from "react";
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

type Report = {
  id: number;
  name: string;
  date: string;
  status: string;
  riskLevel: string;
  parameters?: number;
  abnormal?: number;
  category: "Health Tests" | "ECG Tests" | "Physiotherapy" | "Consultations" | string;
};

const reports: Report[] = [
  { id: 1, name: "Complete Blood Count", date: "Nov 28, 2024", status: "ready", riskLevel: "low", parameters: 9, abnormal: 0, category: "Health Tests" },
  { id: 2, name: "Thyroid Profile", date: "Nov 25, 2024", status: "ready", riskLevel: "medium", parameters: 6, abnormal: 2, category: "Health Tests" },
  { id: 3, name: "Liver Function Test", date: "Nov 20, 2024", status: "ready", riskLevel: "low", parameters: 12, abnormal: 0, category: "Health Tests" },
  { id: 4, name: "Vitamin D & B12", date: "Nov 15, 2024", status: "ready", riskLevel: "high", parameters: 4, abnormal: 2, category: "Health Tests" },
  { id: 11, name: "Resting ECG Report", date: "Dec 02, 2024", status: "ready", riskLevel: "medium", category: "ECG Tests" },
  { id: 12, name: "Holter Monitor Summary", date: "Jan 05, 2025", status: "ready", riskLevel: "low", category: "ECG Tests" },
  { id: 21, name: "Physio Session 1 Notes", date: "Dec 10, 2024", status: "ready", riskLevel: "low", category: "Physiotherapy" },
  { id: 22, name: "Physio Progress Report", date: "Jan 12, 2025", status: "ready", riskLevel: "medium", category: "Physiotherapy" },
  { id: 31, name: "Consultation - Dr. Sharma", date: "Nov 30, 2024", status: "ready", riskLevel: "low", category: "Consultations" },
  { id: 32, name: "Follow-up - Dr. Rao", date: "Jan 20, 2025", status: "ready", riskLevel: "low", category: "Consultations" },
];

const ReportsScreen = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categoryColors: Record<string, { bg: string; text: string }> = {
    "Health Tests": { bg: "bg-primary/10", text: "text-primary" },
    "ECG Tests": { bg: "bg-destructive/10", text: "text-destructive" },
    "Physiotherapy": { bg: "bg-secondary/10", text: "text-secondary" },
    "Consultations": { bg: "bg-primary/10", text: "text-primary" },
  };

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
            {["All", ...Array.from(new Set(reports.map((r) => r.category)))].map((c) => {
              const colors = categoryColors[c];
              const isAll = c === "All";
              return (
                <motion.button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedCategory === c
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isAll
                      ? "bg-muted text-muted-foreground hover:bg-muted/80"
                      : `${colors.bg} ${colors.text}`
                  }`}
                >
                  {c !== "All" && (
                    selectedCategory === c ? (
                      <CategoryIcon category={c} className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <span className={`inline-flex items-center justify-center p-2 rounded-xl ${colors ? colors.bg : 'bg-muted'}`}>
                        <CategoryIcon category={c} className={`${colors ? colors.text : 'text-muted-foreground'} w-5 h-5`} />
                      </span>
                    )
                  )}
                  <span className={selectedCategory === c ? undefined : (!isAll && colors ? colors.text : undefined)}>{c}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        <Tabs defaultValue="reports" className="mt-4">
          <TabsContent value="reports" className="space-y-4">
            {(() => {
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

              const colors = categoryColors[cat];

              return (
                <div key={cat} className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                    <span className={`p-2 rounded-xl ${colors ? colors.bg : ""}`}>
                      <CategoryIcon category={cat} className={`w-5 h-5 ${colors ? colors.text : "text-foreground/80"}`} />
                    </span>
                    <span className="ml-1">{cat}</span>
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
