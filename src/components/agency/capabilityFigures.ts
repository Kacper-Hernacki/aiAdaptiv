import type { HairlineFigureName } from "./HairlineFigure";

/**
 * Capability-card figures, keyed by each item's `id`. Each figure stands for
 * the practice on the card — not decoration.
 */
export const capabilityFigures: Record<string, HairlineFigureName> = {
  "ai-saas": "exploded",
  "mobile-apps": "phone",
  "ai-automations": "relay",
  "ai-pilots": "plot",
  "ai-marketing": "riffle",
  "app-factory": "rebuild",
};
