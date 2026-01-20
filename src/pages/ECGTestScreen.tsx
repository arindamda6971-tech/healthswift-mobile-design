import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartPulse,
  Clock,
  MapPin,
  CheckCircle,
  Star,
  Shield,
  Building2,
  Home,
  ShoppingCart,
  ChevronRight,
  Sparkles,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

// Calculate mock distance based on lat/long
const calculateDistance = (lat: number | null, lng: number | null): string => {
  if (!lat || !lng) return "2.5 km";
  const baseDistance = Math.abs((lat - 19.1) * 10 + (lng - 72.9) * 5);
  return `${(baseDistance % 5 + 0.5).toFixed(1)} km`;
};

// Check if lab is currently open
const isLabOpen = (openTime: string, closeTime: string): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const openHour = parseInt(openTime.split(':')[0]);
  const closeHour = parseInt(closeTime.split(':')[0]);
  return currentHour >= openHour && currentHour < closeHour;
};

// ECG Test details
const ecgTestDetails = {
  name: "12-Lead ECG Test",
  description: "Complete heart rhythm analysis with AI-powered insights",
  duration: "15 mins",
  reportTime: "2 hours",
  includes: [
    "12-Lead ECG Recording",
    "Heart Rate Analysis",
    "Rhythm Assessment",
    "AI-Powered Interpretation",
    "Cardiologist Review",
    "Digital Report",
  ],
  preparation: [
    "Avoid caffeine 24 hours before test",
    "Wear loose, comfortable clothing",
    "Inform about heart medications",
    "Relax and avoid exercise 2-3 hours before",
  ],
};

// Home collection option
const homeCollectionOption = {
  id: "home-ecg",
  name: "At-Home ECG",
  price: 599,
  description: "Technician visits your home with portable 12-Lead ECG machine",
  features: ["No travel needed", "Portable equipment", "Same day slots"],
};

const ECGTestScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, pendingItem, confirmReplace, cancelReplace, itemCount } = useCart();
  const [labs, setLabs] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ECG labs from database
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
          description: "Failed to load ECG labs. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchECGLabs();
  }, [toast]);

  const handleAddToCart = (labId: string, labName: string, price: number) => {
    const success = addToCart({
      id: `ecg-${labId}`,
      name: "12-Lead ECG Test",
      price: price,
      labId: labId,
      labName: labName,
    });
    
    if (success) {
      toast({
        title: "Added to Cart",
        description: `ECG Test from ${labName} added to cart`,
      });
    }
  };

  const handleConfirmReplace = () => {
    confirmReplace();
    toast({
      title: "Cart Updated",
      description: "Your cart has been updated with the new item",
    });
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
          {/* Background Pattern */}
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
                <h2 className="text-xl font-bold">{ecgTestDetails.name}</h2>
                <p className="text-sm opacity-90 mt-0.5">{ecgTestDetails.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{ecgTestDetails.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Report in {ecgTestDetails.reportTime}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">What's Included</h3>
          <div className="grid grid-cols-2 gap-2">
            {ecgTestDetails.includes.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-xs text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Home Collection Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            At-Home Collection
            <Badge className="bg-success/20 text-success text-[10px]">Popular</Badge>
          </h3>
          
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{homeCollectionOption.name}</h4>
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{homeCollectionOption.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  {homeCollectionOption.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] bg-white/50">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-primary">₹{homeCollectionOption.price}</p>
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-primary hover:bg-primary/90"
              onClick={() => handleAddToCart('home', 'At-Home Collection', homeCollectionOption.price)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </motion.div>
        </motion.div>

        {/* Available Labs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" />
              Partner Labs
            </h3>
            <Badge variant="outline" className="text-xs">
              {labs.length} available
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {labs.map((lab, index) => {
                const isOpen = isLabOpen(lab.opening_time, lab.closing_time);
                const distance = calculateDistance(lab.latitude, lab.longitude);
                
                return (
                  <motion.div
                    key={lab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-3">
                      {/* Lab Logo */}
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {lab.logo_url ? (
                          <img 
                            src={lab.logo_url} 
                            alt={lab.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Building2 className={`w-7 h-7 text-muted-foreground ${lab.logo_url ? 'hidden' : ''}`} />
                      </div>

                      {/* Lab Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground text-sm line-clamp-1">{lab.name}</h4>
                              {lab.is_verified && (
                                <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{lab.address}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-foreground">₹{lab.ecg_price}</p>
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium text-foreground">{lab.rating}</span>
                            <span className="text-xs text-muted-foreground">({lab.reviews_count})</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{distance}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${isOpen ? 'border-success text-success' : 'border-destructive text-destructive'}`}
                          >
                            {isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          size="sm"
                          className="w-full mt-3 h-9"
                          onClick={() => handleAddToCart(lab.id, lab.name, lab.ecg_price)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Preparation Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
        >
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Preparation Tips
          </h4>
          <ul className="space-y-2">
            {ecgTestDetails.preparation.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-2xl bg-muted/50"
        >
          <h4 className="font-semibold text-foreground mb-3">Why Choose HealthSwift?</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, text: "NABL Accredited", color: "text-primary" },
              { icon: Sparkles, text: "AI Analysis", color: "text-purple-500" },
              { icon: Clock, text: "Quick Reports", color: "text-success" },
              { icon: Users, text: "Expert Team", color: "text-secondary" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lab Conflict Dialog */}
      <AlertDialog open={!!pendingItem} onOpenChange={() => cancelReplace()}>
        <AlertDialogContent className="max-w-[90%] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Different Lab Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart contains items from {pendingItem?.existingLabName}. Would you like to replace your cart with this item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelReplace}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace}>Replace Cart</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
};

export default ECGTestScreen;
