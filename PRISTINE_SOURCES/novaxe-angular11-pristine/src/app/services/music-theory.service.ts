import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicTheoryService {
  
  private notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Recreate Key functionality
  Key = {
    majorScale: (root: string) => {
      const rootIndex = this.notes.indexOf(root);
      const intervals = [0, 2, 4, 5, 7, 9, 11];
      return intervals.map(interval => this.notes[(rootIndex + interval) % 12]);
    },
    
    minorScale: (root: string) => {
      const rootIndex = this.notes.indexOf(root);
      const intervals = [0, 2, 3, 5, 7, 8, 10];
      return intervals.map(interval => this.notes[(rootIndex + interval) % 12]);
    }
  };
  
  // Recreate Progression functionality
  Progression = {
    fromRomanNumerals: (key: string, numerals: string[]) => {
      return numerals.map(numeral => `${key} ${numeral}`);
    }
  };
  
  // Recreate RomanNumeral functionality
  RomanNumeral = {
    get: (numeral: string) => ({
      name: numeral,
      quality: this.getRomanNumeralQuality(numeral),
      degree: this.getRomanNumeralDegree(numeral)
    })
  };
  
  private getRomanNumeralQuality(numeral: string): string {
    if (numeral === numeral.toLowerCase()) return 'minor';
    if (numeral.includes('o')) return 'diminished';
    if (numeral.includes('+')) return 'augmented';
    return 'major';
  }
  
  private getRomanNumeralDegree(numeral: string): number {
    const cleanNumeral = numeral.replace(/[^IVX]/g, '');
    const romanMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7 };
    return romanMap[cleanNumeral as keyof typeof romanMap] || 1;
  }
}

// Export constants for backward compatibility
export const Key = new MusicTheoryService().Key;
export const Progression = new MusicTheoryService().Progression;
export const RomanNumeral = new MusicTheoryService().RomanNumeral;
