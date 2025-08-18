# 🚀 EXECUTE NOW - SPOTIFY METADATA FETCHER

## Immediate Next Steps

### 1. Fix SSH Password Issue
```bash
# Run this to set up SSH keys (eliminates password prompts)
chmod +x setup_ssh_keys.sh
./setup_ssh_keys.sh
```

### 2. Create Spotify Developer Apps
1. Go to https://developer.spotify.com/dashboard
2. Create 3 apps:
   - `VIPER_MacStudio`
   - `VIPER_MacPro` 
   - `VIPER_iMac`
3. Get `client_id` and `client_secret` for each

### 3. Test Everything
```bash
# Test SSH, dependencies, and Spotify API
python test_spotify_setup.py --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

### 4. Launch 3-Machine Processing
```bash
# Deploy to all machines
chmod +x deploy_spotify_fetcher.sh
./deploy_spotify_fetcher.sh YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### 5. Monitor Progress
```bash
# Check status
python merge_spotify_results.py --status

# Monitor logs
tail -f studio_spotify.log
ssh vandendool@10.0.0.115 'tail -f ~/macpro_spotify.log'
ssh vandendool@10.0.0.66 'tail -f ~/imac_spotify.log'
```

### 6. Merge Results (when complete)
```bash
python merge_spotify_results.py
```

## 🎯 What This Will Do

✅ **Fix SSH password prompts** - Set up key-based authentication  
✅ **Test all connections** - Verify SSH, Spotify API, dependencies  
✅ **Launch 3-machine processing** - Distribute work across all machines  
✅ **Fetch comprehensive metadata** - Track, album, artist, audio features, analysis  
✅ **Monitor progress** - Real-time logs and status updates  
✅ **Merge results** - Combine all data into final dataset  

## 📊 Expected Results

- **Processing Time**: 18-40 hours total
- **Output**: `data3.5_spotify_extras_complete.csv`
- **Tracks**: ~951,270 with rich metadata
- **Success Rate**: >95% API calls successful

## 🔧 If SSH Still Fails

If SSH password prompts continue:

```bash
# Manual SSH key setup
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_imac -N ""
ssh-copy-id -i ~/.ssh/id_rsa_imac.pub vandendool@10.0.0.66

ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_macpro -N ""
ssh-copy-id -i ~/.ssh/id_rsa_macpro.pub vandendool@10.0.0.115
```

## 🚨 Emergency Stop

If you need to stop all processing:

```bash
# Stop Mac Studio (local)
pkill -f spotify_metadata_fetcher

# Stop Mac Pro (remote)
ssh vandendool@10.0.0.115 "pkill -f spotify_metadata_fetcher"

# Stop iMac (remote)
ssh vandendool@10.0.0.66 "pkill -f spotify_metadata_fetcher"
```

---

**Ready to launch? Start with Step 1 above!** 🚀 