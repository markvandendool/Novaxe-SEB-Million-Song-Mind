# DATA3 Specification (Draft v0.1)
This defines the CSV row format that our AI-collection pipeline produces and the catalog-mapper consumes.

## Columns (wide, tidy-friendly)
- song_id: stable ID (e.g., mbid or "artist - title - year")
- artist
- title
- year
- section: verse/chorus/bridge/etc. (optional)
- key: tonic pitch-class (e.g., C, G, F#, Bb)
- window_id: index of a 4-chord window within the section
- roman_1..roman_4: Roman numerals for each chord in the window (e.g., I, V, vi, IV)
- sym_1..sym_4: surface chord symbols (pretty-printed with musical glyphs, e.g., C♭9, G7, Am, Fmaj7)
- inv_1..inv_4: inversion class per chord: 0=root,1=1st,2=2nd,3=3rd
- ext_1..ext_4: extension bundle flags per chord (semicolon-joined labels from the HUV set, e.g., "7;9", "sus4", "")
- huv_1..huv_4: the compact Harmonic Usage Vector string for each chord (core+extensions, early-stopped)
- provider: data source (musicxml, midi, hooktheory, wikichords, manual, etc.)
- quality: one of [gold, silver, bronze] indicating confidence (gold = sourced from score/MusicXML or verified)
- created_at: ISO timestamp
- extra_json: any provider-specific metadata (JSON-encoded)

## Windowing
- We emit a row for every *consecutive* 4-chord window in a section. Overlapping windows are allowed.

## Rationale
- Roman numerals + inversions + extensions are sufficient for catalog mapping.
- HUV mirrors the same features for downstream analytics.
