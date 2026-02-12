import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const PAYMENT_WEBHOOK_SECRET = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PAYMENT_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Webhook function not configured");
      return new Response(JSON.stringify({ error: "Not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Basic secret check to ensure calls are from your payment provider (configure provider to call this URL)
    const incomingSecret = req.headers.get("x-payment-secret") || "";
    if (incomingSecret !== PAYMENT_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const payload = await req.json();
    // Expect payload: { order_id: "<uuid>", status: "succeeded" }
    const orderId = payload.order_id;
    const status = payload.status;

    if (!orderId || !status) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Map provider status to order fields
    const paymentStatus = status === "succeeded" ? "completed" : status;
    const orderStatus = status === "succeeded" ? "confirmed" : "pending";

    // Update order via Supabase REST API using service role key
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ payment_status: paymentStatus, status: orderStatus }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Failed to update order:", resp.status, text);
      return new Response(JSON.stringify({ error: "Failed to update order" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
