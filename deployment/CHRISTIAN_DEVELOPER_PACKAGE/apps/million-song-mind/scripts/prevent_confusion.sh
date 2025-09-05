#!/bin/bash

echo "🔍 CLAUDE CONFUSION PREVENTION CHECK"
echo "===================================="

# Current state
echo "📍 LOCATION: $(pwd)"
echo "🌿 BRANCH: $(git branch --show-current 2>/dev/null || echo 'No git repo')"

# Application type detection
if [ -f "angular.json" ]; then
  echo "🚨 ANGULAR APP DETECTED - This might be the OLD Novaxe app"
  echo "❌ CLAUDE: DO NOT WORK ON ANGULAR - SWITCH TO REACT"
fi

if [ -f "vite.config.ts" ]; then
  echo "✅ VITE/REACT APP DETECTED - This is likely the REAL Harmonic Oracle"
  echo "✅ CLAUDE: This is probably the correct application"
fi

# Check what's running
echo ""
echo "🖥️ RUNNING SERVERS:"
ps aux | grep -E "(ng serve|npm|vite)" | grep -v grep | while read line; do
  echo "  $line"
done

# Port verification
echo ""
echo "🌐 PORT STATUS:"
for port in 4200 5173 8080 3000; do
  if curl -s --connect-timeout 2 http://localhost:$port >/dev/null 2>&1; then
    echo "  ✅ Port $port: ACTIVE"
  else
    echo "  ❌ Port $port: INACTIVE"
  fi
done

echo ""
echo "🎯 CLAUDE INSTRUCTIONS:"
echo "- If you see Angular (port 4200): IGNORE IT"
echo "- Focus on React/Vite app (port 5173 or 8080)"
echo "- REAL Harmonic Oracle: Million Song Mind title"
echo "- ALWAYS verify current state before making assumptions"
echo "- ASK USER about current status if unsure"

echo "===================================="