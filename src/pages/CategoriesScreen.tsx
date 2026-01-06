import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Stethoscope } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getIconForKey } from "@/lib/iconMap";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  tests?: Array<any> | null;
}

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("test_categories")
    .select("id, name, description, icon, sort_order, is_active, tests(id)")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as Category[];
};

const CategoriesScreen = () => {
  const navigate = useNavigate();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <MobileLayout>
        <ScreenHeader title="Test Categories" showBack={false} />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MobileLayout>
    );
  }

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
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/categories/${category.id}`)}
              className="category-card"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-3`}>
                {/* If category icon is present map to lucide icon, else show initial */}
                {(() => {
                  const Icon = getIconForKey(category.icon ?? undefined);
                  return Icon ? <Icon className="w-6 h-6 text-primary-foreground" /> : <span className="font-semibold text-primary-foreground">{category.name.charAt(0)}</span>;
                })()}
              </div>
              <h3 className="font-semibold text-foreground text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{(category.tests || []).length} tests</p>
              {category.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{category.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popular Packages (unchanged) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-4 pb-6"
      >
        <h2 className="text-lg font-bold text-foreground mb-4">Popular Packages</h2>
        <div className="space-y-3">
          {[
            { name: "Essential Health Checkup", tests: 40, price: 999, originalPrice: 2499 },
            { name: "Comprehensive Health Package", tests: 80, price: 1999, originalPrice: 4999 },
            { name: "Advanced Full Body", tests: 100, price: 2999, originalPrice: 6999 },
          ].map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => navigate("/test/select", { 
                state: { 
                  test: { 
                    id: `package-${index}`,
                    name: pkg.name, 
                    price: pkg.price, 
                    original_price: pkg.originalPrice,
                    discount_percent: Math.round((1 - pkg.price / pkg.originalPrice) * 100),
                    report_time_hours: 24,
                    sample_type: "Blood"
                  } 
                } 
              })}
              className="soft-card flex items-center gap-4 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground">{pkg.tests} tests included</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">₹{pkg.price}</p>
                <p className="text-xs text-muted-foreground line-through">₹{pkg.originalPrice}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </MobileLayout>
  );
};

export default CategoriesScreen;