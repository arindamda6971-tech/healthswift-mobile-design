import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartPulse,
  Clock,
  Home,
  ShoppingCart,
  ChevronRight,
  Stethoscope,
  Award,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews_count: number;
  fee: number;
  availability: string;
  qualification: string;
}

const homeCollectionOption = {
  id: "home-ecg",
  name: "At-Home ECG",
  price: 599,
  description: "Technician visits your home",
  icon: Home,
};

// Mock doctors data
const mockDoctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiology",
    experience: 12,
    rating: 4.9,
    reviews_count: 324,
    fee: 599,
    availability: "9 AM - 5 PM",
    qualification: "MD (Cardiology), DM (Cardiology)",
  },
  {
    id: "doc-2",
    name: "Dr. Priya Sharma",
    specialization: "Cardiac Specialist",
    experience: 8,
    rating: 4.8,
    reviews_count: 256,
    fee: 499,
    availability: "10 AM - 6 PM",
    qualification: "MD (Cardiology), FACC",
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Singh",
    specialization: "Cardiac Surgeon",
    experience: 15,
    rating: 4.9,
    reviews_count: 512,
    fee: 799,
    availability: "8 AM - 4 PM",
    qualification: "MCh (Cardiac Surgery), FACS",
  },
  {
    id: "doc-4",
    name: "Dr. Anjali Gupta",
    specialization: "Cardiologist",
    experience: 10,
    rating: 4.7,
    reviews_count: 198,
    fee: 549,
    availability: "11 AM - 7 PM",
    qualification: "MD (Cardiology), FACC",
  },
  {
    id: "doc-5",
    name: "Dr. Arjun Reddy",
    specialization: "ECG Specialist",
    experience: 7,
    rating: 4.8,
    reviews_count: 289,
    fee: 399,
    availability: "9 AM - 6 PM",
    qualification: "MD (Internal Medicine)",
  },
];

const ECGTestScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, itemCount } = useCart();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch doctors from database
    // For now, use mock data
    setDoctors(mockDoctors);
    setLoading(false);
  }, []);

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

  const handleBookDoctor = (doctor: Doctor) => {
    const success = addToCart({
      id: `ecg-${doctor.id}`,
      name: `12-Lead ECG Test with ${doctor.name}`,
      price: doctor.fee,
      labId: doctor.id,
      labName: doctor.name,
    });

    if (success) {
      toast({
        title: "Added to Cart",
        description: `${doctor.name}'s ECG test added to cart`,
      });
    }
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

        {/* Select a Doctor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8"
        >
          <h3 className="font-semibold text-foreground mb-4">Available Doctors</h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-6 rounded-xl bg-muted/50 text-center">
              <p className="text-muted-foreground">No doctors available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  {/* Doctor Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">{doctor.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{doctor.specialization}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doctor.qualification}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-primary">₹{doctor.fee}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Consultation</p>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/50">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{doctor.experience}y</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Experience</p>
                    </div>
                    <div className="text-center border-l border-r border-border/50">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-foreground">{doctor.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">({doctor.reviews_count})</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-semibold text-foreground">Available</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{doctor.availability}</p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button
                    className="w-full mt-3 h-10 bg-primary hover:bg-primary/90"
                    onClick={() => handleBookDoctor(doctor)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Book Now - ₹{doctor.fee}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            💡 Quick Tips
          </h4>
          <ul className="space-y-1 text-sm text-foreground">
            <li>• All doctors are NABL certified and experienced cardiologists</li>
            <li>• Fees are inclusive of test and consultation</li>
            <li>• Reports will be available within 2 hours</li>
          </ul>
        </motion.div>
      </div>

    </MobileLayout>
  );
};

export default ECGTestScreen;
