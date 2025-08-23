import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CSV Format Detection - Enhanced version that recognizes TRUE HUV fingerprints
export type CSVFormat = "datanaught" | "data1" | "data2" | "data3" | "unknown";

export function detectCSVFormat(headers: string[]): CSVFormat {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const headerSet = new Set(normalizedHeaders);

  // Datanaught format (vertical chord data)
  if (headerSet.has("chord") && headerSet.has("percent")) {
    return "datanaught";
  }

  // If CPML core fields are present, decide between data3 and data2 FIRST
  const hasArtist = ['artist_id', 'artistid', 'artist'].some(h => headerSet.has(h));
  const hasCoreCPML = headerSet.has("chords") && hasArtist;
  if (hasCoreCPML) {
    // Explicitly check for our 27-slot schema in two shapes:
    // 1) Vector columns named exactly by slot (e.g., "I", "ii", "V(7)")
    // 2) Per-metric columns like "i_percent", "i_root", etc.
    const CHORD_SLOTS = [
      'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø',
      'I7', 'iiiø', 'II(7)', '#ivø', 'III(7)', '#vº', 'VI(7)', '#iº', 'VII(7)', '#iiº', 'viiº',
      'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'Other'
    ];
    const hasVectorSlots = CHORD_SLOTS.some(s => headerSet.has(s.toLowerCase()));
    const hasMetricSlots = CHORD_SLOTS.some(s => normalizedHeaders.some(h => h.startsWith(`${s.toLowerCase()}_`)));

    if (headerSet.has("harmonic_fingerprint") || hasVectorSlots || hasMetricSlots) {
      return "data3";
    }
    return "data2";
  }

  // Data1 format (horizontal harmonic profile) - only when CPML fields are absent
  if (normalizedHeaders.some(h => h.includes("i_percent"))) {
    return "data1";
  }

  return "unknown";
}

// Parse TRUE HUV fingerprint into structured data
export const parseHUVFingerprint = (huvString: string): {
  sections: Array<{
    sectionName: string;
    intervals: number[];
  }>;
  totalIntervals: number;
} => {
  if (!huvString || typeof huvString !== 'string') {
    return { sections: [], totalIntervals: 0 };
  }

  try {
    // Remove quotes if present
    const cleanHUV = huvString.replace(/^["']|["']$/g, '');

    // Split by section markers (e.g., "<verse_1>|1,1,0,0,0,0,1")
    const sections = cleanHUV.split('|').filter(Boolean);

    const parsedSections = sections.map(section => {
      const [sectionName, intervalsStr] = section.split('|');

      if (!intervalsStr) {
        // Handle case where section name contains the intervals
        const parts = section.split(',');
        const sectionNamePart = parts[0];
        const intervals = parts.slice(1).map(s => parseInt(s.trim()) || 0);

        return {
          sectionName: sectionNamePart.trim(),
          intervals
        };
      }

      const intervals = intervalsStr.split(',').map(s => parseInt(s.trim()) || 0);

      return {
        sectionName: sectionName.trim(),
        intervals
      };
    });

    const totalIntervals = parsedSections.reduce((sum, section) =>
      sum + section.intervals.reduce((sectionSum, interval) => sectionSum + interval, 0), 0
    );

    return {
      sections: parsedSections,
      totalIntervals
    };
  } catch (error) {
    console.warn('Failed to parse HUV fingerprint:', huvString, error);
    return { sections: [], totalIntervals: 0 };
  }
};



// Key inference from chord progression
export function inferKeyFromChords(chords: string): string {
  const tokens = chords.match(/\b[A-G][#b]?m?(aj7|7|sus2|sus4|dim|aug)?\b/g) || [];
  const rootCounts: Record<string, number> = {};

  for (const chord of tokens) {
    const root = chord.match(/[A-G][#b]?/)?.[0];
    if (root) {
      rootCounts[root] = (rootCounts[root] || 0) + 1;
    }
  }

  return Object.entries(rootCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "C";
}

// Roman numeral mapping
const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ROMAN_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

export function mapChordsToRoman(chords: string, key: string): string {
  const keyIndex = CHROMATIC_SCALE.indexOf(key.replace('b', '#'));
  if (keyIndex === -1) return chords; // Fallback to original if key not found

  return chords.replace(/\b([A-G][#b]?)m?(aj7|7|sus2|sus4|dim|aug)?\b/g, (match, root) => {
    const rootIndex = CHROMATIC_SCALE.indexOf(root.replace('b', '#'));
    if (rootIndex === -1) return match;

    const interval = (rootIndex - keyIndex + 12) % 12;
    const scaleIndex = [0, 2, 4, 5, 7, 9, 11].indexOf(interval);

    if (scaleIndex !== -1) {
      let roman = ROMAN_NUMERALS[scaleIndex];
      if (match.includes('m') && !['ii', 'iii', 'vi'].includes(roman)) {
        roman = roman.toLowerCase();
      }
      return roman;
    }

    return match; // Keep original if not in major scale
  });
}
