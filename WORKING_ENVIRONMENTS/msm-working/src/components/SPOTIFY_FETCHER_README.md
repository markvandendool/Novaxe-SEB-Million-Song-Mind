# 🎵 SPOTIFY METADATA FETCHER v3.5

## Overview

This system fetches comprehensive Spotify metadata for the Harmonic Oracle project using a distributed 3-machine architecture. It processes the `data3_enriched.csv` file and creates `data3.5_spotify_extras_complete.csv` with rich metadata including track info, album data, artist data, audio features, and light audio analysis.

## 🏗️ Architecture

### 3-Machine Distribution
- **Mac Pro (2019)**: Rows 0-375,000 (375k tracks)
- **Mac Studio M2**: Rows 375,001-750,000 (375k tracks)  
- **iMac (2012)**: Rows 750,001-end (~201k tracks)

### Metadata Included
✅ **Track Data**: name, explicit, popularity, duration_ms, preview_url, external_spotify_url  
✅ **Album Data**: id, name, release_date, total_tracks, album_type, cover_url  
✅ **Artist Data**: name, genres, popularity, followers, spotify_url  
✅ **Audio Features**: danceability, energy, key, mode, tempo, valence, acousticness, liveness, instrumentalness, speechiness, loudness, time_signature  
✅ **Light Audio Analysis**: tempo, key, mode, time_signature, loudness, confidence, start, duration  

❌ **Excluded** (too large): detailed segments, bars, beats, tatums, markets, external URLs

## 🚀 Quick Start

### 1. Setup Spotify Apps
```bash
# Go to https://developer.spotify.com/dashboard
# Create 3 apps: VIPER_MacStudio, VIPER_MacPro, VIPER_iMac
# Get client_id and client_secret for each
```

### 2. Test Setup
```bash
# Test everything before deployment
python test_spotify_setup.py --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

### 3. Deploy to All Machines
```bash
# Launch 3-machine processing
./deploy_spotify_fetcher.sh YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### 4. Monitor Progress
```bash
# Check status
python merge_spotify_results.py --status

# Monitor logs
tail -f studio_spotify.log
ssh vandendool@10.0.0.115 'tail -f ~/macpro_spotify.log'
ssh vandendool@10.0.0.66 'tail -f ~/imac_spotify.log'
```

### 5. Merge Results
```bash
# When all machines complete
python merge_spotify_results.py
```

## 📁 Files

### Core Scripts
- `spotify_metadata_fetcher.py` - Main fetcher script
- `deploy_spotify_fetcher.sh` - 3-machine deployment script
- `merge_spotify_results.py` - Merge results from all machines
- `test_spotify_setup.py` - Test setup before deployment
- `setup_ssh_keys.sh` - SSH key setup (optional)

### Output Files
- `data3.5_spotify_extras_macpro.csv` - Mac Pro results
- `data3.5_spotify_extras_studio.csv` - Mac Studio results  
- `data3.5_spotify_extras_imac.csv` - iMac results
- `data3.5_spotify_extras_complete.csv` - Merged final results

### Log Files
- `studio_spotify.log` - Mac Studio processing log
- `macpro_spotify.log` - Mac Pro processing log
- `imac_spotify.log` - iMac processing log

## 🔧 Setup Requirements

### SSH Access
All machines must have SSH enabled and accessible:
- **iMac**: `ssh vandendool@10.0.0.66`
- **Mac Pro**: `ssh vandendool@10.0.0.115`

### Python Dependencies
```bash
pip install pandas aiohttp asyncio backoff rich
```

### Input Files
- `data3_enriched.csv` (or equivalent with `spotify_song_id` column)

## 📊 Performance

### Expected Processing Times
- **Mac Pro**: ~18.5 hours (375k tracks)
- **Mac Studio**: ~18.5 hours (375k tracks)
- **iMac**: ~30-40 hours (201k tracks)

### Rate Limiting
- Automatic retry/backoff on 429 errors
- Progress saving every 1000 tracks
- Concurrent request limiting (10 simultaneous)

## 🛠️ Troubleshooting

### SSH Issues
```bash
# Test SSH connections
ssh vandendool@10.0.0.66 "echo 'iMac working'"
ssh vandendool@10.0.115 "echo 'Mac Pro working'"

# Setup SSH keys (if needed)
./setup_ssh_keys.sh
```

### Spotify API Issues
```bash
# Test API access
python test_spotify_setup.py --client-id YOUR_ID --client-secret YOUR_SECRET

# Check rate limits
tail -f *.log | grep "Rate limited"
```

### Missing Dependencies
```bash
# Install on remote machines
ssh vandendool@10.0.0.66 "pip3 install pandas aiohttp asyncio backoff rich"
ssh vandendool@10.0.0.115 "pip3 install pandas aiohttp asyncio backoff rich"
```

## 📈 Monitoring

### Check Processing Status
```bash
python merge_spotify_results.py --status
```

### Monitor Individual Machines
```bash
# Mac Studio (local)
tail -f studio_spotify.log

# Mac Pro (remote)
ssh vandendool@10.0.0.115 'tail -f ~/macpro_spotify.log'

# iMac (remote)
ssh vandendool@10.0.0.66 'tail -f ~/imac_spotify.log'
```

### Check Progress Files
```bash
# Look for temp files (progress saves)
ls -la *.temp

# Check final files
ls -la data3.5_spotify_extras_*.csv
```

## 🔄 Recovery

### Resume from Interruption
The system automatically saves progress every 1000 tracks. To resume:

1. Check which machines completed
2. Restart only the incomplete machines
3. Merge results when all complete

### Manual Restart
```bash
# Restart specific machine
ssh vandendool@10.0.0.66 "cd ~ && python3 spotify_metadata_fetcher.py --start 750001 --output data3.5_spotify_extras_imac.csv --client-id YOUR_ID --client-secret YOUR_SECRET > imac_spotify.log 2>&1 &"
```

## 📋 Data Schema

### Output Columns
```csv
spotify_song_id,track_name,explicit,popularity,duration_ms,preview_url,external_spotify_url,
album_id,album_name,album_release_date,album_total_tracks,album_type,album_cover_url,
artist_name,artist_genres,artist_popularity,artist_followers,artist_spotify_url,
danceability,energy,key,mode,tempo,valence,acousticness,liveness,instrumentalness,speechiness,loudness,time_signature,
analysis_tempo,analysis_key,analysis_mode,analysis_time_signature,analysis_loudness,analysis_confidence,analysis_start,analysis_duration
```

## 🎯 Success Criteria

- ✅ All 3 machines complete processing
- ✅ No duplicate spotify_song_id entries
- ✅ >95% success rate for API calls
- ✅ Complete metadata for >90% of tracks
- ✅ Merged file: `data3.5_spotify_extras_complete.csv`

## 🔮 Next Steps

After successful completion:
1. Join with `data3_enriched.csv` using `spotify_song_id`
2. Create final `data3.5_complete.csv` for Million Song Mind app
3. Begin app development with rich metadata

---

**Estimated Total Processing Time**: 18-40 hours  
**Total Tracks**: ~951,270  
**Output Size**: ~50-100MB  
**Success Rate Target**: >95% 