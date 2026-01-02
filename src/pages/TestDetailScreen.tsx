import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  FileText,
  Home,
  Shield,
  Sparkles,
  Check,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";

const testDetails = {
  name: "Complete Blood Count (CBC)",
  description: "A complete blood count test measures several components and features of your blood, including red blood cells, white blood cells, and platelets.",
  price: 299,
  originalPrice: 499,
  discount: "40%",
  reportTime: "6 hours",
  sampleType: "Blood",
  fasting: "No fasting required",
  parameters: [
    "Hemoglobin", "RBC Count", "WBC Count", "Platelet Count",
    "PCV/Hematocrit", "MCV", "MCH", "MCHC", "RDW"
  ],
  includes: [
    { icon: Home, text: "Home sample collection" },
    { icon: Shield, text: "NABL certified lab" },
    { icon: FileText, text: "Digital report" },
    { icon: Sparkles, text: "AI-powered insights" },
  ],
};

const TestDetailScreen = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  return (
    <MobileLayout>
      <ScreenHeader
        title="Test Details"
        rightAction={
          <button onClick={() => navigate("/cart")} className="icon-btn relative">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs text-primary-foreground flex items-center justify-center">
              1
            </span>
          </button>
        }
      />

      <div className="px-4 pb-32">
        {/* Main info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Badge variant="softSuccess" className="mb-2">{testDetails.discount} OFF</Badge>
              <h1 className="text-xl font-bold text-foreground">{testDetails.name}</h1>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            {testDetails.description}
          </p>

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="soft-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Report in</p>
                <p className="font-semibold text-foreground text-sm">{testDetails.reportTime}</p>
              </div>
            </div>
            <div className="soft-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fasting</p>
                <p className="font-semibold text-foreground text-sm">Not required</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">AI will explain your report</p>
              <p className="text-xs text-muted-foreground">Get insights in simple language</p>
            </div>
            <Badge variant="ai">AI</Badge>
          </div>
        </motion.div>

        {/* What's included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-3">What's Included</h2>
          <div className="soft-card space-y-3">
            {testDetails.includes.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-success" />
                </div>
                <span className="text-foreground text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-3">
            Parameters ({testDetails.parameters.length})
          </h2>
          <div className="soft-card">
            <div className="flex flex-wrap gap-2">
              {testDetails.parameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm"
                >
                  <Check className="w-3 h-3 text-success" />
                  <span className="text-foreground">{param}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="soft-card mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-3">Price Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Test Price</span>
              <span className="text-foreground line-through">₹{testDetails.originalPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-success">-₹{testDetails.originalPrice - testDetails.price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Home Collection</span>
              <span className="text-success">FREE</span>
            </div>
            <div className="h-px bg-border my-3" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">₹{testDetails.price}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 left-1 right-1 max-w-[428px] mx-auto bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl px-4 py-3 shadow-lg"
      >
        <div className="flex items-center gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-muted rounded-xl px-2 py-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-card flex items-center justify-center"
            >
              <Minus className="w-4 h-4 text-foreground" />
            </button>
            <span className="w-8 text-center font-semibold text-foreground">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-card flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Add to cart */}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/cart")}
          >
            Add to Cart
          </Button>

          {/* Book now */}
          <Button
            variant="hero"
            className="flex-1"
            onClick={() => navigate("/book")}
          >
            Book Now
          </Button>
        </div>
      </motion.div>
    </MobileLayout>
  );
};

export default TestDetailScreen;
