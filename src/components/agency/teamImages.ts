import type { StaticImageData } from "next/image";
import kacper from "./assets/team-kacper.jpg";

/** Team photos, keyed by each member's `id`. Real photographs, never generated. */
export const teamImages: Record<string, StaticImageData> = {
  kacper,
};
