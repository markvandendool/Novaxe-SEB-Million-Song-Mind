# VIPER 2.0 - Enhanced Data2 to Data3 Enrichment Script

## 🚀 Overview

VIPER 2.0 is an industrial-scale data enrichment pipeline that converts Chordonomicon data2 (CPML format) to data3 format with advanced features including Spotify metadata enrichment, confidence-scored key detection, enhanced Roman numeral analysis, and comprehensive error handling.

## ✨ Enhanced Features

### 🔧 Core Enhancements
- **Exponential Backoff API Resilience**: Robust retry logic with jitter for Spotify API calls
- **Confidence-Scored Key Detection**: ML-driven key detection with ambiguity detection
- **Enhanced Roman Numeral Analysis**: Context-aware analysis with confidence scoring
- **Per-Row Status Tracking**: Detailed tracking of conversion success/failure for each row
- **Comprehensive Error Handling**: Graceful handling of all error scenarios
- **Chroma Vector Module**: Future-ready module for data4 audio analysis (commented out)

### 📊 Data3 Structure Compliance
- **Exact Column Order**: Guaranteed compliance with data3 specification
- **Enhanced Metadata**: Rich Spotify artist and track information
- **Harmonic Fingerprinting**: Advanced HUV (Harmonic Unit Vector) generation
- **Chord Type Counting**: Precise counting of 27 chord categories
- **Quality Assessment**: Analysis quality scoring for each song

### 🛡️ Production-Ready Features
- **Validation System**: Comprehensive output validation
- **Status Tracking**: Per-row conversion status and error reporting
- **Failed Row Export**: Separate CSV for failed/partial conversions
- **Performance Monitoring**: Real-time processing statistics
- **Configurable Settings**: Extensive CLI and YAML configuration options

## 📋 Requirements

- Python 3.9+
- 4GB+ RAM (for large datasets)
- Internet connection (for Spotify API)

## 🛠️ Installation

### Quick Setup
```bash
# Clone or download the script files
chmod +x setup_v8.sh
./setup_v8.sh
```

### Manual Setup
```bash
# Create virtual environment
python3 -m venv venv_viper_v8
source venv_viper_v8/bin/activate

# Install dependencies
pip install -r requirements_v8.txt

# Test installation
python test_viper.py
```

## 🚀 Usage

### Basic Conversion
```bash
# Activate virtual environment
source venv_viper_v8/bin/activate

# Basic conversion
python enrich_data2_to_data3_v8.py --input data2.csv --output data3.csv
```

### Enhanced Conversion with Status Tracking
```bash
python enrich_data2_to_data3_v8.py \
  --input data2.csv \
  --output data3.csv \
  --validate-output \
  --output-failed-rows \
  --verbose
```

### High-Performance Production Mode
```bash
python enrich_data2_to_data3_v8.py \
  --input chordonomicon_v2.csv \
  --output data3_enhanced.csv \
  --batch-size 100 \
  --max-retries 3 \
  --strict-mode \
  --validate-output
```

### Using Configuration File
```bash
python enrich_data2_to_data3_v8.py \
  --input data2.csv \
  --output data3.csv \
  --config viper_config.yaml
```

## 📊 Command Line Options

### Required Arguments
- `--input, -i`: Input data2 CSV file path
- `--output, -o`: Output data3 CSV file path (default: data3_enhanced_v8.csv)

### Processing Options
- `--batch-size`: API calls per batch (default: 50)
- `--max-retries`: Maximum retry attempts (default: 5)
- `--strict-mode`: Enable strict validation
- `--validate-output`: Validate data3 structure
- `--output-failed-rows`: Save failed rows to separate file
- `--disable-status-tracking`: Disable per-row status tracking

### API Resilience Options
- `--exponential-backoff-base`: Backoff calculation base (default: 2.0)
- `--exponential-backoff-max`: Maximum backoff time (default: 60.0)
- `--jitter-factor`: Jitter factor for backoff (default: 0.1)

### Key Detection Options
- `--key-confidence-threshold`: Minimum confidence threshold (default: 0.3)
- `--ambiguous-key-threshold`: Ambiguous key threshold (default: 0.1)

### Logging Options
- `--verbose, -v`: Enable detailed logging
- `--quiet, -q`: Suppress non-error logging
- `--log-file`: Log file path (default: viper_enrichment.log)

## 📁 Output Files

### Main Output
- `data3.csv`: Main enriched data3 file with all columns

### Status Files (if enabled)
- `data3_failed.csv`: Failed/partial conversions
- `spotify_cache_v8.json`: Spotify API response cache
- `viper_enrichment.log`: Detailed processing log

### Enhanced Columns Added
- `key`: Detected musical key
- `key_confidence`: Key detection confidence (0-1)
- `is_ambiguous_key`: Boolean flag for ambiguous keys
- `key_candidates`: Alternative key candidates with scores
- `roman_numerals`: Roman numeral analysis
- `roman_confidence`: Roman numeral confidence (0-1)
- `harmonic_fingerprint`: HUV harmonic fingerprint
- `analysis_quality`: Overall analysis quality (excellent/good/fair/poor)
- `conversion_status`: Row processing status
- `conversion_errors`: Detailed error messages
- `processing_time`: Time spent processing each row

## 🔧 Configuration

### YAML Configuration File
```yaml
# Spotify API credentials
spotify_client_id: "your_client_id"
spotify_client_secret: "your_client_secret"

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
```

## 📈 Performance

### Processing Speed
- **Typical**: 50-100 songs/second (depending on API response times)
- **Optimized**: 100-200 songs/second (with larger batch sizes)
- **Memory Usage**: ~2-4GB for 600K+ song datasets

### Scalability
- **Batch Processing**: Configurable batch sizes for optimal performance
- **Caching**: Intelligent Spotify API response caching
- **Resume Capability**: Failed rows can be reprocessed separately
- **Error Recovery**: Graceful handling of API failures and timeouts

## 🔍 Quality Assurance

### Validation Features
- **Schema Validation**: Ensures exact data3 column compliance
- **Data Type Checking**: Validates numeric and string fields
- **Quality Scoring**: Analysis quality assessment for each song
- **Error Reporting**: Detailed error messages for troubleshooting

### Quality Metrics
- **Key Detection Confidence**: 0-1 scoring for key accuracy
- **Roman Numeral Confidence**: 0-1 scoring for analysis accuracy
- **Analysis Quality**: excellent/good/fair/poor classification
- **Success Rate**: Overall conversion success percentage

## 🐛 Troubleshooting

### Common Issues

#### API Rate Limiting
```bash
# Reduce batch size and increase retries
python enrich_data2_to_data3_v8.py \
  --input data2.csv \
  --output data3.csv \
  --batch-size 25 \
  --max-retries 10
```

#### Memory Issues
```bash
# Process in smaller chunks
python enrich_data2_to_data3_v8.py \
  --input data2.csv \
  --output data3.csv \
  --batch-size 25
```

#### Validation Errors
```bash
# Enable strict validation
python enrich_data2_to_data3_v8.py \
  --input data2.csv \
  --output data3.csv \
  --strict-mode \
  --validate-output
```

### Log Analysis
```bash
# Check detailed logs
tail -f viper_enrichment.log

# Search for errors
grep "ERROR" viper_enrichment.log

# Check API statistics
grep "Spotify API" viper_enrichment.log
```

## 🔮 Future Enhancements

### Chroma Vector Module
The script includes a commented-out chroma vector module for future data4 implementation when audio/MIDI data becomes available.

### Planned Features
- **Distributed Processing**: Ray-based parallel processing
- **Advanced Audio Analysis**: Chroma vector extraction from audio
- **Machine Learning**: Enhanced key detection models
- **Database Integration**: Direct database read/write capabilities

## 📚 Technical Details

### Architecture
- **Modular Design**: Separate components for music theory, API client, and conversion
- **Async Processing**: Non-blocking API calls with aiohttp
- **Error Isolation**: Per-row error handling without affecting other rows
- **Configurable**: Extensive configuration options via CLI and YAML

### Data Flow
1. **Load data2**: Read CPML format CSV
2. **Spotify Enrichment**: Fetch artist and track metadata
3. **Harmonic Analysis**: Key detection and Roman numeral analysis
4. **Fingerprinting**: Generate HUV harmonic fingerprints
5. **Validation**: Ensure data3 structure compliance
6. **Output**: Save enriched data3 CSV

### Error Handling
- **API Failures**: Exponential backoff with jitter
- **Parsing Errors**: Graceful fallback for malformed data
- **Memory Issues**: Efficient memory management
- **Network Issues**: Robust retry logic

## 🤝 Contributing

### Development Setup
```bash
# Install development dependencies
pip install pytest pytest-asyncio black flake8

# Run tests
pytest test_viper.py

# Code formatting
black enrich_data2_to_data3_v8.py
```

### Code Style
- Follow PEP 8 guidelines
- Use type hints throughout
- Comprehensive docstrings
- Error handling for all external calls

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Chordonomicon**: For the comprehensive chord progression dataset
- **Spotify API**: For rich metadata enrichment
- **Music Theory Community**: For harmonic analysis algorithms
- **Python Community**: For excellent async and data processing libraries

---

**VIPER 2.0 - Mission: Convert data2 to data3 with industrial-scale reliability and precision! 🚀** 