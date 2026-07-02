# scripts

## bake_brain.py

One-time (offline) bake of a **real human cortex** into the point cloud that
CosmicField's brain shape renders. Source mesh is the FreeSurfer `fsaverage5`
pial surface (left+right hemispheres) with FreeSurfer's own `sulc` map driving
per-point brightness, so genuine gyri/sulci read as a 3D brain from every angle
— not a picture painted on a smooth dome.

Output: `public/brain-points.bin` (~66 KB, 6000 points). Binary layout is
documented at the top of the script; the browser loader in
`src/components/CosmicField.tsx` reads it to fill `aBrain` / `aNormal` /
`bright`.

Not part of the app build — run it only to regenerate the asset.

```sh
python3 -m venv .venv
./.venv/bin/pip install numpy nilearn
./.venv/bin/python scripts/bake_brain.py public/brain-points.bin
```

`nilearn` downloads and caches the fsaverage surfaces on first run.
