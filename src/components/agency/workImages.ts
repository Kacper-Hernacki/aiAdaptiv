import type { StaticImageData } from "next/image";
import secondBrain from "./assets/work-second-brain.jpg";

/**
 * Case-study thumbnails, keyed by the card's `id` in the dictionaries. A card
 * with no entry renders the abstract placeholder, so the series can be filled
 * in one image at a time. Style: pencil sketch on light paper, graphite only.
 */
export const workImages: Record<string, StaticImageData> = {
  "second-brain": secondBrain,
};
