import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Video,
  Phone,
  Shield,
  ChevronRight,
  Activity,
  Bone,
  Brain,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { toast } from "sonner";

const physiotherapists = [
  {
    id: 1,
    name: "Dr. Vikram Singh",
    specialty: "Sports Physiotherapy",
    experience: "10 years",
    rating: 4.9,
    reviews: 856,
    available: true,
    nextSlot: "Available now",
    consultationFee: 399,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Meera Gupta",
    specialty: "Orthopedic Rehabilitation",
    experience: "8 years",
    rating: 4.8,
    reviews: 642,
    available: true,
    nextSlot: "In 30 mins",
    consultationFee: 349,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Arjun Menon",
    specialty: "Neurological Physiotherapy",
    experience: "12 years",
    rating: 4.9,
    reviews: 978,
    available: false,
    nextSlot: "Tomorrow 11 AM",
    consultationFee: 499,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Dr. Kavya Nair",
    specialty: "Cardiopulmonary Physio",
    experience: "7 years",
    rating: 4.7,
    reviews: 432,
    available: true,
    nextSlot: "In 1 hour",
    consultationFee: 349,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
  },
];

const specializations = [
  { id: "sports", icon: Activity, label: "Sports Injury", color: "bg-primary/10 text-primary" },
  { id: "ortho", icon: Bone, label: "Orthopedic", color: "bg-success/10 text-success" },
  { id: "neuro", icon: Brain, label: "Neurological", color: "bg-warning/10 text-warning" },
  { id: "cardio", icon: Heart, label: "Cardiopulmonary", color: "bg-destructive/10 text-destructive" },
];

const consultTypes = [
  { id: "video", icon: Video, label: "Video Call", price: "+₹0" },
  { id: "audio", icon: Phone, label: "Audio Call", price: "+₹0" },
];

const PhysioConsultScreen = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("video");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [selectedPhysio, setSelectedPhysio] = useState<number | null>(null);

  const filteredPhysios = selectedSpecialization
    ? physiotherapists.filter((p) => {
        if (selectedSpecialization === "sports") return p.specialty.includes("Sports");
        if (selectedSpecialization === "ortho") return p.specialty.includes("Orthopedic");
        if (selectedSpecialization === "neuro") return p.specialty.includes("Neurological");
        if (selectedSpecialization === "cardio") return p.specialty.includes("Cardiopulmonary");
        return true;
      })
    : physiotherapists;

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Consult Physiotherapist" />

      <div className="px-4 pb-32">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground"
        >
          <h2 className="text-lg font-bold">Expert Physiotherapy Care</h2>
          <p className="text-sm opacity-90 mt-1">
            Connect with certified physiotherapists for pain relief, rehabilitation & recovery
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-secondary-foreground/20 text-secondary-foreground border-0">
              <Shield className="w-3 h-3 mr-1" />
              Certified Experts
            </Badge>
            <Badge variant="secondary" className="bg-secondary-foreground/20 text-secondary-foreground border-0">
              Home Visits Available
            </Badge>
          </div>
        </motion.div>

        {/* Specializations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Specializations</h3>
          <div className="grid grid-cols-4 gap-2">
            {specializations.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialization(selectedSpecialization === spec.id ? null : spec.id)}
                className={`py-3 px-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  selectedSpecialization === spec.id
                    ? "bg-primary text-primary-foreground"
                    : spec.color
                }`}
              >
                <spec.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium text-center leading-tight">{spec.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Consultation type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Consultation Type</h3>
          <div className="flex gap-2">
            {consultTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex-1 py-3 px-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  selectedType === type.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <type.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Available physiotherapists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Available Physiotherapists</h3>
            <button className="text-primary text-sm font-medium">View all</button>
          </div>
          <div className="space-y-3">
            {filteredPhysios.map((physio, index) => (
              <motion.div
                key={physio.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setSelectedPhysio(physio.id)}
                className={`soft-card cursor-pointer transition-all ${
                  selectedPhysio === physio.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={physio.image}
                    alt={physio.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{physio.name}</h4>
                      <Badge variant={physio.available ? "live" : "secondary"}>
                        {physio.available ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{physio.specialty}</p>
                    <p className="text-xs text-muted-foreground">{physio.experience} experience</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="text-sm font-medium">{physio.rating}</span>
                        <span className="text-xs text-muted-foreground">({physio.reviews})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {physio.nextSlot}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Consultation fee</p>
                    <p className="font-bold text-foreground">₹{physio.consultationFee}</p>
                  </div>
                  <Button variant="soft" size="sm">
                    Book Now
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      {selectedPhysio && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 safe-area-bottom"
        >
          <Button
            variant="hero"
            className="w-full"
            size="lg"
            onClick={() => {
              const physio = physiotherapists.find(p => p.id === selectedPhysio);
              if (physio) {
                if (!physio.available) {
                  toast.error("Physiotherapist is currently offline", {
                    description: `Next available: ${physio.nextSlot}`,
                  });
                  return;
                }
                navigate("/consultation-call", {
                  state: {
                    type: selectedType,
                    professional: physio,
                    professionalType: "physiotherapist",
                  },
                });
              }
            }}
          >
            {selectedType === "video" ? <Video className="w-5 h-5 mr-2" /> : <Phone className="w-5 h-5 mr-2" />}
            Start {selectedType === "video" ? "Video" : "Audio"} Call • ₹{physiotherapists.find(p => p.id === selectedPhysio)?.consultationFee}
          </Button>
        </motion.div>
      )}
    </MobileLayout>
  );
};

export default PhysioConsultScreen;
