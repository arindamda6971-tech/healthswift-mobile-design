import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { toast } from "sonner";

type AddressItem = {
  id: string;
  address: string;
  phone: string;
  lat?: number | null;
  lon?: number | null;
};

const STORAGE_KEY = "saved_addresses";

const SavedAddressesScreen = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [editing, setEditing] = useState<null | AddressItem>(null);
  const [addressValue, setAddressValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAddresses(JSON.parse(raw));
    } catch (err) {
      console.error("Failed to load saved addresses", err);
    }
  }, []);

  const persist = (items: AddressItem[]) => {
    setAddresses(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save addresses", err);
      toast.error("Failed to save addresses");
    }
  };

  const startAdd = () => {
    setEditing(null);
    setAddressValue("");
    setPhoneValue("");
    setTempCoords(null);
  };

  const startEdit = (item: AddressItem) => {
    setEditing(item);
    setAddressValue(item.address);
    setPhoneValue(item.phone);
    setTempCoords(item.lat != null && item.lon != null ? { lat: item.lat, lon: item.lon } : null);
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "HealthSwiftApp/1.0"
        }
      });
      const data = await res.json();
      return data.display_name || "";
    } catch (err) {
      console.error("Reverse geocode failed", err);
      return "";
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator?.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setTempCoords({ lat, lon });

      const addr = await reverseGeocode(lat, lon);
      if (addr) {
        setAddressValue(addr);
        toast.success("Location found");
      } else {
        toast.success("Coordinates obtained — you can save them");
      }

      setLocLoading(false);
    }, (err) => {
      console.error("Geolocation error", err);
      if (err.code === 1) toast.error("Location permission denied");
      else toast.error("Failed to get location");
      setLocLoading(false);
    }, { enableHighAccuracy: true, timeout: 15000 });
  };

  const handleSave = () => {
    if (!addressValue.trim()) {
      toast.error("Please enter an address");
      return;
    }

    if (!phoneValue.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (editing) {
      const updated = addresses.map((a) => (a.id === editing.id ? { ...a, address: addressValue, phone: phoneValue, lat: tempCoords?.lat ?? a.lat ?? null, lon: tempCoords?.lon ?? a.lon ?? null } : a));
      persist(updated);
      toast.success("Address updated");
    } else {
      const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.floor(Math.random()*10000)}`;
      const newItem: AddressItem = { id, address: addressValue, phone: phoneValue, lat: tempCoords?.lat ?? null, lon: tempCoords?.lon ?? null };
      persist([newItem, ...addresses]);
      toast.success("Address added");
    }

    setEditing(null);
    setAddressValue("");
    setPhoneValue("");
    setTempCoords(null);
  };

  const handleDelete = (id: string) => {
    const filtered = addresses.filter((a) => a.id !== id);
    persist(filtered);
    toast.success("Address removed");
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Saved Addresses" />

      <div className="px-4 pb-32">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p className="text-sm text-muted-foreground">Save your frequently used addresses and phone numbers for faster bookings and deliveries.</p>
        </motion.div>

        {editing !== null || addressValue !== "" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={addressValue} onChange={(e) => setAddressValue(e.target.value)} placeholder="Flat / Building, Street, City, State" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} placeholder="Mobile number" />
            </div>

            <div className="mt-2">
              <Button variant="outline" className="w-full mb-2" onClick={handleUseCurrentLocation} disabled={locLoading}>
                {locLoading ? "Locating..." : "Use my current location"}
              </Button>
              {tempCoords && (
                <p className="text-sm text-muted-foreground">Lat: {tempCoords.lat.toFixed(6)}, Lon: {tempCoords.lon.toFixed(6)}</p>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setEditing(null); setAddressValue(""); setPhoneValue(""); setTempCoords(null); }}>
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleSave}>
                Save Address
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            {addresses.length === 0 ? (
              <div className="soft-card p-6 text-center text-muted-foreground">
                <MapPin className="mx-auto w-8 h-8 text-muted-foreground" />
                <p className="mt-3">No saved addresses yet.</p>
                <p className="text-sm">Tap Add to create your first address.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className="soft-card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{a.address}</p>
                      <p className="text-sm text-muted-foreground mt-1">{a.phone}</p>
                      {a.lat != null && a.lon != null && (
                        <p className="text-xs text-muted-foreground mt-1">Lat: {a.lat.toFixed(6)}, Lon: {a.lon.toFixed(6)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(a)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add button fixed to bottom */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 safe-area-bottom">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => startAdd()}>
            Add Address
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => navigate(-1)}>
            Done
          </Button>
        </div>
      </motion.div>
    </MobileLayout>
  );
};

export default SavedAddressesScreen;
