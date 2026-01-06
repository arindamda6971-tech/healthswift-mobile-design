import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  labId?: string;
  labName?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("healthswift-cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    console.log("Cart items changed, saving to localStorage:", items);
    localStorage.setItem("healthswift-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    console.log("CartContext.addToCart called with:", item);
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

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal }}
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
