import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ShoppingCart,
  Plus,
  Check,
  AlertCircle,
  HeartPulse,
  Activity,
  Shield,
  Clock,
  Home,
  Star,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";

interface PackageTest {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface PackageData {
  id: string;
  name: string;
  description: string | null;
  tests_count: number;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  icon: string | null;
  color: string | null;
  lab_id: string | null;
  lab_name: string | null;
  lab_logo: string | null;
  tests?: PackageTest[];
}

interface LabOption {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  priceMultiplier: number;
  accredited: boolean;
  homeCollection: boolean;
  reportTime: string;
}

// Available labs for packages
const labOptionsMap: Record<string, LabOption[]> = {
  default: [
    { 
      id: "lal-pathlabs", 
      name: "Dr. Lal PathLabs", 
      rating: 4.8, 
      reviews: 2500,
      priceMultiplier: 1,
      accredited: true,
      homeCollection: true,
      reportTime: "Same day"
    },
    { 
      id: "metropolis", 
      name: "Metropolis Healthcare", 
      rating: 4.7, 
      reviews: 1800,
      priceMultiplier: 1.05,
      accredited: true,
      homeCollection: true,
      reportTime: "Next day"
    },
    { 
      id: "srl", 
      name: "SRL Diagnostics", 
      rating: 4.6, 
      reviews: 1500,
      priceMultiplier: 0.95,
      accredited: true,
      homeCollection: true,
      reportTime: "Same day"
    },
    { 
      id: "thyrocare", 
      name: "Thyrocare", 
      rating: 4.5, 
      reviews: 3200,
      priceMultiplier: 0.85,
      accredited: true,
      homeCollection: true,
      reportTime: "Next day"
    },
    { 
      id: "apollo", 
      name: "Apollo Diagnostics", 
      rating: 4.7, 
      reviews: 2100,
      priceMultiplier: 1.1,
      accredited: true,
      homeCollection: true,
      reportTime: "Same day"
    },
  ],
};

const defaultIncludes = [
  { icon: Home, text: "Home sample collection" },
  { icon: Shield, text: "NABL certified labs" },
  { icon: Clock, text: "Fast reports" },
  { icon: HeartPulse, text: "Comprehensive tests" },
];

const PackageDetailScreen = () => {
  const navigate = useNavigate();
  const { packageId } = useParams<{ packageId: string }>();
  const { addToCart, pendingItem, confirmReplace, cancelReplace } = useCart();
  
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string>("lal-pathlabs");
  const [packageTests, setPackageTests] = useState<PackageTest[]>([]);
  const [fetchingTests, setFetchingTests] = useState(false);

  // Fetch package data from Supabase
  const fetchPackageData = useCallback(async () => {
    if (!packageId) {
      setError("Package ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("test_packages")
        .select(`
          id, name, description, tests_count, price, original_price, discount_percent, icon, color,
          diagnostic_centers!diagnostic_center_id (id, name, logo_url)
        `)
        .eq("id", packageId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching package:", fetchError);
        setError("Failed to load package details");
      } else if (!data) {
        setError("Package not found");
      } else {
        setPackageData({
          id: data.id,
          name: data.name,
          description: data.description,
          tests_count: data.tests_count || 0,
          price: data.price,
          original_price: data.original_price || undefined,
          discount_percent: data.discount_percent || undefined,
          icon: data.icon,
          color: data.color,
          lab_id: data.diagnostic_centers?.id,
          lab_name: data.diagnostic_centers?.name,
          lab_logo: data.diagnostic_centers?.logo_url,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  // Fetch tests included in the package
  const fetchPackageTests = useCallback(async () => {
    if (!packageId) return;

    try {
      setFetchingTests(true);
      const { data, error: fetchError } = await supabase
        .from("package_tests")
        .select(`
          test_id,
          tests!test_id (id, name, price, category: test_category)
        `)
        .eq("package_id", packageId);

      if (fetchError) {
        console.error("Error fetching package tests:", fetchError);
      } else if (data && data.length > 0) {
        const tests = data
          .map((pt: any) => ({
            id: pt.tests?.id,
            name: pt.tests?.name,
            price: pt.tests?.price,
            category: pt.tests?.test_category || "General",
          }))
          .filter((t: any) => t.id && t.name);
        setPackageTests(tests);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setFetchingTests(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchPackageData();
    fetchPackageTests();
  }, [fetchPackageData, fetchPackageTests]);

  if (loading) {
    return (
      <MobileLayout>
        <ScreenHeader title="Package Details" />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MobileLayout>
    );
  }

  if (error || !packageData) {
    return (
      <MobileLayout>
        <ScreenHeader title="Package Details" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {error || "Package not found"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            The package you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/packages")}>
            Browse Packages
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const labOptions = packageData.lab_id 
    ? [labOptionsMap.default[0]] // If specific lab, show that lab
    : labOptionsMap.default;

  const selectedLab = labOptions.find(lab => lab.id === selectedLabId) || labOptions[0];
  const displayPrice = Math.round(packageData.price * selectedLab.priceMultiplier);
  const discountPercent = packageData.discount_percent || 
    (packageData.original_price 
      ? Math.round((1 - displayPrice / packageData.original_price) * 100) 
      : 0);

  const handleAddToCart = () => {
    const success = addToCart({
      id: `${packageData.id}-${selectedLab.id}`,
      name: packageData.name,
      price: displayPrice,
      labId: selectedLab.id,
      labName: selectedLab.name,
      isPackage: true,
      testCount: packageData.tests_count,
    });

    if (success) {
      toast.success(`${packageData.name} added to cart from ${selectedLab.name}`);
    }
  };

  const handleConfirmReplace = () => {
    confirmReplace();
    toast.success("Cart replaced with package");
  };

  return (
    <MobileLayout>
      <ScreenHeader title="Package Details" />

      <div className="px-4 pb-32">
        {/* Package Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card mt-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {discountPercent > 0 && (
                <Badge variant="softSuccess" className="mb-2">{discountPercent}% OFF</Badge>
              )}
              <h1 className="text-lg font-bold text-foreground">{packageData.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {packageData.tests_count} Tests Included
                </Badge>
                {packageData.lab_name && (
                  <p className="text-xs text-muted-foreground">by {packageData.lab_name}</p>
                )}
              </div>
              {packageData.description && (
                <p className="text-sm text-muted-foreground mt-2">{packageData.description}</p>
              )}
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <p className="font-bold text-lg text-foreground">₹{displayPrice}</p>
              {packageData.original_price && packageData.original_price > displayPrice && (
                <p className="text-xs text-muted-foreground line-through">₹{packageData.original_price}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">per package</p>
            </div>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 mt-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-3">What's Included</h2>
          <div className="soft-card space-y-3">
            {defaultIncludes.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-success" />
                </div>
                <span className="text-foreground text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tests in Package */}
        {packageTests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-3">
              Tests in this Package ({packageTests.length})
            </h2>
            <div className="soft-card space-y-2 max-h-64 overflow-y-auto">
              {packageTests.map((test, index) => (
                <div key={test.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{test.name}</p>
                      <p className="text-xs text-muted-foreground">{test.category}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground ml-2 flex-shrink-0">₹{test.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lab Selection */}
        {!packageData.lab_id && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 mb-4"
            >
              <h2 className="text-lg font-bold text-foreground">Choose Your Lab</h2>
              <p className="text-sm text-muted-foreground">Select a lab to book this package</p>
            </motion.div>

            <div className="space-y-3">
              {labOptions.map((lab, index) => {
                const labPrice = Math.round(packageData.price * lab.priceMultiplier);

                return (
                  <motion.div
                    key={lab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => setSelectedLabId(lab.id)}
                    className={`soft-card cursor-pointer transition-all ${
                      selectedLabId === lab.id 
                        ? "border-primary ring-1 ring-primary" 
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{lab.name}</h3>
                          {selectedLabId === lab.id && (
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>{lab.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{lab.reviews.toLocaleString()} reviews</span>
                          <span>•</span>
                          <span>{lab.reportTime}</span>
                        </div>
                        {lab.homeCollection && (
                          <p className="text-[10px] text-success font-medium mt-1">✓ Home collection available</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-foreground">₹{labPrice}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Pending Item Replace Dialog */}
        <AnimatePresence>
          {pendingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end"
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="w-full bg-background rounded-t-2xl p-4"
              >
                <h3 className="font-bold text-foreground mb-2">Replace Cart Items?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your cart has items from another lab. Do you want to replace them?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={cancelReplace}
                  >
                    Keep Both
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConfirmReplace}
                  >
                    Replace Cart
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add to Cart Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <Button
          className="w-full gap-2 shadow-lg"
          size="lg"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-5 h-5" />
          Add Package to Cart
        </Button>
      </motion.div>
    </MobileLayout>
  );
};

export default PackageDetailScreen;
