import type { StaticImageData } from "next/image";
import privateAi from "./assets/work-private-ai.jpg";
import messagingBots from "./assets/work-messaging-bots.jpg";
import websiteSupport from "./assets/work-website-support.jpg";
import secondBrain from "./assets/work-second-brain.jpg";

/**
 * Case-study thumbnails, keyed by the card's `id` in the dictionaries. A card
 * with no entry renders the abstract placeholder, so the series can be filled
 * in one image at a time. Style: pencil sketch on light paper, graphite only.
 */
export const workImages: Record<string, StaticImageData> = {
  "private-ai": privateAi,
  "messaging-bots": messagingBots,
  "website-support": websiteSupport,
  "second-brain": secondBrain,
};
