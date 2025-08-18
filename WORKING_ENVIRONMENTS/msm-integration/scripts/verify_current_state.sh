#!/bin/bash

# 🚨 MANDATORY STATUS VERIFICATION SCRIPT
# Run this BEFORE making any assumptions about project state

echo "🔍 VERIFYING CURRENT PROJECT STATE..."
echo "=================================="

echo ""
echo "1. 📍 CURRENT DIRECTORY:"
pwd

echo ""
echo "2. 🌿 GIT STATUS:"
git branch | grep "^\*"
echo "Status:" 
git status --porcelain | head -10

echo ""
echo "3. 🖥️  RUNNING SERVERS:"
ps aux | grep -E "(ng serve|npm|vite)" | grep -v grep | while read line; do
  echo "  $line"
done

echo ""
echo "4. 🌐 APPLICATION CHECKS:"

# Check React app (THE REAL ONE)
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "  ✅ React App (localhost:5173): RUNNING - THIS IS THE REAL HARMONIC ORACLE"
  echo "     Title: $(curl -s http://localhost:5173 | grep -o '<title>[^<]*' | sed 's/<title>//')"
else
  echo "  ❌ React App (localhost:5173): NOT RUNNING"
fi

# Check Angular app (IGNORE THIS)
if curl -s http://localhost:4200 > /dev/null 2>&1; then
  echo "  🔴 Angular App (localhost:4200): RUNNING - IGNORE THIS (Old Novaxe app)"
else
  echo "  ⚪ Angular App (localhost:4200): NOT RUNNING"
fi

echo ""
echo "5. 📁 REACT APP FILES:"
if [ -f "src/App.tsx" ]; then
  echo "  ✅ src/App.tsx exists"
  echo "     Content preview:"
  head -5 src/App.tsx | sed 's/^/     /'
else
  echo "  ❌ src/App.tsx NOT FOUND"
fi

if [ -f "src/pages/MillionSongMind.tsx" ]; then
  echo "  ✅ src/pages/MillionSongMind.tsx exists"
else
  echo "  ❌ src/pages/MillionSongMind.tsx NOT FOUND"
fi

echo ""
echo "=================================="
echo "🎯 SUMMARY:"
echo "- FOCUS ON: React app (localhost:5173)"
echo "- IGNORE: Angular app (localhost:4200)" 
echo "- ALWAYS ASK LOVABLE about current status"
echo "- NEVER ASSUME progress or state"
echo "=================================="