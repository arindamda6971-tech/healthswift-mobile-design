import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Repeat } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { fetchOrdersForUser } from "@/integrations/supabase/orders";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

const OrderHistoryScreen = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data: orders = [], isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => fetchOrdersForUser() });

  const handleReorder = (order: any) => {
    if (!order || !order.order_items) return;
    order.order_items.forEach((oi: any) => {
      const test = oi.tests || null;
      const id = test ? test.id : oi.test_id || oi.id;
      const name = test ? test.name : "Test";
      const price = oi.price || (test ? test.price : 0);
      // Add with quantity times
      for (let i = 0; i < (oi.quantity || 1); i++) {
        addToCart({ id, name, price });
      }
    });
    toast({ title: "Added", description: "Items added to cart — review and book" });
    navigate("/cart");
  };

  return (
    <MobileLayout>
      <ScreenHeader title="Order History" />

      <div className="px-4 pb-32">
        {isLoading && <p>Loading...</p>}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">You have no previous orders</p>
            <Button onClick={() => navigate('/categories')} className="mt-4">Browse Tests</Button>
          </div>
        )}

        <div className="space-y-3 mt-4">
          {orders.map((order: any) => (
            <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="soft-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{order.order_number || order.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₹{order.total}</p>
                  <p className="text-xs text-muted-foreground">{order.status}</p>
                </div>
              </div>

              <div className="mt-3">
                {order.order_items && order.order_items.map((oi: any) => (
                  <div key={oi.id} className="flex items-center justify-between py-2 border-t border-border">
                    <div>
                      <p className="text-sm font-medium">{oi.tests?.name || "Test"}</p>
                      <p className="text-xs text-muted-foreground">Qty: {oi.quantity} • ₹{oi.price}</p>
                    </div>
                    <div>
                      <Button size="sm" variant="ghost" onClick={() => { addToCart({ id: oi.tests?.id || oi.test_id, name: oi.tests?.name || 'Test', price: oi.price }); toast({ title: 'Added', description: 'Added to cart' }); }}>
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => navigate(`/report-detail`, { state: { orderId: order.id } })}>
                  View Details
                </Button>
                <Button variant="success" onClick={() => handleReorder(order)}>
                  <Repeat className="w-4 h-4 mr-2" /> Reorder
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default OrderHistoryScreen;
