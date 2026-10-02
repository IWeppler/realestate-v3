import {
  Building2,
  Car,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  MapPin,
  Pill,
  ShoppingBag,
  ShoppingCart,
  TrainFront,
  Trees,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export const NEARBY_CATEGORIES = [
  "shopping",
  "park",
  "school",
  "university",
  "hospital",
  "pharmacy",
  "supermarket",
  "transport",
  "parking",
  "restaurant",
  "gym",
  "other",
] as const;

export type NearbyCategory = (typeof NEARBY_CATEGORIES)[number];

export const NEARBY_ICONS: Record<NearbyCategory, LucideIcon> = {
  shopping: ShoppingBag,
  park: Trees,
  school: GraduationCap,
  university: Building2,
  hospital: HeartPulse,
  pharmacy: Pill,
  supermarket: ShoppingCart,
  transport: TrainFront,
  parking: Car,
  restaurant: Utensils,
  gym: Dumbbell,
  other: MapPin,
};

// Etiquetas para el panel interno (el sitio público usa traducciones).
export const NEARBY_LABELS_ES: Record<NearbyCategory, string> = {
  shopping: "Shopping",
  park: "Plaza / parque",
  school: "Colegio",
  university: "Universidad",
  hospital: "Hospital / clínica",
  pharmacy: "Farmacia",
  supermarket: "Supermercado",
  transport: "Transporte",
  parking: "Estacionamiento",
  restaurant: "Gastronomía",
  gym: "Gimnasio",
  other: "Otro",
};

export type NearbyPlace = {
  id: string;
  category: NearbyCategory;
  name: string;
  distance_m: number | null;
};

export function isNearbyCategory(v: string): v is NearbyCategory {
  return (NEARBY_CATEGORIES as readonly string[]).includes(v);
}
