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
attribute vec3 a_scatter;
attribute vec4 a_meta; // bright, size, seed, shape
uniform vec2 u_res;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_morph;   // 0 brain -> 1 rocket -> 2 scatter
uniform float u_intro;
uniform float u_rotY;
uniform float u_rotX;
uniform float u_time;
uniform float u_galpha;
uniform vec3 u_light;
uniform float u_dpr;
varying vec3 v_color;
varying float v_alpha;
varying float v_shape;

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

  float mB = clamp(u_morph, 0.0, 1.0);       // brain -> rocket
  float mS = clamp(u_morph - 1.0, 0.0, 1.0); // rocket -> scatter
  vec3 p = mix(a_brain, a_rocket, mB);
  p = mix(p, a_scatter, mS);
  p = mix(a_scatter, p, u_intro);
  vec3 n = normalize(mix(a_normal, a_normal2, mB));

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
}
`;

const FRAG = `
precision highp float;
varying vec3 v_color;
varying float v_alpha;
varying float v_shape;

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
  float d;
  if (v_shape < 0.5) d = sdTri(p, 0.85);
  else if (v_shape < 1.5) d = (abs(p.x) + abs(p.y)) - 0.82;
  else if (v_shape < 2.5) d = length(p) - 0.72;
  else d = max(abs(p.x), abs(p.y)) - 0.68;
  float a = smoothstep(0.17, 0.0, abs(d));
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
    const aScatter = new Float32Array(COUNT * 3);
    const aMeta = new Float32Array(COUNT * 4);
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

    // ── Rocket geometry (pointing +y): body, nose, fins, flame ──
    const rBody = Math.floor(COUNT * 0.5);
    const rNose = Math.floor(COUNT * 0.18);
    const rFin = Math.floor(COUNT * 0.2);
    const setN = (i: number, x: number, y: number, z: number) => {
      const l = Math.hypot(x, y, z) || 1;
      aNormal2[i * 3] = x / l;
      aNormal2[i * 3 + 1] = y / l;
      aNormal2[i * 3 + 2] = z / l;
    };
    for (let i = 0; i < COUNT; i++) {
      if (i < rBody) {
        const a = golden * i;
        const frac = i / rBody;
        const rb = 0.24;
        aRocket[i * 3] = Math.cos(a) * rb;
        aRocket[i * 3 + 1] = -0.45 + frac * 0.95;
        aRocket[i * 3 + 2] = Math.sin(a) * rb;
        setN(i, Math.cos(a), 0, Math.sin(a));
      } else if (i < rBody + rNose) {
        const j = i - rBody;
        const a = golden * j;
        const t = j / rNose;
        const rr = 0.24 * (1 - t);
        aRocket[i * 3] = Math.cos(a) * rr;
        aRocket[i * 3 + 1] = 0.5 + t * 0.42;
        aRocket[i * 3 + 2] = Math.sin(a) * rr;
        setN(i, Math.cos(a) * 0.7, 0.7, Math.sin(a) * 0.7);
      } else if (i < rBody + rNose + rFin) {
        const j = i - rBody - rNose;
        const fin = j % 3;
        const ang = (fin * Math.PI * 2) / 3;
        const t = rand();
        const out = 0.24 + t * 0.32 * (0.4 + 0.6 * rand());
        aRocket[i * 3] = Math.cos(ang) * out;
        aRocket[i * 3 + 1] = -0.16 - t * 0.42;
        aRocket[i * 3 + 2] = Math.sin(ang) * out;
        setN(i, -Math.sin(ang), 0.15, Math.cos(ang));
      } else {
        const t = rand();
        const a = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * 0.2 * (1 - t * 0.6);
        aRocket[i * 3] = Math.cos(a) * rr;
        aRocket[i * 3 + 1] = -0.5 - t * 0.42;
        aRocket[i * 3 + 2] = Math.sin(a) * rr;
        setN(i, 0, -1, 0);
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
    const bind = (name: string, data: Float32Array, size: number) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    bind("a_brain", aBrain, 3);
    bind("a_normal", aNormal, 3);
    bind("a_rocket", aRocket, 3);
    bind("a_normal2", aNormal2, 3);
    bind("a_scatter", aScatter, 3);
    bind("a_meta", aMeta, 4);

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
      for (const id of ["problem", "solution", "pricing"]) {
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
    const cxFrames: [number, number][] = [
      [0.0, 0.66],
      [1.0, 0.3],
      [2.0, 0.6],
      [3.0, 0.5],
    ];
    const scaleFrames: [number, number][] = [
      [0.0, 1.05],
      [1.0, 1.2],
      [2.0, 1.25],
      [3.0, 1.05],
    ];

    let t = 0;
    let raf = 0;
    let introStart = -1;

    const render = (now: number) => {
      if (introStart < 0) introStart = now;
      const intro = reduceMotion ? 1 : Math.min(1, (now - introStart) / 1500);
      const introEase = 1 - Math.pow(1 - intro, 3);
      const phase = getPhase();

      // morph 0..2: brain→rocket over phase 1→2, rocket→scatter over 2→3.
      let morph = 0;
      if (phase >= 2) morph = 1 + Math.min(1, phase - 2);
      else if (phase >= 1) morph = phase - 1;

      const cxFrac = narrow ? 0.5 : keyframe(phase, cxFrames);
      const cyFrac = narrow ? 0.34 : 0.5;
      const scale = narrow ? 0.95 : keyframe(phase, scaleFrames);

      const rotY = (reduceMotion ? 0.35 : Math.sin(t * 0.00022) * 0.7) + phase * 0.25;
      const rotX = 0.16 + (reduceMotion ? 0 : Math.sin(t * 0.0003) * 0.06);
      const fade = Math.max(0, 1 - Math.max(0, phase - 2.4) / 0.6);
      const globalAlpha = (narrow ? 0.9 : 0.9) * fade;

      gl.uniform2f(uCenter, w * cxFrac * dpr, h * cyFrac * dpr);
      gl.uniform1f(uRadius, Math.min(w, h) * (narrow ? 0.4 : 0.36) * scale * dpr);
      gl.uniform1f(uMorph, morph);
      gl.uniform1f(uIntro, introEase);
      gl.uniform1f(uRotY, rotY);
      gl.uniform1f(uRotX, rotX);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform1f(uGAlpha, globalAlpha);

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
