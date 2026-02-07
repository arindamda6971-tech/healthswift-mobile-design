import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  MapPin,
  Navigation,
  Plus,
  Check,
  Video,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Address = Tables<"addresses">;

interface Physiotherapist {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  available: boolean;
  nextSlot: string;
  videoCallFee: number;
  audioCallFee: number;
  image: string;
}

interface LocationState {
  physio: Physiotherapist;
  consultationType: "video" | "audio";
}

const timeSlots = [
  { id: 1, time: "9:00 AM - 9:30 AM", available: true },
  { id: 2, time: "9:30 AM - 10:00 AM", available: true },
  { id: 3, time: "10:00 AM - 10:30 AM", available: true },
  { id: 4, time: "10:30 AM - 11:00 AM", available: false },
  { id: 5, time: "11:00 AM - 11:30 AM", available: true },
  { id: 6, time: "2:00 PM - 2:30 PM", available: true },
  { id: 7, time: "2:30 PM - 3:00 PM", available: true },
  { id: 8, time: "3:00 PM - 3:30 PM", available: true },
  { id: 9, time: "4:00 PM - 4:30 PM", available: true },
  { id: 10, time: "5:00 PM - 5:30 PM", available: true },
];

const PhysioBookingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabaseUserId } = useAuth();
  
  const locationState = location.state as LocationState | null;
  const physio = locationState?.physio;
  const consultationType = locationState?.consultationType || "video";
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(2);
  const [selectedType, setSelectedType] = useState<"video" | "audio">(consultationType);
  
  // Add Address Modal State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0],
    };
  });

  const fetchAddresses = async () => {
    if (!supabaseUserId) {
      setLoadingAddresses(false);
      return;
    }
    
    setLoadingAddresses(true);
    
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", supabaseUserId)
        .order("is_default", { ascending: false });

      if (error) {
        console.error("Error fetching addresses:", error);
        setAddresses([]);
      } else if (data) {
        setAddresses(data);
        const defaultAddress = data.find(addr => addr.is_default) || data[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("Exception fetching addresses:", err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (!physio) {
      navigate("/physio-consult");
      return;
    }
    fetchAddresses();
  }, [supabaseUserId, physio]);

  const handleSaveAddress = async () => {
    if (!supabaseUserId) {
      toast.error("Please log in to add an address");
      return;
    }

    if (!newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSavingAddress(true);
    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: supabaseUserId,
          type: newAddress.type,
          address_line1: newAddress.address_line1,
          address_line2: newAddress.address_line2 || null,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          is_default: newAddress.is_default || addresses.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Address added successfully");
      setShowAddAddressModal(false);
      setNewAddress({
        type: "Home",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
      
      await fetchAddresses();
      if (data) {
        setSelectedAddressId(data.id);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const currentFee = selectedType === "video" ? physio?.videoCallFee : physio?.audioCallFee;

  const handleProceedToPayment = () => {
    if (!physio) return;
    
    if (!selectedAddressId && addresses.length > 0) {
      toast.error("Please select an address");
      return;
    }

    if (addresses.length === 0) {
      toast.error("Please add an address to proceed");
      return;
    }

    navigate("/payment", {
      state: {
        cartItems: [{
          id: `physio-${physio.id}-${selectedType}`,
          name: `${selectedType === "video" ? "Video" : "Audio"} Consultation with ${physio.name}`,
          price: currentFee,
          quantity: 1,
        }],
        addressId: selectedAddressId,
        scheduledDate: dates[selectedDate].fullDate,
        scheduledTimeSlot: timeSlots.find(s => s.id === selectedTime)?.time || "",
        subtotal: currentFee,
        bookingType: "physio",
        physioName: physio.name,
        consultationType: selectedType,
      },
    });
  };

  if (!physio) {
    return null;
  }

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Book Consultation" />

      <div className="px-4 pb-44">
        {/* Physio Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mb-4 flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20"
        >
          <img
            src={physio.image}
            alt={physio.name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{physio.name}</p>
            <p className="text-xs text-muted-foreground">{physio.specialty}</p>
            <p className="text-xs text-muted-foreground">{physio.experience} experience</p>
          </div>
          <Badge variant={physio.available ? "live" : "secondary"}>
            {physio.available ? "Online" : "Offline"}
          </Badge>
        </motion.div>

        {/* Consultation Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Consultation Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedType("video")}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                selectedType === "video"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              <Video className="w-6 h-6" />
              <span className="font-medium">Video Call</span>
              <span className="text-lg font-bold">₹{physio.videoCallFee}</span>
            </button>
            <button
              onClick={() => setSelectedType("audio")}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                selectedType === "audio"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              <Phone className="w-6 h-6" />
              <span className="font-medium">Audio Call</span>
              <span className="text-lg font-bold">₹{physio.audioCallFee}</span>
            </button>
          </div>
        </motion.div>

        {/* Date selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Select Date</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {dates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(index)}
                className={`flex-shrink-0 w-16 py-3 rounded-2xl text-center transition-all ${
                  selectedDate === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-xs opacity-80">{date.day}</p>
                <p className="text-lg font-bold">{date.date}</p>
                <p className="text-xs opacity-80">{date.month}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Time slot selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Select Time Slot</h3>
            <Badge variant="soft">30 min session</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && setSelectedTime(slot.id)}
                disabled={!slot.available}
                className={`py-3 px-4 rounded-xl text-center transition-all ${
                  !slot.available
                    ? "bg-muted/50 text-muted-foreground opacity-50"
                    : selectedTime === slot.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm font-medium">{slot.time}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Address Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Your Address</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={() => setShowAddAddressModal(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add New
            </Button>
          </div>

          {loadingAddresses ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="p-6 rounded-xl bg-muted/50 text-center">
              <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No addresses saved</p>
              <Button
                variant="outline"
                onClick={() => setShowAddAddressModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedAddressId === address.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted/50 border border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedAddressId === address.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-border"
                    }`}>
                      {selectedAddressId === address.id && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="soft" className="text-xs">{address.type}</Badge>
                        {address.is_default && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Price Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-muted/50 border border-border"
        >
          <h3 className="font-semibold text-foreground mb-3">Price Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedType === "video" ? "Video" : "Audio"} Consultation
              </span>
              <span className="text-foreground">₹{currentFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-success">FREE</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">₹{currentFee}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-24 left-0 right-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 safe-area-bottom"
      >
        <Button
          variant="hero"
          className="w-full"
          size="lg"
          disabled={!selectedAddressId || addresses.length === 0}
          onClick={handleProceedToPayment}
        >
          {selectedType === "video" ? <Video className="w-5 h-5 mr-2" /> : <Phone className="w-5 h-5 mr-2" />}
          Proceed to Pay • ₹{currentFee}
        </Button>
      </motion.div>

      {/* Add Address Modal */}
      <Dialog open={showAddAddressModal} onOpenChange={setShowAddAddressModal}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="type">Address Type</Label>
              <Select
                value={newAddress.type}
                onValueChange={(value) => setNewAddress({ ...newAddress, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Input
                id="address_line1"
                placeholder="House/Flat No., Building Name"
                value={newAddress.address_line1}
                onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                placeholder="Street, Area (Optional)"
                value={newAddress.address_line2}
                onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="6-digit Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddAddressModal(false)}
              disabled={savingAddress}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleSaveAddress}
              disabled={savingAddress}
            >
              {savingAddress ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default PhysioBookingScreen;
