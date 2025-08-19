# Braid Parity Forensic Report and Plan

Status: In-progress (feature/braid-classic-port-clean)
PR target: main (no direct pushes to main)

Scope
- Bring React braid variants to pixel-accurate parity with Angular source (nvx_braid_fixes2)
- Verify musical mapping (center/left/right up/down, outer lanes) and rotation offsets
- Reintroduce correct fonts (Fontdec13 / nvxChord)
- Investigate and fix I-chord visibility regression
- Provide validation tooling for Data3 Pure vs braid rendering

Repositories and branches
- GitHub (this app): feature/braid-classic-port-clean → PR into main
- GitLab (read-only): nvx_braid_fixes2 (source of truth for classic braid SVG and SCSS)

Terminal setup (read-only sync reference)
```bash
# 1) Create feature branch for parity work (already exists, repeatable)
git checkout -b feature/braid-classic-port-clean || git checkout feature/braid-classic-port-clean

# 2) Add GitLab remote (read-only)
git remote add gitlab git@gitlab.com:delphineG/novaxe-fakebook.git || true

# 3) Fetch nvx_braid_fixes2
git fetch gitlab nvx_braid_fixes2

# 4) Dump Angular sources locally for reference
mkdir -p vendor/gitlab_braid
git show gitlab/nvx_braid_fixes2:src/app/components/braid/braid.component.html > vendor/gitlab_braid/braid.component.html
git show gitlab/nvx_braid_fixes2:src/app/components/braid/braid.component.ts   > vendor/gitlab_braid/braid.component.ts
git show gitlab/nvx_braid_fixes2:src/app/components/braid/braid.component.scss > vendor/gitlab_braid/braid.component.scss

# 5) Tonalities JSON
mkdir -p vendor/gitlab_braid
git show gitlab/nvx_braid_fixes2:src/assets/braid_tonalities.json > vendor/gitlab_braid/braid_tonalities.json

# 6) Optional assets (paths used by <defs> or fonts)
git ls-tree -r --name-only gitlab/nvx_braid_fixes2 | grep misc_braid_nvx_fkb | while read p; do
  mkdir -p "vendor/gitlab_braid/$(dirname "$p")"
  git show "gitlab/nvx_braid_fixes2:$p" > "vendor/gitlab_braid/$p"
done

# 7) Font files (if repo permits; otherwise obtain via design handoff)
# May require separate artifact handoff due to licensing
# git show gitlab/nvx_braid_fixes2:src/assets/font/nvxFont.otf > vendor/gitlab_braid/nvxFont.otf
```

Files in this React app
- Components
  - src/components/braid/BraidClassic.tsx (Blues / Classic scaffold)
  - src/components/braid/BraidTonal.tsx (Classic/Tonal) [to be synced]
  - src/components/braid/BraidNew2.tsx (NEW2/Hive) [to be synced]
- Pages
  - src/pages/BraidClassicPage.tsx
  - src/pages/BraidTonalPage.tsx [to be synced]
  - src/pages/BraidNew2Page.tsx [to be synced]
- Data
  - public/assets/braid_tonalities.json (keys and Roman arrays) [to be synced]
- Routes
  - src/App.tsx (paths: /braid, /braid-classic, /novaxe-braid)
  - Aliases to add: /braid-blues → Classic, /braid-tonal → Tonal, /braid-hive → NEW2

1) Geometry and <defs> audit
Goal: Enumerate all <defs> ids and usages per variant, verify transforms/rotations/ordering.
Action:
- Extract <defs> from vendor/gitlab_braid/braid.component.html
- Ensure the following are present in React equivalents:
  - Small-bubble comma defs: leftCommaSM, rightCommaSM
  - Medium/large bubble defs: leftComma, rightComma, medBubble, smallBubble, classes: bub, outer
  - Arrows and link rects: rect-arrow, arrows-2, etc.
  - Background circle: greenCircle (check gradient/filter refs)
  - Filters/gradients: copy exact ids and attributes
- Verify layer ordering: background circles → links/arrows → foreground bubbles
- Confirm vector-effect="non-scaling-stroke" and shape-rendering="geometricPrecision" where present

Deliverable: Matrix of id → purpose → used in (Classic/Tonal/NEW2)

2) Musical mapping audit
Goal: Confirm array mapping matches Angular nvx_braid_fixes2 and rotation offsets.
Expected mapping for key K (Tonalites[K]):
- center_up = center_minor
- center_left = center_major
- center_right = center_minor
- left_up, left_down, right_up, right_down
- outer_left_up/down, outer_right_up/down
- Rotation offsets (e.g., -3) as in Angular
Action:
- Compare current React mapping to Angular in braid.component.ts
- Verify index rules and visibility guards match one-to-one

3) Fonts plan (Fontdec13 / nvxChord)
Goal: Restore historical chord glyph appearance.
Packaging options:
- Self-host OTF/WOFF2 in public/fonts (preferred for parity)
- Add @font-face in a fonts.css imported once (e.g., in main.tsx)
- Tailwind: extend theme.fontFamily: { chord: ['nvxChord','Fontdec13','ui-monospace','monospace'] }
- Fallback: ui-monospace/monospace
@font-face example:
```css
@font-face {
  font-family: 'nvxChord';
  src: url('/fonts/nvxChord.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```
Notes:
- Verify license for redistribution; if restricted, keep as private asset
- If glyph metrics differ, apply letter-spacing overrides in the specific text nodes only

4) Regression: I-chord visibility
Symptoms: I chord sometimes not rendered despite presence in Data3 Pure.
Hypotheses:
- Data issue: braid_tonalities.json missing/empty string where 'I' expected
- Rotation/index off-by-one: Roman arrives at index filtered out by guard
- JSX visibility guard: falsy checks or conditional class hides 'I'
Plan:
- Diff vendor braid_tonalities.json vs public/assets version
- Run validation (added in utils) to flag keys/lanes missing 'I'
- Inspect component code for filters like `label && ...`, casing mismatches, or `display: none` via class
- Fix minimal surface:
  - Data: correct mapping in JSON (no label changes to Roman schemes)
  - Code: align rotation / index guards to Angular
  - Avoid hard-coded exclusions of 'I'

5) Variant parity matrix
For each variant (Blues/Classic, Tonal, NEW2/Hive):
- Shapes present: circles, commas, arrows, link rects, gradients, filters
- Missing/incorrect: enumerate and patch
- Transform parity: translate/rotate/scale match Angular values
- Z-order parity: group ordering

6) Data3 Pure interface (read-only)
- No destructive changes to Data3 Pure
- Add validation-only tooling to compare Data3-derived expectations vs braid_tonalities.json
- Output: console warnings and optional CSV report (dev only)

7) Deliverables
- PR(s) to feature branches only
- README (this file) kept up-to-date with ids, transforms, index rules
- Checklist of visual parity with screenshots (to be attached in PR)
- Targeted fix for I-chord regression (data or code), minimal impact

Immediate next steps
- Sync missing files from feature/braid-classic-port-clean (components/pages/data)
- Enumerate <defs> and usages; fill the matrix table
- Run validation and capture any I-chord gaps
- Prepare minimal PR: route aliases + docs + validation tooling
- Follow-up PRs: defs parity, font bundling, visual fixes
