import { supabase } from "./client";

export async function createOrderFromCart({ items, subtotal, addressId, familyMemberId, scheduledDate, scheduledTimeSlot }: {
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  addressId?: string | null;
  familyMemberId?: string | null;
  scheduledDate?: string | null;
  scheduledTimeSlot?: string | null;
}) {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  // Create order
  const total = subtotal; // discount/coupon handling can be added later
  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert([{ user_id: userId, subtotal, total, address_id: addressId ?? null, family_member_id: familyMemberId ?? null, scheduled_date: scheduledDate ?? null, scheduled_time_slot: scheduledTimeSlot ?? null, status: "confirmed" }])
    .select("id, order_number")
    .single();

  if (orderError || !createdOrder) {
    console.error("createOrderFromCart: order insert error", orderError);
    throw orderError || new Error("Failed to create order");
  }

  const orderId = createdOrder.id;

  // Prepare order_items rows
  const orderItems = items.map((it) => {
    // Cart item id may be like `testId-labId` or just `testId` - extract test id
    const parsed = it.id.split("-")[0];
    const maybeUuid = parsed;

    return {
      order_id: orderId,
      test_id: maybeUuid || null,
      package_id: null,
      quantity: it.quantity || 1,
      price: it.price,
      family_member_id: null,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    console.error("createOrderFromCart: order_items insert error", itemsError);
    // We don't attempt to rollback here (client-sided). In production this should be an RPC for atomicity.
    throw itemsError;
  }

  return { orderId, orderNumber: createdOrder.order_number };
}

export async function fetchOrdersForUser() {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, tests(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchOrdersForUser error", error);
    throw error;
  }

  return data;
}
