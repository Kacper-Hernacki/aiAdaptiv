import type { StaticImageData } from "next/image";
import aiSaas from "./assets/cap-ai-saas.jpg";
import mobileApps from "./assets/cap-mobile-apps.jpg";
import aiAutomations from "./assets/cap-ai-automations.jpg";
import aiPilots from "./assets/cap-ai-pilots.jpg";
import aiMarketing from "./assets/cap-ai-marketing.jpg";
import appFactory from "./assets/cap-app-factory.jpg";

/**
 * Square backdrops for the capability cards, keyed by each item's `id`. Same
 * pencil-sketch series as the case studies; they sit behind an overlay that
 * lifts on hover.
 */
export const capabilityImages: Record<string, StaticImageData> = {
  "ai-saas": aiSaas,
  "mobile-apps": mobileApps,
  "ai-automations": aiAutomations,
  "ai-pilots": aiPilots,
  "ai-marketing": aiMarketing,
  "app-factory": appFactory,
};
