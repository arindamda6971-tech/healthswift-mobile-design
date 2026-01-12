import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, Tag, CreditCard, Wallet, Smartphone, ShoppingCart, MapPin, ChevronRight } from "lucide-react";
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

const paymentMethods = [
  { id: "upi", icon: Smartphone, name: "UPI", subtitle: "Google Pay, PhonePe, Paytm" },
  { id: "card", icon: CreditCard, name: "Card", subtitle: "Credit / Debit Card" },
  { id: "wallet", icon: Wallet, name: "Wallet", subtitle: "Paytm, Amazon Pay" },
];

const CartScreen = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { supabaseUserId } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [couponApplied, setCouponApplied] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
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

  const discount = couponApplied ? 100 : 0;
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "HEALTH100") {
      setCouponApplied(true);
    }
  };

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

        {/* Coupon section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="soft-card mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Apply Coupon</h3>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 bg-muted border-0 rounded-xl"
            />
            <Button
              variant="soft"
              onClick={applyCoupon}
              disabled={couponApplied}
            >
              {couponApplied ? "Applied" : "Apply"}
            </Button>
          </div>
          {couponApplied && (
            <Badge variant="softSuccess" className="mt-2">
              Coupon HEALTH100 applied - ₹100 off
            </Badge>
          )}
        </motion.div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full soft-card flex items-center gap-4 transition-all ${
                  selectedPayment === method.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <method.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground text-sm">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.subtitle}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPayment === method.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                } flex items-center justify-center`}>
                  {selectedPayment === method.id && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Price breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="soft-card mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Price Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Home Collection</span>
              <span className="text-success">FREE</span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coupon Discount</span>
                <span className="text-success">-₹{discount}</span>
              </div>
            )}
            <div className="h-px bg-border my-3" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">₹{total}</span>
            </div>
          </div>
          <Badge variant="softSuccess" className="mt-3">
            No hidden charges
          </Badge>
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
          onClick={() => navigate("/book", { state: { selectedAddressId } })}
          disabled={!selectedAddressId && addresses.length > 0}
        >
          Proceed to Book • ₹{total}
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