#!/usr/bin/env python3
"""Bake a real human cortex (FreeSurfer fsaverage5 pial surface, both hemispheres)
into a compact point cloud for CosmicField's brain shape.

Output: public/brain-points.bin — a tight binary the browser reads to fill the
per-particle aBrain / aNormal / pick / bright arrays. The points sit on a real
cortex mesh (genuine gyri + sulci): FreeSurfer's sulcal-depth map drives
brightness, the points are Poisson-disk spaced (denser on crests, sparser in
grooves, never overlapping), and each carries a lobe-based colour pick so the
brain reads as large colour fields (frontal / parietal / temporal / occipital)
like the reference. Glyph orientation is uniform, applied in the shader.

Binary layout (little-endian):
  magic    : 4 bytes  = b'BPT3'
  count    : uint32               number of points
  posScale : float32              world = int16 * posScale
  then count * 11 bytes:
    px,py,pz : int16   position / posScale   (world units)
    nx,ny,nz : int8    normal   * 127        (unit vector)
    pick     : uint8   0..255                (lobe colour, palette pick * 255)
    bright   : uint8   0..255                (1 = gyral crest, 0 = sulcal floor)

World frame matches the existing generator: x = anterior->posterior profile,
y = up (superior), z = left/right depth; half-width ~1.08.
"""

import struct
import sys

import numpy as np
from nilearn import datasets
from nilearn.surface import load_surf_data, load_surf_mesh
from scipy.spatial import cKDTree

COUNT = 7000
HALF_WIDTH = 1.08  # matches rx in CosmicField (world units, anterior-posterior)
OUT = sys.argv[1] if len(sys.argv) > 1 else "brain-points.bin"


def vertex_normals(coords, faces):
    fn = np.cross(
        coords[faces[:, 1]] - coords[faces[:, 0]],
        coords[faces[:, 2]] - coords[faces[:, 0]],
    )
    vn = np.zeros_like(coords)
    for k in range(3):
        np.add.at(vn, faces[:, k], fn)  # area-weighted (fn is unnormalised)
    n = np.linalg.norm(vn, axis=1, keepdims=True)
    return vn / np.maximum(n, 1e-9)


def main():
    fs = datasets.fetch_surf_fsaverage(mesh="fsaverage5")

    # BOTH hemispheres — a whole brain that can rotate a full turn like the
    # reference. Strong front-face dimming in the shader keeps the near surface
    # dominant so it still reads as a folded brain, not a blob.
    cl, fl_, sl = [], [], []
    off = 0
    for hemi in ("left", "right"):
        mm = load_surf_mesh(fs[f"pial_{hemi}"])
        cl.append(np.asarray(mm.coordinates, dtype=np.float64))
        fl_.append(np.asarray(mm.faces, dtype=np.int64) + off)
        sl.append(np.asarray(load_surf_data(fs[f"sulc_{hemi}"]), dtype=np.float64))
        off += len(cl[-1])
    coords = np.concatenate(cl)
    faces = np.concatenate(fl_)
    sulc = np.concatenate(sl)
    normals = vertex_normals(coords, faces)

    # ---- Orient to the site's world frame ----------------------------------
    # fsaverage MNI-ish axes: col0 = L(-)/R(+), col1 = posterior->anterior,
    # col2 = inferior->superior. We want the LEFT hemisphere's lateral (outer)
    # surface facing the viewer, frontal lobe to the right:
    #   world x = anterior->posterior   (frontal lobe on +x / screen right)
    #   world y = superior              (up)
    #   world z = lateral outward       (+z toward viewer; left lateral = -col0)
    P = np.column_stack([coords[:, 1], coords[:, 2], -coords[:, 0]])
    N = np.column_stack([normals[:, 1], normals[:, 2], -normals[:, 0]])

    P -= P.mean(axis=0)
    # Scale so the anterior-posterior half-extent maps to HALF_WIDTH.
    half_ap = (P[:, 0].max() - P[:, 0].min()) / 2.0
    P *= HALF_WIDTH / half_ap

    # ---- FreeSurfer sulc -> brightness -------------------------------------
    # sulc > 0 = sulcus (deep/dark), sulc < 0 = gyrus (raised/bright).
    lo, hi = np.percentile(sulc, [4, 96])
    bright = 1.0 - np.clip((sulc - lo) / max(1e-6, hi - lo), 0.0, 1.0)
    # Contrast stretch so gyral crests glow and sulcal grooves fall toward
    # black — the crisp fold banding of the reference (a soft gradient reads as
    # uniform mush once tiled with glyphs).
    bright = np.clip(0.5 + np.tanh((bright - 0.5) * 3.2) * 0.62, 0.0, 1.0)

    # ---- Lobe colour fields ------------------------------------------------
    # Large smooth colour regions (frontal / parietal / temporal / occipital),
    # so the brain reads as LOBES like the reference, instead of per-point
    # confetti. Assigned from anatomical position in the world frame
    # (x = anterior(+)->posterior(-), y = superior, z = lateral depth). Value is
    # a palette pick in [0,1] matching the shader's palette() bands.
    px, py = P[:, 0], P[:, 1]
    x01 = (px - px.min()) / (px.max() - px.min())  # 0 posterior .. 1 anterior
    y01 = (py - py.min()) / (py.max() - py.min())  # 0 inferior .. 1 superior
    pick = np.full(len(P), 0.45)                    # default violet
    pick[(x01 > 0.58) & (y01 > 0.4)] = 0.9          # frontal  -> gold
    pick[(x01 <= 0.58) & (y01 > 0.62)] = 0.77       # parietal -> blue
    pick[y01 <= 0.34] = 0.58                         # temporal -> teal
    pick[(x01 < 0.24) & (y01 > 0.34)] = 0.68         # occipital-> pink
    # A white share on the brightest gyral crests, whatever the lobe.
    rng0 = np.random.default_rng(11)
    crest_white = (bright > 0.78) & (rng0.random(len(P)) < 0.5)
    pick[crest_white] = 0.12

    # ---- Candidate points = the mesh vertices ------------------------------
    # The ~20k pial vertices (both hemispheres) are the candidate pool. Poisson
    # selection below picks an evenly-spaced subset; combined with the uniform
    # glyph orientation in the shader that gives the ordered tessellation of the
    # reference (no anatomical row lattice needed).
    Pall, Nall, Ball, Pick = P, N, bright, pick

    # ---- Poisson-disk selection: NO two glyphs may overlap -----------------
    # Enforce a minimum spacing between kept points. The radius grows in the
    # grooves (sparse) and shrinks on the crests (dense) — but never below R0,
    # so no pair is ever closer than a glyph width. Crests are placed first so
    # the ridges pack tightly; R0 auto-shrinks until exactly COUNT points fit.
    order = np.argsort(-Ball)  # brightest (crest) first

    def poisson(r0, k=1.9):
        r = r0 * (1.0 + k * (1.0 - Ball))
        acc, pend, tree_a = [], [], None
        for n in order:
            p = Pall[n]
            ok = True
            if tree_a is not None and tree_a.query(p)[0] < r[n]:
                ok = False
            if ok and pend and np.linalg.norm(np.asarray(pend) - p, axis=1).min() < r[n]:
                ok = False
            if ok:
                acc.append(n)
                pend.append(p)
                if len(pend) >= 200:
                    tree_a = cKDTree(Pall[acc])
                    pend = []
            if len(acc) >= COUNT:
                break
        return acc

    R0 = 0.05
    for _ in range(14):
        acc = poisson(R0)
        if len(acc) >= COUNT:
            break
        R0 *= 0.9
    if len(acc) < COUNT:
        raise SystemExit(f"only placed {len(acc)}/{COUNT}; shrink glyphs or COUNT")
    keep = np.array(acc[:COUNT])
    sp, sn, spick, sb = Pall[keep], Nall[keep], Pick[keep], Ball[keep]

    # nearest-neighbour distance sanity check (min spacing achieved)
    nnd = cKDTree(sp).query(sp, k=2)[0][:, 1]
    print(f"R0={R0:.4f}  min NN dist={nnd.min():.4f}  median={np.median(nnd):.4f}")

    # ---- Encode ------------------------------------------------------------
    pos_scale = float(np.abs(sp).max()) / 32000.0
    qp = np.clip(np.round(sp / pos_scale), -32767, 32767).astype("<i2")
    qn = np.clip(np.round(sn * 127), -127, 127).astype("i1")
    qk = np.clip(np.round(spick * 255), 0, 255).astype("u1")
    qb = np.clip(np.round(sb * 255), 0, 255).astype("u1")

    buf = bytearray()
    buf += b"BPT3"  # v3: per-point lobe colour pick + brightness (no tangent)
    buf += struct.pack("<If", COUNT, pos_scale)
    for i in range(COUNT):
        buf += struct.pack(
            "<3h3bBB",
            int(qp[i, 0]), int(qp[i, 1]), int(qp[i, 2]),
            int(qn[i, 0]), int(qn[i, 1]), int(qn[i, 2]),
            int(qk[i]), int(qb[i]),
        )

    with open(OUT, "wb") as fh:
        fh.write(buf)

    print(f"wrote {OUT}: {len(buf)} bytes, {COUNT} points, posScale={pos_scale:.6g}")
    print(f"world extents  x[{sp[:,0].min():.2f},{sp[:,0].max():.2f}] "
          f"y[{sp[:,1].min():.2f},{sp[:,1].max():.2f}] "
          f"z[{sp[:,2].min():.2f},{sp[:,2].max():.2f}]")
    print(f"bright min/mean/max {sb.min():.2f}/{sb.mean():.2f}/{sb.max():.2f}")


if __name__ == "__main__":
    main()
