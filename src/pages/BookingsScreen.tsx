import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Activity,
  Heart,
  Stethoscope,
  TestTube,
  ChevronRight,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

type Order = {
  id: string;
  order_number: string | null;
  status: string | null;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  total: number;
  created_at: string;
  payment_status: string | null;
};

const BookingsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
      case "confirmed":
        return "bg-primary/10 text-primary";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      case "in_progress":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "in_progress":
        return "In Progress";
      default:
        return status || "Unknown";
    }
  };

  const getBookingIcon = (orderNumber: string | null) => {
    if (orderNumber?.startsWith("ECG")) return Activity;
    if (orderNumber?.startsWith("PHY")) return Heart;
    if (orderNumber?.startsWith("DOC")) return Stethoscope;
    return TestTube;
  };

  const getBookingType = (orderNumber: string | null) => {
    if (orderNumber?.startsWith("ECG")) return "ECG Test";
    if (orderNumber?.startsWith("PHY")) return "Physiotherapy";
    if (orderNumber?.startsWith("DOC")) return "Consultation";
    return "Lab Test";
  };

  const upcomingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "in_progress"
  );
  const pastOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "cancelled"
  );

  const renderOrderCard = (order: Order, index: number) => {
    const BookingIcon = getBookingIcon(order.order_number);
    const bookingType = getBookingType(order.order_number);

    return (
      <motion.div
        key={order.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="soft-card cursor-pointer"
        onClick={() => navigate("/tracking/" + order.id)}
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookingIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground text-sm">{bookingType}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.order_number || `#${order.id.slice(0, 8)}`}
                </p>
              </div>
              <Badge className={`text-[10px] ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>

            <div className="mt-3 space-y-1.5">
              {order.scheduled_date && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(order.scheduled_date), "MMM dd, yyyy")}</span>
                </div>
              )}
              {order.scheduled_time_slot && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{order.scheduled_time_slot}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="font-semibold text-foreground">₹{order.total}</span>
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                View Details
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEmptyState = (type: string) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">No {type} Bookings</h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">
        {type === "upcoming"
          ? "You don't have any upcoming appointments. Book a test to get started!"
          : "Your past bookings will appear here once completed."}
      </p>
    </motion.div>
  );

  return (
    <MobileLayout>
      <ScreenHeader title="My Bookings" showBack={false} />

      <div className="px-4 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming" className="text-sm">
              Upcoming ({upcomingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-sm">
              Past ({pastOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="soft-card animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingOrders.length > 0 ? (
              upcomingOrders.map((order, idx) => renderOrderCard(order, idx))
            ) : (
              renderEmptyState("upcoming")
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="soft-card animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pastOrders.length > 0 ? (
              pastOrders.map((order, idx) => renderOrderCard(order, idx))
            ) : (
              renderEmptyState("past")
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default BookingsScreen;
