#!/bin/bash

# Harmonic Oracle v7.0 Setup Script
# =================================
# This script installs the modernized dependencies and tests the system

set -e  # Exit on any error

echo "🎵 Harmonic Oracle v7.0 - Modernized Setup"
echo "============================================"

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
if [ ! -d "venv_v7" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv_v7
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv_v7/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install core dependencies first
echo "📚 Installing core dependencies..."
pip install pandas>=2.0.0 polars>=0.20.0 numpy>=1.24.0 scipy>=1.10.0 scikit-learn>=1.3.0

# Install modern audio processing
echo "🎵 Installing modern audio processing..."
pip install essentia-tensorflow>=2.1.0 torch>=2.0.0 torchaudio>=2.0.0

# Install MIDI processing
echo "🎼 Installing MIDI processing..."
pip install pretty_midi>=0.1.16 mido>=1.3.0

# Install distributed computing
echo "⚡ Installing distributed computing..."
pip install ray>=2.0.0

# Install database and networking
echo "🗄️  Installing database and networking..."
pip install sqlalchemy>=2.0.0 redis>=4.0.0 aiohttp>=3.8.0 requests>=2.31.0 urllib3>=2.0.0

# Install utilities
echo "🔧 Installing utilities..."
pip install pyyaml>=6.0

# Test the installation
echo "🧪 Testing installation..."
python3 harmonic_oracle_v7.py --check-deps

echo ""
echo "🎉 Setup complete! Your Harmonic Oracle v7.0 is ready."
echo ""
echo "Usage examples:"
echo "  python3 harmonic_oracle_v7.py --input your_data.csv --output enriched.csv"
echo "  python3 harmonic_oracle_v7.py --input large_dataset.csv --workers 32"
echo "  python3 harmonic_oracle_v7.py --check-deps"
echo ""
echo "Key improvements in v7.0:"
echo "  ✅ Eliminated librosa/music21 dependency conflicts"
echo "  ✅ Modern audio processing with essentia + torchaudio"
echo "  ✅ Lightweight MIDI processing with pretty_midi + mido"
echo "  ✅ Enhanced ML models with better architecture"
echo "  ✅ All original algorithms preserved"
echo ""
echo "To activate the environment in the future:"
echo "  source venv_v7/bin/activate" 