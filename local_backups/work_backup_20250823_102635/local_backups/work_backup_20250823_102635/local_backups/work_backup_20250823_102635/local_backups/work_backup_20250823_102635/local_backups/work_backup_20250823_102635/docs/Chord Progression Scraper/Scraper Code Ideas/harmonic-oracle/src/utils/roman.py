# src/utils/roman.py
from typing import List, Tuple

ACCIDENTAL_MAP = {"#": "♯", "b": "♭", "♭": "♭", "♯": "♯", "n": "♮"}

def pretty_accidentals(s: str) -> str:
    """Replace ASCII accidentals with musical glyphs."""
    out = []
    i = 0
    while i < len(s):
        ch = s[i]
        if ch in ("#", "b"):
            out.append(ACCIDENTAL_MAP[ch])
        else:
            out.append(ch)
        i += 1
    return "".join(out)

def normalize_roman(r: str) -> str:
    """Normalize Roman numerals to standardized symbols (I, ii, V, vi, IV)."""
    return r.strip().replace("b", "♭").replace("#", "♯").upper().replace("VII", "VII")

def classify_extension_bundle(ext_labels: List[str]) -> str:
    """
    Categorize chord into: 'triad', '7ths', 'extensions' based on extension labels list.
    - triad: no 7/b7/maj7 and no other extensions
    - 7ths: exactly one of {7, b7} or 'maj7' (we store maj7 as '7' in HUV)
    - extensions: any presence of 9/11/13/alt/sus/6 etc.
    """
    norm = set(l.strip().lower() for l in ext_labels if l.strip())
    if "maj7" in norm:
        norm.add("7")
    if not norm:
        return "triad"
    tier1 = {"7", "b7"}
    tier2 = {"9","b9","#9","11","#11","13","b13","alt","sus4","sus2","6","no3","no5","b2","bb3","#4","b6","bb7"}
    if norm.issubset(tier1):
        return "7ths"
    return "extensions"
