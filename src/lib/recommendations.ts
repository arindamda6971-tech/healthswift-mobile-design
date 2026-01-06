import { supabase } from "@/integrations/supabase/client";

export async function getRecommendationsForCart(cartItems: Array<{ id: string }>) {
  if (!cartItems || cartItems.length === 0) return [];

  // Extract test ids from cart items (id could be "testId" or "testId-labId")
  const cartTestIds = cartItems.map((c) => c.id.split("-")[0]);

  // Fetch categories for tests in cart
  const { data: testsInCart, error: testsError } = await supabase
    .from("tests")
    .select("id, category_id")
    .in("id", cartTestIds);

  if (testsError) {
    console.error("getRecommendationsForCart - fetching cart tests failed", testsError);
    return [];
  }

  const categories = Array.from(new Set((testsInCart || []).map((t: any) => t.category_id).filter(Boolean)));
  if (categories.length === 0) return [];

  // Fetch tests in the same categories excluding ones already in cart
  const { data: recs, error: recsError } = await supabase
    .from("tests")
    .select("id, name, price, is_popular, category_id")
    .in("category_id", categories)
    .not("id", "in", `(${cartTestIds.map((id) => `'${id}'`).join(",")})`)
    .order("is_popular", { ascending: false })
    .limit(6);

  if (recsError) {
    console.error("getRecommendationsForCart - fetching recommendations failed", recsError);
    return [];
  }

  return recs || [];
}
