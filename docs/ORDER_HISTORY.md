✅ Order History & Recommendations — Implementation notes

What I added

- Backend helpers
  - `src/integrations/supabase/orders.ts`
    - `createOrderFromCart(...)` — inserts into `orders` and `order_items`.
    - `fetchOrdersForUser()` — fetches orders with `order_items` and related `tests`.

- Recommendations
  - `src/lib/recommendations.ts`
    - `getRecommendationsForCart(cartItems)` — suggests tests from same categories (excludes cart items).

- UI changes
  - `src/pages/BookingScreen.tsx`
    - Booking now creates an Order on Confirm and navigates to `/tracking` with `{ orderId }` in `location.state`.
  - `src/pages/OrderHistoryScreen.tsx`
    - New page at `/orders` (protected). Shows past orders, items, and supports "Reorder".
  - `src/pages/CartScreen.tsx`
    - Shows recommendations based on cart contents and allows adding recommended tests.
  - `src/App.tsx`
    - Added route `/orders`.
  - `src/pages/ProfileScreen.tsx`
    - Added "Orders" quick entry in the profile menu.

Manual verification steps

1. Add tests to the cart (from test listing or test detail).
2. Go to Cart -> Proceed to Book -> Confirm Booking.
   - Booking should create an order (Supabase) and navigate to Tracking.
3. Open Profile -> Orders: you should see recent orders with items and totals.
4. Use "Reorder" on an order — items should be added to cart.
5. On Cart page you should see recommendations (if there are related tests) — try adding them.

Notes / Caveats

- Order creation is done client-side via Supabase inserts. For production atomicity you should implement a server-side RPC that inserts orders and items in a transaction.
- Recommendations are simple (category-based). We can improve with ML or rules later.

If you want, I can:
- Add a server-side RPC to make order creation transactional.
- Add unit tests and an E2E test to verify order creation and reorder flow.

---
