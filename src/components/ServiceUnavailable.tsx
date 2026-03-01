import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import serviceUnavailableImg from "@/assets/service-unavailable.png";

interface ServiceUnavailableProps {
  title: string;
  serviceName: string;
}

const ServiceUnavailable = ({ title, serviceName }: ServiceUnavailableProps) => {
  const navigate = useNavigate();

  return (
    <MobileLayout showNav={true}>
      <ScreenHeader title={title} />
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center min-h-[60vh]">
        <motion.img
          src={serviceUnavailableImg}
          alt="Service unavailable"
          className="w-48 h-48 mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
        <motion.h2
          className="text-xl font-bold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Oops! Service Not Available
        </motion.h2>
        <motion.p
          className="text-sm text-muted-foreground max-w-xs mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <span className="font-medium text-foreground">{serviceName}</span> is
          not available in your area yet. We're working hard to expand — stay
          tuned!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button variant="hero" onClick={() => navigate("/home")}>
            Go to Home
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default ServiceUnavailable;
