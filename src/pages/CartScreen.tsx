import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, Tag, CreditCard, Wallet, Smartphone, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useCart } from "@/contexts/CartContext";

const paymentMethods = [
  { id: "upi", icon: Smartphone, name: "UPI", subtitle: "Google Pay, PhonePe, Paytm" },
  { id: "card", icon: CreditCard, name: "Card", subtitle: "Credit / Debit Card" },
  { id: "wallet", icon: Wallet, name: "Wallet", subtitle: "Paytm, Amazon Pay" },
];

const CartScreen = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [couponApplied, setCouponApplied] = useState(false);

  const discount = couponApplied ? 100 : 0;
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "HEALTH100") {
      setCouponApplied(true);
    }
  };

  const [showDebug, setShowDebug] = useState(false);

  if (items.length === 0) {
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
            <Button variant="outline" onClick={() => setShowDebug((s) => !s)}>
              {showDebug ? "Hide debug" : "Show debug"}
            </Button>
          </div>
          {showDebug && (
            <pre className="mt-4 p-3 bg-muted text-xs rounded max-w-full overflow-auto w-full text-left">{
              JSON.stringify({ items, storage: localStorage.getItem("healthswift-cart") }, null, 2)
            }</pre>
          )}
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
          {items.map((item, index) => (
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
          ))}
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
          onClick={() => navigate("/book")}
        >
          Proceed to Book • ₹{total}
        </Button>
      </motion.div>
    </MobileLayout>
  );
};

export default CartScreen;
