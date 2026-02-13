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
  purchaseSubscription: (plan: "monthly" | "yearly", price: number) => Promise<void>;
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

      // Use any type to avoid TypeScript errors with new tables not yet synced to client types
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
    async (plan: "monthly" | "yearly", price: number) => {
      if (!user) {
        throw new Error("User must be logged in to purchase subscription");
      }

      try {
        // Calculate end date based on plan
        const endDate = new Date();
        if (plan === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        // First, cancel any previous subscription
        const { data: existingSubscriptions } = await (supabase
          .from("subscriptions" as any)
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active") as any);

        if (existingSubscriptions && existingSubscriptions.length > 0) {
          await (supabase
            .from("subscriptions" as any)
            .update({ status: "cancelled" })
            .eq("id", existingSubscriptions[0].id) as any);
        }

        // Insert new subscription
        const { data: newSubscription, error } = await (supabase
          .from("subscriptions" as any)
          .insert({
            user_id: user.id,
            subscription_plan: plan,
            membership_type: "gold",
            end_date: endDate.toISOString(),
            status: "active",
            amount_paid: price,
            is_auto_renew: true,
          })
          .select()
          .single() as any);

        if (error) throw error;

        // Update user profile subscription type
        await (supabase
          .from("profiles")
          .update({ subscription_type: "gold" as any } as any)
          .eq("id", user.id) as any);

        setSubscription(newSubscription as Subscription);
      } catch (err) {
        console.error("Error purchasing subscription:", err);
        throw err instanceof Error ? err : new Error("Failed to purchase subscription");
      }
    },
    [user]
  );

  const cancelSubscription = useCallback(async () => {
    if (!subscription) {
      throw new Error("No active subscription to cancel");
    }

    try {
      const { error } = await (supabase
        .from("subscriptions" as any)
        .update({ status: "cancelled" })
        .eq("id", subscription.id) as any);

      if (error) throw error;

      // Update user profile if we have a user id
      if (user?.id) {
        await (supabase
          .from("profiles")
          .update({ subscription_type: "none" as any } as any)
          .eq("id", user.id) as any);
      }

      setSubscription(null);
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      throw err instanceof Error ? err : new Error("Failed to cancel subscription");
    }
  }, [subscription, user?.id]);

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
