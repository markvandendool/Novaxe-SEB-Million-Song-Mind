#!/bin/bash
# 🎵 SPOTIFY DATA ENRICHER SETUP & TEST SCRIPT
# Sets up Python environment and tests the Spotify data enricher

set -e

echo "🎵 Setting up Spotify Data Enricher..."

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Install required Python packages
echo "📦 Installing required Python packages..."
python3 -m pip install requests --user --quiet 2>/dev/null || true

# Make the script executable
chmod +x spotify-data-enricher.py

echo "📄 Creating test CSV data..."
cat << 'EOF' > test_data3_sample.csv
artist,title,album,genre,year,duration
"The Beatles","Hey Jude","The Beatles 1967-1970","Rock",1968,431
"Queen","Bohemian Rhapsody","A Night at the Opera","Rock",1975,355
"Miles Davis","So What","Kind of Blue","Jazz",1959,544
"Adele","Rolling in the Deep","21","Pop",2010,228
"Pink Floyd","Comfortably Numb","The Wall","Progressive Rock",1979,382
EOF

echo "🔍 Testing CSV analysis..."
python3 spotify-data-enricher.py --analyze test_data3_sample.csv

echo "🧪 Testing data enrichment (dry run)..."
echo "Note: This requires the Novaxe Angular app to be running on localhost:4200"
echo "To start the app: cd novaxe-seb-ng11 && npm start"

# Check if localhost:4200 is accessible
if curl -s --connect-timeout 5 http://localhost:4200 >/dev/null 2>&1; then
    echo "✅ Novaxe app detected on localhost:4200"
    echo "🔄 Processing sample data..."
    python3 spotify-data-enricher.py --input test_data3_sample.csv --output test_enriched_output.csv --config spotify-enricher-config.json
    
    if [ -f test_enriched_output.csv ]; then
        echo "✅ Enrichment complete! Output file created:"
        echo "📄 test_enriched_output.csv"
        echo ""
        echo "📊 Sample enriched data (first 2 lines):"
        head -n 2 test_enriched_output.csv
        echo "..."
        echo ""
        echo "🎉 Test successful! You can now process your data3_enriched.csv files:"
        echo "   python3 spotify-data-enricher.py --input your_data3_enriched.csv --output enriched_output.csv"
    else
        echo "⚠️  Enrichment test completed but no output file found"
        echo "Check the log file: spotify-enricher.log"
    fi
else
    echo "⚠️  Novaxe app not running on localhost:4200"
    echo "🔧 To test with real data:"
    echo "   1. Start the Novaxe Angular app: cd novaxe-seb-ng11 && npm start"
    echo "   2. Run: python3 spotify-data-enricher.py --input test_data3_sample.csv --output test_output.csv"
    echo ""
    echo "📋 Available commands:"
    echo "   Analyze CSV:     python3 spotify-data-enricher.py --analyze data3_enriched.csv"
    echo "   Process single:  python3 spotify-data-enricher.py --input data3.csv --output enriched.csv"
    echo "   Batch process:   python3 spotify-data-enricher.py --batch-process 'data3_*.csv'"
fi

echo ""
echo "📚 USAGE DOCUMENTATION:"
echo "========================"
echo ""
echo "1. ANALYZE CSV STRUCTURE:"
echo "   python3 spotify-data-enricher.py --analyze your_file.csv"
echo ""
echo "2. PROCESS SINGLE FILE:"
echo "   python3 spotify-data-enricher.py --input data3_enriched.csv --output enriched_output.csv"
echo ""
echo "3. BATCH PROCESS MULTIPLE FILES:"
echo "   python3 spotify-data-enricher.py --batch-process 'data3_*.csv'"
echo ""
echo "4. USE CUSTOM CONFIG:"
echo "   python3 spotify-data-enricher.py --input file.csv --output out.csv --config my_config.json"
echo ""
echo "🔧 CONFIGURATION OPTIONS:"
echo "   - Edit spotify-enricher-config.json for API endpoints and settings"
echo "   - Set 'spotify_api_base' to switch between development and production"
echo "   - Adjust rate_limit settings to prevent API overload"
echo ""
echo "📝 OUTPUT COLUMNS ADDED:"
echo "   - spotify_track_id, spotify_artist_id, spotify_uri"
echo "   - spotify_popularity, spotify_duration_ms, spotify_preview_url"  
echo "   - audio_features_* (danceability, energy, key, tempo, etc.)"
echo "   - enrichment_status, enrichment_timestamp"
echo ""
echo "✅ Setup complete! The Spotify Data Enricher is ready to use."
