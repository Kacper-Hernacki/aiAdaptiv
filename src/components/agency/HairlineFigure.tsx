import type { ComponentType } from "react";
import {
  Basket,
  Cabinet,
  Elevator,
  Exploded,
  Hub,
  Laptop,
  Padlock,
  Phone,
  Phosphor,
  Plot,
  Rebuild,
  Relay,
  Riffle,
  Router,
  Slow,
  Stack,
  Terminal,
  Vault,
  type HairlineProps,
} from "@lucasmarkes/hairline/react";
import styles from "./HairlineFigure.module.css";

/**
 * Wrapper around a ready-made Hairline figure. Matches the Second Brain Pro
 * usage: play, theme="auto", intensity=0.55, reserved 5:4 box so the empty
 * server render does not shift when the drawing mounts.
 */
const figures = {
  basket: Basket,
  cabinet: Cabinet,
  elevator: Elevator,
  exploded: Exploded,
  hub: Hub,
  laptop: Laptop,
  padlock: Padlock,
  phone: Phone,
  phosphor: Phosphor,
  plot: Plot,
  rebuild: Rebuild,
  relay: Relay,
  riffle: Riffle,
  router: Router,
  slow: Slow,
  stack: Stack,
  terminal: Terminal,
  vault: Vault,
} as const;

export type HairlineFigureName = keyof typeof figures;

export type HairlineSurface = "page" | "alt" | "card";

type FigureComponent = ComponentType<HairlineProps>;

export function HairlineFigure({
  name,
  label,
  surface = "page",
  fill = false,
  className,
}: {
  name: HairlineFigureName;
  /** Accessible name; falls back to the figure's built-in description. */
  label?: string;
  /** Plate colour must match the surface the figure sits on. */
  surface?: HairlineSurface;
  /** Stretch over a parent that already sizes the slot (capability cards). */
  fill?: boolean;
  className?: string;
}) {
  const Figure = figures[name] as FigureComponent;

  return (
    <div
      className={[
        "hairline-figure",
        styles.figure,
        fill ? styles.fill : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-surface={surface}
    >
      <Figure play theme="auto" intensity={0.55} label={label} />
    </div>
  );
}
