#!/usr/bin/env python3
"""
🧪 SPOTIFY SETUP TESTER
========================

Tests SSH connections, Spotify API access, and basic functionality
before launching the full 3-machine deployment.

Usage:
    python test_spotify_setup.py --client-id <id> --client-secret <secret>
"""

import asyncio
import aiohttp
import argparse
import subprocess
import sys
import os

async def test_spotify_api(client_id: str, client_secret: str):
    """Test Spotify API access"""
    print("🎵 Testing Spotify API access...")
    
    # Get access token
    auth_url = "https://accounts.spotify.com/api/token"
    auth_data = {'grant_type': 'client_credentials'}
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            auth_url,
            data=auth_data,
            auth=aiohttp.BasicAuth(client_id, client_secret)
        ) as response:
            if response.status != 200:
                print(f"❌ Spotify API auth failed: {response.status}")
                return False
            
            data = await response.json()
            access_token = data['access_token']
            print(f"✅ Spotify API auth successful (expires in {data['expires_in']}s)")
    
    # Test a simple API call
    test_url = "https://api.spotify.com/v1/tracks/4iV5W9uYEdYUVa79Axb7Rh"  # Wonderwall
    headers = {'Authorization': f'Bearer {access_token}'}
    
    async with aiohttp.ClientSession() as session:
        async with session.get(test_url, headers=headers) as response:
            if response.status == 200:
                track_data = await response.json()
                print(f"✅ Spotify API test successful: {track_data['name']} by {track_data['artists'][0]['name']}")
                return True
            else:
                print(f"❌ Spotify API test failed: {response.status}")
                return False

def test_ssh_connections():
    """Test SSH connections to all machines"""
    print("🔑 Testing SSH connections...")
    
    machines = [
        ("iMac (2012)", "10.0.0.66"),
        ("Mac Pro", "10.0.0.115")
    ]
    
    all_good = True
    
    for name, ip in machines:
        print(f"Testing {name} ({ip})...")
        try:
            result = subprocess.run(
                ["ssh", f"vandendool@{ip}", "echo 'SSH connection successful'"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print(f"✅ {name} SSH working")
            else:
                print(f"❌ {name} SSH failed: {result.stderr}")
                all_good = False
                
        except subprocess.TimeoutExpired:
            print(f"❌ {name} SSH timeout")
            all_good = False
        except Exception as e:
            print(f"❌ {name} SSH error: {e}")
            all_good = False
    
    return all_good

def test_python_dependencies():
    """Test Python dependencies on local machine"""
    print("🐍 Testing Python dependencies...")
    
    required_packages = [
        "pandas", "aiohttp", "asyncio", "backoff", "rich"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} (missing)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Install missing packages:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def test_input_file():
    """Test if input CSV file exists"""
    print("📁 Testing input file...")
    
    input_files = [
        "data3_enriched.csv",
        "data3_macpro_chordonomicon_v2.csv",
        "data3_studio_chordonomicon_v2.csv"
    ]
    
    found_files = []
    for file in input_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✅ {file} ({size} bytes)")
            found_files.append(file)
        else:
            print(f"❌ {file} (not found)")
    
    if not found_files:
        print("❌ No input files found!")
        return False
    
    return True

async def main():
    parser = argparse.ArgumentParser(description='Test Spotify setup')
    parser.add_argument('--client-id', required=True, help='Spotify Client ID')
    parser.add_argument('--client-secret', required=True, help='Spotify Client Secret')
    
    args = parser.parse_args()
    
    print("🧪 SPOTIFY SETUP TESTER")
    print("=" * 40)
    
    # Test 1: Python dependencies
    deps_ok = test_python_dependencies()
    
    # Test 2: Input files
    files_ok = test_input_file()
    
    # Test 3: SSH connections
    ssh_ok = test_ssh_connections()
    
    # Test 4: Spotify API
    spotify_ok = await test_spotify_api(args.client_id, args.client_secret)
    
    # Summary
    print("\n" + "=" * 40)
    print("📊 TEST SUMMARY")
    print("=" * 40)
    print(f"🐍 Python dependencies: {'✅' if deps_ok else '❌'}")
    print(f"📁 Input files: {'✅' if files_ok else '❌'}")
    print(f"🔑 SSH connections: {'✅' if ssh_ok else '❌'}")
    print(f"🎵 Spotify API: {'✅' if spotify_ok else '❌'}")
    
    all_good = deps_ok and files_ok and ssh_ok and spotify_ok
    
    if all_good:
        print("\n🎉 ALL TESTS PASSED!")
        print("Ready to launch 3-machine Spotify fetcher deployment.")
        print("\nNext step: ./deploy_spotify_fetcher.sh <client_id> <client_secret>")
    else:
        print("\n❌ SOME TESTS FAILED!")
        print("Please fix the issues above before proceeding.")
    
    return all_good

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1) 