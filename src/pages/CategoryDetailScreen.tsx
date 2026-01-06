import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getIconForKey } from "@/lib/iconMap";
import { Button } from "@/components/ui/button";

const fetchCategoryWithTests = async (id: string) => {
  const { data, error } = await supabase
    .from("test_categories")
    .select("id, name, description, icon, tests(id, name, price, discount_percent, original_price, report_time_hours, sample_type)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const CategoryDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: category, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategoryWithTests(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MobileLayout>
        <ScreenHeader title="Category" />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MobileLayout>
    );
  }

  if (isError || !category) {
    return (
      <MobileLayout>
        <ScreenHeader title="Category" />
        <div className="flex items-center justify-center h-[60vh] px-4 text-center">
          <p className="text-sm text-muted-foreground">Category not found or an error occurred.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <ScreenHeader title={category.name} />

      <div className="px-4 pb-32">
        <div className="mt-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            {(() => {
              const Icon = getIconForKey(category.icon ?? undefined);
              return Icon ? <Icon className="w-6 h-6 text-primary" /> : <span className="font-semibold text-primary">{category.name.charAt(0)}</span>;
            })()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
          </div>
        </div>

        {category.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="soft-card mt-4"
          >
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Tests in {category.name}</h2>

          <div className="space-y-3">
            {(category.tests || []).map((test: any) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="soft-card flex items-center justify-between cursor-pointer"
                onClick={() => navigate(`/test/select/${test.id}`)}
              >
                <div>
                  <h3 className="font-semibold text-foreground">{test.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Sample: {test.sample_type || "Blood"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{test.price}</p>
                  {test.discount_percent > 0 && (
                    <p className="text-xs text-success">{test.discount_percent}% OFF</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </MobileLayout>
  );
};

export default CategoryDetailScreen;
