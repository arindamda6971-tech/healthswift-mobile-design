import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";

const PackagesScreen = () => {
  const navigate = useNavigate();
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
        lab_id: pkg.diagnostic_centers?.id || undefined,
        lab_name: pkg.diagnostic_centers?.name || undefined,
        lab_logo: pkg.diagnostic_centers?.logo_url || undefined,
      })));
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Build unique labs map with counts
  const labs = useMemo(() => {
    const map = new Map<string, { id?: string; name?: string; logo?: string; count: number }>();
    packages.forEach((p) => {
      const key = p.lab_id || p.lab_name || p.id; // fallback key
      if (!map.has(key)) {
        map.set(key, { id: p.lab_id, name: p.lab_name || `Lab ${key}`, logo: p.lab_logo, count: 1 });
      } else {
        const entry = map.get(key)!;
        entry.count += 1;
        map.set(key, entry);
      }
    });
    return Array.from(map.values());
  }, [packages]);

  return (
    <MobileLayout>
      <ScreenHeader title="Labs Offering Packages" />

      <div className="px-4 py-4 space-y-3">
        {labs.length === 0 && (
          <div className="text-center py-12">
            <HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No labs found offering packages</p>
          </div>
        )}

        {labs.map((lab, index) => (
          <motion.div
            key={lab.id || `${lab.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="soft-card p-4 cursor-pointer"
            onClick={() => {
              if (lab.id) navigate(`/lab/${lab.id}`);
              else navigate('/partner-labs');
            }}
          >
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground truncate">{lab.name}</h3>
                  <p className="text-xs text-muted-foreground">{lab.count} package{lab.count > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </MobileLayout>
  );
};

export default PackagesScreen;
