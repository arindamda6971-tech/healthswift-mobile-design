import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Zap } from "lucide-react";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate("/onboarding"), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 max-w-[430px] mx-auto">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Icon container */}
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 20px hsl(201 88% 62% / 0.2)",
              "0 0 40px hsl(201 88% 62% / 0.4)",
              "0 0 20px hsl(201 88% 62% / 0.2)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6"
        >
          <div className="relative">
            <Activity className="w-12 h-12 text-primary-foreground" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center"
            >
              <Zap className="w-3 h-3 text-success-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-secondary mb-2"
        >
          Health<span className="text-primary">Swift</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-center font-medium"
        >
          Diagnostics. Faster. Smarter.
        </motion.p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-20 left-8 right-8"
      >
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Loading your health companion...
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
