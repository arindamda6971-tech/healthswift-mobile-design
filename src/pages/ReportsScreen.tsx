import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Sparkles,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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

                  <div className="flex items-center justify-end">
                    <div className="flex gap-2">
                      <Button variant="soft" size="sm" className="h-8 px-3">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Summary
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default ReportsScreen;
