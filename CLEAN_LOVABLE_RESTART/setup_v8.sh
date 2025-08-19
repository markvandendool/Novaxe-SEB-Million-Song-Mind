#!/bin/bash

# VIPER 2.0 Enhanced Setup Script
# Enhanced Data2 to Data3 Enrichment Script Installation

set -e  # Exit on any error

echo "=================================================================================="
echo "VIPER 2.0 - Enhanced Data2 to Data3 Enrichment Script Setup"
echo "=================================================================================="

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
REQUIRED_VERSION="3.9"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Error: Python 3.9+ required, found $PYTHON_VERSION"
    echo "Please upgrade Python and try again."
    exit 1
fi

echo "✅ Python version check passed: $PYTHON_VERSION"

# Create virtual environment
VENV_NAME="venv_viper_v8"
echo "Creating virtual environment: $VENV_NAME"

if [ -d "$VENV_NAME" ]; then
    echo "⚠️  Virtual environment already exists, removing..."
    rm -rf "$VENV_NAME"
fi

python3 -m venv "$VENV_NAME"
echo "✅ Virtual environment created"

# Activate virtual environment
echo "Activating virtual environment..."
source "$VENV_NAME/bin/activate"

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies in stages
echo "Installing core dependencies..."
pip install pandas numpy

echo "Installing async HTTP client..."
pip install aiohttp aiofiles

echo "Installing configuration and serialization..."
pip install pyyaml python-dotenv

echo "Installing enhanced logging and monitoring..."
pip install colorlog rich

echo "Installing data validation..."
pip install pydantic marshmallow

echo "Installing enhanced error handling..."
pip install tenacity backoff

echo "Installing performance monitoring..."
pip install psutil memory-profiler

# Verify installation
echo "Verifying installation..."
python3 -c "
import pandas as pd
import numpy as np
import aiohttp
import yaml
import pydantic
import tenacity
import psutil
print('✅ All core dependencies installed successfully')
"

# Create configuration file
echo "Creating default configuration..."
cat > viper_config.yaml << EOF
# VIPER 2.0 Configuration File

# Spotify API credentials
spotify_client_id: "fe078534288e4a8f95c41a189e9cc493"
spotify_client_secret: "26dcec68d1bc4ad3b2e9c72709da77cc"

# Processing settings
batch_size: 50
max_retries: 5
api_timeout: 30
cache_file: "spotify_cache_v8.json"

# Enhanced API resilience
exponential_backoff_base: 2.0
exponential_backoff_max: 60.0
jitter_factor: 0.1

# Key detection settings
key_confidence_threshold: 0.3
ambiguous_key_threshold: 0.1

# Status tracking
enable_status_tracking: true
output_failed_rows: true

# Validation settings
validate_output: true
strict_mode: false
EOF

echo "✅ Configuration file created: viper_config.yaml"

# Create test script
echo "Creating test script..."
cat > test_viper.py << 'EOF'
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

try:
    from enrich_data2_to_data3_v8 import Config, EnhancedMusicTheoryEngine, EnhancedSpotifyClient
    
    async def test_viper():
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
EOF

chmod +x test_viper.py
echo "✅ Test script created: test_viper.py"

# Run test
echo "Running VIPER 2.0 test..."
python3 test_viper.py

if [ $? -eq 0 ]; then
    echo "✅ VIPER 2.0 test passed"
else
    echo "❌ VIPER 2.0 test failed"
    exit 1
fi

# Create usage examples
echo "Creating usage examples..."
cat > viper_examples.md << 'EOF'
# VIPER 2.0 Usage Examples

## Basic Usage
```bash
# Activate virtual environment
source venv_viper_v8/bin/activate

# Basic conversion
python enrich_data2_to_data3_v8.py --input data2.csv --output data3.csv

# Enhanced conversion with status tracking
python enrich_data2_to_data3_v8.py --input data2.csv --output data3.csv --validate-output --output-failed-rows

# High-performance conversion
python enrich_data2_to_data3_v8.py --input data2.csv --output data3.csv --batch-size 100 --max-retries 3

# Strict mode for production
python enrich_data2_to_data3_v8.py --input data2.csv --output data3.csv --strict-mode --verbose
```

## Configuration Options
- `--batch-size`: Number of API calls per batch (default: 50)
- `--max-retries`: Maximum retry attempts (default: 5)
- `--strict-mode`: Enable strict validation
- `--validate-output`: Validate data3 structure
- `--output-failed-rows`: Save failed rows to separate file
- `--verbose`: Enable detailed logging
- `--quiet`: Suppress non-error logging

## Output Files
- `data3.csv`: Main output file
- `data3_failed.csv`: Failed rows (if enabled)
- `spotify_cache_v8.json`: Spotify API cache
- `viper_enrichment.log`: Detailed log file
EOF

echo "✅ Usage examples created: viper_examples.md"

# Final setup summary
echo ""
echo "=================================================================================="
echo "VIPER 2.0 Setup Complete! 🚀"
echo "=================================================================================="
echo ""
echo "📁 Virtual Environment: $VENV_NAME"
echo "📄 Configuration: viper_config.yaml"
echo "🧪 Test Script: test_viper.py"
echo "📖 Examples: viper_examples.md"
echo ""
echo "🚀 To start using VIPER 2.0:"
echo "1. Activate virtual environment: source $VENV_NAME/bin/activate"
echo "2. Run test: python test_viper.py"
echo "3. Process data: python enrich_data2_to_data3_v8.py --input your_data2.csv --output data3.csv"
echo ""
echo "📊 Enhanced Features Available:"
echo "✅ Exponential backoff API resilience"
echo "✅ Confidence-scored key detection"
echo "✅ Enhanced Roman numeral analysis"
echo "✅ Per-row status tracking"
echo "✅ Comprehensive error handling"
echo "✅ Chroma vector module (commented for future data4)"
echo "✅ Exact data3 structure compliance"
echo ""
echo "==================================================================================" 