"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./LoomEmbed.module.css";

/**
 * Click-to-load Loom embed.
 *
 * The iframe is only mounted once the visitor presses play, so Loom is not
 * contacted — and sets nothing — on page load. That matters here more than
 * usual: this page's whole argument is about not leaking data to third
 * parties, and an eagerly embedded video would contradict it before the
 * cookie banner has even been answered. It also keeps the page fast.
 */
export function LoomEmbed({
  id,
  video,
}: {
  id: string;
  video: Dictionary["privateAi"]["video"];
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        {playing ? (
          <iframe
            className={styles.iframe}
            src={`https://www.loom.com/embed/${id}?autoplay=1`}
            title={video.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.poster}
            onClick={() => setPlaying(true)}
          >
            <span className={styles.play}>
              <svg className={styles.playIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className={styles.title}>{video.title}</span>
            <span className={styles.meta}>
              {video.cta} · {video.duration}
            </span>
          </button>
        )}
      </div>
      <p className={styles.note}>{video.note}</p>
    </div>
  );
}
