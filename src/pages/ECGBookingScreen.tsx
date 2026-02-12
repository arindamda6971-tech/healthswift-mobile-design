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
  Stethoscope,
  Building2,
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

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews_count: number;
  fee: number;
  availability: string;
  qualification: string;
}

interface LocationState {
  doctor: Doctor;
}

const timeSlots = [
  { id: 1, time: "6:00 AM - 8:00 AM", available: true, phlebotomists: 5 },
  { id: 2, time: "8:00 AM - 10:00 AM", available: true, phlebotomists: 8 },
  { id: 3, time: "10:00 AM - 12:00 PM", available: true, phlebotomists: 6 },
  { id: 4, time: "12:00 PM - 2:00 PM", available: false, phlebotomists: 0 },
  { id: 5, time: "2:00 PM - 4:00 PM", available: true, phlebotomists: 4 },
  { id: 6, time: "4:00 PM - 6:00 PM", available: true, phlebotomists: 7 },
  { id: 7, time: "6:00 PM - 8:00 PM", available: true, phlebotomists: 3 },
  { id: 8, time: "8:00 PM - 10:00 PM", available: true, phlebotomists: 2 },
];

const ECGBookingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabaseUserId } = useAuth();
  
  const locationState = location.state as LocationState | null;
  const doctor = locationState?.doctor;
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(2);
  
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
        if (import.meta.env.DEV) console.error("Failed to fetch addresses");
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
      if (import.meta.env.DEV) console.error("Failed to load addresses");
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (!doctor) {
      navigate("/ecg-test");
      return;
    }
    fetchAddresses();
  }, [supabaseUserId, doctor]);

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
      if (import.meta.env.DEV) console.error("Failed to save address")
      toast.error("Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!doctor) return;
    
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
          id: `ecg-${doctor.id}`,
          name: `12-Lead ECG Test with ${doctor.name}`,
          price: doctor.fee,
          quantity: 1,
        }],
        addressId: selectedAddressId,
        scheduledDate: dates[selectedDate].fullDate,
        scheduledTimeSlot: timeSlots.find(s => s.id === selectedTime)?.time || "",
        subtotal: doctor.fee,
        bookingType: "ecg",
        doctorName: doctor.name,
      },
    });
  };

  if (!doctor) {
    return null;
  }

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Book ECG Appointment" />

      <div className="px-4 pb-44">
        {/* Doctor Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mb-4 flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary/80 font-medium">12-Lead ECG Test with</p>
            <p className="font-semibold text-primary truncate">{doctor.name}</p>
            <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-primary">₹{doctor.fee}</p>
          </div>
        </motion.div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234AB3F4' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="text-center relative z-10">
            <Navigation className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Home visit for ECG test</p>
          </div>
          <Badge variant="live" className="absolute top-3 right-3">
            Available today
          </Badge>
        </motion.div>

        {/* Date selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
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
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Select Time Slot</h3>
            <Badge variant="soft">24/7 Available</Badge>
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
                {slot.available && (
                  <p className={`text-xs mt-1 ${
                    selectedTime === slot.id ? "opacity-80" : "text-muted-foreground"
                  }`}>
                    {slot.phlebotomists} available
                  </p>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Address Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Home Address</h3>
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
          className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border"
        >
          <h3 className="font-semibold text-foreground mb-3">Price Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ECG Test + Consultation</span>
              <span className="text-foreground">₹{doctor.fee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Home Visit Charges</span>
              <span className="text-success">FREE</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">₹{doctor.fee}</span>
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
          Proceed to Pay • ₹{doctor.fee}
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

export default ECGBookingScreen;
