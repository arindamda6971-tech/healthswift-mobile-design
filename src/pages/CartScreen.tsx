import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingCart, MapPin, ChevronRight, Clock, Calendar, Upload, FileImage, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Address = Tables<"addresses">;

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

const CartScreen = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { supabaseUserId } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(2);
  
  // Prescription upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  
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
        if (import.meta.env.DEV) console.error("Error fetching addresses:", error);
        setAddresses([]);
      } else if (data) {
        setAddresses(data);
        // Auto-select default address or first address
        const defaultAddress = data.find(addr => addr.is_default) || data[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        setAddresses([]);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Exception fetching addresses:", err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [supabaseUserId]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0], // YYYY-MM-DD format for DB
    };
  });

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
      
      // Refresh addresses and auto-select the new one
      await fetchAddresses();
      if (data) {
        setSelectedAddressId(data.id);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving address:", error);
      toast.error("Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  // Prescription upload handlers
  const handlePrescriptionSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      toast.error("Please upload a JPG/JPEG image only");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setPrescriptionFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPrescriptionPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPrescription = async () => {
    if (!prescriptionFile || !supabaseUserId) {
      toast.error("Please select a prescription image");
      return;
    }

    setUploadingPrescription(true);
    try {
      const fileExt = prescriptionFile.name.split('.').pop();
      const fileName = `${supabaseUserId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, prescriptionFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);

      setPrescriptionUrl(fileName);
      toast.success("Prescription uploaded successfully!");
    } catch (error) {
      console.error("Error uploading prescription:", error);
      toast.error("Failed to upload prescription");
    } finally {
      setUploadingPrescription(false);
    }
  };

  const handleRemovePrescription = async () => {
    if (prescriptionUrl && supabaseUserId) {
      try {
        await supabase.storage
          .from('prescriptions')
          .remove([prescriptionUrl]);
      } catch (error) {
        console.error("Error removing prescription:", error);
      }
    }
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    setPrescriptionUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!items || items.length === 0) {
    return (
      <MobileLayout>
        <ScreenHeader title="Your Cart" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Add tests to your cart to proceed with booking
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/categories") }>
              Browse Tests
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <ScreenHeader title="Your Cart" />

      <div className="px-4 pb-32">
        {/* Cart items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 mt-4"
        >
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="soft-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    {item.labName && (
                      <p className="text-xs text-muted-foreground mt-1">Booked from: {item.labName}</p>
                    )}
                    <p className="text-primary font-bold mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 text-foreground" />
                      </button>
                      <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 text-foreground" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : null}
        </motion.div>

        {/* Upload Prescription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileImage className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Upload Prescription</h3>
            <Badge variant="soft" className="text-xs">Optional</Badge>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,image/jpeg"
            onChange={handlePrescriptionSelect}
            className="hidden"
          />
          
          {!prescriptionPreview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full soft-card border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col items-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Upload Prescription Image</p>
                <p className="text-xs text-muted-foreground mt-1">JPG format only • Max 5MB</p>
              </div>
            </button>
          ) : (
            <div className="soft-card">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                  <img
                    src={prescriptionPreview}
                    alt="Prescription preview"
                    className="w-full h-full object-cover"
                  />
                  {prescriptionUrl && (
                    <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-success" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {prescriptionFile?.name || "Prescription"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {prescriptionFile ? `${(prescriptionFile.size / 1024).toFixed(1)} KB` : ""}
                  </p>
                  {prescriptionUrl ? (
                    <Badge variant="softSuccess" className="mt-2">Uploaded</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="soft"
                      className="mt-2 h-7 text-xs"
                      onClick={handleUploadPrescription}
                      disabled={uploadingPrescription}
                    >
                      {uploadingPrescription ? "Uploading..." : "Upload"}
                    </Button>
                  )}
                </div>
                <button
                  onClick={handleRemovePrescription}
                  className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Select Address Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Select Address</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="soft"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setShowAddAddressModal(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add New
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-xs h-auto p-0"
                onClick={() => navigate("/saved-addresses")}
              >
                Manage
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          
          {loadingAddresses ? (
            <div className="soft-card">
              <p className="text-sm text-muted-foreground">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="soft-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">No addresses saved</p>
                </div>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => setShowAddAddressModal(true)}
                >
                  Add New
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`w-full soft-card flex items-start gap-3 transition-all text-left ${
                    selectedAddressId === address.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm capitalize">{address.type || "Home"}</p>
                      {address.is_default && (
                        <Badge variant="soft" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                      , {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ${
                    selectedAddressId === address.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  } flex items-center justify-center`}>
                    {selectedAddressId === address.id && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Date selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
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
              </button>
            ))}
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
          onClick={() => navigate("/payment", { 
            state: { 
              cartItems: items, 
              addressId: selectedAddressId, 
              scheduledDate: dates[selectedDate].fullDate,
              scheduledTimeSlot: timeSlots.find(s => s.id === selectedTime)?.time || "",
              subtotal 
            } 
          })}
          disabled={!selectedAddressId && addresses.length > 0}
        >
          Proceed to Payment • ₹{subtotal}
        </Button>
      </motion.div>

      {/* Add Address Modal */}
      <Dialog open={showAddAddressModal} onOpenChange={setShowAddAddressModal}>
        <DialogContent className="max-w-[400px] mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="address_type">Address Type</Label>
              <Select
                value={newAddress.type}
                onValueChange={(value) => setNewAddress({ ...newAddress, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
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

export default CartScreen;