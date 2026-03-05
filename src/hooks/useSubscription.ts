import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Subscription {
  id: string;
  user_id: string;
  subscription_plan: "monthly" | "yearly";
  membership_type: "gold" | "silver" | "bronze";
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled";
  amount_paid: number;
  is_auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isActive: boolean;
  membershipType: string | null;
  isLoading: boolean;
  error: Error | null;
  purchaseSubscription: (plan: "monthly" | "yearly") => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refetchSubscription: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: subscriptionError } = await (supabase
        .from("subscriptions" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single() as any);

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        throw subscriptionError;
      }

      setSubscription(data as Subscription | null);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch subscription"));
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const purchaseSubscription = useCallback(
    async (plan: "monthly" | "yearly") => {
      if (!user) {
        throw new Error("User must be logged in to purchase subscription");
      }

      // Call edge function instead of direct DB insert
      const { data, error: fnError } = await supabase.functions.invoke(
        "purchase-subscription",
        { body: { plan, action: "purchase" } }
      );

      if (fnError) throw new Error(fnError.message || "Failed to purchase subscription");
      if (data?.error) throw new Error(data.error);

      setSubscription(data.subscription as Subscription);
    },
    [user]
  );

  const cancelSubscription = useCallback(async () => {
    if (!subscription) {
      throw new Error("No active subscription to cancel");
    }

    // Call edge function instead of direct DB update
    const { data, error: fnError } = await supabase.functions.invoke(
      "purchase-subscription",
      { body: { action: "cancel" } }
    );

    if (fnError) throw new Error(fnError.message || "Failed to cancel subscription");
    if (data?.error) throw new Error(data.error);

    setSubscription(null);
  }, [subscription]);

  const refetchSubscription = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  const isActive = subscription
    ? new Date(subscription.end_date) > new Date() && subscription.status === "active"
    : false;

  const membershipType = subscription && isActive ? subscription.membership_type : null;

  return {
    subscription,
    isActive,
    membershipType,
    isLoading,
    error,
    purchaseSubscription,
    cancelSubscription,
    refetchSubscription,
  };
};
