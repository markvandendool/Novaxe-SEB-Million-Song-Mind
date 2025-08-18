# src/mapping/huv_to_catalog.py
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from src.utils.roman import classify_extension_bundle

FAMILIES = [
    ["I","V","vi","IV"],
    ["I","V","IV","vi"],
    ["I","vi","V","IV"],
    ["I","vi","IV","V"],
    ["I","IV","V","vi"],
    ["I","IV","vi","V"],
]

@dataclass
class CatalogBin:
    family_index: int
    rotation: int
    inversion_bin: str
    extension_bin: str
    is_mixed: bool

def detect_family_and_rotation(romans: List[str]) -> Optional[Tuple[int,int]]:
    target = [r.replace(" ", "") for r in romans]
    for fi, fam in enumerate(FAMILIES, start=1):
        base = fam
        for rot in range(4):
            rotated = base[rot:]+base[:rot]
            if rotated == target:
                return (fi, rot)
    return None

def inversion_name(inv_code: int) -> str:
    return {0:"root",1:"1st",2:"2nd",3:"3rd"}.get(inv_code, "root")

def map_window(romans: List[str], invs: List[int], ext_labels: List[List[str]]) -> Optional[CatalogBin]:
    fam_rot = detect_family_and_rotation(romans)
    if fam_rot is None:
        return None
    fi, rot = fam_rot
    first_inv = invs[0]
    if all(inv == first_inv for inv in invs):
        inv_bin = inversion_name(first_inv)
        is_mixed = False
    else:
        inv_bin = "mixed"
        is_mixed = True
    cats = [classify_extension_bundle(e) for e in ext_labels]
    if len(set(cats)) == 1:
        ext_bin = "triads" if cats[0] == "triad" else ("7ths" if cats[0] == "7ths" else "with extensions")
    else:
        ext_bin = "with extensions"
        is_mixed = True
    return CatalogBin(family_index=fi, rotation=rot, inversion_bin=inv_bin, extension_bin=ext_bin, is_mixed=is_mixed)
