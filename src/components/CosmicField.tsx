"use client";

import { useEffect, useRef } from "react";

/**
 * Persistent cosmic particle field — a genuinely 3D particle brain that moves.
 *
 * The brain is REAL 3D geometry (not a flat image): an ellipsoidal cerebrum
 * shell displaced by 3D ridged noise to form gyri/sulci, plus a cerebellum
 * bulge and a brainstem. Every particle sits on the true 3D surface, so the
 * brain has real depth — it rotates around the vertical axis and you see volume,
 * with perspective scaling, depth shading, back-to-front draw order, and an
 * amber bloom on the fold ridges (Dala style). Its position + scale are
 * scroll-driven (drifts right, swings large to the left), morphing to a flower
 * then a diffuse scatter deeper down. Particles assemble out of a scatter on
 * load. Honors prefers-reduced-motion; DPR-aware.
 */

type Shape = "triangle" | "circle" | "diamond" | "square";

const COUNT = 14000;

// Monochrome purple ramp: dark violet (far / in shadow) → Plum Voltage →
// light lavender (near / on ridge crests). Lightness encodes 3D depth, so the
// brain reads as a solid form lit against the void.
const PURPLE_STOPS: [number, number, number][] = [
  [12, 7, 30], // near-black violet — deep sulci recede into the void
  [128, 82, 255], // #8052ff Plum Voltage — the mid tone
  [252, 250, 255], // white lavender — lit ridge crests / specular highlights
];

// Fixed studio light in view space (upper-left, toward the viewer).
const LX = -0.5;
const LY = 0.62;
const LZ = 0.6;
const RAMP: string[] = (() => {
  const N = 40;
  const out: string[] = [];
  for (let i = 0; i < N; i++) {
    const v = i / (N - 1);
    const seg = v < 0.5 ? 0 : 1;
    const lt = v < 0.5 ? v / 0.5 : (v - 0.5) / 0.5;
    const a = PURPLE_STOPS[seg];
    const b = PURPLE_STOPS[seg + 1];
    const r = Math.round(a[0] + (b[0] - a[0]) * lt);
    const g = Math.round(a[1] + (b[1] - a[1]) * lt);
    const bl = Math.round(a[2] + (b[2] - a[2]) * lt);
    out.push(`rgb(${r},${g},${bl})`);
  }
  return out;
})();

// Cheap deterministic 3D ridged noise (sum of sines) for gyri.
function noise3(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 3.1 + y * 2.3 + 1.7) * Math.cos(z * 2.7 - 0.6) +
    0.5 * Math.sin(x * 6.3 - z * 5.1 + 2.1) * Math.cos(y * 5.7 + 0.3) +
    0.25 * Math.sin(y * 11 + z * 9 + 1.1) * Math.cos(x * 10.2 - 0.8)
  );
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  x: number,
  y: number,
  s: number,
  outline: boolean,
) {
  switch (shape) {
    case "circle":
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      outline ? ctx.stroke() : ctx.fill();
      break;
    case "square":
      if (outline) ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      else ctx.fillRect(x - s, y - s, s * 2, s * 2);
      break;
    case "diamond":
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s, y);
      ctx.closePath();
      outline ? ctx.stroke() : ctx.fill();
      break;
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(x, y - s * 1.1);
      ctx.lineTo(x + s, y + s * 0.8);
      ctx.lineTo(x - s, y + s * 0.8);
      ctx.closePath();
      outline ? ctx.stroke() : ctx.fill();
      break;
  }
}

function keyframe(p: number, frames: [number, number][]): number {
  if (p <= frames[0][0]) return frames[0][1];
  const last = frames[frames.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < frames.length - 1; i++) {
    const [p0, v0] = frames[i];
    const [p1, v1] = frames[i + 1];
    if (p >= p0 && p <= p1) {
      const t = (p - p0) / (p1 - p0);
      return v0 + (v1 - v0) * t;
    }
  }
  return last[1];
}

export function CosmicField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let seed = 9241;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const golden = Math.PI * (3 - Math.sqrt(5));

    // ── Build the 3D brain geometry ───────────────────────────────
    const brain = new Float32Array(COUNT * 3);
    const bright = new Float32Array(COUNT);
    const nrm = new Float32Array(COUNT * 3); // surface normals for lighting
    const nCereb = Math.floor(COUNT * 0.82);
    const nCbl = Math.floor(COUNT * 0.12);
    const nStem = COUNT - nCereb - nCbl;

    // gyri strength at a surface direction: 1 on a ridge crest, 0 in a sulcus.
    const gyri = (dx: number, dy: number, dz: number) =>
      Math.max(0, 1 - Math.abs(noise3(dx * 2.1, dy * 2.1, dz * 2.1)) * 1.25);

    // Cerebrum: sample DENSITY weighted toward the gyri crests (sparse sulci),
    // and displace ridges outward / sulci inward for real fold relief.
    {
      const M = nCereb * 3;
      const cdf = new Float64Array(M);
      let total = 0;
      for (let m = 0; m < M; m++) {
        const yy = 1 - ((m + 0.5) / M) * 2;
        const r = Math.sqrt(Math.max(0, 1 - yy * yy));
        const th = golden * m;
        const g = gyri(Math.cos(th) * r, yy, Math.sin(th) * r);
        total += Math.pow(0.18 + g, 2.6); // crest-heavy density
        cdf[m] = total;
      }
      for (let i = 0; i < nCereb; i++) {
        const target = rand() * total;
        let lo = 0;
        let hi = M - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cdf[mid] < target) lo = mid + 1;
          else hi = mid;
        }
        const yy = 1 - ((lo + 0.5) / M) * 2;
        const r = Math.sqrt(Math.max(0, 1 - yy * yy));
        const th = golden * lo;
        let dx = Math.cos(th) * r + (rand() - 0.5) * 0.05;
        let dy = yy + (rand() - 0.5) * 0.05;
        let dz = Math.sin(th) * r + (rand() - 0.5) * 0.05;
        const ax = 1.18 * (dx > 0 ? 1.0 : 0.92); // frontal bulge (+x = right)
        const ay = 0.82 * (dy < 0 ? 0.82 : 1.0); // flatter underside
        const az = 0.82;
        const ng = noise3(dx * 2.1, dy * 2.1, dz * 2.1);
        const ridge = 1 - Math.abs(ng) * 0.34; // deep folds: sulci recede
        brain[i * 3] = dx * ax * ridge;
        brain[i * 3 + 1] = dy * ay * ridge + 0.08;
        brain[i * 3 + 2] = dz * az * ridge;
        bright[i] = Math.max(0, Math.min(1, 1 - Math.abs(ng) * 1.25));

        // Surface normal = radial, tilted by the local fold slope so gyri
        // walls face different directions and catch/lose the light.
        let nl = Math.hypot(dx, dy, dz) || 1;
        const n0x = dx / nl;
        const n0y = dy / nl;
        const n0z = dz / nl;
        // tangent basis
        const ref = Math.abs(n0y) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        let t1x = ref[1] * n0z - ref[2] * n0y;
        let t1y = ref[2] * n0x - ref[0] * n0z;
        let t1z = ref[0] * n0y - ref[1] * n0x;
        const t1l = Math.hypot(t1x, t1y, t1z) || 1;
        t1x /= t1l;
        t1y /= t1l;
        t1z /= t1l;
        const t2x = n0y * t1z - n0z * t1y;
        const t2y = n0z * t1x - n0x * t1z;
        const t2z = n0x * t1y - n0y * t1x;
        const eps = 0.07;
        const g0 = Math.abs(ng);
        const gA = Math.abs(
          noise3((dx + t1x * eps) * 2.1, (dy + t1y * eps) * 2.1, (dz + t1z * eps) * 2.1),
        );
        const gB = Math.abs(
          noise3((dx + t2x * eps) * 2.1, (dy + t2y * eps) * 2.1, (dz + t2z * eps) * 2.1),
        );
        const k = 2.2; // fold-normal strength
        const s1 = ((gA - g0) / eps) * -0.34 * k;
        const s2 = ((gB - g0) / eps) * -0.34 * k;
        let nx = n0x - t1x * s1 - t2x * s2;
        let ny = n0y - t1y * s1 - t2y * s2;
        let nz = n0z - t1z * s1 - t2z * s2;
        nl = Math.hypot(nx, ny, nz) || 1;
        nrm[i * 3] = nx / nl;
        nrm[i * 3 + 1] = ny / nl;
        nrm[i * 3 + 2] = nz / nl;
      }
    }

    // Cerebellum: small textured ellipsoid, back-bottom.
    for (let j = 0; j < nCbl; j++) {
      const i = nCereb + j;
      const yy = 1 - ((j + 0.5) / nCbl) * 2;
      const r = Math.sqrt(Math.max(0, 1 - yy * yy));
      const a = golden * j;
      const dx = Math.cos(a) * r;
      const dy = yy;
      const dz = Math.sin(a) * r;
      const ng = noise3(dx * 6, dy * 6, dz * 6);
      const ridge = 1 - Math.abs(ng) * 0.32;
      const s = 0.36;
      brain[i * 3] = -0.74 + dx * s * 1.05 * ridge;
      brain[i * 3 + 1] = -0.48 + dy * s * 0.78 * ridge;
      brain[i * 3 + 2] = dz * s * 0.95 * ridge;
      bright[i] = Math.max(0, Math.min(1, 1 - Math.abs(ng) * 1.5));
      const cl = Math.hypot(dx, dy, dz) || 1;
      nrm[i * 3] = dx / cl;
      nrm[i * 3 + 1] = dy / cl;
      nrm[i * 3 + 2] = dz / cl;
    }

    // Brainstem: tapering stalk hanging down.
    for (let j = 0; j < nStem; j++) {
      const i = nCereb + nCbl + j;
      const tt = j / Math.max(1, nStem);
      const a = golden * j;
      const rr = 0.07 * (1 - tt * 0.5);
      brain[i * 3] = -0.42 + Math.cos(a) * rr;
      brain[i * 3 + 1] = -0.52 - tt * 0.6;
      brain[i * 3 + 2] = Math.sin(a) * rr;
      bright[i] = 0.32;
      nrm[i * 3] = Math.cos(a);
      nrm[i * 3 + 1] = 0;
      nrm[i * 3 + 2] = Math.sin(a);
    }

    // Per-particle visual props (coloured by ridge brightness).
    const shapes = new Array<Shape>(COUNT);
    const outline = new Array<boolean>(COUNT);
    const baseSize = new Float32Array(COUNT);
    const twk = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = rand();
      const shape: Shape =
        r < 0.66 ? "triangle" : r < 0.8 ? "diamond" : r < 0.91 ? "circle" : "square";
      shapes[i] = shape;
      outline[i] = shape === "triangle" || shape === "diamond" || rand() < 0.5;
      const isEdge = bright[i] > 0.5;
      baseSize[i] = (isEdge ? 1.7 : 1.3) + rand() * (isEdge ? 3 : 2.4);
      twk[i] = 0.5 + rand() * 1.6;
      phase[i] = rand() * Math.PI * 2;
    }

    // ── Other formations (3D; flower/scatter live on z≈0) ─────────
    const flower = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const a = golden * i;
      const petal = 0.55 + 0.45 * Math.abs(Math.cos(2.5 * a));
      const rr = Math.sqrt((i + 0.5) / COUNT) * petal * 1.15;
      flower[i * 3] = Math.cos(a) * rr;
      flower[i * 3 + 1] = Math.sin(a) * rr;
      flower[i * 3 + 2] = (rand() - 0.5) * 0.12;
    }
    const scatter = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * 1.2;
      scatter[i * 3] = Math.cos(a) * rr * 1.3;
      scatter[i * 3 + 1] = Math.sin(a) * rr;
      scatter[i * 3 + 2] = (rand() - 0.5) * 0.6;
    }

    // Depth-sort buffers.
    const sxA = new Float32Array(COUNT);
    const syA = new Float32Array(COUNT);
    const szA = new Float32Array(COUNT);
    const ssA = new Float32Array(COUNT);
    const saA = new Float32Array(COUNT);
    const svA = new Float32Array(COUNT); // lit colour value → ramp index

    // Amber bloom sprite (cheap glow vs shadowBlur).
    const glowIdx: number[] = [];
    for (let i = 0; i < COUNT; i++) if (bright[i] > 0.62) glowIdx.push(i);
    const glow = document.createElement("canvas");
    glow.width = 64;
    glow.height = 64;
    const gx = glow.getContext("2d")!;
    const grd = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(150,110,255,0.8)");
    grd.addColorStop(0.35, "rgba(128,82,255,0.3)");
    grd.addColorStop(1, "rgba(128,82,255,0)");
    gx.fillStyle = grd;
    gx.fillRect(0, 0, 64, 64);

    let w = 0;
    let h = 0;
    let narrow = false;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      narrow = w < 900;
    };

    const getProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const cxFramesWide: [number, number][] = [
      [0.0, 0.66],
      [0.1, 0.84],
      [0.2, 0.28],
      [0.45, 0.5],
      [0.7, 0.64],
      [1.0, 0.5],
    ];
    const scaleFramesWide: [number, number][] = [
      [0.0, 1.05],
      [0.1, 1.12],
      [0.2, 1.5],
      [0.45, 1.7],
      [0.7, 1.3],
      [1.0, 1.05],
    ];

    let t = 0;
    let raf = 0;
    let introStart = -1;

    const render = (now: number) => {
      if (introStart < 0) introStart = now;
      const intro = reduceMotion ? 1 : Math.min(1, (now - introStart) / 1500);
      const introEase = 1 - Math.pow(1 - intro, 3);
      const p = getProgress();

      let fa: Float32Array;
      let fb: Float32Array;
      let blend: number;
      if (p < 0.5) {
        fa = brain;
        fb = brain;
        blend = 0;
      } else if (p < 0.72) {
        fa = brain;
        fb = flower;
        blend = (p - 0.5) / 0.22;
      } else {
        fa = flower;
        fb = scatter;
        blend = (p - 0.72) / 0.28;
      }

      const cxFrac = narrow ? 0.5 : keyframe(p, cxFramesWide);
      const cyFrac = narrow ? 0.34 : 0.5;
      const scale = narrow
        ? keyframe(p, [
            [0, 0.95],
            [0.5, 1.05],
            [1, 0.95],
          ])
        : keyframe(p, scaleFramesWide);

      const cx = w * cxFrac;
      const cy = h * cyFrac;
      const radius = Math.min(w, h) * (narrow ? 0.4 : 0.36) * scale;

      // 3D rotation: clear turn around the vertical axis + top tilt.
      const rotY = (reduceMotion ? 0.35 : Math.sin(t * 0.00022) * 0.7) + p * 0.4;
      const rotX = 0.16 + (reduceMotion ? 0 : Math.sin(t * 0.0003) * 0.06);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const FOV = 3.4;
      const globalAlpha = narrow ? 0.66 : 0.55 + (1 - Math.min(1, p * 1.3)) * 0.45;

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        let x = fa[i3] + (fb[i3] - fa[i3]) * blend;
        let y = fa[i3 + 1] + (fb[i3 + 1] - fa[i3 + 1]) * blend;
        let z = fa[i3 + 2] + (fb[i3 + 2] - fa[i3 + 2]) * blend;
        if (introEase < 1) {
          x = scatter[i3] + (x - scatter[i3]) * introEase;
          y = scatter[i3 + 1] + (y - scatter[i3 + 1]) * introEase;
          z = scatter[i3 + 2] + (z - scatter[i3 + 2]) * introEase;
        }

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const persp = FOV / (FOV - z2);
        const depthN = Math.min(1, Math.max(0, (z2 + 1.2) / 2.4));
        const tw = reduceMotion
          ? 1
          : 0.62 + 0.38 * Math.sin(t * 0.002 * twk[i] + phase[i]);

        // Rotate the surface normal the same way, then light it.
        const nx0 = nrm[i3];
        const ny0 = nrm[i3 + 1];
        const nz0 = nrm[i3 + 2];
        const Nx1 = nx0 * cosY + nz0 * sinY;
        const Nz1 = -nx0 * sinY + nz0 * cosY;
        const Ny1 = ny0 * cosX - Nz1 * sinX;
        const Nz2 = ny0 * sinX + Nz1 * cosX;
        let lambert = Nx1 * LX + Ny1 * LY + Nz2 * LZ;
        if (lambert < 0) lambert = 0;
        const facing = Nz2; // >0 → faces the viewer

        sxA[i] = cx + x1 * radius * persp;
        syA[i] = cy - y1 * radius * persp; // flip: model +y is up, canvas y is down
        szA[i] = z2;
        ssA[i] = baseSize[i] * (0.4 + depthN * 1.0) * persp;

        // Colour value carries the 3D: lit crests bright/white, sulci dark
        // violet — but with a raised floor so shadowed particles stay visible.
        svA[i] =
          0.28 + lambert * 0.55 + bright[i] * lambert * 0.28 - (1 - bright[i]) * 0.1;

        // Keep it DENSE: every particle stays readable; depth comes from colour,
        // not from hiding particles. Back-facing ones only dim a little.
        const faceFactor = 0.55 + 0.45 * Math.min(1, Math.max(0, facing + 0.3));
        const ridgeDim = 0.62 + bright[i] * 0.38;
        saA[i] =
          (0.52 + depthN * 0.38) *
          faceFactor *
          ridgeDim *
          tw *
          globalAlpha *
          (0.4 + 0.6 * introEase);
      }

      ctx.clearRect(0, 0, w, h);

      // Bloom (additive amber halos on bright ridge particles).
      ctx.globalCompositeOperation = "lighter";
      for (let gi = 0; gi < glowIdx.length; gi++) {
        const i = glowIdx[gi];
        const depthN = Math.min(1, Math.max(0, (szA[i] + 1.2) / 2.4));
        const r = ssA[i] * 3 + 3;
        ctx.globalAlpha = Math.min(0.24, saA[i] * 0.5 * (0.4 + depthN * 0.6));
        ctx.drawImage(glow, sxA[i] - r, syA[i] - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = "source-over";

      // Depth reads from per-particle size + alpha + bloom, so we skip an
      // every-frame back-to-front sort (too costly at this particle count).
      const rampMax = RAMP.length - 1;
      for (let i = 0; i < COUNT; i++) {
        ctx.globalAlpha = saA[i];
        const ol = outline[i];
        const size = ssA[i];
        const col = RAMP[Math.max(0, Math.min(rampMax, (svA[i] * rampMax) | 0))];
        if (ol) {
          ctx.strokeStyle = col;
          ctx.lineWidth = Math.max(0.6, size * 0.26);
        } else {
          ctx.fillStyle = col;
        }
        drawShape(ctx, shapes[i], sxA[i], syA[i], size, ol);
      }
      ctx.globalAlpha = 1;
    };

    resize();
    render(0);

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resize();
        render(performance.now());
      });
    };
    window.addEventListener("resize", onResize);

    if (reduceMotion) {
      const onScroll = () => render(performance.now());
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(resizeRaf);
      };
    }

    const loop = (now: number) => {
      t += 16;
      render(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
    />
  );
}
