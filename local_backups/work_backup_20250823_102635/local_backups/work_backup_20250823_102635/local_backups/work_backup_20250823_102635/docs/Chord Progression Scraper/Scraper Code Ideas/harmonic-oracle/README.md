# harmonic-oracle (starter kit)

## What you can do now
1) **Map 4-chord windows to necklace bins** with `src/mapping/huv_to_catalog.py` (used by downstream tools).
2) **Build DATA3** from high-quality sources using the provider pipeline (MusicXML working; other providers stubbed).

## Run (in your repo)
```bash
python -m src.pipeline.ai_search_to_data3 --musicxml-dir ./scores --out ./data/data3.csv
```

## Next steps
- Add more providers (Spotify/Wikidata metadata, chord text adapters, MIDI chordification rules).
- Connect your HUV encoder to fill `huv_1..huv_4` from `sym_1..sym_4`.
- Feed `data3.csv` into a docx generator to auto-populate the Necklace Catalog.
