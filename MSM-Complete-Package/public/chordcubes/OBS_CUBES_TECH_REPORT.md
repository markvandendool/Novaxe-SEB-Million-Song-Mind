# OBS Cubes – Technical Report (r1)

Date: 2025-08-21
Scope: apps/million-song-mind/public/obs-cubes

## Overview
Interactive Three.js scene for chord cubes with two rest zones (front row or shelf origin). Smooth drag, tone-aware rotation, magnetic make‑way, pixel‑perfect shelf return, high‑res dynamic label rendering, and camera-view overlays.

## Interaction Model
- Drag from shelf
  - Vertical mouse controls depth z (down → toward viewer, up → toward shelf).
  - X is computed on a fixed ground plane at the chord’s shelf Y to avoid perspective drift.
  - Y and scale ease as functions of approach to the front plane (y, scale → 0, FRONT_ROW_SCALE).
- Drag in front row
  - Same depth logic; can pull slightly in front (+FRONT_ROW_FORWARD_Z) and push back toward shelf.
  - Magnetic repulsion (soft) and make‑way preview ensure neighbors flow aside.
- Release (Two rest zones only)
  - Nearest rest is chosen; snap hard to either:
    - Front row slot: y=0, z=0, scale=FRONT_ROW_SCALE with lineup reflow.
    - Exact shelf origin: position/scale/quaternion recorded per roman.
- Throwaway gesture
  - Quick upward flick (< 240 ms, > 42 px up) always returns to exact shelf origin.
- Rotation
  - Click the chord-name face or its invisible overlay; cube rotates 90° to make the selected tone the bass (root/3rd/5th/7th mapping by quadrant).

## Rendering
- Renderer: WebGLRenderer alpha, antialias; SRGB textures; anisotropy enabled.
- Labels: High‑res canvas, solid colored border band (1/15 size), text color matches family border hex.
- Fonts: Web-fonts loaded before draw (Lobster for a visible change, Noto Music for supers/accidentals). Canvas falls back if offline.
- Shelf: High-res Venn with REST/MOTION/TENSION curved labels; plane opacity increases below ground for legibility.
- Cubes: Wood tone, colored edge lines, high‑res circle/diamond faces for tones/degrees.

## Physics / Layout
- gridSize: 1.4 (slot spacing)
- FRONT_ROW_SCALE: 1.0
- shelfZ: -4.2; shelfY recorded per chord
- FRONT_ROW_FORWARD_Z: +1.2 (allow slight forward pull)
- Magnetic repulsion: pairwise softened repulsion near front (x,z) with damping; dragged cube is immune; neighbors glide.
- Lineup: Centered reflow on drop; make‑way preview during approach.

## State
- cubes: Active/front row cubes
- shelfCubes: Shelf objects
- lineup: Ordered front row
- shelfOriginByRoman: Exact origin transform per roman (position, scale, quaternion)
- desired: Per-cube target for the harmonized drag smoother (single writer)

## Two Rest Zones Enforcement
- On every frame, all non-dragging cubes are clamped to:
  - Front row (y=0, z=0), or
  - Exact shelf origin (position/scale/quaternion), preventing drift.

## Gestures & Thresholds
- DRAG_START_PX: 8
- CLICK_MAX_PX: 5, CLICK_MAX_MS: 250
- Flick-to-shelf: Δy_screen > 42 px upward and < 240 ms

## Known Good UX Notes
- Fixed ground plane for X mapping removes camera-angle drift.
- Only one system writes transforms during drag (harmonized smoother).
- Collisions apply to neighbors only; the dragged cube remains user-controlled.

## Operator Notes (troubleshooting)
- If fonts appear unchanged, verify network access to Google Fonts; canvas waits up to ~1.2s.
- If any chord rests between zones, confirm its roman has an origin entry; rebuilding the shelf map repopulates origins.
- Rotation depends on hits from front face/overlay; ensure overlays exist after material rebuilds.

## File Hotspots
- main.js: all interaction, physics, smoothing, rendering glue
- chords.js: chord data, degrees/notes, transposition
- Shelf Map Official.json: canonical shelf positions/scales

## Change Highlights in this session
- Unified drag smoother; fixed-plane X mapping; depth→Y/scale easing
- Magnetic repulsion make‑way (soft), lineup reflow on drop only
- Two rest zones enforced continuously; pixel-perfect origin return
- Throwaway gesture hardened; flick threshold tuned
- High‑res label rendering; solid color border band; matching text color
- Webfont loading gate; deterministic label drawing

## Next Ideas
- Momentum on release for natural “settle”
- Per-family collision radii
- Optional shelf collision-only lanes
