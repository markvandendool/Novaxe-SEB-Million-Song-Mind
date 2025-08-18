#!/bin/bash

# Data2 to Data3 Conversion Setup Script
# =====================================
# Sets up the environment for converting chordonomicon data2 to data3 format

set -e  # Exit on any error

echo "🎵 Data2 to Data3 Conversion Setup"
echo "==================================="

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.9"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.9+ required. Found: $python_version"
    exit 1
else
    echo "✅ Python version: $python_version"
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv_data2_to_data3" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv_data2_to_data3
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv_data2_to_data3/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install minimal dependencies
echo "📚 Installing dependencies..."
pip install pandas>=2.0.0 numpy>=1.24.0 aiohttp>=3.8.0 pyyaml>=6.0

# Test the installation
echo "🧪 Testing installation..."
python3 -c "import pandas, numpy, aiohttp; print('✅ All dependencies installed successfully')"

echo ""
echo "🎉 Setup complete! Your Data2 to Data3 converter is ready."
echo ""
echo "Usage examples:"
echo "  python3 enrich_data2_to_data3_v7.py --input data2.csv --output data3.csv"
echo "  python3 enrich_data2_to_data3_v7.py --input chordonomicon_v2.csv --output data3_enriched.csv"
echo ""
echo "Key features:"
echo "  ✅ Spotify metadata enrichment (artist names, song names, URLs)"
echo "  ✅ Key detection using Krumhansl-Schmuckler profiles"
echo "  ✅ Roman numeral analysis with section preservation"
echo "  ✅ Harmonic fingerprinting with HUV vectors"
echo "  ✅ Chord type counting for all 27 chord categories"
echo "  ✅ Exact data3 format compliance"
echo "  ✅ Caching for efficient API usage"
echo ""
echo "To activate the environment in the future:"
echo "  source venv_data2_to_data3/bin/activate" 