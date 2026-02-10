import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Droplets,
  Activity,
  Pill,
  Sun,
  Heart,
  UserCheck,
  Stethoscope,
  Baby,
  Brain,
  Bone,
  Sparkles,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Badge } from "@/components/ui/badge";

const categories = [
  { icon: Droplets, name: "Blood Tests", tests: 45, color: "bg-destructive/10 text-destructive" },
  { icon: Activity, name: "Liver Function", tests: 12, color: "bg-success/10 text-success" },
  { icon: Pill, name: "Thyroid", tests: 8, color: "bg-primary/10 text-primary" },
  { icon: Sun, name: "Vitamin", tests: 15, color: "bg-warning/10 text-warning" },
  { icon: Heart, name: "Women's Health", tests: 28, color: "bg-pink-100 text-pink-600" },
  { icon: UserCheck, name: "Men's Health", tests: 22, color: "bg-secondary/10 text-secondary" },
  { icon: Stethoscope, name: "Full Body", tests: 35, color: "bg-primary/10 text-primary" },
  { icon: Baby, name: "Pregnancy", tests: 18, color: "bg-purple-100 text-purple-600" },
  { icon: Brain, name: "Hormones", tests: 20, color: "bg-indigo-100 text-indigo-600" },
  { icon: Bone, name: "Bone & Joint", tests: 14, color: "bg-orange-100 text-orange-600" },
];

const CategoriesScreen = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <ScreenHeader title="Test Categories" showBack={false} />

      {/* AI Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Not sure what to test?</p>
            <p className="text-xs text-muted-foreground">Let AI recommend tests for you</p>
          </div>
          <Badge variant="ai">AI</Badge>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className="px-4 mt-6 pb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate("/test/select", { 
                state: { 
                  test: { 
                    id: `category-${index}`,
                    name: category.name, 
                    price: 499 + (index * 100), 
                    original_price: 999 + (index * 100),
                    discount_percent: 40,
                    report_time_hours: 24,
                    sample_type: "Blood"
                  } 
                } 
              })}
              className="category-card"
            >
              <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center mb-3`}>
                <category.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{category.tests} tests</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popular Packages removed as requested */}
    </MobileLayout>
  );
};

export default CategoriesScreen;
