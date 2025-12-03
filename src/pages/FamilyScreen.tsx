import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Droplets,
  Heart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";

const familyMembers = [
  {
    id: 1,
    name: "John Doe",
    relation: "Self",
    age: 28,
    gender: "Male",
    bloodGroup: "O+",
    lastTest: "Nov 28, 2024",
    conditions: ["None"],
    isPrimary: true,
  },
  {
    id: 2,
    name: "Priya Doe",
    relation: "Wife",
    age: 26,
    gender: "Female",
    bloodGroup: "A+",
    lastTest: "Nov 15, 2024",
    conditions: ["Thyroid"],
    isPrimary: false,
  },
  {
    id: 3,
    name: "Rajesh Doe",
    relation: "Father",
    age: 58,
    gender: "Male",
    bloodGroup: "B+",
    lastTest: "Oct 30, 2024",
    conditions: ["Diabetes", "Hypertension"],
    isPrimary: false,
  },
  {
    id: 4,
    name: "Sunita Doe",
    relation: "Mother",
    age: 55,
    gender: "Female",
    bloodGroup: "AB+",
    lastTest: "Oct 30, 2024",
    conditions: ["Arthritis"],
    isPrimary: false,
  },
];

const FamilyScreen = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState(familyMembers);

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader
        title="Family Members"
        rightAction={
          <Button variant="soft" size="sm">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        }
      />

      <div className="px-4 pb-8">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20"
        >
          <p className="text-sm text-foreground">
            Manage health profiles for your family members. Book tests for anyone and track their health all in one place.
          </p>
        </motion.div>

        {/* Family members list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 space-y-3"
        >
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="soft-card"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  member.gender === "Male" ? "bg-primary/10" : "bg-pink-100"
                }`}>
                  <User className={`w-7 h-7 ${
                    member.gender === "Male" ? "text-primary" : "text-pink-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    {member.isPrimary && <Badge variant="soft">Primary</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.relation} • {member.age} yrs • {member.gender}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplets className="w-3 h-3" />
                      {member.bloodGroup}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Last test: {member.lastTest}
                    </div>
                  </div>
                  {member.conditions.length > 0 && member.conditions[0] !== "None" && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.conditions.map((condition, i) => (
                        <Badge key={i} variant="softWarning">{condition}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="soft" size="sm" className="flex-1" onClick={() => navigate("/categories")}>
                  Book Test
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                  <Heart className="w-4 h-4" />
                  Reports
                </Button>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Edit className="w-4 h-4" />
                </Button>
                {!member.isPrimary && (
                  <Button variant="ghost" size="icon" className="w-9 h-9 text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add member button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button variant="outline" className="w-full" size="lg">
            <Plus className="w-5 h-5" />
            Add Family Member
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default FamilyScreen;
