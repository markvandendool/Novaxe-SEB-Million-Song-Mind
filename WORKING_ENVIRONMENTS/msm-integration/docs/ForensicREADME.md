# Harmonic Oracle – Forensic Engineering Handoff

_Last updated: 2025-08-09_

This document condenses **everything** a new engineer (or future chat) needs to know to pick up the project without losing context.

---
## 1. Repositories & Branches

| Repo | Purpose | Branches in flight |
|------|---------|-------------------|
| GitHub `harmonic-oracle` | React front-end + tooling | `main` (prod), `feature/guardrails`, `feature/final-boss-key`, `feature/imac-names`, `feature/braid-live-metrics` (Lovable), `feature/fontdec13`, `feature/top-nav-braid`, `feature/braid-tonal-defs-parity`, `feature/mock-data3-sample` |
| GitLab `delphineG/novaxe-fakebook` | Angular legacy braid source (read-only) | `nvx_braid_fixes2` (geometry source of truth) |

`main` is **production-only**.  All work happens on feature branches + PR.

Guardrails (CI + CODEOWNERS) enforce:
* Build passes
* Sentinel greps remain
* Protected paths require cross-review

---
## 2. Data Formats

### 2.1 Data2 (legacy CPML)
* `chords` column with section tags `<verse_1>` …
* No guaranteed roman/harmonic columns.

### 2.2 Data3 Pure (canonical)
* CSV, UTF-8, `,` separator, **no BOM**.
* Core columns (case-insensitive):
  ```
  id,chords,release_date,genres,decade,rock_genre,
  artist_id,main_genre,spotify_song_id,spotify_artist_id,
  artist_name,artist_url,song_name,song_url,
  key,roman_numerals,harmonic_fingerprint,
  chosen_by,other_rate,ks_score
  ```
* **27 slot columns** – one per canonical Roman slot
  `I,ii,iii,IV,V,vi,viiº,I7,iiiø,II(7),#ivø,III(7),#vº,VI(7),#iº,VII(7),#iiº,V(7),viiº,i,iiø,bIII,iv,v,bVI,bVII,V(b9),Other`

#### HUV Vector encoding per cell
Primary tuple (always present):
```
 total,root,first,second,third
```
Optional sub-vectors for colour–tones, pipe-delimited **in this order** if present:
1. `dom7` → `total,root,b7,3,5`
2. `maj7` → `total,root,7,3,5`
3. `sus4` → `total,root,4,5`
4. `add9` / `9` → `total,root,9,3,5`
5. `b9/#9/#11/b13` – one vector per colour as needed.

Example cell with three occurrences of V7sus4:
```
3,3,0,0,0 | 3,3,0,0 | 3,3,3,0,0
```
(first tuple = plain counts; second = dom7; third = sus4)

---
## 3. Tooling & Pipelines

### 3.1 Python converter (`enrich_data2_to_data3_v7.py`)
* **Final-Boss key selector** (branch `feature/final-boss-key`):
  * Sweeps 24 keys, selects the one with lowest `Other` count.
  * Audit columns `chosen_by`, `other_rate`, `ks_score`.
* Spotify & MusicBrainz enrichment (branch `feature/imac-names`):
  * Async aiohttp with resume checkpoint.
  * Writes `names_patch.csv` every 5 min; converter merges it.

### 3.2 Guardrails CI (`.github/workflows/pr-guard.yml`)
* `pnpm build`
* Sentinel greps (`msm:pendingUpload`, `parseUnifiedCSVData:start`, `harmonic_fingerprint`)
* Fails PR if protected paths touched without `allow-*` label.

---
## 4. Front-end Routes

| Path | Page | Notes |
|------|------|-------|
| `/` | Index / Analyzer | Upload Datanaught vertical CSV.
| `/million-song-mind` | MSM explorer (auto-ingest Data3) |
| `/braid` `/braid-tonal` `/braid-classic` | Classic/Tonal braid (React port, SVG parity) |
| `/braid-blues` | Blues braid (scaffold) |
| `/braid-new2` `/braid-hive` | Hive braid (scaffold) |
| `/braid-live-metrics` | **(WIP)** bubble-scaling braid |
| `/calibrate-braid` | Braid alignment tool |

---
## 5. Braid Code

Located in `src/components/braid/**`.
* `BraidTonal.tsx` – Classic, full SVG defs from GitLab, tonality toggle.
* `BraidClassic.tsx` – Blues placeholder.
* `BraidNew2.tsx` – Hive placeholder.
* `feature/braid-live-metrics` branch adds Presence/Only/Progression view and Fontdec13 typography.

---
## 6. Sentinels (grep these)
```
msm:pendingUpload   (Index hand-off)
parseUnifiedCSVData:start (cpmlParser)
convertData3ToHarmonicData (cpmlParser)
harmonic_fingerprint      (detectCSVFormat)
V(7)                      (constants/harmony.ts)
```
Guardrails CI must fail if any sentinel is removed.

---
## 7. Outstanding Work

* **Merge guardrails PR** – enables required reviews.
* **Finish Final-Boss key branch** – already pushed.
* **Finish iMac names back-fill** – resume script, write `names_patch.csv`.
* **Complete live-metrics braid + Fontdec13** – Lovable.
* **Colour-tone HUV vectors** – extend converter + MSM chart.

---
## 8. How to Launch Name Back-fill (once merged)
```
python tools/imac_name_backfill.py \
  --input data3_master.csv \
  --patch names_patch.csv \
  --resume
```
Runs async, throttled, checkpoint every 100 rows.

---
## 9. Mock & Test Data

* `test/mock_data3_pure.csv` – 20 songs, covers all 27 slots.
* `Lovable Correspondences/Lovable.csv` – audit sample with `chosen_by` etc.

---
## 10. Contact / Owners

| Area | CODEOWNER |
|------|-----------|
| Braid UI (`src/components/braid/**`) | @lovable-ai |
| MSM ingestion (parser/utils/scripts) | @copilot-ai |

---
**End of forensic handoff.**