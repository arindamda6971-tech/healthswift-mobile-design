import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  Clock,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Home,
  Building2,
  Coffee,
  Pill,
  Star,
  Phone,
  ArrowLeft,
  Sparkles,
  Shield,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const timeSlots = [
  { id: 1, time: "7:00 AM - 8:00 AM", available: true },
  { id: 2, time: "8:00 AM - 9:00 AM", available: true },
  { id: 3, time: "9:00 AM - 10:00 AM", available: false },
  { id: 4, time: "10:00 AM - 11:00 AM", available: true },
  { id: 5, time: "11:00 AM - 12:00 PM", available: true },
  { id: 6, time: "2:00 PM - 3:00 PM", available: true },
  { id: 7, time: "3:00 PM - 4:00 PM", available: false },
  { id: 8, time: "4:00 PM - 5:00 PM", available: true },
];

const preparationSteps = [
  {
    icon: Coffee,
    title: "Avoid Caffeine",
    description: "No coffee, tea, or energy drinks 24 hours before the test",
  },
  {
    icon: Pill,
    title: "Medication Check",
    description: "Inform about any heart medications you're taking",
  },
  {
    icon: AlertCircle,
    title: "Comfortable Clothing",
    description: "Wear loose, comfortable clothes for easy electrode placement",
  },
  {
    icon: CheckCircle,
    title: "Relax Before Test",
    description: "Avoid strenuous exercise 2-3 hours before the test",
  },
];

// Calculate mock distance based on lat/long
const calculateDistance = (lat: number | null, lng: number | null): string => {
  if (!lat || !lng) return "2.5 km";
  // Mock calculation - in real app, use user's location
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

type Step = 'location' | 'lab-selection' | 'booking';

const ECGTestScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('location');
  const [locationType, setLocationType] = useState<'home' | 'lab' | null>(null);
  const [labs, setLabs] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLab, setSelectedLab] = useState<DiagnosticCenter | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
    };
  };

  // Fetch ECG labs from database
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

  useEffect(() => {
    if (step === 'lab-selection' && locationType === 'lab') {
      fetchECGLabs();
    }
  }, [step, locationType]);

  const handleLocationSelect = (type: 'home' | 'lab') => {
    setLocationType(type);
    if (type === 'home') {
      setStep('booking');
    } else {
      setStep('lab-selection');
    }
  };

  const handleLabSelect = (lab: DiagnosticCenter) => {
    setSelectedLab(lab);
    setStep('booking');
  };

  const handleBack = () => {
    if (step === 'booking') {
      if (locationType === 'lab') {
        setStep('lab-selection');
        setSelectedLab(null);
      } else {
        setStep('location');
      }
      setSelectedDate(null);
      setSelectedSlot(null);
    } else if (step === 'lab-selection') {
      setStep('location');
      setLocationType(null);
    } else {
      navigate(-1);
    }
  };

  const getPrice = () => {
    if (locationType === 'home') return 599;
    if (selectedLab) return selectedLab.ecg_price;
    return 449;
  };

  const handleBooking = () => {
    // Add to cart logic here
    toast({
      title: "ECG Test Added",
      description: `Your ECG test ${selectedLab ? `at ${selectedLab.name}` : 'at home'} has been added to cart.`,
    });
    navigate('/cart');
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader 
        title={step === 'lab-selection' ? 'Select ECG Lab' : 'ECG Test Booking'} 
        onBack={handleBack}
      />

      <div className="px-4 pb-32">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive-foreground/20 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">12-Lead ECG Test</h2>
              <p className="text-sm opacity-90">Complete heart rhythm analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">15 mins</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Report in 2 hours</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Location Selection */}
          {step === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Where would you like your ECG test?</h3>
              <div className="space-y-4">
                {/* Home Option */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLocationSelect('home')}
                  className="w-full p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center gap-4 text-left hover:border-primary/40 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Home className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">At Home</h4>
                      <Badge className="bg-success/20 text-success text-[10px]">Popular</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Technician visits your home with portable ECG</p>
                    <p className="text-lg font-bold text-primary mt-2">₹599</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                {/* Lab Visit Option */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLocationSelect('lab')}
                  className="w-full p-5 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20 flex items-center gap-4 text-left hover:border-secondary/40 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">Visit Lab</h4>
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Save ₹150</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Choose from nearby partner labs</p>
                    <p className="text-lg font-bold text-secondary mt-2">Starting ₹349</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Benefits */}
              <div className="mt-8 p-4 rounded-xl bg-muted/50">
                <h4 className="font-medium text-foreground mb-3">Why choose HealthSwift ECG?</h4>
                <div className="space-y-3">
                  {[
                    { icon: Shield, text: "NABL Accredited Labs" },
                    { icon: Sparkles, text: "AI-Powered Report Analysis" },
                    { icon: Clock, text: "Results in 2 Hours" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Lab Selection */}
          {step === 'lab-selection' && (
            <motion.div
              key="lab-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">ECG Labs Near You</h3>
                <Badge variant="outline" className="text-xs">
                  <Navigation className="w-3 h-3 mr-1" />
                  {labs.length} labs found
                </Badge>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50">
                      <div className="flex gap-4">
                        <Skeleton className="w-16 h-16 rounded-xl" />
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
                <div className="space-y-4">
                  {labs.map((lab, index) => {
                    const isOpen = isLabOpen(lab.opening_time, lab.closing_time);
                    const distance = calculateDistance(lab.latitude, lab.longitude);
                    
                    return (
                      <motion.button
                        key={lab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLabSelect(lab)}
                        className="w-full p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all text-left"
                      >
                        <div className="flex gap-4">
                          {/* Lab Logo */}
                          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {lab.logo_url ? (
                              <img 
                                src={lab.logo_url} 
                                alt={lab.name}
                                className="w-14 h-14 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Building2 className={`w-8 h-8 text-muted-foreground ${lab.logo_url ? 'hidden' : ''}`} />
                          </div>

                          {/* Lab Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-foreground line-clamp-1">{lab.name}</h4>
                                  {lab.is_verified && (
                                    <Shield className="w-4 h-4 text-primary flex-shrink-0" />
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
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-medium text-foreground">{lab.rating}</span>
                                <span className="text-xs text-muted-foreground">({lab.reviews_count})</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-xs">{distance}</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${isOpen ? 'border-success text-success' : 'border-destructive text-destructive'}`}
                              >
                                {isOpen ? 'Open Now' : 'Closed'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Select indicator */}
                        <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
                          <span className="text-xs text-primary font-medium flex items-center gap-1">
                            Select this lab
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Booking Details */}
          {step === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Selected Lab/Home Info */}
              {selectedLab && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                      {selectedLab.logo_url ? (
                        <img src={selectedLab.logo_url} alt={selectedLab.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{selectedLab.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedLab.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{selectedLab.ecg_price}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {locationType === 'home' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">Home ECG Test</h4>
                      <p className="text-xs text-muted-foreground">Technician will visit your address</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹599</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Date Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6"
              >
                <h3 className="font-semibold text-foreground mb-3">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                  {dates.map((date, index) => {
                    const formatted = formatDate(date);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-16 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <span className="text-xs font-medium opacity-80">{formatted.day}</span>
                        <span className="text-lg font-bold">{formatted.date}</span>
                        <span className="text-xs opacity-80">{formatted.month}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Time Slots */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6"
              >
                <h3 className="font-semibold text-foreground mb-3">Available Time Slots</h3>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && setSelectedSlot(slot.id)}
                      disabled={!slot.available}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        !slot.available
                          ? "bg-muted/50 text-muted-foreground line-through opacity-50"
                          : selectedSlot === slot.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Preparation Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <h3 className="font-semibold text-foreground mb-3">Preparation Instructions</h3>
                <div className="space-y-3">
                  {preparationSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{step.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What's Included */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-6"
              >
                <h3 className="font-semibold text-foreground mb-3">What's Included</h3>
                <div className="soft-card">
                  <div className="space-y-3">
                    {[
                      "12-Lead ECG Recording",
                      "Heart Rhythm Analysis",
                      "AI-Powered Insights",
                      "Cardiologist Review",
                      "Digital Report with Graphs",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA - Only show on booking step */}
      {step === 'booking' && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 safe-area-bottom"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold text-foreground">₹{getPrice()}</p>
            </div>
            {selectedDate && selectedSlot && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Selected</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(selectedDate).date} {formatDate(selectedDate).month}, {timeSlots.find(s => s.id === selectedSlot)?.time.split(" - ")[0]}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="hero"
            className="w-full"
            size="lg"
            disabled={!selectedDate || !selectedSlot}
            onClick={handleBooking}
          >
            {selectedDate && selectedSlot ? (
              <>
                Book ECG Test
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              "Select Date & Time"
            )}
          </Button>
        </motion.div>
      )}
    </MobileLayout>
  );
};

export default ECGTestScreen;
