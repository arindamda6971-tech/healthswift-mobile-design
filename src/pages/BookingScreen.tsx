import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Calendar,
  Plus,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useCart } from "@/contexts/CartContext";

const addresses = [
  { id: 1, type: "Home", address: "123 Main Street, Apartment 4B, Mumbai 400001", isDefault: true },
  { id: 2, type: "Office", address: "Tech Park, Building A, Floor 5, Bangalore 560001", isDefault: false },
];

const timeSlots = [
  { id: 1, time: "6:00 AM - 8:00 AM", available: true, phlebotomists: 5 },
  { id: 2, time: "8:00 AM - 10:00 AM", available: true, phlebotomists: 8 },
  { id: 3, time: "10:00 AM - 12:00 PM", available: true, phlebotomists: 6 },
  { id: 4, time: "12:00 PM - 2:00 PM", available: false, phlebotomists: 0 },
  { id: 5, time: "2:00 PM - 4:00 PM", available: true, phlebotomists: 4 },
  { id: 6, time: "4:00 PM - 6:00 PM", available: true, phlebotomists: 7 },
  { id: 7, time: "6:00 PM - 8:00 PM", available: true, phlebotomists: 3 },
  { id: 8, time: "8:00 PM - 10:00 PM", available: true, phlebotomists: 2 },
];

const BookingScreen = () => {
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(2);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  return (
    <MobileLayout>
      <ScreenHeader title="Book Appointment" />

      <div className="px-4 pb-32">
        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234AB3F4' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="text-center relative z-10">
            <Navigation className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Detecting your location...</p>
          </div>
          <Badge variant="live" className="absolute top-3 right-3">
            5 phlebotomists nearby
          </Badge>
        </motion.div>

        {/* Address selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Select Address</h3>
            <button className="flex items-center gap-1 text-primary text-sm font-medium">
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
          <div className="space-y-2">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddress(addr.id)}
                className={`w-full soft-card flex items-start gap-3 text-left transition-all ${
                  selectedAddress === addr.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{addr.type}</p>
                    {addr.isDefault && <Badge variant="soft">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{addr.address}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Date selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Select Date</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {dates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(index)}
                className={`flex-shrink-0 w-16 py-3 rounded-2xl text-center transition-all ${
                  selectedDate === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-xs opacity-80">{date.day}</p>
                <p className="text-lg font-bold">{date.date}</p>
                <p className="text-xs opacity-80">{date.month}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Time slot selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Select Time Slot</h3>
            <Badge variant="soft">24/7 Available</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && setSelectedTime(slot.id)}
                disabled={!slot.available}
                className={`py-3 px-4 rounded-xl text-center transition-all ${
                  !slot.available
                    ? "bg-muted/50 text-muted-foreground opacity-50"
                    : selectedTime === slot.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm font-medium">{slot.time}</p>
                {slot.available && (
                  <p className={`text-xs mt-1 ${
                    selectedTime === slot.id ? "opacity-80" : "text-muted-foreground"
                  }`}>
                    {slot.phlebotomists} available
                  </p>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-24 left-0 right-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 safe-area-bottom"
      >
        <Button
          variant="hero"
          className="w-full"
          size="lg"
          onClick={() => navigate("/tracking", { 
            state: { 
              cartItems: cartItems,
              selectedAddress,
              selectedDate,
              selectedTime,
              selectedMember
            } 
          })}
        >
          Confirm Booking
        </Button>
      </motion.div>
    </MobileLayout>
  );
};

export default BookingScreen;
