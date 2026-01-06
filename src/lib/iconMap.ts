import {
  Activity,
  Droplets,
  Pill,
  Sun,
  Heart,
  UserCheck,
  Stethoscope,
  Baby,
  Brain,
  Bone,
  Sparkles,
  User,
  TestTube,
} from "lucide-react";

// Export a mapping from common icon keys (stored in DB) to lucide-react components
export const ICON_MAP: Record<string, any> = {
  activity: Activity,
  droplets: Droplets,
  pill: Pill,
  sun: Sun,
  heart: Heart,
  usercheck: UserCheck,
  stethoscope: Stethoscope,
  baby: Baby,
  brain: Brain,
  bone: Bone,
  sparkles: Sparkles,
  user: User,
  testtube: TestTube,
};

export const getIconForKey = (key?: string | null) => {
  if (!key) return null;
  const normalized = key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return ICON_MAP[normalized] || null;
};