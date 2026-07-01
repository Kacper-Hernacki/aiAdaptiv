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
 * rocket normals; the vertex shader morphs between them, lights the surface
 * (bright lit crests, shadowed valleys) and colours a purple depth ramp.
 * Additive blending gives the luminous bloom (no depth sort needed). Honors
 * prefers-reduced-motion; DPR-aware; no-op if WebGL is unavailable.
 */

const COUNT = 24000;

function noise3(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 3.1 + y * 2.3 + 1.7) * Math.cos(z * 2.7 - 0.6) +
    0.5 * Math.sin(x * 6.3 - z * 5.1 + 2.1) * Math.cos(y * 5.7 + 0.3) +
    0.25 * Math.sin(y * 11 + z * 9 + 1.1) * Math.cos(x * 10.2 - 0.8)
  );
}

function keyframe(p: number, frames: [number, number][]): number {
  if (p <= frames[0][0]) return frames[0][1];
  const last = frames[frames.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < frames.length - 1; i++) {
    const [p0, v0] = frames[i];
    const [p1, v1] = frames[i + 1];
    if (p >= p0 && p <= p1) return v0 + (v1 - v0) * ((p - p0) / (p1 - p0));
  }
  return last[1];
}

const VERT = `
precision highp float;
attribute vec3 a_brain;
attribute vec3 a_normal;
attribute vec3 a_rocket;
attribute vec3 a_normal2;
attribute vec3 a_hand;
attribute vec3 a_hnorm;
attribute vec3 a_shield;
attribute vec3 a_snorm;
attribute vec3 a_scatter;
attribute vec4 a_meta; // bright, size, seed, shape
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
varying vec3 v_color;
varying float v_alpha;
varying float v_shape;
varying float v_flame;

vec3 ramp(float v){
  vec3 c0 = vec3(0.047, 0.027, 0.117);
  vec3 c1 = vec3(0.502, 0.322, 1.0);
  vec3 c2 = vec3(0.988, 0.980, 1.0);
  v = clamp(v, 0.0, 1.0);
  if (v < 0.5) return mix(c0, c1, v / 0.5);
  return mix(c1, c2, (v - 0.5) / 0.5);
}

void main(){
  float bright = a_meta.x;
  float size = a_meta.y;
  float seed = a_meta.z;
  v_shape = a_meta.w;

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
  float persp = FOV / (FOV - z2);
  float depthN = clamp((z2 + 1.2) / 2.4, 0.0, 1.0);

  float sxp = u_center.x + x1 * u_radius * persp;
  float syp = u_center.y - y1 * u_radius * persp;
  gl_Position = vec4(sxp / u_res.x * 2.0 - 1.0, 1.0 - syp / u_res.y * 2.0, 0.0, 1.0);
  gl_PointSize = max(1.0, size * (0.4 + depthN * 1.0) * persp * u_dpr);

  float lambert = max(dot(vec3(nx1, ny1, nz2), u_light), 0.0);
  float v = 0.3 + lambert * 0.58 + bright * lambert * 0.3 - (1.0 - bright) * 0.1;
  v_color = ramp(v);

  float faceFactor = 0.6 + 0.4 * clamp(nz2 + 0.3, 0.0, 1.0);
  float tw = 0.75 + 0.25 * sin(u_time * seed * 2.0 + seed * 12.0);
  v_alpha = clamp((0.62 + depthN * 0.38) * faceFactor * (0.66 + bright * 0.34) * tw * u_galpha, 0.0, 1.0);

  // Flame overrides colour (amber -> white core) and its own alpha (hidden
  // until the engine ignites), and gets a bigger, softer sprite.
  v_flame = 0.0;
  if (flameOn > 0.5) {
    float core = clamp(1.0 - length(p.xz) * 3.0, 0.0, 1.0);
    // Same purple family as the brain/rocket, but lighter (lavender -> white).
    v_color = mix(vec3(0.66, 0.5, 1.0), vec3(0.97, 0.94, 1.0), core);
    v_flame = burn;
    v_alpha = clamp(burn * (0.55 + 0.45 * flick) * u_galpha, 0.0, 1.0);
    gl_PointSize *= 1.0 + burn * 1.6;
  }
}
`;

const FRAG = `
precision highp float;
varying vec3 v_color;
varying float v_alpha;
varying float v_shape;
varying float v_flame;

float sdTri(vec2 p, float r){
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

void main(){
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  p.y = -p.y;
  float a;
  if (v_flame > 0.01) {
    a = smoothstep(1.0, 0.0, length(p)); // soft filled ember
  } else {
    float d;
    if (v_shape < 0.5) d = sdTri(p, 0.85);
    else if (v_shape < 1.5) d = (abs(p.x) + abs(p.y)) - 0.82;
    else if (v_shape < 2.5) d = length(p) - 0.72;
    else d = max(abs(p.x), abs(p.y)) - 0.68;
    a = smoothstep(0.17, 0.0, abs(d));
  }
  if (a <= 0.003) discard;
  gl_FragColor = vec4(v_color, a * v_alpha);
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

export function CosmicField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
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

    const nCereb = Math.floor(COUNT * 0.82);
    const nCbl = Math.floor(COUNT * 0.12);
    const nStem = COUNT - nCereb - nCbl;
    const gyri = (dx: number, dy: number, dz: number) =>
      Math.max(0, 1 - Math.abs(noise3(dx * 2.1, dy * 2.1, dz * 2.1)) * 1.25);

    // Cerebrum (crest-weighted density + fold normals).
    {
      const M = nCereb * 3;
      const cdf = new Float64Array(M);
      let total = 0;
      for (let m = 0; m < M; m++) {
        const yy = 1 - ((m + 0.5) / M) * 2;
        const r = Math.sqrt(Math.max(0, 1 - yy * yy));
        const th = golden * m;
        total += Math.pow(0.18 + gyri(Math.cos(th) * r, yy, Math.sin(th) * r), 2.6);
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
        const dx = Math.cos(th) * r + (rand() - 0.5) * 0.05;
        const dy = yy + (rand() - 0.5) * 0.05;
        const dz = Math.sin(th) * r + (rand() - 0.5) * 0.05;
        const ax = 1.18 * (dx > 0 ? 1.0 : 0.92);
        const ay = 0.82 * (dy < 0 ? 0.82 : 1.0);
        const az = 0.82;
        const ng = noise3(dx * 2.1, dy * 2.1, dz * 2.1);
        const ridge = 1 - Math.abs(ng) * 0.34;
        aBrain[i * 3] = dx * ax * ridge;
        aBrain[i * 3 + 1] = dy * ay * ridge + 0.08;
        aBrain[i * 3 + 2] = dz * az * ridge;
        bright[i] = Math.max(0, Math.min(1, 1 - Math.abs(ng) * 1.25));

        let nl = Math.hypot(dx, dy, dz) || 1;
        const n0x = dx / nl;
        const n0y = dy / nl;
        const n0z = dz / nl;
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
        const k = 2.2;
        const s1 = ((gA - g0) / eps) * -0.34 * k;
        const s2 = ((gB - g0) / eps) * -0.34 * k;
        let nx = n0x - t1x * s1 - t2x * s2;
        let ny = n0y - t1y * s1 - t2y * s2;
        let nz = n0z - t1z * s1 - t2z * s2;
        nl = Math.hypot(nx, ny, nz) || 1;
        aNormal[i * 3] = nx / nl;
        aNormal[i * 3 + 1] = ny / nl;
        aNormal[i * 3 + 2] = nz / nl;
      }
    }
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
      aBrain[i * 3] = -0.74 + dx * s * 1.05 * ridge;
      aBrain[i * 3 + 1] = -0.48 + dy * s * 0.78 * ridge;
      aBrain[i * 3 + 2] = dz * s * 0.95 * ridge;
      bright[i] = Math.max(0, Math.min(1, 1 - Math.abs(ng) * 1.5));
      const cl = Math.hypot(dx, dy, dz) || 1;
      aNormal[i * 3] = dx / cl;
      aNormal[i * 3 + 1] = dy / cl;
      aNormal[i * 3 + 2] = dz / cl;
    }
    for (let j = 0; j < nStem; j++) {
      const i = nCereb + nCbl + j;
      const tt = j / Math.max(1, nStem);
      const a = golden * j;
      const rr = 0.07 * (1 - tt * 0.5);
      aBrain[i * 3] = -0.42 + Math.cos(a) * rr;
      aBrain[i * 3 + 1] = -0.52 - tt * 0.6;
      aBrain[i * 3 + 2] = Math.sin(a) * rr;
      bright[i] = 0.32;
      aNormal[i * 3] = Math.cos(a);
      aNormal[i * 3 + 1] = 0;
      aNormal[i * 3 + 2] = Math.sin(a);
    }

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
    let ci = 0;
    for (let k = 0; k < rBody; k++, ci++) {
      // Barrel body with softly rounded shoulders.
      const a = golden * k;
      const yv = -0.35 + (k / rBody) * 0.75;
      const rb = 0.32 * (1 - 0.16 * Math.max(0, (yv - 0.16) / 0.24));
      aRocket[ci * 3] = Math.cos(a) * rb;
      aRocket[ci * 3 + 1] = yv;
      aRocket[ci * 3 + 2] = Math.sin(a) * rb;
      setN(ci, Math.cos(a), 0, Math.sin(a));
    }
    for (let k = 0; k < rNose; k++, ci++) {
      // Rounded dome nose (hemisphere), not pointed — "zaokrąglony czubek".
      const a = golden * k;
      const t = k / rNose;
      const rr = 0.32 * Math.sqrt(Math.max(0, 1 - t * t));
      aRocket[ci * 3] = Math.cos(a) * rr;
      aRocket[ci * 3 + 1] = 0.4 + t * 0.4;
      aRocket[ci * 3 + 2] = Math.sin(a) * rr;
      setN(ci, Math.cos(a) * 0.5, 0.85, Math.sin(a) * 0.5);
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
        const bx = 0.26 * sgn;
        const by = -0.05;
        const tx = 0.64 * sgn;
        const ty = -0.55;
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
        const bz = 0.26;
        const by = -0.05;
        const tz = 0.62;
        const ty = -0.55;
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
      const rr = 0.12 * (1 - 0.35 * t);
      aRocket[ci * 3] = Math.cos(a) * rr;
      aRocket[ci * 3 + 1] = -0.35 - t * 0.12;
      aRocket[ci * 3 + 2] = Math.sin(a) * rr;
      setN(ci, Math.cos(a), -0.2, Math.sin(a));
    }
    for (; ci < COUNT; ci++) {
      // Flame plume below the nozzle.
      const t = rand();
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * 0.16 * (1 - t * 0.5);
      aRocket[ci * 3] = Math.cos(a) * rr;
      aRocket[ci * 3 + 1] = -0.48 - t * 0.3;
      aRocket[ci * 3 + 2] = Math.sin(a) * rr;
      setN(ci, 0, -1, 0);
      aFlame[ci] = 1;
    }

    // ── Handshake: two forearms clasped at the centre ──
    {
      const hn = (i: number, x: number, y: number, z: number) => {
        const l = Math.hypot(x, y, z) || 1;
        aHnorm[i * 3] = x / l;
        aHnorm[i * 3 + 1] = y / l;
        aHnorm[i * 3 + 2] = z / l;
      };
      const arm = (i: number, p0: number[], p1: number[]) => {
        const tt = rand();
        const cxp = p0[0] + (p1[0] - p0[0]) * tt;
        const cyp = p0[1] + (p1[1] - p0[1]) * tt;
        let dx = p1[0] - p0[0];
        let dy = p1[1] - p0[1];
        const dl = Math.hypot(dx, dy) || 1;
        dx /= dl;
        dy /= dl;
        const p1x = -dy;
        const p1y = dx;
        const ang = rand() * Math.PI * 2;
        const rad = 0.15 * (0.6 + 0.4 * Math.sqrt(rand()));
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        aHand[i * 3] = cxp + p1x * rad * c;
        aHand[i * 3 + 1] = cyp + p1y * rad * c;
        aHand[i * 3 + 2] = rad * s;
        hn(i, p1x * c, p1y * c, s);
      };
      const nArmL = Math.floor(COUNT * 0.34);
      const nArmR = Math.floor(COUNT * 0.34);
      for (let i = 0; i < COUNT; i++) {
        if (i < nArmL) arm(i, [-1.08, -0.5], [-0.08, 0.04]);
        else if (i < nArmL + nArmR) arm(i, [1.08, -0.5], [0.08, 0.04]);
        else {
          // Clasp: rounded cluster where the hands meet.
          const rr = Math.cbrt(rand());
          const a1 = rand() * Math.PI * 2;
          const b1 = Math.acos(2 * rand() - 1);
          const ex = Math.sin(b1) * Math.cos(a1);
          const ey = Math.cos(b1);
          const ez = Math.sin(b1) * Math.sin(a1);
          aHand[i * 3] = ex * 0.3 * rr;
          aHand[i * 3 + 1] = 0.04 + ey * 0.2 * rr;
          aHand[i * 3 + 2] = ez * 0.24 * rr;
          hn(i, ex, ey * 0.6, ez + 0.3);
        }
      }
    }

    // ── Shield: convex heraldic shield (rounded top, point bottom) ──
    {
      const halfWidth = (y: number) => {
        const nb = (0.52 - y) / 1.14; // 0 top .. 1 bottom point
        let hw = 0.38 * Math.sqrt(Math.max(0, 1 - Math.pow(nb, 1.7)));
        hw *= 1 - 0.28 * Math.max(0, (y - 0.4) / 0.12); // round the top corners
        return Math.max(0, hw);
      };
      for (let i = 0; i < COUNT; i++) {
        const y = -0.62 + rand() * 1.14;
        const hw = halfWidth(y);
        const x = (rand() * 2 - 1) * hw;
        const edge = hw > 0.001 ? x / hw : 0;
        const bulge =
          0.24 * Math.sqrt(Math.max(0, 1 - edge * edge)) * (0.55 + 0.45 * ((y + 0.62) / 1.14));
        const side = rand() < 0.72 ? 1 : -0.55; // mostly the front face
        aShield[i * 3] = x;
        aShield[i * 3 + 1] = y;
        aShield[i * 3 + 2] = bulge * side;
        const nx = edge * 0.9;
        const ny = -0.15;
        const nz = side > 0 ? 1 : -0.9;
        const nl = Math.hypot(nx, ny, nz) || 1;
        aSnorm[i * 3] = nx / nl;
        aSnorm[i * 3 + 1] = ny / nl;
        aSnorm[i * 3 + 2] = nz / nl;
      }
    }

    // ── Scatter + meta ──
    for (let i = 0; i < COUNT; i++) {
      const sa = rand() * Math.PI * 2;
      const sr = Math.sqrt(rand()) * 1.2;
      aScatter[i * 3] = Math.cos(sa) * sr * 1.3;
      aScatter[i * 3 + 1] = Math.sin(sa) * sr;
      aScatter[i * 3 + 2] = (rand() - 0.5) * 0.6;

      const isEdge = bright[i] > 0.5;
      const rshape = rand();
      const shape = rshape < 0.66 ? 0 : rshape < 0.8 ? 1 : rshape < 0.91 ? 2 : 3;
      aMeta[i * 4] = bright[i];
      aMeta[i * 4 + 1] = (isEdge ? 3.8 : 2.8) + rand() * (isEdge ? 5 : 3.6);
      aMeta[i * 4 + 2] = 0.5 + rand() * 1.6;
      aMeta[i * 4 + 3] = shape;
    }

    // ── Buffers ──
    const buffers: Record<string, WebGLBuffer | null> = {};
    const bind = (name: string, data: Float32Array, size: number) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      buffers[name] = buf;
    };
    bind("a_brain", aBrain, 3);
    bind("a_normal", aNormal, 3);
    bind("a_rocket", aRocket, 3);
    bind("a_normal2", aNormal2, 3);
    bind("a_hand", aHand, 3);
    bind("a_hnorm", aHnorm, 3);
    bind("a_shield", aShield, 3);
    bind("a_snorm", aSnorm, 3);
    bind("a_scatter", aScatter, 3);
    bind("a_meta", aMeta, 4);
    bind("a_flame", aFlame, 1);

    // Replace the procedural handshake with a point cloud sampled from the
    // reference silhouette (/hand-map.png) once it loads — reads as a real
    // handshake, with a soft bulge + outward normals for lighting.
    const handImg = new Image();
    handImg.onload = () => {
      const iw = handImg.naturalWidth;
      const ih = handImg.naturalHeight;
      const oc = document.createElement("canvas");
      oc.width = iw;
      oc.height = ih;
      const octx = oc.getContext("2d");
      if (!octx) return;
      octx.drawImage(handImg, 0, 0);
      const d = octx.getImageData(0, 0, iw, ih).data;
      const fx: number[] = [];
      const fy: number[] = [];
      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          if (d[(y * iw + x) * 4] > 110) {
            fx.push(x);
            fy.push(y);
          }
        }
      }
      if (fx.length === 0) return;
      const half = ih / 2;
      const sc = 0.82;
      for (let i = 0; i < COUNT; i++) {
        const k = Math.floor(rand() * fx.length);
        const nx = ((fx[k] + rand() - 0.5 - iw / 2) / half) * sc;
        const ny = (-(fy[k] + rand() - 0.5 - ih / 2) / half) * sc;
        const rr = Math.min(1, Math.hypot(nx / 1.5, ny));
        aHand[i * 3] = nx;
        aHand[i * 3 + 1] = ny;
        aHand[i * 3 + 2] = 0.16 * Math.sqrt(Math.max(0, 1 - rr * rr));
        let nnx = nx * 0.55;
        let nny = ny * 0.55;
        const nl = Math.hypot(nnx, nny, 1) || 1;
        aHnorm[i * 3] = nnx / nl;
        aHnorm[i * 3 + 1] = nny / nl;
        aHnorm[i * 3 + 2] = 1 / nl;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers["a_hand"]);
      gl.bufferData(gl.ARRAY_BUFFER, aHand, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers["a_hnorm"]);
      gl.bufferData(gl.ARRAY_BUFFER, aHnorm, gl.STATIC_DRAW);
    };
    handImg.src = "/hand-map.png";

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
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDpr, dpr);
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
      [0.0, 0.66], // brain right
      [1.0, 0.3], // brain left
      [2.0, 0.55], // rocket centre
      [3.0, 0.68], // handshake right
      [4.0, 0.68], // shield right
      [5.0, 0.5],
    ];
    const scaleFrames: [number, number][] = [
      [0.0, 1.05],
      [1.0, 1.2],
      [2.0, 1.25],
      [3.0, 1.15],
      [4.0, 1.2],
      [5.0, 1.0],
    ];

    let t = 0;
    let raf = 0;
    let introStart = -1;

    const render = (now: number) => {
      if (introStart < 0) introStart = now;
      const intro = reduceMotion ? 1 : Math.min(1, (now - introStart) / 1500);
      const introEase = 1 - Math.pow(1 - intro, 3);
      const phase = getPhase();

      // Morph timeline: brain→rocket (1→2), rocket launch (2→2.6),
      // rocket→handshake (2.6→3), handshake→shield (3→4), shield→scatter (4→5).
      let morph = 0;
      if (phase >= 4) morph = 3 + Math.min(1, phase - 4);
      else if (phase >= 3) morph = 2 + (phase - 3);
      else if (phase >= 2.6) morph = 1 + (phase - 2.6) / 0.4;
      else if (phase >= 2) morph = 1;
      else if (phase >= 1) morph = phase - 1;
      // Engine ignites then fades as the rocket morphs to the handshake.
      const launch =
        Math.min(1, Math.max(0, (phase - 2) / 0.6)) *
        Math.min(1, Math.max(0, (2.9 - phase) / 0.3));

      const cxFrac = narrow ? 0.5 : keyframe(phase, cxFrames);
      const cyFrac = (narrow ? 0.34 : 0.5) - launch * 0.55; // rise on launch
      const scale = narrow ? 0.95 : keyframe(phase, scaleFrames);

      // As the brain becomes a rocket, damp rotation so it stands upright.
      const rocketness = Math.min(1, Math.max(0, phase - 1));
      const idle = reduceMotion ? 0.3 : Math.sin(t * 0.00022) * 0.7;
      const rotY = idle * (1 - rocketness * 0.92) + phase * 0.2 * (1 - rocketness * 0.85);
      const rotX =
        (0.16 + (reduceMotion ? 0 : Math.sin(t * 0.0003) * 0.06)) * (1 - rocketness * 0.7);
      const fade = Math.max(0, 1 - Math.max(0, phase - 4.6) / 0.6);
      const globalAlpha = 0.9 * fade;

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
      gl.drawArrays(gl.POINTS, 0, COUNT);
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
      clearTimeout(settle);
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
