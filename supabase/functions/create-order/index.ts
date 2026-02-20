import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderItemInput {
  id: string;
  name: string;
  price: number;
  quantity: number;
  familyMemberId?: string;
  packageId?: string;
}

interface CreateOrderRequest {
  cartItems: OrderItemInput[];
  addressId: string | null;
  scheduledDate: string | null;
  scheduledTimeSlot: string | null;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string | null;
  couponCode: string | null;
  patientName?: string;
  patientAge?: number | string | null;
  patientGender?: string | null;
  patientPhone?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate user with anon client
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Parse request body
    const body: CreateOrderRequest = await req.json();
    const { cartItems, addressId, scheduledDate, scheduledTimeSlot, discount, paymentMethod, couponCode, patientName, patientAge, patientGender, patientPhone } = body;

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "No items in order" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side price validation: fetch actual prices from DB
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const testIds = cartItems.filter((i) => !i.id.startsWith("ecg-") && !i.id.startsWith("ai-")).map((i) => i.id);

    let priceMap: Record<string, number> = {};

    if (testIds.length > 0) {
      const { data: tests } = await adminClient
        .from("tests")
        .select("id, price")
        .in("id", testIds);

      if (tests) {
        for (const t of tests) {
          priceMap[t.id] = Number(t.price);
        }
      }

      // Also check packages
      const { data: packages } = await adminClient
        .from("test_packages")
        .select("id, price")
        .in("id", testIds);

      if (packages) {
        for (const p of packages) {
          priceMap[p.id] = Number(p.price);
        }
      }
    }

    // Validate and compute server-side subtotal
    let serverSubtotal = 0;
    for (const item of cartItems) {
      const serverPrice = priceMap[item.id];
      if (serverPrice !== undefined) {
        // Use the server price, not client-supplied price
        serverSubtotal += serverPrice * item.quantity;
      } else {
        // For ECG/AI items not in DB, accept client price but cap at reasonable amount
        if (item.price > 50000) {
          return new Response(
            JSON.stringify({ error: "Invalid item price" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        serverSubtotal += item.price * item.quantity;
      }
    }

    // Validate coupon server-side
    let serverDiscount = 0;
    if (couponCode && couponCode.toUpperCase() === "HEALTH100") {
      serverDiscount = 100;
    }

    const serverTotal = Math.max(0, serverSubtotal - serverDiscount);

    // Determine payment status
    // Only cash-on-delivery is currently supported as "verified"
    // Online payment methods require gateway integration (not yet implemented)
    const isCash = paymentMethod === "cash";
    const paymentStatus = isCash ? "completed" : "pending";
    const orderStatus = isCash ? "confirmed" : "pending";

    // Build special instructions
    let specialInstructions: string | null = null;
    if (patientName) {
      specialInstructions = `Patient: ${patientName} (Age: ${patientAge ?? "N/A"}${patientGender ? `, Gender: ${patientGender}` : ""}${patientPhone ? `, Phone: ${patientPhone}` : ""})`;
    }

    // Create order using service role (bypasses RLS for insert)
    const { data: orderData, error: orderError } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        address_id: addressId || null,
        scheduled_date: scheduledDate || null,
        scheduled_time_slot: scheduledTimeSlot || null,
        subtotal: serverSubtotal,
        discount: serverDiscount,
        total: serverTotal,
        payment_method: paymentMethod || null,
        status: orderStatus,
        payment_status: paymentStatus,
        coupon_code: couponCode || null,
        special_instructions: specialInstructions,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order items with server-validated prices
    const orderItems = cartItems.map((item) => ({
      order_id: orderData.id,
      test_id: item.id.startsWith("ecg-") || item.id.startsWith("ai-") ? null : item.id,
      package_id: item.packageId || null,
      quantity: item.quantity,
      price: priceMap[item.id] !== undefined ? priceMap[item.id] : item.price,
      family_member_id: item.familyMemberId || null,
    }));

    const { error: itemsError } = await adminClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Cleanup: delete the order
      await adminClient.from("orders").delete().eq("id", orderData.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        orderNumber: orderData.order_number,
        total: serverTotal,
        paymentStatus,
        status: orderStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
