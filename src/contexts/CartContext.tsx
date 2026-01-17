import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  labId?: string;
  labName?: string;
  quantity: number;
  familyMemberId?: string;
}

interface PendingItem {
  item: Omit<CartItem, "quantity">;
  existingLabName: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateFamilyMember: (id: string, familyMemberId: string | undefined) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  currentLabId: string | null;
  currentLabName: string | null;
  pendingItem: PendingItem | null;
  confirmReplace: () => void;
  cancelReplace: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Use sessionStorage for sensitive health data - clears when browser tab closes
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = sessionStorage.getItem("healthswift-cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) console.log("Cart items changed, saving to sessionStorage:", items);
    sessionStorage.setItem("healthswift-cart", JSON.stringify(items));
  }, [items]);

  // Get current lab from cart items
  const currentLabId = items.length > 0 ? items[0].labId || null : null;
  const currentLabName = items.length > 0 ? items[0].labName || null : null;

  const addToCart = (item: Omit<CartItem, "quantity">): boolean => {
    console.log("CartContext.addToCart called with:", item);
    
    // Check if cart has items from a different lab
    if (items.length > 0 && item.labId && currentLabId && item.labId !== currentLabId) {
      // Set pending item and return false to indicate conflict
      setPendingItem({ item, existingLabName: currentLabName || "another lab" });
      return false;
    }
    
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const updated = prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        console.log("Cart updated (increment):", updated);
        return updated;
      }
      const updated = [...prev, { ...item, quantity: 1 }];
      console.log("Cart updated (new):", updated);
      return updated;
    });
    return true;
  };

  const confirmReplace = () => {
    if (pendingItem) {
      // Clear cart and add the new item
      setItems([{ ...pendingItem.item, quantity: 1 }]);
      setPendingItem(null);
    }
  };

  const cancelReplace = () => {
    setPendingItem(null);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const updateFamilyMember = (id: string, familyMemberId: string | undefined) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, familyMemberId }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        updateFamilyMember, 
        clearCart, 
        itemCount, 
        subtotal,
        currentLabId,
        currentLabName,
        pendingItem,
        confirmReplace,
        cancelReplace
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
