import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Subscribe to real-time updates on the products table.
 * When vendors update product details (price, availability, description),
 * this hook will invalidate relevant queries to refresh the UI.
 */
export const useRealtimeProducts = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          console.log("Products realtime update:", payload);

          // Invalidate product-related queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["labs"] });
          queryClient.invalidateQueries({ queryKey: ["tests"] });

          // Show toast for significant changes
          if (payload.eventType === "UPDATE") {
            const newData = payload.new as { product_name?: string; availability?: boolean };
            if (newData.availability === false) {
              toast.info(`Product "${newData.product_name}" is now unavailable`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
