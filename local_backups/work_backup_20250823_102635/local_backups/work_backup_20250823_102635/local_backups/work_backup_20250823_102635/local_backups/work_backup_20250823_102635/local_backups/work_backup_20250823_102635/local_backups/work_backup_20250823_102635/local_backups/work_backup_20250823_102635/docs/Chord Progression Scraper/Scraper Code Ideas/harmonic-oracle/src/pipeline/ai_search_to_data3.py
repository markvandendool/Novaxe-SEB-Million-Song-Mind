# src/pipeline/ai_search_to_data3.py
from __future__ import annotations
import csv, json, sys, time, argparse, itertools, datetime, re
from pathlib import Path
from typing import Dict, Any, List, Optional, Iterable

try:
    from music21 import converter, roman, harmony, key as m21key, chord as m21chord
    MUSIC21_OK = True
except Exception:
    MUSIC21_OK = False

from src.utils.roman import pretty_accidentals
from src.mapping.huv_to_catalog import map_window

def now_iso() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z"

def chord_symbol_to_ext_labels(sym: str) -> List[str]:
    s = sym.lower()
    labels = []
    if "maj7" in s: labels.append("7")
    if "7" in s and "maj7" not in s: labels.append("b7")
    if "9" in s: labels.append("9")
    if "11" in s: labels.append("11")
    if "13" in s: labels.append("13")
    if "sus4" in s: labels.append("sus4")
    if "sus2" in s: labels.append("sus2")
    if "6/9" in s: labels.extend(["6","9"])
    if "6" in s and "6/9" not in s: labels.append("6")
    if "alt" in s: labels.append("alt")
    if "#9" in s: labels.append("#9")
    if "b9" in s: labels.append("b9")
    if "#11" in s: labels.append("#11")
    if "b13" in s: labels.append("b13")
    if "no3" in s: labels.append("no3")
    if "no5" in s: labels.append("no5")
    return sorted(set(labels))

def inversion_from_figured_bass(fb: str) -> int:
    fb = fb or ""
    if "6/4" in fb: return 2
    if "6/5" in fb or "6" in fb: return 1
    if "4/3" in fb: return 2
    if "4/2" in fb or "2" in fb: return 3
    return 0

def windows(seq, n=4):
    it = iter(seq)
    win = []
    for x in it:
        win.append(x)
        if len(win) == n:
            yield list(win)
            win.pop(0)

def provider_musicxml(xml_path: Path, song_id: str, artist: str, title: str, year: Optional[int]) -> Iterable[Dict[str, Any]]:
    if not MUSIC21_OK:
        return []
    s = converter.parse(xml_path)
    try:
        k = s.analyze('key')
        tonic = k.tonic.name.replace("-", "♭").replace("#", "♯")
    except Exception:
        tonic = "C"
    rns = []
    for rn in s.chordify().recurse().getElementsByClass(harmony.ChordSymbol):
        roman_str = rn.figure
        try:
            if hasattr(k, "tonic"):
                rn_obj = roman.romanNumeralFromChord(rn, k)
                roman_label = rn_obj.figure
                inv = inversion_from_figured_bass(rn_obj.secondaryRomanNumeral or rn_obj.figure)
            else:
                roman_label = ""
                inv = 0
        except Exception:
            roman_label = ""
            inv = 0
        sym_pretty = pretty_accidentals(roman_str)
        rns.append({"roman": roman_label or "", "sym": sym_pretty, "inv": inv, "ext": chord_symbol_to_ext_labels(roman_str)})
    for w_id, win in enumerate(windows(rns, 4)):
        romans = [w["roman"] for w in win]
        if any(r=="" for r in romans): 
            continue
        out = {
            "song_id": song_id, "artist": artist, "title": title, "year": year or "",
            "section": "", "key": tonic, "window_id": w_id,
            "roman_1": romans[0], "roman_2": romans[1], "roman_3": romans[2], "roman_4": romans[3],
            "sym_1": win[0]["sym"], "sym_2": win[1]["sym"], "sym_3": win[2]["sym"], "sym_4": win[3]["sym"],
            "inv_1": win[0]["inv"], "inv_2": win[1]["inv"], "inv_3": win[2]["inv"], "inv_4": win[3]["inv"],
            "ext_1": ";".join(win[0]["ext"]), "ext_2": ";".join(win[1]["ext"]), "ext_3": ";".join(win[2]["ext"]), "ext_4": ";".join(win[3]["ext"]),
            "huv_1": "", "huv_2": "", "huv_3": "", "huv_4": "",
            "provider": "musicxml", "quality": "gold", "created_at": now_iso(),
            "extra_json": json.dumps({"xml_file": str(xml_path)}),
        }
        yield out

def write_data3(rows: Iterable[Dict[str,Any]], out_csv: Path):
    fieldnames = ["song_id","artist","title","year","section","key","window_id",
                  "roman_1","roman_2","roman_3","roman_4",
                  "sym_1","sym_2","sym_3","sym_4",
                  "inv_1","inv_2","inv_3","inv_4",
                  "ext_1","ext_2","ext_3","ext_4",
                  "huv_1","huv_2","huv_3","huv_4",
                  "provider","quality","created_at","extra_json"]
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for row in rows:
            w.writerow(row)

def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--musicxml-dir", type=str, help="Folder of MusicXML files to ingest")
    ap.add_argument("--out", type=str, default="data3.csv")
    args = ap.parse_args()

    out_csv = Path(args.out)
    rows = []

    if args.musicxml_dir:
        xml_dir = Path(args.musicxml_dir)
        for p in xml_dir.glob("**/*.xml"):
            rows.extend(provider_musicxml(p, song_id=p.stem, artist="", title=p.stem, year=None))

    write_data3(rows, out_csv)
    print(f"Wrote {len(rows)} rows to {out_csv}")

if __name__ == "__main__":
    main()
