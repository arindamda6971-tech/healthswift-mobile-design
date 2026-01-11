import React, { createContext, useContext, useEffect, useState } from "react";

type AddressItem = {
  id: string;
  address: string;
  phone: string;
  lat?: number | null;
  lon?: number | null;
};

type AddressContextType = {
  addresses: AddressItem[];
  defaultAddressId: string | null;
  addAddress: (a: Omit<AddressItem, "id">) => AddressItem;
  updateAddress: (id: string, patch: Partial<AddressItem>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string | null) => void;
};

const STORAGE_KEY = "saved_addresses";
const DEFAULT_KEY = "saved_addresses_default";

const AddressContext = createContext<AddressContextType | null>(null);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAddresses(JSON.parse(raw));
    } catch (err) {
      console.error("Failed to load saved addresses", err);
    }
    try {
      const d = localStorage.getItem(DEFAULT_KEY);
      if (d) setDefaultAddressId(d);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch (err) {
      console.error("Failed to persist addresses", err);
    }
  }, [addresses]);

  useEffect(() => {
    try {
      if (defaultAddressId) localStorage.setItem(DEFAULT_KEY, defaultAddressId);
      else localStorage.removeItem(DEFAULT_KEY);
    } catch (err) {
      // ignore
    }
  }, [defaultAddressId]);

  const addAddress = (a: Omit<AddressItem, "id">) => {
    const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const newItem: AddressItem = { id, ...a };
    setAddresses((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateAddress = (id: string, patch: Partial<AddressItem>) => {
    setAddresses((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((p) => p.id !== id));
    if (defaultAddressId === id) setDefaultAddressId(null);
  };

  const setDefaultAddress = (id: string | null) => setDefaultAddressId(id);

  return (
    <AddressContext.Provider value={{ addresses, defaultAddressId, addAddress, updateAddress, removeAddress, setDefaultAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddresses = () => {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within AddressProvider");
  return ctx;
};

export default AddressContext;
