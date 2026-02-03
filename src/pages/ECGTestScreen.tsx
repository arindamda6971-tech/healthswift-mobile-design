import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartPulse,
  Clock,
  Home,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

interface DiagnosticCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  logo_url: string | null;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  ecg_price: number;
  opening_time: string;
  closing_time: string;
  latitude: number | null;
  longitude: number | null;
  home_collection_available: boolean;
}

const homeCollectionOption = {
  id: "home-ecg",
  name: "At-Home ECG",
  price: 599,
  description: "Technician visits your home",
  icon: Home,
};

const ECGTestScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, itemCount } = useCart();
  const [labs, setLabs] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchECGLabs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('diagnostic_centers')
          .select('*')
          .eq('ecg_available', true)
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (error) throw error;
        setLabs(data || []);
      } catch (error) {
        console.error('Error fetching labs:', error);
        toast({
          title: "Error",
          description: "Failed to load ECG tests. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchECGLabs();
  }, [toast]);

  const handleHomeCollection = () => {
    const success = addToCart({
      id: `ecg-${homeCollectionOption.id}`,
      name: homeCollectionOption.name,
      price: homeCollectionOption.price,
      labId: homeCollectionOption.id,
      labName: homeCollectionOption.name,
    });
    
    if (success) {
      toast({
        title: "Added to Cart",
        description: `${homeCollectionOption.name} added to cart`,
      });
    }
  };

  const handleNavigateToLab = (lab: DiagnosticCenter) => {
    navigate(`/ecg-doctors/${lab.id}`, { state: { lab } });
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader 
        title="Book ECG Test" 
        rightAction={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Button>
        }
      />

      <div className="px-4 pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-destructive via-destructive/90 to-destructive/80 text-destructive-foreground relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <HeartPulse className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">12-Lead ECG Test</h2>
                <p className="text-sm opacity-90 mt-0.5">Complete heart rhythm analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Clock className="w-4 h-4" />
                <span>15 mins</span>
              </div>
              <Badge className="bg-white/20 text-white border-0">₹399</Badge>
            </div>
          </div>
        </motion.div>

        {/* At-Home Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleHomeCollection}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{homeCollectionOption.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{homeCollectionOption.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xl font-bold text-primary">₹{homeCollectionOption.price}</p>
                <ChevronRight className="w-5 h-5 text-primary mt-1" />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Select a Lab or Doctor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8"
        >
          <h3 className="font-semibold text-foreground mb-4">Select a Center or Doctor</h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : labs.length === 0 ? (
            <div className="p-6 rounded-xl bg-muted/50 text-center">
              <p className="text-muted-foreground">No centers available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labs.map((lab, index) => (
                <motion.button
                  key={lab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigateToLab(lab)}
                  className="w-full p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1">{lab.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{lab.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          ⭐ {lab.rating} ({lab.reviews_count})
                        </Badge>
                        {lab.home_collection_available && (
                          <Badge variant="secondary" className="text-xs">Home</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">₹{lab.ecg_price}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

    </MobileLayout>
  );
};

export default ECGTestScreen;
