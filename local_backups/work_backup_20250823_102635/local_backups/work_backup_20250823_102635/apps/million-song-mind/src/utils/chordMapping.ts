// Chord mapping utilities to convert between note names and Roman numerals
// This ensures the braid and harmonic profile use the same chord identification system

import { getNoteMappingForKey } from '@/constants/harmony';

/**
 * Convert a note name (like "C", "Dm", "Em") to its Roman numeral equivalent 
 * for a given key context
 */
export function noteToRoman(noteName: string, key?: string): string | null {
  if (!noteName || !key) return null;
  
  const noteMapping = getNoteMappingForKey(key);
  
  // Find the Roman numeral that maps to this note name
  for (const [roman, mappedNote] of Object.entries(noteMapping)) {
    if (mappedNote === noteName || mappedNote.replace(/[♯♭°ø]/g, '') === noteName.replace(/[#b°]/g, '')) {
      return roman;
    }
  }
  
  return null;
}

/**
 * Convert a Roman numeral to its note name equivalent for a given key context
 */
export function romanToNote(roman: string, key?: string): string | null {
  if (!roman || !key) return null;
  
  const noteMapping = getNoteMappingForKey(key);
  return noteMapping[roman] || null;
}

/**
 * Normalize chord names for consistent comparison
 * This handles variations in flat/sharp notation
 */
export function normalizeChordName(chord: string): string {
  return chord
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .replace(/°/g, 'o')
    .replace(/ø/g, 'o');
}

/**
 * Create a bidirectional chord mapping for a specific key
 */
export function createChordMappingForKey(key: string) {
  const noteMapping = getNoteMappingForKey(key);
  const romanToNoteMap = new Map<string, string>();
  const noteToRomanMap = new Map<string, string>();
  
  for (const [roman, note] of Object.entries(noteMapping)) {
    if (note) {
      romanToNoteMap.set(roman, note);
      noteToRomanMap.set(note, roman);
      
      // Also map normalized versions
      const normalizedNote = normalizeChordName(note);
      noteToRomanMap.set(normalizedNote, roman);
    }
  }
  
  return { romanToNoteMap, noteToRomanMap };
}