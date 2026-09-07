import type { StaticImageData } from "next/image";
import privateAi from "./assets/work-private-ai.jpg";
import messagingBots from "./assets/work-messaging-bots.jpg";
import websiteSupport from "./assets/work-website-support.jpg";
import adCreative from "./assets/work-ad-creative.jpg";
import premiumWebsites from "./assets/work-premium-websites.jpg";
import bookingSystems from "./assets/work-booking-systems.jpg";
import secondBrain from "./assets/work-second-brain.jpg";
import mvpTeam from "./assets/work-mvp-team.jpg";
import automations from "./assets/work-automations.jpg";

/**
 * Case-study thumbnails, keyed by the card's `id` in the dictionaries. A card
 * with no entry falls back to the abstract placeholder. Style: pencil sketch
 * on light paper, graphite only — generated with Higgsfield, one object per
 * concept, same prompt scaffold so they read as a series.
 */
export const workImages: Record<string, StaticImageData> = {
  "private-ai": privateAi,
  "messaging-bots": messagingBots,
  "website-support": websiteSupport,
  "ad-creative": adCreative,
  "premium-websites": premiumWebsites,
  "booking-systems": bookingSystems,
  "second-brain": secondBrain,
  "mvp-team": mvpTeam,
  automations,
};
