import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Activity,
  Pill,
  AlertCircle,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Report {
  id: string;
  generated_at: string;
  status: string;
  risk_level: string;
  ai_summary: string | null;
  test_id: string;
}

interface MedicalCondition {
  name: string;
  diagnosed_date: string;
  status: "active" | "managed" | "resolved";
}

const MedicalHistoryScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample medical conditions (in production, these would come from the database)
  const [conditions] = useState<MedicalCondition[]>([
    { name: "Vitamin D Deficiency", diagnosed_date: "2024-03-15", status: "managed" },
    { name: "Mild Anemia", diagnosed_date: "2024-01-10", status: "resolved" },
  ]);

  useEffect(() => {
    if (user) {
      fetchMedicalHistory();
    }
  }, [user]);

  const fetchMedicalHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, generated_at, status, risk_level, ai_summary, test_id")
        .eq("user_id", user.uid)
        .order("generated_at", { ascending: false })
        .limit(10);

      if (data) {
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching medical history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "softWarning";
      case "managed":
        return "soft";
      case "resolved":
        return "softSuccess";
      default:
        return "secondary";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "destructive";
      case "medium":
        return "softWarning";
      case "low":
        return "softSuccess";
      default:
        return "secondary";
    }
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Medical History" />

      <div className="px-4 pb-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          <div className="soft-card text-center">
            <FileText className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Reports</p>
          </div>
          <div className="soft-card text-center">
            <Activity className="w-6 h-6 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold text-foreground">{conditions.length}</p>
            <p className="text-xs text-muted-foreground">Conditions</p>
          </div>
          <div className="soft-card text-center">
            <Calendar className="w-6 h-6 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Months</p>
          </div>
        </motion.div>

        {/* Medical Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Medical Conditions</h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {conditions.length > 0 ? (
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <motion.div
                  key={condition.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="soft-card flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{condition.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(condition.status) as any}>
                    {condition.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="soft-card text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No medical conditions recorded</p>
            </div>
          )}
        </motion.div>

        {/* Past Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Past Reports</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
              View All
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="soft-card h-20 shimmer" />
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report, index) => (
                <motion.button
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => navigate("/report-detail", { state: { reportId: report.id } })}
                  className="w-full soft-card flex items-center gap-4 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Health Report</p>
                    <p className="text-xs text-muted-foreground">
                      {report.generated_at
                        ? new Date(report.generated_at).toLocaleDateString()
                        : "Processing"}
                    </p>
                  </div>
                  <Badge variant={getRiskColor(report.risk_level || "low") as any}>
                    {report.risk_level || "low"} risk
                  </Badge>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="soft-card text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No reports yet</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/categories")}>
                Book Your First Test
              </Button>
            </div>
          )}
        </motion.div>

        {/* Medications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Current Medications</h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="soft-card text-center py-8">
            <Pill className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No medications recorded</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add medications to track your health better
            </p>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default MedicalHistoryScreen;
