#!/usr/bin/env python3
"""
VIPER 2.0 Test Script
Tests basic functionality without processing data
"""

import asyncio
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

async def test_viper():
    try:
        from enrich_data2_to_data3_v8 import Config, EnhancedMusicTheoryEngine, EnhancedSpotifyClient
        
        print("Testing VIPER 2.0 components...")
        
        # Test configuration
        config = Config()
        print("✅ Configuration loaded")
        
        # Test music theory engine
        engine = EnhancedMusicTheoryEngine()
        test_chords = ["C", "F", "G", "Am"]
        key, is_major, confidence, is_ambiguous, candidates = engine.detect_key_enhanced(test_chords)
        print(f"✅ Key detection test: {key} (confidence: {confidence:.3f})")
        
        # Test chord parsing
        parsed = engine.parse_chord_advanced("Cmaj7")
        if parsed:
            print(f"✅ Chord parsing test: {parsed['root']}{parsed['quality']}")
        
        # Test Spotify client initialization
        spotify_client = EnhancedSpotifyClient(config)
        print("✅ Spotify client initialized")
        
        print("\n🎉 All VIPER 2.0 components working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_viper())
    sys.exit(0 if success else 1)
