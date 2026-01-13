import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";

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

const locations = [
  { id: "home", icon: Home, label: "At Home", price: 599, popular: true },
  { id: "lab", icon: Building2, label: "Visit Lab", price: 449, popular: false },
];

const ECGTestScreen = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("home");

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

  const selectedLocationData = locations.find((l) => l.id === selectedLocation);

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="ECG Test Booking" />

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

        {/* Test Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Choose Location</h3>
          <div className="grid grid-cols-2 gap-3">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`relative p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  selectedLocation === loc.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {loc.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-success text-success-foreground text-[10px]">
                    Popular
                  </Badge>
                )}
                <loc.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{loc.label}</span>
                <span className="text-lg font-bold">₹{loc.price}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.25 }}
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
          transition={{ delay: 0.3 }}
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
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 safe-area-bottom"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-foreground">₹{selectedLocationData?.price}</p>
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
          onClick={() => navigate("/cart")}
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
    </MobileLayout>
  );
};

export default ECGTestScreen;
