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
 * TRIANGLES in a confetti palette (white / violet / teal / pink / blue / gold)
 * that clusters into same-coloured patches across the surface, with a golden
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
varying vec3 v_color;
varying float v_alpha;
varying vec3 v_bary;
varying float v_flame;

// Confetti palette picked by a clustered value in [0,1] (patches of the same
// colour sit next to each other, like the reference brain).
vec3 palette(float pick){
  if (pick < 0.34) return vec3(0.95, 0.95, 1.0);  // white
  if (pick < 0.54) return vec3(0.58, 0.36, 1.0);  // violet
  if (pick < 0.63) return vec3(0.24, 0.82, 0.68); // teal
  if (pick < 0.72) return vec3(1.0, 0.58, 0.78);  // pink
  if (pick < 0.80) return vec3(0.3, 0.52, 1.0);   // blue
  return vec3(1.0, 0.74, 0.2);                    // gold
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

  // Morph chain: brain -> rocket -> handshake -> shield -> scatter.
  float mB = clamp(u_morph, 0.0, 1.0);
  float m2 = clamp(u_morph - 1.0, 0.0, 1.0);
  float m3 = clamp(u_morph - 2.0, 0.0, 1.0);
  float m4 = clamp(u_morph - 3.0, 0.0, 1.0);
  vec3 p = mix(a_brain, a_rocket, mB);
  p = mix(p, a_hand, m2);
  p = mix(p, a_shield, m3);
  p = mix(p, a_scatter, m4);
  p = mix(a_scatter, p, u_intro);
  vec3 n = mix(a_normal, a_normal2, mB);
  n = mix(n, a_hnorm, m2);
  n = mix(n, a_snorm, m3);
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
  gv = mix(gv, gvUni, 1.0 - clamp(u_morph, 0.0, 1.0));
  float ws = size * (0.4 + depthN) * u_dpr * u_ptScale * (1.0 + burn * 1.6) * 0.5 / u_radius;
  vec3 q = vec3(x1, y1, z2) + gv * ws;

  float persp = FOV / (FOV - q.z);
  float sxp = u_center.x + q.x * u_radius * persp;
  float syp = u_center.y - q.y * u_radius * persp;
  gl_Position = vec4(sxp / u_res.x * 2.0 - 1.0, 1.0 - syp / u_res.y * 2.0, 0.0, 1.0);

  float lambert = max(dot(vec3(nx1, ny1, nz2), u_light), 0.0);
  vec3 base = palette(pick);
  float shade = 0.62 + lambert * 0.4 + bright * 0.25;
  v_color = base * min(shade, 1.2);

  // Dim the far side of the shell so the interior stays dark enough for the
  // front glyphs to read individually.
  float front = smoothstep(-0.2, 0.4, nz2);
  float vis = mix(0.08, 0.95, front);
  float tw = 0.93 + 0.07 * sin(u_time * seed * 2.0 + seed * 12.0);
  // bright ≈ 1 on gyri crests, ≈ 0 in sulci grooves — grooves go dark so the
  // fold pattern carves visibly through the tiled surface.
  v_alpha = clamp((0.7 + depthN * 0.3) * vis * (0.14 + bright * 0.86) * tw * u_galpha, 0.0, 1.0);

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
    a = 1.0 - smoothstep(0.07, 0.07 + w, e); // crisp edge outline
    a = max(a, 0.05);                         // faint face fill
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
    const rFin = Math.floor(COUNT * 0.26);
    const rNoz = Math.floor(COUNT * 0.05);
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
      const yv = -0.55 + (k / rBody) * (shoulderY + 0.55);
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

    // ── Partners section: a soft dispersed particle cloud (placeholder). No
    // recognisable form yet — just scattered particles gently lit. ──
    {
      for (let i = 0; i < COUNT; i++) {
        const a = rand() * Math.PI * 2;
        const ct = 2 * rand() - 1;
        const st = Math.sqrt(1 - ct * ct);
        const rr = Math.cbrt(rand()); // fill the ball evenly
        const x = st * Math.cos(a) * rr * 1.15;
        const y = ct * rr * 0.95;
        const z = st * Math.sin(a) * rr * 0.9;
        aHand[i * 3] = x;
        aHand[i * 3 + 1] = y;
        aHand[i * 3 + 2] = z;
        const nl = Math.hypot(x, y, z) || 1;
        aHnorm[i * 3] = x / nl;
        aHnorm[i * 3 + 1] = y / nl;
        aHnorm[i * 3 + 2] = z / nl;
      }
    }

    // ── Shield with a padlock on its face ──
    {
      const halfWidth = (y: number) => {
        const nb = (0.52 - y) / 1.14; // 0 top .. 1 bottom point
        let hw = 0.38 * Math.sqrt(Math.max(0, 1 - Math.pow(nb, 1.7)));
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
      const nLock = Math.floor(COUNT * 0.16);
      const nShield = COUNT - nLock;
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
          // Padlock body: rounded rectangle, raised in front of the shield.
          let bx = 0;
          let by = 0;
          do {
            bx = (rand() * 2 - 1) * 0.15;
            by = -0.16 + rand() * 0.24;
          } while (Math.abs(bx) > 0.15 - Math.max(0, Math.abs(by + 0.04) - 0.08) * 0.9);
          const kh = Math.hypot(bx, by + 0.02) < 0.035; // keyhole gap
          if (kh) by += 0.14;
          bright[i] = 0.95;
          setS(i, bx, by, 0.3, bx * 0.3, by * 0.3, 1);
        } else {
          // Padlock shackle: upper semicircle arc.
          const ang = rand() * Math.PI;
          const rr = 0.1 + (rand() - 0.5) * 0.045;
          bright[i] = 0.95;
          setS(i, Math.cos(ang) * rr, 0.08 + Math.sin(ang) * rr, 0.3, Math.cos(ang) * 0.4, 0.2, 1);
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
        for (const arr of [aBrain, aRocket, aHand, aShield, aScatter]) {
          arr[i * 3] = x;
          arr[i * 3 + 1] = y;
          arr[i * 3 + 2] = z;
        }
        const nl = Math.hypot(x, y, z) || 1;
        for (const arr of [aNormal, aNormal2, aHnorm, aSnorm]) {
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
      for (const id of ["problem", "solution", "pricing", "how-it-works", "faq"]) {
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
      gl.uniform1f(uMaxSeed, phone ? 0.95 : narrow ? 1.3 : 10.0);
      gl.uniform1f(uPtScale, phone ? 0.27 : narrow ? 0.5 : 1.0);
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

    // Phase → composition. Hero(0) right brain → Problem(1) left brain →
    // Solution(2) rocket (right) → Pricing(3)+ dissolve to scatter.
    // phase: 0 hero, 1 problem, 2 solution, 3 pricing, 4 how-it-works, 5 faq
    const cxFrames: [number, number][] = [
      [0.0, 0.86], // brain far right so it never covers the hero text
      [1.0, 0.14], // brain far left so it never covers the problem-section text
      [2.0, 0.55], // rocket centre
      [3.0, 0.68], // handshake right
      [4.0, 0.68], // shield right
      [5.0, 0.5],
    ];
    const scaleFrames: [number, number][] = [
      [0.0, 1.45], // large — spreads the glyphs so they stop overlapping
      [1.0, 1.55],
      [2.0, 1.02], // smaller rocket
      [3.0, 0.8], // smaller handshake
      [4.0, 1.2],
      [5.0, 1.0],
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
    const onPointerMove = (e: PointerEvent) => {
      tpx = (e.clientX / Math.max(1, w) - 0.5) * 2;
      tpy = (e.clientY / Math.max(1, h) - 0.5) * 2;
    };
    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
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
      // (2→2.6), rocket→handshake (2.6→3), handshake→shield (3→4), →scatter (4→5).
      let morph = 0;
      if (phase >= 4) morph = 3 + es(phase - 4);
      else if (phase >= 3) morph = 2 + es(phase - 3);
      else if (phase >= 2.6) morph = 1 + es((phase - 2.6) / 0.4);
      else if (phase >= 2) morph = 1;
      else if (phase >= 1) morph = es(phase - 1);
      // Engine ignites then fades as the rocket morphs to the handshake.
      const launch =
        es(Math.min(1, Math.max(0, (phase - 2) / 0.6))) *
        es(Math.min(1, Math.max(0, (2.9 - phase) / 0.3)));

      // On mobile the visual sits in the TOP portion of the viewport (centred
      // horizontally) so the text below it stays clear; on desktop it uses the
      // per-section left/right choreography.
      const cxFrac = narrow ? 0.5 : keyframe(phase, cxFrames);
      const cyFrac =
        (narrow ? 0.21 : 0.5) - launch * (narrow ? 0.12 : 0.55); // rise on launch
      const scale = narrow ? 0.6 : keyframe(phase, scaleFrames);

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
        [3.0, 0.34], // bust: slight turn so head/shoulders read 3D
        [4.0, 0.5], // shield: three-quarter view
        [5.0, 0.0],
      ]);
      // How much slow idle sway to layer on (reveals depth as it rocks).
      const sway = keyframe(phase, [
        [0.0, 0.0], // brain uses a continuous spin instead (below)
        [2.0, 0.0], // rocket steady
        [3.0, 0.18], // bust gently turns
        [4.0, 0.24], // shield gently rocks
        [5.0, 0.4],
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
      const fade = Math.max(0, 1 - Math.max(0, phase - 4.6) / 0.6);
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
