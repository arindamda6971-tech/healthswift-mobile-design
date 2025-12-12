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
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  family_member_id: string | null;
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  gender: string | null;
  medical_conditions: string[] | null;
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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null); // null = self
  const [loading, setLoading] = useState(true);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);

  // Sample medical conditions (in production, these would come from the database)
  const [conditions] = useState<MedicalCondition[]>([
    { name: "Vitamin D Deficiency", diagnosed_date: "2024-03-15", status: "managed" },
    { name: "Mild Anemia", diagnosed_date: "2024-01-10", status: "resolved" },
  ]);

  useEffect(() => {
    const getSupabaseUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setSupabaseUserId(session.user.id);
      }
    };
    getSupabaseUser();
  }, []);

  useEffect(() => {
    if (supabaseUserId) {
      fetchFamilyMembers();
      fetchUserProfile();
      fetchMedicalHistory();
    }
  }, [supabaseUserId, selectedMember]);

  const fetchUserProfile = async () => {
    if (!supabaseUserId) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", supabaseUserId)
      .maybeSingle();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const fetchFamilyMembers = async () => {
    if (!supabaseUserId) return;

    const { data, error } = await supabase
      .from("family_members")
      .select("id, name, relation, gender, medical_conditions")
      .eq("user_id", supabaseUserId);

    if (data) {
      setFamilyMembers(data);
    }
  };

  const fetchMedicalHistory = async () => {
    if (!supabaseUserId) return;
    setLoading(true);

    try {
      let query = supabase
        .from("reports")
        .select("id, generated_at, status, risk_level, ai_summary, test_id, family_member_id")
        .eq("user_id", supabaseUserId)
        .order("generated_at", { ascending: false })
        .limit(10);

      if (selectedMember) {
        query = query.eq("family_member_id", selectedMember);
      } else {
        query = query.is("family_member_id", null);
      }

      const { data, error } = await query;

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSelectedName = () => {
    if (!selectedMember) {
      return userProfile?.full_name || user?.displayName || "You";
    }
    const member = familyMembers.find((m) => m.id === selectedMember);
    return member?.name || "Unknown";
  };

  const getSelectedConditions = () => {
    if (selectedMember) {
      const member = familyMembers.find((m) => m.id === selectedMember);
      if (member?.medical_conditions && member.medical_conditions.length > 0) {
        return member.medical_conditions.map((condition) => ({
          name: condition,
          diagnosed_date: "",
          status: "active" as const,
        }));
      }
      return [];
    }
    return conditions;
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Medical History" />

      <div className="px-4 pb-6">
        {/* Family Member Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Select Member</span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Self */}
            <button
              onClick={() => setSelectedMember(null)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                selectedMember === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <Avatar className="w-12 h-12">
                <AvatarFallback className={selectedMember === null ? "bg-primary-foreground text-primary" : "bg-background"}>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium whitespace-nowrap">You</span>
            </button>

            {/* Family Members */}
            {familyMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                  selectedMember === member.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={selectedMember === member.id ? "bg-primary-foreground text-primary" : "bg-background"}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-xs font-medium whitespace-nowrap max-w-[60px] truncate">
                    {member.name.split(" ")[0]}
                  </p>
                  <p className={`text-[10px] ${selectedMember === member.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {member.relation}
                  </p>
                </div>
              </button>
            ))}

            {/* Add Family Member */}
            <button
              onClick={() => navigate("/family")}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/50 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">Add</span>
            </button>
          </div>
        </motion.div>

        {/* Selected Member Header */}
        <motion.div
          key={selectedMember}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 soft-card bg-gradient-to-r from-primary/10 to-primary/5"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {selectedMember ? getInitials(getSelectedName()) : <User className="w-6 h-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-foreground text-lg">{getSelectedName()}'s History</h3>
              <p className="text-sm text-muted-foreground">
                {selectedMember
                  ? familyMembers.find((m) => m.id === selectedMember)?.relation
                  : "Primary Account Holder"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          key={`stats-${selectedMember}`}
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
            <p className="text-2xl font-bold text-foreground">{getSelectedConditions().length}</p>
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
          key={`conditions-${selectedMember}`}
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

          {getSelectedConditions().length > 0 ? (
            <div className="space-y-3">
              {getSelectedConditions().map((condition, index) => (
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
                    {condition.diagnosed_date && (
                      <p className="text-xs text-muted-foreground">
                        Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                      </p>
                    )}
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
          key={`reports-${selectedMember}`}
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
              <p className="text-muted-foreground">No reports for {getSelectedName()}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/categories")}>
                Book a Test
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
              Add medications to track health better
            </p>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default MedicalHistoryScreen;
