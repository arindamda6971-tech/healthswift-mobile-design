import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface FamilyMember {
  id: string;
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  relationship: string;
  customRelationship?: string;
}

const RELATIONSHIPS = [
  "Self",
  "Father",
  "Mother",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandfather",
  "Grandmother",
  "Other",
] as const;

export { RELATIONSHIPS };

const STORAGE_KEY = "bloodlyn-family-members";

function getStorageKey(userId: string | null) {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function useFamilyMembers() {
  const { supabaseUserId } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(supabaseUserId));
    if (stored) {
      try {
        setMembers(JSON.parse(stored));
      } catch {
        setMembers([]);
      }
    } else {
      setMembers([]);
    }
  }, [supabaseUserId]);

  const persist = useCallback(
    (updated: FamilyMember[]) => {
      localStorage.setItem(getStorageKey(supabaseUserId), JSON.stringify(updated));
      setMembers(updated);
    },
    [supabaseUserId]
  );

  const addMember = useCallback(
    (member: Omit<FamilyMember, "id">) => {
      const newMember: FamilyMember = { ...member, id: crypto.randomUUID() };
      persist([...members, newMember]);
      return newMember;
    },
    [members, persist]
  );

  const removeMember = useCallback(
    (id: string) => {
      persist(members.filter((m) => m.id !== id));
    },
    [members, persist]
  );

  return { members, addMember, removeMember };
}
