import { motion } from "framer-motion";
import { Phone, MessageCircle, ChevronRight } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";

const SUPPORT_PHONE = "6296092819";

const supportOptions = [
  {
    icon: Phone,
    label: "Call Support",
    description: "Talk to our support team directly",
    action: () => {
      window.location.href = `tel:+91${SUPPORT_PHONE}`;
    },
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp Support",
    description: "Chat with us on WhatsApp",
    action: () => {
      window.open(`https://wa.me/91${SUPPORT_PHONE}`, "_blank");
    },
    color: "bg-green-500/10",
    iconColor: "text-green-500",
  },
];

const SupportScreen = () => {
  return (
    <MobileLayout>
      <ScreenHeader title="Help & Support" />

      <div className="px-4 pb-6">
        {/* Support header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card mt-4 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Need Help?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We're here to assist you 24/7
          </p>
        </motion.div>

        {/* Support options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 space-y-3"
        >
          {supportOptions.map((option, index) => (
            <motion.button
              key={option.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={option.action}
              className="w-full soft-card flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center`}>
                <option.icon className={`w-6 h-6 ${option.iconColor}`} />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold text-foreground">{option.label}</span>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          ))}
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="soft-card mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Our support team is available
          </p>
          <p className="text-sm font-medium text-foreground mt-1">
            Monday - Sunday, 9 AM - 9 PM
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default SupportScreen;
