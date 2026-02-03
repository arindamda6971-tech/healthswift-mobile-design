import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight, HeartPulse, Activity, Shield } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";

const PackagesScreen = () => {
  const [packages, setPackages] = useState<any[]>([]);

  const fetchPackages = useCallback(async () => {
    const { data } = await supabase
      .from("test_packages")
      .select(`
        id, name, tests_count, price, original_price, discount_percent, icon, color,
        diagnostic_centers!diagnostic_center_id (id, name, logo_url)
      `)
      .eq("is_active", true)
      .order("is_popular", { ascending: false });
    if (data) {
      setPackages(data.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        tests_count: pkg.tests_count || 0,
        price: pkg.price,
        original_price: pkg.original_price || undefined,
        discount_percent: pkg.discount_percent || undefined,
        icon: pkg.icon || undefined,
        color: pkg.color || undefined,
        lab_name: pkg.diagnostic_centers?.name || undefined,
        lab_logo: pkg.diagnostic_centers?.logo_url || undefined
      })));
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <MobileLayout>
      <ScreenHeader title="Packages" />

      <div className="px-4 py-4 space-y-3">
        {packages.length === 0 && (
          <div className="text-center py-12">
            <HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No packages available</p>
          </div>
        )}

        {packages.map((pkg, index) => {
          const gradientColors = [
            "from-primary to-primary/60",
            "from-success to-success/60",
            "from-secondary to-secondary/60",
            "from-destructive to-destructive/60",
            "from-accent to-accent/60",
          ];
          const IconComponent = pkg.icon === "HeartPulse" ? HeartPulse : 
                               pkg.icon === "Activity" ? Activity : 
                               pkg.icon === "Shield" ? Shield : HeartPulse;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="soft-card flex items-center gap-4 cursor-pointer"
              onClick={() => window.location.assign(`/test/select/${pkg.id}`)}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pkg.color || gradientColors[index % gradientColors.length]} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground">{pkg.tests_count} tests included</p>
                {pkg.lab_name && (
                  <p className="text-[10px] text-primary font-medium mt-0.5">by {pkg.lab_name}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-foreground">₹{pkg.price}</p>
                <p className="text-[10px] text-muted-foreground">starting price</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </MobileLayout>
  );
};

export default PackagesScreen;
