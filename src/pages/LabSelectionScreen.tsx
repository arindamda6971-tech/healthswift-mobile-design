import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Star,
  Clock,
  Shield,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// Labs with pricing variations
const labs = [
  {
    id: "lal-pathlabs",
    name: "Dr. Lal PathLabs",
    rating: 4.8,
    reviews: 2500,
    priceMultiplier: 1,
    accredited: true,
    homeCollection: true,
    reportTime: "Same day",
  },
  {
    id: "metropolis",
    name: "Metropolis Healthcare",
    rating: 4.7,
    reviews: 1800,
    priceMultiplier: 1.05,
    accredited: true,
    homeCollection: true,
    reportTime: "Next day",
  },
  {
    id: "srl",
    name: "SRL Diagnostics",
    rating: 4.6,
    reviews: 1500,
    priceMultiplier: 0.95,
    accredited: true,
    homeCollection: true,
    reportTime: "Same day",
  },
  {
    id: "thyrocare",
    name: "Thyrocare",
    rating: 4.5,
    reviews: 3200,
    priceMultiplier: 0.85,
    accredited: true,
    homeCollection: true,
    reportTime: "Next day",
  },
  {
    id: "apollo",
    name: "Apollo Diagnostics",
    rating: 4.7,
    reviews: 2100,
    priceMultiplier: 1.1,
    accredited: true,
    homeCollection: true,
    reportTime: "Same day",
  },
];

const LabSelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as { patientName?: string; patientAge?: number | string; patientGender?: string } | null) || null;
  const { items, updateLabForItems, subtotal } = useCart();
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if cart has items
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
  }, [items, navigate]);

  if (items.length === 0) {
    return (
      <MobileLayout>
        <ScreenHeader title="Select Lab" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No items in cart
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please add tests to cart before selecting a lab.
          </p>
          <Button onClick={() => navigate("/cart")}>
            Back to Cart
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const calculateLabPrice = (basePriceMultiplier: number) => {
    return Math.round(subtotal * basePriceMultiplier);
  };

  const handleSelectLab = async (labId: string, labName: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Update all items in cart with the selected lab
      updateLabForItems(labId, labName);
      toast.success(`${labName} selected for your tests`);
      
        // Navigate to payment screen with selection (preserve patient info if present)
      setTimeout(() => {
        navigate("/payment", { state: { patientName: locationState?.patientName, patientAge: locationState?.patientAge, patientGender: locationState?.patientGender } });
      }, 500);
    } catch (error) {
      console.error("Error selecting lab:", error);
      toast.error("Failed to select lab. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MobileLayout>
      <ScreenHeader title="Select Lab" />

      <div className="px-4 pb-32">
        {/* Cart Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card mt-4"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
          </h3>
          
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground flex-1 truncate pr-2">
                  {item.name}
                </span>
                <span className="font-medium text-foreground">
                  ₹{item.price} × {item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">₹{subtotal}</span>
            </div>
          </div>
        </motion.div>

        {/* Lab Selection Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 mb-4"
        >
          <h2 className="text-lg font-bold text-foreground">Choose Your Favourite Lab</h2>
          <p className="text-sm text-muted-foreground">Select a lab to book your tests</p>
        </motion.div>

        {/* Lab Options */}
        <div className="space-y-3">
          {labs.map((lab, index) => {
            const labTotalPrice = calculateLabPrice(lab.priceMultiplier);
            const originalTotalPrice = calculateLabPrice(1);
            const savings = originalTotalPrice - labTotalPrice;

            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`soft-card cursor-pointer transition-all ${
                  selectedLabId === lab.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Lab icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>

                  {/* Lab info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm truncate">
                        {lab.name}
                      </h3>
                      {lab.accredited && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          NABL
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span>{lab.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{lab.reviews.toLocaleString()} reviews</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{lab.reportTime}</span>
                      </div>
                      {lab.homeCollection && (
                        <div className="flex items-center gap-1 text-success">
                          <Shield className="w-3 h-3" />
                          <span>Home Collection</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-foreground">₹{labTotalPrice}</p>
                    {lab.priceMultiplier < 1 && savings > 0 && (
                      <p className="text-[10px] text-success">Save ₹{savings}</p>
                    )}
                    <div className="mt-3">
                      <Button
                        variant={selectedLabId === lab.id ? "hero" : "outline"}
                        size="sm"
                        onClick={() => handleSelectLab(lab.id, lab.name)}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {selectedLabId === lab.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-3 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-xs text-muted-foreground">
            💡 <span className="font-medium text-foreground">Prices vary by lab</span> based on their infrastructure and service quality. All labs are NABL certified.
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default LabSelectionScreen;
