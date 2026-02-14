import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Video, ChevronLeft, Camera, Image, FileText, X, AlertCircle } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePrescriptionStorage } from "@/hooks/usePrescriptionStorage";

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

// slot generation removed — replaced by prescription upload UI


const ConsultationBookingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || null;

  const [phone, setPhone] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { prescription, savePrescription, deletePrescription } = usePrescriptionStorage();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (prescription?.image_url) setUploadedImage(prescription.image_url);
  }, [prescription]);

  if (!state) return null;

  const { professional, type } = state;

  const isAudio = type === "audio";
  const professionalType = state.professionalType || "doctor";

  // Determine consultation fee from provided professional object. Support both
  // older `consultationFee` field and newer per-type fees (`videoCallFee`/`audioCallFee`).
  const consultationFee = (professional as any).consultationFee ?? (isAudio
    ? (professional as any).audioCallFee
    : (professional as any).videoCallFee) ?? 0;
  const { supabaseUserId } = useAuth();
  const [isBooking, setIsBooking] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsUploading(true);
      const savedUrl = await savePrescription(base64);
      if (savedUrl) {
        setUploadedImage(savedUrl);
        toast.success("Prescription uploaded");
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async () => {
    await deletePrescription();
    setUploadedImage(null);
  };

  const handleConfirm = () => {
    if (isAudio && phone.trim().length < 6) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!supabaseUserId) {
      toast.error("Please login to book a consultation");
      navigate("/login");
      return;
    }

    // Pass the consultation as a single cart item so the Payment -> Tracking flow
    // can process the booking (subtotal, payment, order creation) consistently.
    setIsBooking(true);
    navigate("/payment", {
      state: {
        cartItems: [
          {
            id: `consult-${professional.id}`,
            name: `${professional.name} Consultation (${isAudio ? "Audio" : "Video"})`,
            price: consultationFee,
            quantity: 1,
          },
        ],
        addressId: null,
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTimeSlot: null,
        subtotal: consultationFee,
        bookingType: "consultation",
        professionalId: professional.id,
        professionalName: professional.name,
        consultationMode: isAudio ? "audio" : "video",
      },
    });
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

          <div className="soft-card p-4 mt-6 flex items-start gap-3 bg-amber-700/5 border-amber-300/20">
            <AlertCircle className="w-5 h-5 text-warning mt-1" />
            <div>
              <p className="font-semibold text-foreground">
                {professionalType === "doctor" ? "Doctor will call you shortly" : "Physiotherapist will call you shortly"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Keep your network connection active.</p>
            </div>
          </div>

          <div className="mt-4">
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center bg-muted/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Upload prescription (optional)</h4>
                <p className="text-sm text-muted-foreground mb-4">Snap a photo or choose from gallery — this helps the doctor prepare.</p>

                <div className="flex gap-3 justify-center">
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                  <Button variant="outline" className="gap-2" onClick={() => cameraInputRef.current?.click()} disabled={isUploading}>
                    <Camera className="w-4 h-4" /> Camera
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Image className="w-4 h-4" /> Gallery
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative mt-2">
                <img src={uploadedImage} alt="Prescription" className="w-full rounded-2xl object-cover max-h-56" />
                <button onClick={handleRemoveImage} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-4 h-4 text-destructive-foreground" />
                </button>
              </div>
            )}
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
              <p className="text-xs text-muted-foreground mt-2">
                {professionalType === "doctor" ? "Doctor will call this number for the audio consultation." : "Physiotherapist will call this number for the audio consultation."}
              </p>
            </div>
          )}

          <div className="mt-8">
            <Button className="w-full rounded-xl" onClick={handleConfirm} size="lg" disabled={isBooking}>
              {isBooking ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default ConsultationBookingScreen;
