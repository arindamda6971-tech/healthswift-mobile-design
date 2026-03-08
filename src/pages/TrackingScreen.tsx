import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

interface PhlebotomistInfo {
  name: string;
  photo_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  experience_years: number | null;
}

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
    labId?: string;
    labName?: string;
    vendorId?: string;
    category?: string;
  }>;
  addressId: string | null;
  scheduledDate: string | null;
  scheduledTimeSlot: string | null;
  subtotal: number;
  couponApplied?: boolean;
  discount?: number;
  total?: number;
  selectedPayment?: string;
  paymentVerified?: boolean;
  patientName?: string;
  patientAge?: number | string;
  patientGender?: string | null;
  patientPhone?: string | null;
}

const TrackingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const paramOrderId = params.orderId;
  const { supabaseUserId } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const [eta, setEta] = useState(12);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [fetchedBooking, setFetchedBooking] = useState<BookingState | undefined>(undefined);
  const [phlebotomist, setPhlebotomist] = useState<PhlebotomistInfo | null>(null);

  // Subscribe to real-time order status updates
  const { latestStatus } = useRealtimeOrders(paramOrderId || orderId || undefined);

  // expose booking state for UI (patient info / schedule)
  const bookingState = location.state as BookingState | undefined;
  const effectiveBookingState = bookingState || fetchedBooking;

  // Show phlebotomist personal details only to authenticated users with an order and assigned phlebotomist
  const showPhleboDetails = !!supabaseUserId && !!orderId && !!phlebotomist;

  // Fetch phlebotomist info when order is loaded
  useEffect(() => {
    if (!orderId || !supabaseUserId) return;
    const fetchPhlebotomist = async () => {
      try {
        // Get phlebotomist_id from order
        const { data: orderData } = await supabase
          .from("orders")
          .select("phlebotomist_id")
          .eq("id", orderId)
          .single();
        if (!orderData?.phlebotomist_id) return;

        // Fetch safe fields from the public view
        const { data: phlebo } = await supabase
          .from("phlebotomists_public")
          .select("name, photo_url, rating, reviews_count, experience_years")
          .eq("id", orderData.phlebotomist_id)
          .single();
        if (phlebo && phlebo.name) setPhlebotomist(phlebo as PhlebotomistInfo);
      } catch {
        // silently fail — phlebotomist section just won't show
      }
    };
    fetchPhlebotomist();
  }, [orderId, supabaseUserId]);

  // If :orderId exists in the URL, fetch and display the existing order instead of creating a new one
  useEffect(() => {
    if (!paramOrderId) return;
    const fetchOrder = async () => {
      try {
        const { data: orderData, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", paramOrderId)
          .single();

        if (error || !orderData) {
          setOrderError("Order not found");
          return;
        }

        setOrderId(orderData.id);
        setFetchedBooking({
          cartItems: [],
          addressId: orderData.address_id || null,
          scheduledDate: orderData.scheduled_date || null,
          scheduledTimeSlot: orderData.scheduled_time_slot || null,
          subtotal: orderData.subtotal ?? 0,
          couponApplied: !!orderData.coupon_code,
          discount: orderData.discount ?? 0,
          total: orderData.total ?? orderData.subtotal ?? 0,
          selectedPayment: orderData.payment_method ?? undefined,
          paymentVerified: orderData.payment_status === "completed",
          patientName: undefined,
          patientAge: undefined,
          patientGender: undefined,
          patientPhone: undefined,
        });
      } catch (err) {
        if (import.meta.env.DEV) console.error("Error fetching order:", err);
        setOrderError("Failed to fetch order");
      }
    };

    fetchOrder();
  }, [paramOrderId]);

  useEffect(() => {
    const createOrder = async () => {
      if (paramOrderId) return; // don't create when viewing existing order
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
        const paymentMethod = bookingState?.selectedPayment || null;

        // Create order via server-side edge function for price validation
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) {
          setOrderError("Please log in to complete your booking");
          setIsCreatingOrder(false);
          return;
        }

        const { data: fnData, error: fnError } = await supabase.functions.invoke("create-order", {
          body: {
            cartItems: stateCartItems.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              familyMemberId: item.familyMemberId || null,
              packageId: item.packageId || null,
              category: item.category || null,
              labId: item.labId || null,
              labName: item.labName || null,
              vendorId: item.vendorId || null,
            })),
            addressId: bookingState?.addressId || null,
            scheduledDate: bookingState?.scheduledDate || null,
            scheduledTimeSlot: bookingState?.scheduledTimeSlot || null,
            subtotal,
            discount,
            total,
            paymentMethod,
            couponCode: bookingState?.couponApplied ? "HEALTH100" : null,
            patientName: bookingState?.patientName,
            patientAge: bookingState?.patientAge,
            patientGender: bookingState?.patientGender,
            patientPhone: bookingState?.patientPhone,
            labId: stateCartItems[0]?.labId || null,
            labName: stateCartItems[0]?.labName || null,
            vendorId: stateCartItems[0]?.vendorId || null,
          },
        });

        if (fnError) throw fnError;
        if (fnData?.error) throw new Error(fnData.error);

        setOrderId(fnData.orderId);

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
              {phlebotomist?.photo_url ? (
                <img src={phlebotomist.photo_url} alt={phlebotomist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
              )}
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

          {/* Booking summary / patient info */}
          {effectiveBookingState?.patientName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="soft-card mt-4 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-semibold text-foreground">{effectiveBookingState.patientName}</p>

                  <div className="mt-2 flex items-center gap-3">
                    {effectiveBookingState.patientPhone && (
                      <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{effectiveBookingState.patientPhone}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">Age: {effectiveBookingState.patientAge ?? 'N/A'} • Gender: {effectiveBookingState.patientGender ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p className="font-semibold text-foreground">{effectiveBookingState.scheduledDate ?? 'Today'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{effectiveBookingState.scheduledTimeSlot ?? 'Any time'}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phlebotomist details (visible to authenticated users with an order) */}
          {showPhleboDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="soft-card mt-4 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {phlebotomist!.photo_url ? (
                    <img src={phlebotomist!.photo_url} alt={phlebotomist!.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Phlebotomist</p>
                  <p className="font-semibold text-foreground">{phlebotomist!.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Experience: {phlebotomist!.experience_years ? `${phlebotomist!.experience_years}+ years` : 'Experienced'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="soft" size="sm" className="h-8">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

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
