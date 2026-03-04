import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Navigation, Loader2, AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const LocationCheckScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"ask" | "detecting" | "manual" | "serviceable" | "not-serviceable">("ask");
  const [pincode, setPincode] = useState("");
  const [detectedPincode, setDetectedPincode] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user already has a saved address (location already checked)
  useEffect(() => {
    if (!user) return;
    const checkExisting = async () => {
      const locationChecked = localStorage.getItem(`location_checked_${user.id}`);
      if (locationChecked === "true") {
        navigate("/home", { replace: true });
      }
    };
    checkExisting();
  }, [user, navigate]);

  const reverseGeocode = async (lat: number, lon: number): Promise<{ pincode: string; display: string }> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "BloodLyn-App" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const pc = addr.postcode || "";
      const city = addr.city || addr.town || addr.village || addr.county || "";
      const state = addr.state || "";
      return { pincode: pc, display: `${city}${state ? ", " + state : ""}` };
    } catch {
      return { pincode: "", display: "" };
    }
  };

  const checkServiceability = async (pc: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("serviceable_pincodes")
      .select("pincode")
      .eq("pincode", pc.trim())
      .eq("is_active", true)
      .maybeSingle();
    return !error && !!data;
  };

  const saveAddressAndProceed = async (pc: string, displayName: string, lat?: number, lon?: number) => {
    if (!user) return;
    try {
      await supabase.from("addresses").insert({
        user_id: user.id,
        address_line1: displayName || `Location - ${pc}`,
        city: displayName.split(",")[0]?.trim() || "",
        state: displayName.split(",")[1]?.trim() || "",
        pincode: pc,
        latitude: lat || null,
        longitude: lon || null,
        is_default: true,
        type: "Home",
      });
    } catch (e) {
      console.error("Failed to save address:", e);
    }
    localStorage.setItem(`location_checked_${user.id}`, "true");
    navigate("/home", { replace: true });
  };

  const handleAllowLocation = () => {
    setStep("detecting");
    if (!navigator.geolocation) {
      toast({ title: "GPS not supported", description: "Please enter your PIN code manually.", variant: "destructive" });
      setStep("manual");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        const { pincode: pc, display } = await reverseGeocode(latitude, longitude);
        if (!pc) {
          toast({ title: "Could not detect PIN code", description: "Please enter manually.", variant: "destructive" });
          setStep("manual");
          return;
        }
        setDetectedPincode(pc);
        setLocationName(display);
        const serviceable = await checkServiceability(pc);
        if (serviceable) {
          setStep("serviceable");
          setTimeout(() => saveAddressAndProceed(pc, display, latitude, longitude), 1500);
        } else {
          setStep("not-serviceable");
        }
      },
      () => {
        toast({ title: "Location permission denied", description: "Please enter your PIN code manually." });
        setStep("manual");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualCheck = async () => {
    if (pincode.length !== 6) {
      toast({ title: "Invalid PIN code", description: "Please enter a valid 6-digit PIN code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const serviceable = await checkServiceability(pincode);
    if (serviceable) {
      setDetectedPincode(pincode);
      setStep("serviceable");
      setTimeout(() => saveAddressAndProceed(pincode, `PIN ${pincode}`), 1500);
    } else {
      setDetectedPincode(pincode);
      setStep("not-serviceable");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-[430px] mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[-40px] w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-[-40px] w-40 h-40 rounded-full bg-success/5 blur-3xl" />

      {/* Ask Permission */}
      {step === "ask" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center text-center w-full"
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MapPin className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Enable Location</h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-[280px]">
            We need your location to check if our services are available in your area.
          </p>
          <Button variant="hero" className="w-full mb-3" onClick={handleAllowLocation}>
            <Navigation className="w-4 h-4 mr-2" />
            Allow Location Access
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setStep("manual")}>
            Enter PIN Code Manually
          </Button>
        </motion.div>
      )}

      {/* Detecting */}
      {step === "detecting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Navigation className="w-12 h-12 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-2">Detecting Location...</h2>
          <p className="text-muted-foreground text-sm">Please wait while we find your area</p>
          <Loader2 className="w-6 h-6 animate-spin text-primary mt-6" />
        </motion.div>
      )}

      {/* Manual Entry */}
      {step === "manual" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center text-center w-full"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Enter Your PIN Code</h2>
          <p className="text-muted-foreground text-sm mb-6">We'll check if our services are available in your area</p>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit PIN code"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-lg tracking-widest mb-4"
          />
          <Button
            variant="hero"
            className="w-full mb-3"
            onClick={handleManualCheck}
            disabled={pincode.length !== 6 || loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Check Availability
          </Button>
          <Button variant="ghost" className="text-sm" onClick={() => setStep("ask")}>
            ← Try GPS Instead
          </Button>
        </motion.div>
      )}

      {/* Serviceable */}
      {step === "serviceable" && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            >
              <svg className="w-12 h-12 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </motion.div>
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-1">We're Available!</h2>
          <p className="text-muted-foreground text-sm mb-1">
            PIN Code: <span className="font-semibold text-foreground">{detectedPincode}</span>
          </p>
          {locationName && (
            <p className="text-muted-foreground text-xs mb-4">{locationName}</p>
          )}
          <p className="text-success text-sm font-medium">Redirecting to home...</p>
          <Loader2 className="w-5 h-5 animate-spin text-primary mt-4" />
        </motion.div>
      )}

      {/* Not Serviceable */}
      {step === "not-serviceable" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center text-center w-full"
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <AlertCircle className="w-12 h-12 text-destructive" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-2">Service Not Available</h2>
          <p className="text-muted-foreground text-sm mb-1 max-w-[280px]">
            Sorry, our services are not available in your area yet.
          </p>
          <p className="text-muted-foreground text-xs mb-6">
            PIN Code: <span className="font-semibold text-foreground">{detectedPincode}</span>
          </p>
          <Button
            variant="hero"
            className="w-full mb-3"
            onClick={() => {
              toast({ title: "We'll notify you!", description: "You'll be the first to know when we launch in your area." });
            }}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
          <Button variant="outline" className="w-full mb-3" onClick={() => { setStep("manual"); setPincode(""); }}>
            Try Another PIN Code
          </Button>
          <Button variant="ghost" className="text-sm" onClick={() => setStep("ask")}>
            ← Try GPS Instead
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default LocationCheckScreen;
