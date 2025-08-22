## 2025-08-22 (later)

- Locked per‑chord border/text hex colors to template‑extracted values (I/ii/iii/IV/V/vi/viiø; applied; minor), eliminating family ambiguity.
- Removed legacy `makeFrontLabelTexture`; styled canvas renderer is now the single source of truth for front faces.
- Font loader hardened: loads serif + Noto Music and waits on weights before texture generation to avoid fallbacks.
- Curved shelf labels use stable string spread (`const chars = [...word]`) with tuned anchors for REST/MOTION/TENSION.
- Reverted global accidental/ø repositioning; kept precise `#ivø` surgical alignment only.
- Restored Adjust mode behavior: shelf cubes are freely movable/scalable while editing; positions persist to localStorage and can be exported via Save Map.
- Restored `Shelf Map Official.json` to canonical layout (pre‑symmetry); only applied stack was previously trialed and is now rolled back.
- Deterministic picking: front row (layer 1) first, shelf (layer 2) second; raycaster layers reset per call; clones assigned to layer 1; overlays/center inherit parent layer; camera layers (0/1/2) enabled at startup and after `loadSet()`.
- Shelf picking: use screen‑projected polygon selection everywhere (no shelf‑band gating); fall back to proxy/cube raycast only if polygon returns none. Greatly improves accuracy for small applied/minor cubes vs I/IV/V.

# OBS Cubes – Changelog (2025‑08‑22)

## Summary
- Stabilized main render loop (removed duplicate animate).
- Restored center play circle (front face) – replays current chord orientation without rotation.
- Single‑face audition: bottom=bass, top=melody, sides=chord; visual pulse on click.
- Audio layers:
  - Chord bed: compact voicing within 1 octave; default triad; add 7th via toggle.
  - Bass layer: bottom face mapped to a contiguous octave anchored at super‑low root (root −36, others within +0..11 semitones of root).
  - Melody layer: top face above chord bed; rotation reassigns bass/melody only (chord bed constant).
  - Lower global volume; envelopes shortened; AudioContext auto‑resume.
- UI controls:
  - With 7th (triad by default); Bass/Melody enable toggles (Bass=on, Melody=off); instrument dropdowns (Soundfont fallback to oscillators).
  - Play Progression button: plays current front‑row lineup in order.
- Progression capture:
  - When enabled, yellow shimmering arrows connect consecutively played chords (front row and shelf adds). Points accumulate; arrows auto‑update.
- Camera: ~25° down, zoomed out more; Melody/Bass view buttons adjusted.

## Known items / Next
- Extend progression arrows explicitly across shelf region centers (REST/MOTION/TENSION) with bias.
- Optional: preload specific high‑quality soundfonts (e.g., MuseScore General) and cache instruments.
- Style center play circle (subtle ring) and 3D play button per theme.

## Files touched (recent)
- `main.js`: interaction/audio/loop fixes; arrows; play circle; toggles; instruments.
- `index.html`: controls for toggles, instruments, Soundfont‑Player include; Play Progression button.
- `OBS_CUBES_TECH_REPORT.md`: prior technical details.

- Orchestral defaults: chord=string_ensemble_1, bass=contrabass, melody=violin; instrument dropdowns reloading Soundfont voices live.
