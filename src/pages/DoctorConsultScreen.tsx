import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Calendar,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";

const doctors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialty: "General Physician",
    experience: "12 years",
    rating: 4.9,
    reviews: 1240,
    available: true,
    nextSlot: "Available now",
    consultationFee: 299,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Rajesh Kumar",
    specialty: "Internal Medicine",
    experience: "15 years",
    rating: 4.8,
    reviews: 980,
    available: true,
    nextSlot: "In 15 mins",
    consultationFee: 399,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Ananya Patel",
    specialty: "Endocrinologist",
    experience: "10 years",
    rating: 4.9,
    reviews: 756,
    available: false,
    nextSlot: "Tomorrow 10 AM",
    consultationFee: 599,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
  },
];

const consultTypes = [
  { id: "video", icon: Video, label: "Video Call", price: "+₹0" },
  { id: "audio", icon: Phone, label: "Audio Call", price: "+₀" },
  { id: "chat", icon: MessageCircle, label: "Chat", price: "-₹50" },
];

const DoctorConsultScreen = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("video");
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Consult a Doctor" />

      <div className="px-4 pb-32">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
        >
          <h2 className="text-lg font-bold">Get Expert Advice</h2>
          <p className="text-sm opacity-90 mt-1">
            Connect with certified doctors to understand your test results better
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
              <Shield className="w-3 h-3 mr-1" />
              MBBS Verified
            </Badge>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
              Instant Connect
            </Badge>
          </div>
        </motion.div>

        {/* Consultation type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        {/* Available doctors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Available Doctors</h3>
            <button className="text-primary text-sm font-medium">View all</button>
          </div>
          <div className="space-y-3">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setSelectedDoctor(doctor.id)}
                className={`soft-card cursor-pointer transition-all ${
                  selectedDoctor === doctor.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{doctor.name}</h4>
                      <Badge variant={doctor.available ? "live" : "secondary"}>
                        {doctor.available ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground">{doctor.experience} experience</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {doctor.nextSlot}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Consultation fee</p>
                    <p className="font-bold text-foreground">₹{doctor.consultationFee}</p>
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
      {selectedDoctor && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 safe-area-bottom"
        >
          <Button
            variant="hero"
            className="w-full"
            size="lg"
            onClick={() => navigate("/home")}
          >
            Book Consultation • ₹{doctors.find(d => d.id === selectedDoctor)?.consultationFee}
          </Button>
        </motion.div>
      )}
    </MobileLayout>
  );
};

export default DoctorConsultScreen;
