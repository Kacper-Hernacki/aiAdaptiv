# scripts

## bake_brain.py

One-time (offline) bake of a **real human cortex** into the point cloud that
CosmicField's brain shape renders. Source mesh is the FreeSurfer `fsaverage5`
pial surface (both hemispheres — a whole brain that can spin) with FreeSurfer's own
`sulc` map driving per-point brightness, so genuine gyri/sulci read as a 3D
brain from every angle — not a picture painted on a smooth dome. Points are
Poisson-disk spaced (denser on crests, sparser in grooves, never overlapping)
and each carries a lobe-based colour pick so the brain reads as large colour
fields (frontal / parietal / temporal / occipital). Glyph orientation is
uniform, applied in the shader.

Output: `public/brain-points.bin` (~77 KB, 7000 points). Binary layout is
documented at the top of the script; the browser loader in
`src/components/CosmicField.tsx` reads it to fill `aBrain` / `aNormal` /
`pick` / `bright`.

Not part of the app build — run it only to regenerate the asset.

```sh
python3 -m venv .venv
./.venv/bin/pip install numpy nilearn
./.venv/bin/python scripts/bake_brain.py public/brain-points.bin
```

`nilearn` downloads and caches the fsaverage surfaces on first run.
