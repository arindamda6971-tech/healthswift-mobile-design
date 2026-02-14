import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Video,
  Phone,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { toast } from "sonner";

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
    videoCallFee: 299,
    audioCallFee: 199,
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
    videoCallFee: 399,
    audioCallFee: 299,
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
    videoCallFee: 599,
    audioCallFee: 499,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
  },
];

const DoctorConsultScreen = () => {
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Book a Doctor" />

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
                  <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    variant="soft"
                    className="flex-1"
                    onClick={() => {
                      if (!doctor.available) {
                        toast.error("Doctor is currently offline", {
                          description: `Next available: ${doctor.nextSlot}`,
                        });
                        return;
                      }
                      navigate("/consultation-booking", {
                        state: { type: "video", professional: doctor, professionalType: "doctor" },
                      });
                    }}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    <span className="font-medium">Video ₹{doctor.videoCallFee}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (!doctor.available) {
                        toast.error("Doctor is currently offline", {
                          description: `Next available: ${doctor.nextSlot}`,
                        });
                        return;
                      }
                      navigate("/consultation-booking", {
                        state: { type: "audio", professional: doctor, professionalType: "doctor" },
                      });
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="font-medium">Audio ₹{doctor.audioCallFee}</span>
                  </Button>
                </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>


    </MobileLayout>
  );
};

export default DoctorConsultScreen;
