import type { HairlineFigureName } from "./HairlineFigure";

/**
 * Selected-work figures, keyed by the card's `id` in the dictionaries. One
 * object per concept, same Hairline series so they read as a set.
 */
export const workFigures: Record<string, HairlineFigureName> = {
  "private-ai": "vault",
  "messaging-bots": "router",
  "website-support": "terminal",
  "ad-creative": "phosphor",
  "premium-websites": "laptop",
  "booking-systems": "elevator",
  "second-brain": "hub",
  "mvp-team": "stack",
  automations: "cabinet",
};
