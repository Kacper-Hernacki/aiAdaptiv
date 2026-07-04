"use client";

import { useEffect, useRef } from "react";

/**
 * Persistent GPU (WebGL) particle field that tells a story across sections.
 *
 * The same particles form a lit 3D BRAIN in the hero (right side), slide LEFT
 * for the Problem section, then MORPH INTO A ROCKET at the Solution section,
 * before dissolving to an ambient scatter deeper down. Progress is driven by
 * the real on-page positions of the sections (#problem, #solution, #pricing),
 * so the choreography stays in sync with the layout.
 *
 * Each particle carries brain + rocket + scatter target positions and brain +
 * rocket normals; the vertex shader morphs between them and lights the surface
 * (bright lit crests, shadowed valleys). Particles render as OUTLINED
 * TRIANGLES in the Dala brand palette (white / purple / purple-light / green /
 * yellow) that clusters into same-coloured patches across the surface, with a golden
 * rim on the silhouette; the smallest particles render as dust specks.
 * Additive blending gives the luminous bloom (no depth sort needed). Honors
 * prefers-reduced-motion; DPR-aware; no-op if WebGL is unavailable.
 */

const COUNT = 7000;

function noise3(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 3.1 + y * 2.3 + 1.7) * Math.cos(z * 2.7 - 0.6) +
    0.5 * Math.sin(x * 6.3 - z * 5.1 + 2.1) * Math.cos(y * 5.7 + 0.3) +
    0.25 * Math.sin(y * 11 + z * 9 + 1.1) * Math.cos(x * 10.2 - 0.8)
  );
}

// smoothstep easing → transitions ease in/out (zero slope at the ends).
function es(x: number): number {
  x = x < 0 ? 0 : x > 1 ? 1 : x;
  return x * x * (3 - 2 * x);
}

function keyframe(p: number, frames: [number, number][]): number {
  if (p <= frames[0][0]) return frames[0][1];
  const last = frames[frames.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < frames.length - 1; i++) {
    const [p0, v0] = frames[i];
    const [p1, v1] = frames[i + 1];
    if (p >= p0 && p <= p1) return v0 + (v1 - v0) * es((p - p0) / (p1 - p0));
  }
  return last[1];
}

const VERT = `
precision highp float;
attribute vec3 a_vert;   // tetrahedron vertex, glyph-local (divisor 0)
attribute vec3 a_bary;   // barycentric corner of the face (divisor 0)
attribute vec3 a_brain;
attribute vec3 a_normal;
attribute vec3 a_rocket;
attribute vec3 a_normal2;
attribute vec3 a_hand;
attribute vec3 a_hnorm;
attribute vec3 a_shield;
attribute vec3 a_snorm;
attribute vec3 a_car;
attribute vec3 a_cnorm;
attribute vec3 a_scatter;
attribute vec4 a_meta; // bright, size, seed, palette-pick
attribute float a_flame; // 1 for engine-flame particles
uniform vec2 u_res;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_morph;   // 0 brain -> 1 rocket -> 2 scatter
uniform float u_intro;
uniform float u_rotY;
uniform float u_rotX;
uniform float u_time;
uniform float u_galpha;
uniform float u_launch;  // 0 engine off -> 1 full burn
uniform vec3 u_light;
uniform float u_dpr;
uniform float u_maxSeed; // cull particles with seed above this (mobile density)
uniform float u_ptScale; // global glyph-size multiplier (smaller on mobile)
uniform vec2 u_mouse;    // cursor position (device px; far offscreen when idle)
uniform float u_mouseR;  // cursor influence radius (device px)
varying vec3 v_color;
varying float v_alpha;
varying vec3 v_bary;
varying float v_flame;

// Confetti palette picked by a clustered value in [0,1] (patches of the same
// colour sit next to each other, like the reference brain). Colours match the
// Dala brand set exactly: white, purple #8052ff, purple-light #ecd6ff, green
// #189b81 (lifted for additive glow), yellow #ffb829 — no generic pink/blue.
vec3 palette(float pick){
  if (pick < 0.34) return vec3(0.96, 0.96, 1.0);  // white
  if (pick < 0.62) return vec3(1.0, 0.72, 0.16);  // yellow  #ffb829 (gold-forward, like Dala)
  if (pick < 0.78) return vec3(0.50, 0.32, 1.0);  // purple  #8052ff
  if (pick < 0.90) return vec3(0.14, 0.74, 0.58); // green   #189b81
  return vec3(0.93, 0.84, 1.0);                   // purple-light #ecd6ff
}

void main(){
  float bright = a_meta.x;
  float size = a_meta.y;
  float seed = abs(a_meta.z);
  float pick = a_meta.w;
  v_bary = a_bary;

  // Thin the field on small screens: drop particles whose (uniform) seed is
  // above the cutoff. Culls evenly across every shape so nothing is truncated.
  if (seed > u_maxSeed) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // outside the clip volume
    v_alpha = 0.0;
    v_flame = 0.0;
    v_color = vec3(0.0);
    return;
  }

  // Morph chain: brain -> rocket -> tie -> shield -> car -> scatter.
  float mB = clamp(u_morph, 0.0, 1.0);
  float m2 = clamp(u_morph - 1.0, 0.0, 1.0);
  float m3 = clamp(u_morph - 2.0, 0.0, 1.0);
  float m4 = clamp(u_morph - 3.0, 0.0, 1.0);
  float m5 = clamp(u_morph - 4.0, 0.0, 1.0);
  vec3 p = mix(a_brain, a_rocket, mB);
  p = mix(p, a_hand, m2);
  p = mix(p, a_shield, m3);
  p = mix(p, a_car, m4);
  p = mix(p, a_scatter, m5);
  p = mix(a_scatter, p, u_intro);
  vec3 n = mix(a_normal, a_normal2, mB);
  n = mix(n, a_hnorm, m2);
  n = mix(n, a_snorm, m3);
  n = mix(n, a_cnorm, m4);
  n = normalize(n);

  // Engine flame: only while it is the rocket (not yet morphing to hand).
  float flick = 0.5 + 0.5 * sin(u_time * 22.0 + seed * 40.0);
  float flameOn = a_flame * step(0.5, mB) * (1.0 - m2);
  float burn = flameOn * u_launch;
  p.y -= burn * (0.2 + 1.1 * flick);
  p.xz *= (1.0 + burn * 0.7 * flick);

  float cy = cos(u_rotY), sy = sin(u_rotY), cx = cos(u_rotX), sx = sin(u_rotX);
  float x1 = p.x * cy + p.z * sy;
  float z1 = -p.x * sy + p.z * cy;
  float y1 = p.y * cx - z1 * sx;
  float z2 = p.y * sx + z1 * cx;
  float nx1 = n.x * cy + n.z * sy;
  float nz1 = -n.x * sy + n.z * cy;
  float ny1 = n.y * cx - nz1 * sx;
  float nz2 = n.y * sx + nz1 * cx;

  float FOV = 3.4;
  float depthN = clamp((z2 + 1.2) / 2.4, 0.0, 1.0);

  // Each glyph is a small 3D TETRAHEDRON (like the reference's pyramids). The
  // offset is applied in rotated view space BEFORE the perspective divide, so
  // glyphs inherit real perspective — near ones render bigger than far ones.
  float rb = fract(seed * 9.13) * 6.2832;
  float ra = fract(seed * 5.71) * 6.2832 + u_time * (fract(seed * 3.31) - 0.5) * 0.55;
  float c1 = cos(rb), s1 = sin(rb);
  vec3 gv = vec3(a_vert.x * c1 + a_vert.z * s1, a_vert.y, -a_vert.x * s1 + a_vert.z * c1);
  float c2 = cos(ra), s2 = sin(ra);
  gv = vec3(gv.x * c2 - gv.y * s2, gv.x * s2 + gv.y * c2, gv.z);
  // On the BRAIN every pyramid slowly TUMBLES in 3D — all in unison, the same
  // angle at the same time, so they spin together in one direction (a visible
  // rotation, not the invisible in-plane spin of a symmetric tetra). The whole
  // brain also turns (u_rotY), so the field both spins and orbits. Built in
  // view space, so the tumble stays uniform on screen. Rocket/scatter keep the
  // per-particle random tumble.
  float ua = u_time * 0.13;                   // shared spin angle (slow, ~48s / turn)
  float uc = cos(ua), us = sin(ua);
  vec3 gvUni = vec3(a_vert.x * uc + a_vert.z * us, a_vert.y, -a_vert.x * us + a_vert.z * uc);
  float tc = cos(0.6), ts = sin(0.6);         // fixed tilt so it never views flat
  gvUni = vec3(gvUni.x, gvUni.y * tc - gvUni.z * ts, gvUni.y * ts + gvUni.z * tc);
  // Every formed shape (brain, rocket, shield, …) uses the same uniform
  // tumbling orientation — the particles all point one direction together.
  gv = gvUni;
  float ws = size * (0.4 + depthN) * u_dpr * u_ptScale * (1.0 + burn * 1.6) * 0.5 / u_radius;
  vec3 q = vec3(x1, y1, z2) + gv * ws;

  // Floor the denominator so a particle near/behind the camera plane can't blow
  // its glyph into a streak (huge persp) or flip to negative. Legit front
  // glyphs sit around ~1.5, so this cap (max 2.0) never touches them.
  float persp = FOV / max(FOV - q.z, FOV * 0.5);
  float sxp = u_center.x + q.x * u_radius * persp;
  float syp = u_center.y - q.y * u_radius * persp;

  // Cursor repulsion computed from the glyph CENTRE (not per-vertex), so the
  // same offset is added to every vertex — the glyph MOVES rigidly, it doesn't
  // stretch or distort. Gentle, brain only.
  float perspC = FOV / (FOV - z2);
  vec2 ctr = vec2(u_center.x + x1 * u_radius * perspC, u_center.y - y1 * u_radius * perspC);
  vec2 toM = ctr - u_mouse;
  float md = length(toM);
  float pushAmt = smoothstep(u_mouseR, 0.0, md) * (1.0 - clamp(u_morph, 0.0, 1.0));
  vec2 off = (toM / max(md, 1.0)) * pushAmt * u_mouseR * 0.16;
  sxp += off.x;
  syp += off.y;

  gl_Position = vec4(sxp / u_res.x * 2.0 - 1.0, 1.0 - syp / u_res.y * 2.0, 0.0, 1.0);

  float lambert = max(dot(vec3(nx1, ny1, nz2), u_light), 0.0);
  vec3 base = palette(pick);
  // Brighter crests + a slightly higher ceiling read as bloom once the dense
  // additive glyphs overlap (closer to Dala's luminous brain).
  float shade = 0.66 + lambert * 0.42 + bright * 0.42;
  v_color = base * min(shade, 1.4);

  // Dim the far side of the shell so the interior stays dark enough for the
  // front glyphs to read individually.
  float front = smoothstep(-0.2, 0.4, nz2);
  float vis = mix(0.08, 0.95, front);
  float tw = 0.93 + 0.07 * sin(u_time * seed * 2.0 + seed * 12.0);
  // bright ≈ 1 on gyri crests, ≈ 0 in sulci grooves — grooves go dark so the
  // fold pattern carves visibly through the tiled surface.
  v_alpha = clamp((0.7 + depthN * 0.3) * vis * (0.14 + bright * 0.86) * tw * u_galpha, 0.0, 1.0);

  // Surplus particles park far out of frame while a shape is formed — fade
  // them out entirely so they never read as bright background confetti on any
  // screen size (ambient floaters stay within ~3.6 of the origin).
  v_alpha *= 1.0 - smoothstep(4.2, 4.9, length(p));

  // Flame overrides colour (lavender -> white core) and its own alpha
  // (hidden until the engine ignites).
  v_flame = 0.0;
  if (flameOn > 0.5) {
    float core = clamp(1.0 - length(p.xz) * 3.0, 0.0, 1.0);
    v_color = mix(vec3(0.66, 0.5, 1.0), vec3(0.97, 0.94, 1.0), core);
    v_flame = burn;
    v_alpha = clamp(burn * (0.55 + 0.45 * flick) * u_galpha, 0.0, 1.0);
  }
}
`;

// Fragment shader: outlined tetrahedron faces via barycentric edge distance.
// Rendered additively with no depth test, so back edges show through the
// front face — the nested-triangle look of the reference's pyramids.
const FRAG = (deriv: boolean) => `
${deriv ? "#extension GL_OES_standard_derivatives : enable" : ""}
precision highp float;
varying vec3 v_color;
varying float v_alpha;
varying vec3 v_bary;
varying float v_flame;

void main(){
  float e = min(v_bary.x, min(v_bary.y, v_bary.z));
  float a;
  if (v_flame > 0.01) {
    a = 0.85; // filled ember faces
  } else {
    ${deriv ? "float w = fwidth(e) * 1.4 + 0.015;" : "float w = 0.07;"}
    // Filled, glowing pyramid face (was a thin outline): a bright crisp rim
    // over a soft body fill that brightens toward the edges. Under additive
    // blending the dense overlaps read as bloom — the Dala look, our geometry.
    float rim = 1.0 - smoothstep(0.06, 0.06 + w, e);
    float body = 0.16 + 0.16 * (1.0 - smoothstep(0.0, 0.34, e)); // glowing interior
    a = max(rim, body);
  }
  a *= v_alpha;
  if (a <= 0.004) discard;
  gl_FragColor = vec4(v_color, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("shader error:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

// Baked cortex point cloud (public/brain-points.bin — see scripts/bake_brain.py).
type BrainPoints = {
  pos: Float32Array; // COUNT * 3, world units
  nrm: Float32Array; // COUNT * 3, unit normals
  pick: Float32Array; // COUNT, lobe colour (palette pick 0..1)
  bright: Float32Array; // COUNT, 1 = gyral crest, 0 = sulcal floor
};

// Binary layout 'BPT3': uint32 count, float32 posScale, then count * 11 bytes
// { int16 x,y,z (× posScale) ; int8 nx,ny,nz (÷127) ; uint8 pick ; uint8 bright }.
function parseBrainPoints(buf: ArrayBuffer): BrainPoints | null {
  const dv = new DataView(buf);
  if (
    dv.byteLength < 12 ||
    dv.getUint8(0) !== 0x42 || // 'B'
    dv.getUint8(1) !== 0x50 || // 'P'
    dv.getUint8(2) !== 0x54 || // 'T'
    dv.getUint8(3) !== 0x33 // '3'
  ) {
    return null;
  }
  const count = dv.getUint32(4, true);
  const scale = dv.getFloat32(8, true);
  const STRIDE = 11;
  if (dv.byteLength < 12 + count * STRIDE) return null;
  const pos = new Float32Array(count * 3);
  const nrm = new Float32Array(count * 3);
  const pick = new Float32Array(count);
  const bright = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const o = 12 + i * STRIDE;
    pos[i * 3] = dv.getInt16(o, true) * scale;
    pos[i * 3 + 1] = dv.getInt16(o + 2, true) * scale;
    pos[i * 3 + 2] = dv.getInt16(o + 4, true) * scale;
    nrm[i * 3] = dv.getInt8(o + 6) / 127;
    nrm[i * 3 + 1] = dv.getInt8(o + 7) / 127;
    nrm[i * 3 + 2] = dv.getInt8(o + 8) / 127;
    pick[i] = dv.getUint8(o + 9) / 255;
    bright[i] = dv.getUint8(o + 10) / 255;
  }
  return { pos, nrm, pick, bright };
}

export function CosmicField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // All geometry + GL setup lives in init(); it runs once the baked cortex
    // point cloud has loaded (or immediately with null as a fallback).
    const init = (pts: BrainPoints | null): (() => void) | undefined => {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    // Instanced rendering (one tetrahedron per particle) — universally
    // available on WebGL1 as an extension.
    const inst = gl.getExtension("ANGLE_instanced_arrays");
    if (!inst) return;
    const deriv = !!gl.getExtension("OES_standard_derivatives");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG(deriv));
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // ── Geometry ──
    let seed = 9241;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const golden = Math.PI * (3 - Math.sqrt(5));

    const aBrain = new Float32Array(COUNT * 3);
    const aNormal = new Float32Array(COUNT * 3);
    const aRocket = new Float32Array(COUNT * 3);
    const aNormal2 = new Float32Array(COUNT * 3);
    const aHand = new Float32Array(COUNT * 3);
    const aHnorm = new Float32Array(COUNT * 3);
    const aShield = new Float32Array(COUNT * 3);
    const aSnorm = new Float32Array(COUNT * 3);
    const aCar = new Float32Array(COUNT * 3);
    const aCnorm = new Float32Array(COUNT * 3);
    const aScatter = new Float32Array(COUNT * 3);
    const aMeta = new Float32Array(COUNT * 4);
    const aFlame = new Float32Array(COUNT);
    const bright = new Float32Array(COUNT);

    // Per-particle style, filled by the brain generators and read by the
    // final meta loop (so the shield's later bright[] tweaks still apply).
    const pSize = new Float32Array(COUNT);
    const pPick = new Float32Array(COUNT);

    const clusterPick = (x: number, y: number, z: number) => {
      const cn = noise3(x * 1.15 + 7.3, y * 1.15 - 2.1, z * 1.15 + 4.7);
      return Math.min(1, Math.max(0, cn * 0.29 + 0.5 + (rand() - 0.5) * 0.22));
    };

    // ── Brain from a REAL cortex mesh ─────────────────────────────────────
    // Points are baked offline from the FreeSurfer fsaverage pial surface
    // (both hemispheres), with FreeSurfer's own sulcal-depth map as the
    // brightness. Because they sit on genuine cortex geometry, the gyri catch
    // light and the sulci fall into shadow at EVERY rotation — a real 3D form,
    // not a drawing wrapped on a smooth dome. Baked by scripts/bake_brain.py.
    const genBrainFromPoints = (pts: BrainPoints): boolean => {
      if (pts.bright.length !== COUNT) return false;
      for (let i = 0; i < COUNT; i++) {
        const x = pts.pos[i * 3];
        const y = pts.pos[i * 3 + 1];
        const z = pts.pos[i * 3 + 2];
        aBrain[i * 3] = x;
        aBrain[i * 3 + 1] = y;
        aBrain[i * 3 + 2] = z;
        aNormal[i * 3] = pts.nrm[i * 3];
        aNormal[i * 3 + 1] = pts.nrm[i * 3 + 1];
        aNormal[i * 3 + 2] = pts.nrm[i * 3 + 2];
        const b = pts.bright[i];
        bright[i] = b;
        // Large pyramids that tile edge-to-edge into continuous lobe/gyrus
        // planes like the reference; crests larger still, a little fine dust in
        // the sparse grooves.
        pSize[i] =
          rand() < 0.06
            ? 3 + rand() * 2.5
            : (21 + rand() * 9) * (0.6 + 0.6 * b);
        // Colour comes from the baked lobe field (large frontal/parietal/
        // temporal/occipital regions), so the brain reads as lobes.
        pPick[i] = pts.pick[i];
      }
      return true;
    };

    // ── Procedural fallback (only if the baked point cloud fails to load) ──
    const genBrainProcedural = () => {
      for (let i = 0; i < COUNT; i++) {
        const yy = 1 - ((i + 0.5) / COUNT) * 2;
        const r = Math.sqrt(Math.max(0, 1 - yy * yy));
        const th = golden * i;
        const dx = Math.cos(th) * r;
        const dy = yy;
        const dz = Math.sin(th) * r;
        const ng = noise3(dx * 1.5, dy * 3.4, dz * 2.4);
        const ridge = 1 - Math.abs(ng) * 0.18;
        aBrain[i * 3] = dx * 1.08 * ridge;
        aBrain[i * 3 + 1] = dy * 0.9 * ridge;
        aBrain[i * 3 + 2] = dz * 0.82 * ridge;
        bright[i] = Math.max(0, Math.min(1, 1 - Math.abs(ng) * 1.4));
        const nl = Math.hypot(dx, dy, dz) || 1;
        aNormal[i * 3] = dx / nl;
        aNormal[i * 3 + 1] = dy / nl;
        aNormal[i * 3 + 2] = dz / nl;
        pSize[i] = rand() < 0.15 ? 2.2 + rand() * 1.6 : 9 + rand() * 4;
        pPick[i] = clusterPick(aBrain[i * 3], aBrain[i * 3 + 1], aBrain[i * 3 + 2]);
      }
    };

    if (!(pts && genBrainFromPoints(pts))) genBrainProcedural();

    // ── Rocket geometry (pointing +y): chunky body, ROUNDED dome nose, three
    //    ROUNDED (leaf) fins, nozzle, flame. ──
    const rBody = Math.floor(COUNT * 0.42);
    const rNose = Math.floor(COUNT * 0.16);
    const rFin = Math.floor(COUNT * 0.12); // thinner fins — the bottom was a dense clump
    const rNoz = Math.floor(COUNT * 0.04);
    const setN = (i: number, x: number, y: number, z: number) => {
      const l = Math.hypot(x, y, z) || 1;
      aNormal2[i * 3] = x / l;
      aNormal2[i * 3 + 1] = y / l;
      aNormal2[i * 3 + 2] = z / l;
    };
    // Tall, slim rocket. Body cylinder + a TANGENT OGIVE nose so the nose edge
    // meets the body edge with a vertical tangent — no shoulder / step.
    const RKT_R = 0.26;
    const shoulderY = 0.2;
    const tipY = 1.18;
    const noseL = tipY - shoulderY;
    const rho = (RKT_R * RKT_R + noseL * noseL) / (2 * RKT_R);
    let ci = 0;
    for (let k = 0; k < rBody; k++, ci++) {
      const a = golden * k;
      // Taper density toward the base so the bottom isn't a dense clump: the
      // power < 1 spreads particles apart low down, keeps them denser up top.
      const yv = -0.55 + Math.pow(k / rBody, 0.6) * (shoulderY + 0.55);
      aRocket[ci * 3] = Math.cos(a) * RKT_R;
      aRocket[ci * 3 + 1] = yv;
      aRocket[ci * 3 + 2] = Math.sin(a) * RKT_R;
      setN(ci, Math.cos(a), 0, Math.sin(a));
    }
    for (let k = 0; k < rNose; k++, ci++) {
      const a = golden * k;
      const h = (k / rNose) * noseL; // height above the base
      const rr = Math.sqrt(Math.max(0, rho * rho - h * h)) - (rho - RKT_R);
      const slope = h / Math.sqrt(Math.max(1e-4, rho * rho - h * h)); // -dr/dy
      aRocket[ci * 3] = Math.cos(a) * rr;
      aRocket[ci * 3 + 1] = shoulderY + h;
      aRocket[ci * 3 + 2] = Math.sin(a) * rr;
      setN(ci, Math.cos(a), slope, Math.sin(a));
    }
    for (let k = 0; k < rFin; k++, ci++) {
      // Rounded leaf fins that read flat from the front: left + right (in the
      // screen plane) and one front fin (toward the viewer).
      const g = k % 3;
      const t = rand();
      const hw = 0.1 * Math.sqrt(Math.max(0, 1 - t * t)) * (0.6 + 0.4 * (1 - t));
      const wj = (rand() * 2 - 1) * hw;
      if (g === 0 || g === 1) {
        const sgn = g === 0 ? 1 : -1;
        const bx = 0.24 * sgn;
        const by = -0.22;
        const tx = 0.56 * sgn;
        const ty = -0.66;
        let dx = tx - bx;
        let dy = ty - by;
        const dl = Math.hypot(dx, dy) || 1;
        dx /= dl;
        dy /= dl;
        aRocket[ci * 3] = bx + (tx - bx) * t + -dy * wj;
        aRocket[ci * 3 + 1] = by + (ty - by) * t + dx * wj;
        aRocket[ci * 3 + 2] = (rand() - 0.5) * 0.06;
        setN(ci, sgn * 0.4, 0.12, 0.9);
      } else {
        const bz = 0.24;
        const by = -0.22;
        const tz = 0.56;
        const ty = -0.66;
        let dz = tz - bz;
        let dy = ty - by;
        const dl = Math.hypot(dz, dy) || 1;
        dz /= dl;
        dy /= dl;
        aRocket[ci * 3] = (rand() - 0.5) * 0.06;
        aRocket[ci * 3 + 1] = by + (ty - by) * t + dz * wj;
        aRocket[ci * 3 + 2] = bz + (tz - bz) * t + -dy * wj;
        setN(ci, 0, 0.12, 1);
      }
    }
    for (let k = 0; k < rNoz; k++, ci++) {
      const a = golden * k;
      const t = k / rNoz;
      const rr = 0.1 * (1 - 0.35 * t);
      aRocket[ci * 3] = Math.cos(a) * rr;
      aRocket[ci * 3 + 1] = -0.55 - t * 0.1;
      aRocket[ci * 3 + 2] = Math.sin(a) * rr;
      setN(ci, Math.cos(a), -0.2, Math.sin(a));
    }
    for (; ci < COUNT; ci++) {
      // Flame plume below the nozzle.
      const t = rand();
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * 0.14 * (1 - t * 0.5);
      aRocket[ci * 3] = Math.cos(a) * rr;
      aRocket[ci * 3 + 1] = -0.66 - t * 0.32;
      aRocket[ci * 3 + 2] = Math.sin(a) * rr;
      setN(ci, 0, -1, 0);
      aFlame[ci] = 1;
    }

    // Deterministic far-out parking spot for a shape's surplus particles.
    // Length is always >= 5, so the shader's far-fade hides them on every
    // screen size, and the spot is stable per index — a particle that is
    // surplus in two consecutive shapes doesn't streak across the frame
    // during the morph.
    const farPos = (i: number): [number, number, number] => {
      const a = i * golden;
      const rr = 5.2 + (((i * 131) % 100) / 100) * 1.5;
      return [Math.cos(a) * rr * 1.6, Math.sin(a) * rr, ((i * 37) % 100) / 100 - 0.5];
    };

    // ── Pricing section: a NECKTIE drawn with ORDERED particles. The knot and
    // blade silhouettes are traced as evenly spaced beads (front/back layers)
    // so the edges read as crisp lines, and the blade fills with diagonal
    // regimental stripes flowing down-right — flowing fabric, not noise. The
    // brightest (largest) particles are assigned to the outlines so the edges
    // pop; the dimmest park far offscreen. ──
    {
      const setH = (i: number, x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
        aHand[i * 3] = x;
        aHand[i * 3 + 1] = y;
        aHand[i * 3 + 2] = z;
        const nl = Math.hypot(nx, ny, nz) || 1;
        aHnorm[i * 3] = nx / nl;
        aHnorm[i * 3 + 1] = ny / nl;
        aHnorm[i * 3 + 2] = nz / nl;
      };
      // Blade half-width along t (0 just below the knot .. 1 the pointed tip):
      // widens to a maximum around 78% down, then tapers to a point.
      const bladeHW = (t: number) =>
        t < 0.78
          ? 0.1 + 0.24 * Math.sin((t / 0.78) * Math.PI * 0.5)
          : 0.34 * (1 - (t - 0.78) / 0.22);
      const yTop = 0.62;
      const yTip = -0.88;
      const span = yTop - yTip;
      const hwAt = (y: number) => Math.max(0, bladeHW((yTop - y) / span));
      // Knot: inverted trapezoid — wide at the top, tapering into the blade.
      const knotT = yTop + 0.3;
      const knotHW = (y: number) => 0.13 + 0.09 * ((y - yTop) / (knotT - yTop));

      // Brightest particles first: outlines get the big lit glyphs, the fill
      // gets the mid range, and the dim tail is parked offscreen. The ambient
      // floaters (last ~4.5%, overridden later) are kept out of the pool.
      const pool = COUNT - Math.floor(COUNT * 0.045);
      const order = Array.from({ length: pool }, (_, i) => i).sort(
        (a, b) => bright[b] - bright[a],
      );

      // Evenly spaced beads along a polyline; every third bead sits on the
      // back layer so the edge reads as a thin 3D slab, not a flat line.
      const tracePath = (path: [number, number][], from: number, count: number) => {
        const segLen: number[] = [];
        let total = 0;
        for (let s = 0; s < path.length - 1; s++) {
          const l = Math.hypot(path[s + 1][0] - path[s][0], path[s + 1][1] - path[s][1]);
          segLen.push(l);
          total += l;
        }
        for (let k = 0; k < count; k++) {
          let d = ((k + 0.5) / count) * total;
          let s = 0;
          while (s < segLen.length - 1 && d > segLen[s]) {
            d -= segLen[s];
            s++;
          }
          const t = segLen[s] > 0 ? d / segLen[s] : 0;
          const x = path[s][0] + (path[s + 1][0] - path[s][0]) * t + (rand() - 0.5) * 0.012;
          const y = path[s][1] + (path[s + 1][1] - path[s][1]) * t + (rand() - 0.5) * 0.012;
          const back = k % 3 === 2;
          setH(order[from + k], x, y, back ? -0.06 : 0.02, x * 1.4, 0.1, back ? -1 : 1);
        }
      };

      // Blade silhouette: down the left edge, through the tip, up the right.
      const blade: [number, number][] = [];
      for (let s = 0; s <= 24; s++) {
        const y = yTop - (s / 24) * span;
        blade.push([-hwAt(y), y]);
      }
      for (let s = 23; s >= 0; s--) {
        const y = yTop - (s / 24) * span;
        blade.push([hwAt(y), y]);
      }
      const knot: [number, number][] = [
        [-knotHW(knotT), knotT],
        [knotHW(knotT), knotT],
        [knotHW(yTop), yTop],
        [-knotHW(yTop), yTop],
        [-knotHW(knotT), knotT],
      ];

      // Diagonal 45° stripes clipped to the blade: beads march in order along
      // each band, so the fill has a clear flowing direction.
      const stripePts: [number, number][] = [];
      const inv = Math.SQRT1_2;
      for (let o = -0.9; o <= 0.72; o += 0.15) {
        for (let s = -0.72; s <= 0.9; s += 0.042) {
          const x = (o + s) * inv;
          const y = (o - s) * inv;
          if (y < yTip + 0.02 || y > yTop) continue;
          if (Math.abs(x) > hwAt(y) * 0.9) continue; // keep clear of the edge beads
          stripePts.push([x, y]);
        }
      }

      const nEdge = 260;
      const nKnot = 240;
      const nFill = Math.min(stripePts.length * 2, 2100);
      const nActive = nEdge + nKnot + nFill;

      tracePath(blade, 0, nEdge);
      // Knot: traced outline + a dense MIRRORED diagonal weave inside (the
      // opposite direction to the blade stripes), so it reads as a solid
      // woven block rather than loose bars.
      const nKnotEdge = Math.floor(nKnot * 0.38);
      tracePath(knot, nEdge, nKnotEdge);
      const knotPts: [number, number][] = [];
      for (let o = -0.82; o <= -0.26; o += 0.05) {
        for (let s = 0.26; s <= 0.82; s += 0.022) {
          const x = (o + s) * inv;
          const y = (s - o) * inv;
          if (y < yTop + 0.015 || y > knotT - 0.01) continue;
          if (Math.abs(x) > knotHW(y) * 0.85) continue;
          knotPts.push([x, y]);
        }
      }
      for (let k = 0; k < nKnot - nKnotEdge; k++) {
        const [px, py] = knotPts[k % knotPts.length];
        const front = Math.floor(k / knotPts.length) % 2 === 0;
        setH(
          order[nEdge + nKnotEdge + k],
          px + (rand() - 0.5) * 0.01,
          py + (rand() - 0.5) * 0.01,
          front ? 0.1 : -0.08,
          px * 0.6,
          0.1,
          front ? 1 : -1,
        );
      }
      // Blade fill: cycle the stripe beads — first lap on the front face,
      // second on the back — with the centre fold (V crease) kept.
      for (let k = 0; k < nFill; k++) {
        const [px, py] = stripePts[k % stripePts.length];
        const back = Math.floor(k / stripePts.length) % 2 === 1;
        const hw = hwAt(py);
        const ex = hw > 0.001 ? px / hw : 0;
        const fold = 0.07 * (1 - ex * ex); // raised at the centre, flat at edges
        setH(
          order[nEdge + nKnot + k],
          px + (rand() - 0.5) * 0.014,
          py + (rand() - 0.5) * 0.014,
          back ? fold - 0.06 : fold,
          ex * 0.5,
          0.12,
          back ? -1 : 1,
        );
      }
      // The dim surplus parks far offscreen.
      for (let s = nActive; s < pool; s++) {
        const i = order[s];
        const [fx, fy, fz] = farPos(i);
        setH(i, fx, fy, fz, fx, fy, fz);
      }
    }

    // ── Shield with a padlock on its face ──
    {
      const halfWidth = (y: number) => {
        const nb = (0.52 - y) / 1.14; // 0 top .. 1 bottom point
        let hw = 0.52 * Math.sqrt(Math.max(0, 1 - Math.pow(nb, 1.7))); // wider shield
        hw *= 1 - 0.28 * Math.max(0, (y - 0.4) / 0.12); // round the top corners
        return Math.max(0, hw);
      };
      const setS = (i: number, x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
        aShield[i * 3] = x;
        aShield[i * 3 + 1] = y;
        aShield[i * 3 + 2] = z;
        const nl = Math.hypot(nx, ny, nz) || 1;
        aSnorm[i * 3] = nx / nl;
        aSnorm[i * 3 + 1] = ny / nl;
        aSnorm[i * 3 + 2] = nz / nl;
      };
      // Sparse fill: only ~46% form the shield face so gaps open up and the
      // padlock shows through; ~26% are the (larger) padlock so it reads
      // clearly; the rest fly out of frame.
      const nShield = Math.floor(COUNT * 0.46);
      const nLock = Math.floor(COUNT * 0.26);
      const nBody = Math.floor(nLock * 0.62);
      for (let i = 0; i < COUNT; i++) {
        if (i < nShield) {
          const y = -0.62 + rand() * 1.14;
          const hw = halfWidth(y);
          const x = (rand() * 2 - 1) * hw;
          const edge = hw > 0.001 ? x / hw : 0;
          const bulge =
            0.24 * Math.sqrt(Math.max(0, 1 - edge * edge)) * (0.55 + 0.45 * ((y + 0.62) / 1.14));
          const side = rand() < 0.72 ? 1 : -0.55;
          setS(i, x, y, bulge * side, edge * 0.9, -0.15, side > 0 ? 1 : -0.9);
        } else if (i < nShield + nBody) {
          // Padlock body: rounded rectangle, raised well in front of the shield.
          let bx = 0;
          let by = 0;
          do {
            bx = (rand() * 2 - 1) * 0.22;
            by = -0.22 + rand() * 0.34;
          } while (Math.abs(bx) > 0.22 - Math.max(0, Math.abs(by + 0.05) - 0.11) * 0.9);
          const kh = Math.hypot(bx, by + 0.02) < 0.05; // keyhole gap
          if (kh) by += 0.2;
          bright[i] = 0.95;
          setS(i, bx, by, 0.42, bx * 0.3, by * 0.3, 1);
        } else if (i < nShield + nLock) {
          // Padlock shackle: upper semicircle arc.
          const ang = rand() * Math.PI;
          const rr = 0.15 + (rand() - 0.5) * 0.06;
          bright[i] = 0.95;
          setS(i, Math.cos(ang) * rr, 0.14 + Math.sin(ang) * rr, 0.42, Math.cos(ang) * 0.4, 0.2, 1);
        } else {
          // Surplus parks far offscreen (stable spot per index across shapes).
          const [fx, fy, fz] = farPos(i);
          setS(i, fx, fy, fz, fx, fy, fz);
        }
      }
    }

    // ── Client Roadmap section: a simple 3D CAR (side profile) — body + cabin
    // + four wheels, as box shells so it reads when it turns. ──
    {
      const setC = (i: number, x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
        aCar[i * 3] = x;
        aCar[i * 3 + 1] = y;
        aCar[i * 3 + 2] = z;
        const nl = Math.hypot(nx, ny, nz) || 1;
        aCnorm[i * 3] = nx / nl;
        aCnorm[i * 3 + 1] = ny / nl;
        aCnorm[i * 3 + 2] = nz / nl;
      };
      // A point on the shell of an axis-aligned box (centre c, half-extents h).
      const boxShell = (
        i: number,
        cx: number,
        cy: number,
        cz: number,
        hx: number,
        hy: number,
        hz: number,
      ) => {
        const u = rand() * 2 - 1;
        const v = rand() * 2 - 1;
        const f = Math.floor(rand() * 6);
        let x = 0;
        let y = 0;
        let z = 0;
        let nx = 0;
        let ny = 0;
        let nz = 0;
        if (f < 2) {
          const s = f === 0 ? 1 : -1;
          x = cx + s * hx;
          y = cy + u * hy;
          z = cz + v * hz;
          nx = s;
        } else if (f < 4) {
          const s = f === 2 ? 1 : -1;
          y = cy + s * hy;
          x = cx + u * hx;
          z = cz + v * hz;
          ny = s;
        } else {
          const s = f === 4 ? 1 : -1;
          z = cz + s * hz;
          x = cx + u * hx;
          y = cy + v * hy;
          nz = s;
        }
        setC(i, x, y, z, nx, ny, nz);
      };
      const nCarBody = Math.floor(COUNT * 0.4);
      const nCabin = Math.floor(COUNT * 0.18);
      const nWheels = Math.floor(COUNT * 0.28);
      for (let i = 0; i < COUNT; i++) {
        if (i < nCarBody) {
          // Lower body: long low box.
          boxShell(i, 0, -0.02, 0, 0.82, 0.14, 0.3);
        } else if (i < nCarBody + nCabin) {
          // Cabin/roof: shorter box, set slightly back, on top of the body.
          boxShell(i, -0.06, 0.28, 0, 0.4, 0.16, 0.26);
        } else if (i < nCarBody + nCabin + nWheels) {
          // Four wheels: filled discs in the x/y plane at the corners.
          const wi = i % 4;
          const wx = (wi % 2 === 0 ? 1 : -1) * 0.5;
          const wz = (wi < 2 ? 1 : -1) * 0.31;
          const ang = rand() * Math.PI * 2;
          const rr = 0.19 * Math.sqrt(rand());
          setC(
            i,
            wx + Math.cos(ang) * rr,
            -0.18 + Math.sin(ang) * rr,
            wz + (rand() - 0.5) * 0.06,
            Math.cos(ang) * 0.3,
            Math.sin(ang) * 0.3,
            wz > 0 ? 1 : -1,
          );
        } else {
          // Surplus parks far offscreen (stable spot per index across shapes).
          const [fx, fy, fz] = farPos(i);
          setC(i, fx, fy, fz, fx, fy, fz);
        }
      }
    }

    // ── Scatter + meta ──
    for (let i = 0; i < COUNT; i++) {
      const sa = rand() * Math.PI * 2;
      const sr = Math.sqrt(rand()) * 1.2;
      aScatter[i * 3] = Math.cos(sa) * sr * 1.3;
      aScatter[i * 3 + 1] = Math.sin(sa) * sr;
      aScatter[i * 3 + 2] = (rand() - 0.5) * 0.6;

      // Style (size + palette pick) was decided per-class by the brain
      // generators; bright[] is read here so later shape tweaks still land.
      aMeta[i * 4] = bright[i];
      aMeta[i * 4 + 1] = pSize[i];
      aMeta[i * 4 + 2] = 0.5 + rand() * 1.6;
      aMeta[i * 4 + 3] = pPick[i];
    }

    // ── Ambient floaters: a few large, faint triangles drifting around (and
    // behind) the main form. They keep the SAME position through every morph
    // target, so they read as a persistent background layer with depth, like
    // the reference. Overrides the tail of every shape array. ──
    {
      const nAmbient = Math.floor(COUNT * 0.045);
      for (let j = 0; j < nAmbient; j++) {
        const i = COUNT - 1 - j;
        const a = rand() * Math.PI * 2;
        const ct = 2 * rand() - 1;
        const st = Math.sqrt(1 - ct * ct);
        const rr = 1.25 + rand() * 1.1;
        const x = st * Math.cos(a) * rr * 1.5;
        const y = ct * rr;
        const z = (rand() - 0.5) * 1.4;
        for (const arr of [aBrain, aRocket, aHand, aShield, aCar, aScatter]) {
          arr[i * 3] = x;
          arr[i * 3 + 1] = y;
          arr[i * 3 + 2] = z;
        }
        const nl = Math.hypot(x, y, z) || 1;
        for (const arr of [aNormal, aNormal2, aHnorm, aSnorm, aCnorm]) {
          arr[i * 3] = x / nl;
          arr[i * 3 + 1] = y / nl;
          arr[i * 3 + 2] = z / nl;
        }
        aFlame[i] = 0;
        aMeta[i * 4] = 0.12; // dim
        aMeta[i * 4 + 1] = 14 + rand() * 22; // large soft outlines
      }
    }

    // ── Glyph geometry: a regular tetrahedron (4 outlined faces, 12 verts),
    // scaled so the glyph spans ~1 unit — `size` then maps to pixels. ──
    const TQ = [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ];
    const TF = [0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2];
    const vertArr = new Float32Array(36);
    const baryArr = new Float32Array(36);
    // A rotated tetra projects smaller than its circumsphere — oversize it
    // so `size` still reads as the glyph's apparent pixel span.
    const tScale = 0.42;
    for (let vi = 0; vi < 12; vi++) {
      vertArr[vi * 3] = TQ[TF[vi]][0] * tScale;
      vertArr[vi * 3 + 1] = TQ[TF[vi]][1] * tScale;
      vertArr[vi * 3 + 2] = TQ[TF[vi]][2] * tScale;
      baryArr[vi * 3 + (vi % 3)] = 1;
    }

    // ── Buffers ──
    const buffers: Record<string, WebGLBuffer | null> = {};
    const bind = (
      name: string,
      data: Float32Array,
      size: number,
      perInstance: boolean,
    ) => {
      const loc = gl.getAttribLocation(prog, name);
      if (loc < 0) return;
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      if (perInstance) inst.vertexAttribDivisorANGLE(loc, 1);
      buffers[name] = buf;
    };
    bind("a_vert", vertArr, 3, false);
    bind("a_bary", baryArr, 3, false);
    bind("a_brain", aBrain, 3, true);
    bind("a_normal", aNormal, 3, true);
    bind("a_rocket", aRocket, 3, true);
    bind("a_normal2", aNormal2, 3, true);
    bind("a_hand", aHand, 3, true);
    bind("a_hnorm", aHnorm, 3, true);
    bind("a_shield", aShield, 3, true);
    bind("a_snorm", aSnorm, 3, true);
    bind("a_car", aCar, 3, true);
    bind("a_cnorm", aCnorm, 3, true);
    bind("a_scatter", aScatter, 3, true);
    bind("a_meta", aMeta, 4, true);
    bind("a_flame", aFlame, 1, true);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("u_res");
    const uCenter = U("u_center");
    const uRadius = U("u_radius");
    const uMorph = U("u_morph");
    const uIntro = U("u_intro");
    const uRotY = U("u_rotY");
    const uRotX = U("u_rotX");
    const uTime = U("u_time");
    const uGAlpha = U("u_galpha");
    const uLaunch = U("u_launch");
    const uLight = U("u_light");
    const uDpr = U("u_dpr");
    const uMaxSeed = U("u_maxSeed");
    const uPtScale = U("u_ptScale");
    const uMouse = U("u_mouse");
    const uMouseR = U("u_mouseR");

    const ll = Math.hypot(-0.5, 0.62, 0.6);
    gl.uniform3f(uLight, -0.5 / ll, 0.62 / ll, 0.6 / ll);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 1);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let narrow = false;

    // Scroll positions (in scrollY) where each section is centred → phases.
    let anchors: number[] = [0];
    const computeAnchors = () => {
      anchors = [0];
      for (const id of ["problem", "solution", "pricing", "how-it-works", "client-roadmap", "faq"]) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          anchors.push(top + el.offsetHeight / 2 - window.innerHeight / 2);
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
      narrow = w < 900;
      const phone = w < 640;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDpr, dpr);
      // Thin + shrink the field on smaller screens so it doesn't read as a
      // dense blob. seed is uniform in [0.5, 2.1]; keep ~34% on phones, ~56%
      // on tablets, all on desktop. Glyphs are large now, so shrink them hard
      // on phones or they mush the small brain into a clump.
      // Denser + finer grain on small screens so the brain reads as a solid
      // Dala-style silhouette rather than a loose scatter (was 0.95/1.3).
      gl.uniform1f(uMaxSeed, phone ? 1.75 : narrow ? 1.9 : 10.0);
      gl.uniform1f(uPtScale, phone ? 0.26 : narrow ? 0.42 : 1.0);
      computeAnchors();
    };

    const getPhase = () => {
      const y = window.scrollY;
      if (anchors.length < 2) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        return max > 0 ? (y / max) * 3 : 0;
      }
      if (y <= anchors[0]) return 0;
      for (let i = 0; i < anchors.length - 1; i++) {
        if (y <= anchors[i + 1]) {
          const span = anchors[i + 1] - anchors[i] || 1;
          return i + (y - anchors[i]) / span;
        }
      }
      return anchors.length - 1;
    };

    // Phase → composition.
    // phase: 0 hero, 1 problem, 2 solution, 3 pricing, 4 how-it-works,
    //        5 client-roadmap (car), 6 faq
    const cxFrames: [number, number][] = [
      [0.0, 0.86], // brain far right so it never covers the hero text
      [1.0, 0.14], // brain far left so it never covers the problem-section text
      [2.0, 0.78], // rocket right, clear of the text
      [3.0, 0.68], // tie right
      [4.0, 0.82], // shield far right
      [5.0, 0.72], // car right
      [6.0, 0.5],
    ];
    const scaleFrames: [number, number][] = [
      [0.0, 1.45], // large — spreads the glyphs so they stop overlapping
      [1.0, 1.55],
      [2.0, 1.4], // bigger rocket — spreads the particles apart
      [3.0, 1.28], // tie sized so the knot clears the top of the viewport
      [4.0, 2.0], // big shield — spreads the particles so the shape reads
      [5.0, 1.35], // car
      [6.0, 1.0],
    ];
    // Vertical centre (fraction from top). Most shapes sit mid-screen; the tall
    // rocket sits lower so its nose isn't cut off at the top.
    const cyFrames: [number, number][] = [
      [0.0, 0.5],
      [2.0, 0.62], // rocket lower
      [3.0, 0.55], // tie a touch lower so the knot isn't clipped
      [4.0, 0.5],
    ];

    // Mobile choreography (Dala-style): the hero brain sits UPPER-RIGHT and
    // bleeds off the right edge, with the headline stacked left underneath it —
    // rather than a small centred blob pushing all the copy far down. Later
    // sections keep their shapes near-centre so single-column text stays clear.
    const mobileCxFrames: [number, number][] = [
      [0.0, 0.74], // hero: more of the brain visible (was 0.9 = too cut off)
      [1.0, 0.44],
      [2.0, 0.5],
      [6.0, 0.5],
    ];
    const mobileCyFrames: [number, number][] = [
      [0.0, 0.3], // hero: upper third, overlapping the headline's top-right
      [1.0, 0.22],
      [2.0, 0.28],
    ];
    const mobileScaleFrames: [number, number][] = [
      [0.0, 1.05], // hero: full brain silhouette, spilling just past the edge
      [1.0, 0.6],
    ];

    let t = 0;
    let raf = 0;
    let introStart = -1;
    let smoothPhase = -1;

    // Mouse parallax (eased) — the subtle camera response that sells the 3D.
    let pmx = 0;
    let pmy = 0;
    let tpx = 0;
    let tpy = 0;
    // Raw cursor in CSS px, and the eased position the repulsion follows.
    let cursorX = -1e5;
    let cursorY = -1e5;
    let mouseX = -1e5;
    let mouseY = -1e5;
    let hovering = false;
    const onPointerMove = (e: PointerEvent) => {
      tpx = (e.clientX / Math.max(1, w) - 0.5) * 2;
      tpy = (e.clientY / Math.max(1, h) - 0.5) * 2;
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!hovering) {
        // jump the eased position to the cursor on first move (no swoop-in)
        mouseX = cursorX;
        mouseY = cursorY;
        hovering = true;
      }
    };
    const onPointerLeave = () => {
      hovering = false;
      cursorX = -1e5;
      cursorY = -1e5;
    };
    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    const render = (now: number) => {
      if (introStart < 0) introStart = now;
      const intro = reduceMotion ? 1 : Math.min(1, (now - introStart) / 1500);
      const introEase = 1 - Math.pow(1 - intro, 3);

      // Damp the phase toward the scroll target so morphs glide (inertia)
      // instead of snapping frame-to-frame with jerky wheel scrolling.
      const target = getPhase();
      if (smoothPhase < 0) smoothPhase = target;
      smoothPhase += (target - smoothPhase) * (reduceMotion ? 1 : 0.09);
      const phase = smoothPhase;

      // Morph timeline (each segment eased): brain→rocket (1→2), rocket launch
      // (2→2.6), rocket→tie (2.6→3), tie→shield (3→4), shield→car (4→5),
      // car→scatter (5→6).
      let morph = 0;
      if (phase >= 5) morph = 4 + es(phase - 5);
      else if (phase >= 4) morph = 3 + es(phase - 4);
      else if (phase >= 3) morph = 2 + es(phase - 3);
      else if (phase >= 2.6) morph = 1 + es((phase - 2.6) / 0.4);
      else if (phase >= 2) morph = 1;
      else if (phase >= 1) morph = es(phase - 1);
      // Engine fire removed — the rocket no longer ignites or lifts off.
      const launch = 0;

      // On mobile the visual sits in the TOP portion of the viewport (centred
      // horizontally) so the text below it stays clear; on desktop it uses the
      // per-section left/right choreography.
      const cxFrac = narrow ? keyframe(phase, mobileCxFrames) : keyframe(phase, cxFrames);
      const cyFrac = narrow ? keyframe(phase, mobileCyFrames) : keyframe(phase, cyFrames);
      const scale = narrow ? keyframe(phase, mobileScaleFrames) : keyframe(phase, scaleFrames);

      // Only the rocket must stand still and upright; the brain, handshake and
      // shield rotate so their 3D relief actually reads. `upright` peaks over
      // the rocket beat (phase ~2.3) and releases before and after it.
      const upright = Math.max(0, 1 - Math.abs(phase - 2.3) / 0.7);
      // Standing yaw per beat: hands and shield sit at a 3/4 angle so their
      // depth is visible; the rocket and brain face front.
      const baseYaw = keyframe(phase, [
        [0.0, 0.0],
        [2.0, 0.0], // rocket: face front
        [2.7, 0.06],
        [3.0, 0.34], // tie: slight turn so it reads 3D
        [4.0, 0.5], // shield: three-quarter view
        [5.0, 0.42], // car: three-quarter so the side + front read
        [6.0, 0.0],
      ]);
      // How much slow idle sway to layer on (reveals depth as it rocks).
      const sway = keyframe(phase, [
        [0.0, 0.0], // brain uses a continuous spin instead (below)
        [2.0, 0.0], // rocket steady
        [3.0, 0.18], // tie gently turns
        [4.0, 0.24], // shield gently rocks
        [5.0, 0.22], // car gently rocks
        [6.0, 0.4],
      ]);
      // The whole brain slowly and continuously turns in one direction, so the
      // pyramids orbit together (fades out before the rocket phase).
      const spin = keyframe(phase, [
        [0.0, 1.0],
        [1.0, 1.0],
        [1.8, 0.0],
      ]);
      const brainSpin = reduceMotion ? 0 : spin * t * 0.001 * 0.05;
      pmx += (tpx - pmx) * 0.06;
      pmy += (tpy - pmy) * 0.06;
      const rotY =
        baseYaw +
        brainSpin +
        (reduceMotion ? 0 : Math.sin(t * 0.00022) * sway + pmx * 0.12);
      const rotX =
        (0.15 + (reduceMotion ? 0 : Math.sin(t * 0.0003) * 0.05)) *
          (1 - upright * 0.85) +
        (reduceMotion ? 0 : pmy * 0.07);
      const fade = Math.max(0, 1 - Math.max(0, phase - 5.6) / 0.6);
      // Far fewer, bigger particles now — crisp outlines need more alpha.
      const globalAlpha = 0.95 * fade;

      gl.uniform2f(uCenter, w * cxFrac * dpr, h * cyFrac * dpr);
      gl.uniform1f(uRadius, Math.min(w, h) * (narrow ? 0.4 : 0.36) * scale * dpr);
      gl.uniform1f(uMorph, morph);
      gl.uniform1f(uIntro, introEase);
      gl.uniform1f(uRotY, rotY);
      gl.uniform1f(uRotX, rotX);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform1f(uGAlpha, globalAlpha);
      gl.uniform1f(uLaunch, reduceMotion ? 0 : launch);

      // Ease the repulsion origin toward the cursor (or offscreen when idle)
      // and hand it to the shader in device pixels.
      mouseX += (cursorX - mouseX) * 0.18;
      mouseY += (cursorY - mouseY) * 0.18;
      gl.uniform2f(uMouse, mouseX * dpr, mouseY * dpr);
      gl.uniform1f(uMouseR, Math.min(w, h) * 0.13 * dpr);

      gl.clear(gl.COLOR_BUFFER_BIT);
      inst.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 12, COUNT);
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
    // Recompute anchors once layout/fonts settle.
    const settle = window.setTimeout(computeAnchors, 600);

    if (reduceMotion) {
      const onScroll = () => render(performance.now());
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(resizeRaf);
        clearTimeout(settle);
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
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      clearTimeout(settle);
    };
    };

    // Fetch the baked cortex point cloud and hand it to init(). The asset is
    // baked offline from a real FreeSurfer brain surface — see
    // scripts/bake_brain.py. Any failure falls back to the procedural sphere.
    fetch("/brain-points.bin")
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then((buf) => {
        if (cancelled) return;
        cleanup = init(parseBrainPoints(buf));
      })
      .catch(() => {
        if (!cancelled) cleanup = init(null);
      });

    return () => {
      cancelled = true;
      cleanup?.();
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
