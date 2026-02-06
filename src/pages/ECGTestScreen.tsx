import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Stethoscope,
  Award,
  Star,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  X,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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

// Mock doctors data
const mockDoctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiology",
    experience: 12,
    rating: 4.9,
    reviews_count: 324,
    fee: 599,
    availability: "9 AM - 5 PM",
    qualification: "MD (Cardiology), DM (Cardiology)",
  },
  {
    id: "doc-2",
    name: "Dr. Priya Sharma",
    specialization: "Cardiac Specialist",
    experience: 8,
    rating: 4.8,
    reviews_count: 256,
    fee: 499,
    availability: "10 AM - 6 PM",
    qualification: "MD (Cardiology), FACC",
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Singh",
    specialization: "Cardiac Surgeon",
    experience: 15,
    rating: 4.9,
    reviews_count: 512,
    fee: 799,
    availability: "8 AM - 4 PM",
    qualification: "MCh (Cardiac Surgery), FACS",
  },
  {
    id: "doc-4",
    name: "Dr. Anjali Gupta",
    specialization: "Cardiologist",
    experience: 10,
    rating: 4.7,
    reviews_count: 198,
    fee: 549,
    availability: "11 AM - 7 PM",
    qualification: "MD (Cardiology), FACC",
  },
  {
    id: "doc-5",
    name: "Dr. Arjun Reddy",
    specialization: "ECG Specialist",
    experience: 7,
    rating: 4.8,
    reviews_count: 289,
    fee: 399,
    availability: "9 AM - 6 PM",
    qualification: "MD (Internal Medicine)",
  },
];

const timeSlots = [
  { id: 1, time: "9:00 AM - 10:00 AM", available: true },
  { id: 2, time: "10:00 AM - 11:00 AM", available: true },
  { id: 3, time: "11:00 AM - 12:00 PM", available: true },
  { id: 4, time: "12:00 PM - 1:00 PM", available: false },
  { id: 5, time: "2:00 PM - 3:00 PM", available: true },
  { id: 6, time: "3:00 PM - 4:00 PM", available: true },
  { id: 7, time: "4:00 PM - 5:00 PM", available: true },
  { id: 8, time: "5:00 PM - 6:00 PM", available: true },
];

const ECGTestScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supabaseUserId, user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking flow state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [bookingStep, setBookingStep] = useState<"slot" | "address">("slot");
  
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

  useEffect(() => {
    setDoctors(mockDoctors);
    setLoading(false);
  }, []);

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

  const handleBookDoctor = (doctor: Doctor) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book an ECG test",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    setSelectedDoctor(doctor);
    setBookingStep("slot");
    setSelectedTime(null);
    setShowBookingModal(true);
    fetchAddresses();
  };

  const handleProceedToAddress = () => {
    if (!selectedTime) {
      toast({
        title: "Select Time Slot",
        description: "Please select a time slot to proceed",
        variant: "destructive",
      });
      return;
    }
    setBookingStep("address");
  };

  const handleProceedToPayment = () => {
    if (!selectedAddressId && addresses.length > 0) {
      toast({
        title: "Select Address",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (addresses.length === 0) {
      toast({
        title: "Add Address",
        description: "Please add an address to proceed",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDoctor) return;

    // Navigate to payment with booking details
    navigate("/payment", {
      state: {
        cartItems: [{
          id: `ecg-${selectedDoctor.id}`,
          name: `12-Lead ECG Test with ${selectedDoctor.name}`,
          price: selectedDoctor.fee,
          quantity: 1,
        }],
        addressId: selectedAddressId,
        scheduledDate: dates[selectedDate].fullDate,
        scheduledTimeSlot: timeSlots.find(s => s.id === selectedTime)?.time || "",
        subtotal: selectedDoctor.fee,
        bookingType: "ecg",
        doctorName: selectedDoctor.name,
      },
    });
  };

  const handleSaveAddress = async () => {
    if (!supabaseUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to add an address",
        variant: "destructive",
      });
      return;
    }

    if (!newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Address added successfully",
      });
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
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setBookingStep("slot");
    setSelectedTime(null);
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Book ECG Test" />

      <div className="px-4 pb-8">
        {/* Select a Doctor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          <h3 className="font-semibold text-foreground mb-4">Available Doctors</h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-6 rounded-xl bg-muted/50 text-center">
              <p className="text-muted-foreground">No doctors available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  {/* Doctor Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">{doctor.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{doctor.specialization}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doctor.qualification}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-primary">₹{doctor.fee}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Consultation</p>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/50">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{doctor.experience}y</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Experience</p>
                    </div>
                    <div className="text-center border-l border-r border-border/50">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-foreground">{doctor.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">({doctor.reviews_count})</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-semibold text-foreground">Available</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{doctor.availability}</p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button
                    variant="hero"
                    className="w-full mt-3 h-10"
                    onClick={() => handleBookDoctor(doctor)}
                  >
                    Book Now - ₹{doctor.fee}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            💡 Quick Tips
          </h4>
          <ul className="space-y-1 text-sm text-foreground">
            <li>• All doctors are NABL certified and experienced cardiologists</li>
            <li>• Fees are inclusive of test and consultation</li>
            <li>• Reports will be available within 2 hours</li>
          </ul>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-[400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bookingStep === "slot" ? (
                <>
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Date & Time
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 text-primary" />
                  Select Address
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedDoctor && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{selectedDoctor.name}</p>
                  <p className="text-xs text-muted-foreground">12-Lead ECG Test</p>
                </div>
                <p className="font-bold text-primary">₹{selectedDoctor.fee}</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {bookingStep === "slot" ? (
              <motion.div
                key="slot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Date Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {dates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(index)}
                        className={`flex-shrink-0 w-14 py-2 rounded-xl text-center transition-all ${
                          selectedDate === index
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        <p className="text-xs opacity-80">{date.day}</p>
                        <p className="text-base font-bold">{date.date}</p>
                        <p className="text-xs opacity-80">{date.month}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Select Time Slot</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && setSelectedTime(slot.id)}
                        disabled={!slot.available}
                        className={`py-2.5 px-3 rounded-xl text-center transition-all text-sm ${
                          !slot.available
                            ? "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                            : selectedTime === slot.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleProceedToAddress}
                  disabled={!selectedTime}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Selected Slot Summary */}
                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{dates[selectedDate].day}, {dates[selectedDate].date} {dates[selectedDate].month}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{timeSlots.find(s => s.id === selectedTime)?.time}</span>
                    </div>
                  </div>
                </div>

                {/* Address Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Select Address</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setShowAddAddressModal(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add New
                    </Button>
                  </div>

                  {loadingAddresses ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No addresses saved</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowAddAddressModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          onClick={() => setSelectedAddressId(address.id)}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedAddressId === address.id
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-muted/50 border border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selectedAddressId === address.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted border border-border"
                            }`}>
                              {selectedAddressId === address.id && <Check className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="soft" className="text-xs">{address.type}</Badge>
                                {address.is_default && (
                                  <Badge variant="outline" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground mt-1 line-clamp-2">
                                {address.address_line1}, {address.city}, {address.state} - {address.pincode}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setBookingStep("slot")}
                  >
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleProceedToPayment}
                    disabled={!selectedAddressId && addresses.length > 0}
                  >
                    Proceed to Pay
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

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

export default ECGTestScreen;
