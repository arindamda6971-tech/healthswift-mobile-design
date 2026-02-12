import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Video, ChevronLeft } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Professional {
  id: number;
  name: string;
  specialty: string;
  image: string;
  consultationFee: number;
}

type LocationState = {
  type: "video" | "audio";
  professional: Professional;
  professionalType: "doctor" | "physiotherapist";
} | null;

const generateSlots = () => {
  const now = new Date();
  const slots: string[] = [];
  // generate next 6 half-hour slots
  for (let i = 1; i <= 6; i++) {
    const slot = new Date(now.getTime() + i * 30 * 60 * 1000);
    slots.push(slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }
  return slots;
};

const ConsultationBookingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || null;

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const slots = useMemo(() => generateSlots(), []);

  if (!state) return null;

  const { professional, type } = state;

  const isAudio = type === "audio";
  const { user, supabaseUserId } = useAuth();
  const [isBooking, setIsBooking] = useState(false);

  const handleConfirm = async () => {
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    if (isAudio && phone.trim().length < 6) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!supabaseUserId) {
      toast.error("Please login to book a consultation");
      navigate("/login");
      return;
    }

    setIsBooking(true);
    try {
      const orderNumber = `DOC${Date.now()}`;

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: supabaseUserId,
          order_number: orderNumber,
          scheduled_date: new Date().toISOString().split("T")[0],
          scheduled_time_slot: selectedSlot,
          subtotal: professional.consultationFee,
          total: professional.consultationFee,
          status: "confirmed",
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      toast.success("Appointment booked", {
        description: `Doctor will call you within 10 minutes at ${isAudio ? phone : "your app"}`,
      });

      setTimeout(() => navigate("/bookings"), 800);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <MobileLayout>
      <ScreenHeader title="Schedule Call" showBack={false} />

      <div className="px-4 pb-32">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="soft-card flex items-center gap-4">
            <img src={professional.image} alt={professional.name} className="w-16 h-16 rounded-2xl object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{professional.name}</h3>
              <p className="text-xs text-muted-foreground">{professional.specialty}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold">{isAudio ? <Phone className="inline w-4 h-4 mr-1" /> : <Video className="inline w-4 h-4 mr-1" />}{isAudio ? "Audio" : "Video"}</span>
            </div>
          </div>

          <h4 className="mt-6 mb-2 font-semibold">Choose an available slot</h4>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                className={`py-2 px-2 rounded-lg text-sm ${selectedSlot === s ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>

          {isAudio && (
            <div className="mt-6">
              <label className="block text-xs text-muted-foreground mb-2">Phone number to call</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full py-3 px-4 rounded-xl bg-input border border-border"
              />
              <p className="text-xs text-muted-foreground mt-2">Doctor will call this number for the audio consultation.</p>
            </div>
          )}

          <div className="mt-8">
            <Button className="w-full" onClick={handleConfirm} size="lg" disabled={isBooking}>
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default ConsultationBookingScreen;
