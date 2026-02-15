import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Shield,
  Star,
  Navigation,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

const phlebotomist = {
  name: "Rahul Sharma",
  photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
  rating: 4.9,
  reviews: 234,
  verificationId: "HS-2024-8721",
  experience: "5+ years",
};

const trackingSteps = [
  { id: 1, title: "Booking Confirmed", time: "10:30 AM", completed: true },
  { id: 2, title: "Phlebotomist Assigned", time: "10:32 AM", completed: true },
  { id: 3, title: "On the way", time: "10:45 AM", completed: true, current: true },
  { id: 4, title: "Sample Collection", time: "", completed: false },
  { id: 5, title: "Delivered to Lab", time: "", completed: false },
];

interface BookingState {
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    familyMemberId?: string;
    packageId?: string;
  }>;
  addressId: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  subtotal: number;
  couponApplied?: boolean;
  discount?: number;
  total?: number;
  selectedPayment?: string;
}

const TrackingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabaseUserId } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const [eta, setEta] = useState(12);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Show phlebotomist personal details only to authenticated users with an order
  const showPhleboDetails = !!supabaseUserId && !!orderId;

  useEffect(() => {
    const createOrder = async () => {
      if (isCreatingOrder || orderId) return;

      const bookingState = location.state as BookingState | undefined;
      const stateCartItems = bookingState?.cartItems || cartItems;
      
      if (!stateCartItems || stateCartItems.length === 0 || !supabaseUserId) {
        if (!supabaseUserId) setOrderError("Please log in to complete your booking");
        else if (!stateCartItems || stateCartItems.length === 0) setOrderError("No items to book");
        return;
      }

      setIsCreatingOrder(true);
      setOrderError(null);
      
      try {
        const subtotal = bookingState?.subtotal || stateCartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
        const discount = bookingState?.discount || 0;
        const total = bookingState?.total || subtotal;

        // Enforce payment verification: do not create orders for non-cash payments unless
        // `paymentVerified` is explicitly true in the navigation state.
        const paymentMethod = bookingState?.selectedPayment || null;
        const paymentVerified = bookingState?.paymentVerified === true;

        if (paymentMethod && paymentMethod !== 'cash' && !paymentVerified) {
          // Block order creation — payment not verified
          setOrderError('Payment not verified. Please complete payment before booking.');
          setIsCreatingOrder(false);
          // Send user back to payment screen to complete verification
          navigate('/payment', { state: bookingState });
          return;
        }

        // Create order with booking details — mark payment/status appropriately
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: supabaseUserId,
            address_id: bookingState?.addressId || null,
            scheduled_date: bookingState?.scheduledDate || null,
            scheduled_time_slot: bookingState?.scheduledTimeSlot || null,
            subtotal: subtotal,
            discount: discount,
            total: total,
            payment_method: paymentMethod,
            status: paymentVerified ? 'confirmed' : 'pending',
            payment_status: paymentVerified ? 'completed' : 'pending',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        setOrderId(orderData.id);

        // Create order items with family_member_id
        const orderItems = stateCartItems.map((item: any) => ({
          order_id: orderData.id,
          test_id: item.id,
          package_id: item.packageId || null,
          quantity: item.quantity,
          price: item.price,
          family_member_id: item.familyMemberId || null,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Clear cart after successful order creation
        clearCart();
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error creating order:", error);
        setOrderError("Failed to create order. Please try again.");
      } finally {
        setIsCreatingOrder(false);
      }
    };

    createOrder();
  }, [supabaseUserId, location.state, isCreatingOrder, orderId, cartItems, clearCart]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => Math.max(1, prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Show loading or error state
  if (isCreatingOrder) {
    return (
      <MobileLayout showNav={false}>
        <ScreenHeader title="Processing..." />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Creating your order...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we confirm your booking</p>
        </div>
      </MobileLayout>
    );
  }

  if (orderError) {
    return (
      <MobileLayout showNav={false}>
        <ScreenHeader title="Booking Error" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">{orderError}</h2>
          <p className="text-sm text-muted-foreground mb-6">Please go back and try again</p>
          <Button variant="soft" onClick={() => navigate("/cart")}>
            Return to Cart
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Live Tracking" />

      <div className="px-4 pb-8">
        {/* Map area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 h-52 rounded-2xl bg-gradient-to-br from-primary/20 to-success/10 relative overflow-hidden"
        >
          {/* Map pattern */}
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234AB3F4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          
          {/* Animated route line */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.path
              d="M 50 180 Q 100 150, 150 120 T 250 80 T 350 60"
              stroke="hsl(201 88% 62%)"
              strokeWidth="3"
              strokeDasharray="8 4"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          {/* User location */}
          <div className="absolute bottom-8 left-10">
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-success-foreground" />
            </div>
            <p className="text-xs text-foreground mt-1 font-medium">Your location</p>
          </div>

          {/* Phlebotomist location */}
          <motion.div
            className="absolute top-12 right-16"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-12 h-12 rounded-full border-4 border-card overflow-hidden shadow-xl">
              <img
                src={phlebotomist.photo}
                alt={phlebotomist.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* ETA badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="default" className="bg-card text-foreground shadow-lg py-2 px-3">
              <Navigation className="w-4 h-4 mr-2 text-primary" />
              ETA: {eta} mins
            </Badge>
          </div>
        </motion.div>

        {/* Phlebotomist card (sensitive info hidden from unauthenticated users) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="soft-card mt-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              {showPhleboDetails ? (
                <img
                  src={phlebotomist.photo}
                  alt={phlebotomist.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">Assigned</div>
              )}

              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-card">
                <Shield className="w-3 h-3 text-success-foreground" />
              </div>
            </div>

            <div className="flex-1">
              {showPhleboDetails ? (
                <>
                  <h3 className="font-bold text-foreground">{phlebotomist.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">{phlebotomist.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({phlebotomist.reviews} reviews)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">ID: {phlebotomist.verificationId} • {phlebotomist.experience}</p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-foreground">Phlebotomist assigned</h3>
                  <p className="text-xs text-muted-foreground mt-1">Details available after booking</p>
                </>
              )}
            </div>
          </div>

          {/* Action buttons (disabled when details are hidden) */}
          <div className="flex gap-2 mt-4">
            <Button variant="soft" className="flex-1" size="sm" disabled={!showPhleboDetails}>
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button variant="softSuccess" className="flex-1" size="sm" disabled={!showPhleboDetails}>
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>
        </motion.div>

        {/* Tracking timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="soft-card mt-4"
        >
          <h3 className="font-semibold text-foreground mb-4">Tracking Status</h3>
          <div className="space-y-4">
            {trackingSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-success"
                      : step.current
                      ? "bg-primary animate-pulse"
                      : "bg-muted"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-success-foreground" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${
                        step.current ? "bg-primary-foreground" : "bg-muted-foreground"
                      }`} />
                    )}
                  </div>
                  {index < trackingSteps.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      step.completed ? "bg-success" : "bg-muted"
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${
                      step.completed || step.current ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </p>
                    {step.current && <Badge variant="live">Live</Badge>}
                  </div>
                  {step.time && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {step.time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Support button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/home")}
          >
            Need Help? Contact Support
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default TrackingScreen;
