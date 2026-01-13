// Health Assistant function removed — kept minimal placeholder to avoid accidental deploy errors
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(() => {
  return new Response(JSON.stringify({ error: "Health assistant function removed" }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  });
});
