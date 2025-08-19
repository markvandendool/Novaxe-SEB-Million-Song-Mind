#!/usr/bin/env python3
"""
Test script for Final Boss key detection implementation
"""

import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from enrich_data2_to_data3_v8 import Config, EnhancedMusicTheoryEngine

def test_final_boss():
    """Test the Final Boss key detection with sample chord progressions."""
    
    config = Config()
    
    # Test cases with known optimal keys
    test_cases = [
        {
            'name': 'Simple C major progression',
            'chords': ['C', 'F', 'G', 'C'],
            'expected_key': 'C',
            'expected_major': True
        },
        {
            'name': 'A minor progression', 
            'chords': ['Am', 'F', 'C', 'G'],
            'expected_key': 'C',  # Could be C major or A minor - Final Boss will decide
            'expected_major': True  # Likely C major due to F-C-G
        },
        {
            'name': 'Complex progression with chromatic chords',
            'chords': ['C', 'Am', 'F', 'G', 'E', 'Am', 'Dm', 'G'],
            'expected_key': None,  # Let Final Boss decide
            'expected_major': None
        }
    ]
    
    print("🎯 Testing Final Boss Key Detection")
    print("=" * 50)
    
    for test_case in test_cases:
        print(f"\n📝 Test: {test_case['name']}")
        print(f"🎵 Chords: {' '.join(test_case['chords'])}")
        
        try:
            # Test Final Boss detection
            key, is_major, ks_score, other_rate, chosen_by = EnhancedMusicTheoryEngine.detect_key_final_boss(
                test_case['chords'], config
            )
            
            print(f"🏆 Final Boss Result:")
            print(f"   Key: {key} {'major' if is_major else 'minor'}")
            print(f"   Other Rate: {other_rate:.3f}")
            print(f"   KS Score: {ks_score:.3f}")
            print(f"   Chosen By: {chosen_by}")
            
            # Compare with standard detection
            std_key, std_major, std_confidence, std_ambiguous, std_candidates = EnhancedMusicTheoryEngine.detect_key_enhanced(
                test_case['chords']
            )
            
            print(f"📊 Standard Detection:")
            print(f"   Key: {std_key} {'major' if std_major else 'minor'}")
            print(f"   Confidence: {std_confidence:.3f}")
            print(f"   Ambiguous: {std_ambiguous}")
            
            # Validate expectations if provided
            if test_case['expected_key']:
                if key == test_case['expected_key'] and is_major == test_case['expected_major']:
                    print("✅ Matches expected result")
                else:
                    print(f"⚠️  Expected {test_case['expected_key']} {'major' if test_case['expected_major'] else 'minor'}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n🎉 Final Boss testing complete!")

if __name__ == '__main__':
    test_final_boss()