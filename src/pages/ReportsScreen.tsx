import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";

const reports = [
  {
    id: 1,
    name: "Complete Blood Count",
    date: "Nov 28, 2024",
    status: "ready",
    riskLevel: "low",
    parameters: 9,
    abnormal: 0,
  },
  {
    id: 2,
    name: "Thyroid Profile",
    date: "Nov 25, 2024",
    status: "ready",
    riskLevel: "medium",
    parameters: 6,
    abnormal: 2,
  },
  {
    id: 3,
    name: "Liver Function Test",
    date: "Nov 20, 2024",
    status: "ready",
    riskLevel: "low",
    parameters: 12,
    abnormal: 0,
  },
  {
    id: 4,
    name: "Vitamin D & B12",
    date: "Nov 15, 2024",
    status: "ready",
    riskLevel: "high",
    parameters: 4,
    abnormal: 2,
  },
];

const healthTrends = [
  { name: "Hemoglobin", current: 14.2, previous: 13.8, unit: "g/dL", trend: "up", status: "normal" },
  { name: "Vitamin D", current: 18, previous: 22, unit: "ng/mL", trend: "down", status: "low" },
  { name: "TSH", current: 3.2, previous: 3.0, unit: "mIU/L", trend: "up", status: "normal" },
  { name: "Cholesterol", current: 185, previous: 190, unit: "mg/dL", trend: "down", status: "normal" },
];

const ReportsScreen = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "softSuccess";
      case "medium":
        return "softWarning";
      case "high":
        return "softDestructive";
      default:
        return "soft";
    }
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

      <div className="px-4 pb-6">
        <Tabs defaultValue="reports" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-xl">
            <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Reports
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-3">
            {reports.map((report, index) => {
              const RiskIcon = getRiskIcon(report.riskLevel);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                    <Badge variant={getRiskColor(report.riskLevel) as any}>
                      {report.riskLevel === "low" ? "Normal" : report.riskLevel === "medium" ? "Attention" : "Alert"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {report.parameters} parameters • {report.abnormal} abnormal
                    </p>
                    <div className="flex gap-2">
                      <Button variant="soft" size="sm" className="h-8 px-3">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Summary
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {/* Health trends graph placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="soft-card"
            >
              <h3 className="font-semibold text-foreground mb-4">Health Trends (6 months)</h3>
              <div className="h-40 rounded-xl bg-gradient-to-br from-primary/10 to-success/5 flex items-center justify-center">
                <div className="flex items-end gap-3 h-24">
                  {[40, 55, 45, 60, 70, 65, 75, 80, 72, 85, 78, 90].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.05 }}
                      className="w-4 rounded-t-lg bg-gradient-to-t from-primary to-primary/60"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Individual metrics */}
            <div className="space-y-3">
              {healthTrends.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="soft-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      metric.status === "normal" ? "bg-success/10" : "bg-warning/10"
                    }`}>
                      {metric.trend === "up" ? (
                        <TrendingUp className={`w-5 h-5 ${metric.status === "normal" ? "text-success" : "text-warning"}`} />
                      ) : metric.trend === "down" ? (
                        <TrendingDown className={`w-5 h-5 ${metric.status === "normal" ? "text-success" : "text-warning"}`} />
                      ) : (
                        <Minus className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{metric.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Previous: {metric.previous} {metric.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {metric.current} <span className="text-xs font-normal text-muted-foreground">{metric.unit}</span>
                    </p>
                    <Badge variant={metric.status === "normal" ? "softSuccess" : "softWarning"}>
                      {metric.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default ReportsScreen;
