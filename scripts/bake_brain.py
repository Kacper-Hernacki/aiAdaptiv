#!/usr/bin/env python3
"""Bake a real human cortex (FreeSurfer fsaverage5 pial surface) into a compact
point cloud for CosmicField's brain shape.

Output: public/brain-points.bin — a tight binary the browser reads to fill the
per-particle aBrain / aNormal / bright arrays. Because the points sit on a real
cortex mesh (genuine gyri + sulci) with FreeSurfer's own sulcal-depth map
driving brightness, the fold pattern reads as a 3D brain from every angle,
instead of a picture painted on a smooth dome.

Binary layout (little-endian):
  magic    : 4 bytes  = b'BPT1'
  count    : uint32               number of points
  posScale : float32              world = int16 * posScale
  then count * 12 bytes:
    px,py,pz : int16   position / posScale   (world units)
    nx,ny,nz : int8    normal   * 127        (unit vector)
    bright   : uint8   0..255                (1 = gyral crest, 0 = sulcal floor)
    _pad     : int8

World frame matches the existing generator: x = anterior->posterior profile,
y = up (superior), z = left/right depth; half-width ~1.08.
"""

import struct
import sys

import numpy as np
from nilearn import datasets
from nilearn.surface import load_surf_data, load_surf_mesh

COUNT = 6000
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

    coords_list, faces_list, sulc_list = [], [], []
    offset = 0
    for hemi in ("left", "right"):
        m = load_surf_mesh(fs[f"pial_{hemi}"])
        c = np.asarray(m.coordinates, dtype=np.float64)
        f = np.asarray(m.faces, dtype=np.int64)
        s = np.asarray(load_surf_data(fs[f"sulc_{hemi}"]), dtype=np.float64)
        coords_list.append(c)
        faces_list.append(f + offset)
        sulc_list.append(s)
        offset += len(c)

    coords = np.concatenate(coords_list)
    faces = np.concatenate(faces_list)
    sulc = np.concatenate(sulc_list)
    normals = vertex_normals(coords, faces)

    # ---- Orient to the site's world frame ----------------------------------
    # fsaverage MNI-ish axes: col0 = L/R, col1 = posterior->anterior,
    # col2 = inferior->superior. We want the lateral profile in the x/y plane:
    #   world x = anterior->posterior (nose to the +x side)
    #   world y = superior (up)
    #   world z = L/R (depth)
    P = np.column_stack([-coords[:, 1], coords[:, 2], coords[:, 0]])
    N = np.column_stack([-normals[:, 1], normals[:, 2], normals[:, 0]])

    P -= P.mean(axis=0)
    # Scale so the anterior-posterior half-extent maps to HALF_WIDTH.
    half_ap = (P[:, 0].max() - P[:, 0].min()) / 2.0
    P *= HALF_WIDTH / half_ap

    # ---- FreeSurfer sulc -> brightness -------------------------------------
    # sulc > 0 = sulcus (deep/dark), sulc < 0 = gyrus (raised/bright).
    lo, hi = np.percentile(sulc, [4, 96])
    bright = 1.0 - np.clip((sulc - lo) / max(1e-6, hi - lo), 0.0, 1.0)

    # ---- Area-weighted sampling of COUNT points ----------------------------
    v0, v1, v2 = P[faces[:, 0]], P[faces[:, 1]], P[faces[:, 2]]
    areas = 0.5 * np.linalg.norm(np.cross(v1 - v0, v2 - v0), axis=1)
    prob = areas / areas.sum()
    rng = np.random.default_rng(7)
    tri = rng.choice(len(faces), size=COUNT, p=prob)
    r1 = np.sqrt(rng.random(COUNT))
    r2 = rng.random(COUNT)
    a = 1 - r1
    b = r1 * (1 - r2)
    c = r1 * r2  # barycentric weights

    def bary(attr):
        return (
            a[:, None] * attr[faces[tri, 0]]
            + b[:, None] * attr[faces[tri, 1]]
            + c[:, None] * attr[faces[tri, 2]]
        )

    sp = bary(P)
    sn = bary(N)
    sn /= np.maximum(np.linalg.norm(sn, axis=1, keepdims=True), 1e-9)
    sb = (
        a * bright[faces[tri, 0]]
        + b * bright[faces[tri, 1]]
        + c * bright[faces[tri, 2]]
    )

    # ---- Encode ------------------------------------------------------------
    pos_scale = float(np.abs(sp).max()) / 32000.0
    qp = np.clip(np.round(sp / pos_scale), -32767, 32767).astype("<i2")
    qn = np.clip(np.round(sn * 127), -127, 127).astype("i1")
    qb = np.clip(np.round(sb * 255), 0, 255).astype("u1")

    buf = bytearray()
    buf += b"BPT1"
    buf += struct.pack("<If", COUNT, pos_scale)
    for i in range(COUNT):
        buf += struct.pack(
            "<3h3bBb",
            int(qp[i, 0]), int(qp[i, 1]), int(qp[i, 2]),
            int(qn[i, 0]), int(qn[i, 1]), int(qn[i, 2]),
            int(qb[i]), 0,
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
