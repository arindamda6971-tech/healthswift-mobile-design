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
  category?: string;
  labId?: string;
  labName?: string;
  vendorId?: string;
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
  labId?: string | null;
  labName?: string | null;
  vendorId?: string | null;
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
    const { cartItems, addressId, scheduledDate, scheduledTimeSlot, discount, paymentMethod, couponCode, patientName, patientAge, patientGender, patientPhone, labId, labName, vendorId } = body;

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

    // Server-side pricing for ECG items: look up from diagnostic_centers
    const ecgItems = cartItems.filter((i) => i.id.startsWith("ecg-"));
    if (ecgItems.length > 0) {
      // ECG item IDs follow pattern: ecg-{labId}-{doctorId} or ecg-{doctorId}
      const labIds = ecgItems
        .map((i) => {
          const parts = i.id.replace("ecg-", "").split("-");
          // If 2+ UUID-length parts, first is labId
          return parts.length >= 2 ? parts[0] : null;
        })
        .filter(Boolean) as string[];

      if (labIds.length > 0) {
        const { data: centers } = await adminClient
          .from("diagnostic_centers")
          .select("id, ecg_price")
          .in("id", labIds);

        if (centers) {
          for (const c of centers) {
            if (c.ecg_price != null) {
              // Map all ECG items from this lab to the lab's ecg_price
              for (const item of ecgItems) {
                if (item.id.includes(c.id)) {
                  priceMap[item.id] = Number(c.ecg_price);
                }
              }
            }
          }
        }
      }
    }

    // Server-side pricing for AI-recommended tests (from prescription analysis)
    // These have fixed category-based pricing maintained server-side
    const AI_TEST_PRICES: Record<string, number> = {
      "Blood": 299, "Thyroid": 399, "Liver": 449, "Kidney": 499,
      "Diabetes": 199, "Heart": 599, "Vitamin": 549, "Urine": 149,
      "Imaging": 999, "Other": 399,
    };

    // Validate and compute server-side subtotal
    let serverSubtotal = 0;
    for (const item of cartItems) {
      const serverPrice = priceMap[item.id];
      if (serverPrice !== undefined) {
        serverSubtotal += serverPrice * item.quantity;
      } else if (item.id.startsWith("ai-")) {
        // AI-recommended tests: look up price by category, ignoring client-supplied price
        const category = item.category || "Other";
        const validCategory = AI_TEST_PRICES[category] !== undefined ? category : "Other";
        const aiPrice = AI_TEST_PRICES[validCategory];
        serverSubtotal += aiPrice * item.quantity;
      } else if (item.id.startsWith("ecg-") && priceMap[item.id] === undefined) {
        // ECG item with no lab price found - reject
        return new Response(
          JSON.stringify({ error: "Could not verify ECG test pricing. Please try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Unknown item type - reject entirely
        return new Response(
          JSON.stringify({ error: "Unknown item in order" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate coupon server-side
    let serverDiscount = 0;
    if (couponCode && couponCode.toUpperCase() === "HEALTH100") {
      serverDiscount = 100;
    }

    const serverTotal = Math.max(0, serverSubtotal - serverDiscount);

    // Payment verification: only cash-on-delivery is supported without a payment gateway
    // Online payment methods are NOT accepted until a real payment gateway (Stripe/Razorpay) is integrated
    if (paymentMethod && paymentMethod !== "cash") {
      return new Response(
        JSON.stringify({ error: "Online payments are not yet available. Please select Cash on Delivery." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentStatus = "completed";
    const orderStatus = "confirmed";

    // Build special instructions
    let specialInstructions: string | null = null;
    if (patientName) {
      specialInstructions = `Patient: ${patientName} (Age: ${patientAge ?? "N/A"}${patientGender ? `, Gender: ${patientGender}` : ""}${patientPhone ? `, Phone: ${patientPhone}` : ""})`;
    }

    // Extract vendor_id from cart items or request body
    // If a diagnostic center is selected, look up its vendor_id
    let orderVendorId = vendorId || null;
    const firstLabId = labId || cartItems[0]?.labId;
    
    if (!orderVendorId && firstLabId) {
      const { data: centerData } = await adminClient
        .from("diagnostic_centers")
        .select("vendor_id")
        .eq("id", firstLabId)
        .single();
      
      if (centerData?.vendor_id) {
        orderVendorId = centerData.vendor_id;
      }
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
        vendor_id: orderVendorId,
        lab_name: labName || cartItems[0]?.labName || null,
        test_name: cartItems.length === 1 ? cartItems[0].name : `${cartItems.length} tests`,
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
      price: priceMap[item.id] !== undefined
        ? priceMap[item.id]
        : item.id.startsWith("ai-")
          ? AI_TEST_PRICES[AI_TEST_PRICES[item.category || "Other"] !== undefined ? (item.category || "Other") : "Other"]
          : item.price,
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
