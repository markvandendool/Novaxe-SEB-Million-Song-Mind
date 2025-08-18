#!/bin/bash
# 🚨 AUTOMATED BROWSER LAUNCH & VERIFICATION PROTOCOL
# UNBREAKABLE RULE: Every dev server launch MUST include automated browser verification

set -e

LOCALHOST_URL="$1"
APP_NAME="$2"
EXPECTED_TITLE="$3"

if [ -z "$LOCALHOST_URL" ]; then
    echo "❌ ERROR: Usage: ./LAUNCH_AND_VERIFY.sh <localhost_url> <app_name> [expected_title]"
    echo "Example: ./LAUNCH_AND_VERIFY.sh http://localhost:4200 'Novaxe Angular 11' 'Novaxe'"
    exit 1
fi

echo "🚀 AUTOMATED BROWSER LAUNCH & VERIFICATION PROTOCOL"
echo "📍 Target: $LOCALHOST_URL"
echo "📱 App: $APP_NAME"
echo ""

# Step 1: Launch browser and capture initial response
echo "1️⃣ LAUNCHING BROWSER TO: $LOCALHOST_URL"
open "$LOCALHOST_URL"

# Step 2: Wait for potential loading time
echo "2️⃣ WAITING FOR APPLICATION TO LOAD (5 seconds)..."
sleep 5

# Step 3: Verify connection with curl
echo "3️⃣ VERIFYING CONNECTION WITH CURL:"
if curl -f -s "$LOCALHOST_URL" > /dev/null; then
    echo "✅ CURL SUCCESS: $LOCALHOST_URL is responding"
else
    echo "❌ CURL FAILED: $LOCALHOST_URL is not responding"
    echo "🔍 Attempting detailed curl check:"
    curl -v "$LOCALHOST_URL" 2>&1 | head -20
    echo ""
    echo "❌ CRITICAL FAILURE: Site cannot be reached"
    echo "🚨 UNBREAKABLE RULE VIOLATION: Dev server not accessible"
    exit 1
fi

# Step 4: Get page content and verify it loaded
echo "4️⃣ FETCHING PAGE CONTENT:"
PAGE_CONTENT=$(curl -s "$LOCALHOST_URL")
CONTENT_LENGTH=${#PAGE_CONTENT}

if [ "$CONTENT_LENGTH" -lt 100 ]; then
    echo "❌ WARNING: Page content suspiciously short ($CONTENT_LENGTH characters)"
    echo "📄 Content received:"
    echo "$PAGE_CONTENT"
else
    echo "✅ Page content received: $CONTENT_LENGTH characters"
fi

# Step 5: Check for common error patterns
echo "5️⃣ SCANNING FOR ERROR PATTERNS:"
if echo "$PAGE_CONTENT" | grep -qi "cannot.*reach\|not.*found\|error.*404\|connection.*refused"; then
    echo "❌ ERROR PATTERNS DETECTED IN PAGE CONTENT"
    echo "$PAGE_CONTENT"
    exit 1
else
    echo "✅ No obvious error patterns found in content"
fi

# Step 6: Use osascript to interact with browser for console errors (macOS specific)
echo "6️⃣ ATTEMPTING TO CAPTURE BROWSER CONSOLE ERRORS:"

# Create a temporary AppleScript to check browser console
cat > /tmp/check_console.scpt << 'EOF'
tell application "Safari"
    activate
    delay 2
    tell application "System Events"
        key code 49 using {command down, option down} -- Cmd+Option+I (Inspector)
        delay 2
        key code 9 using command down -- Cmd+R (Refresh)
        delay 3
    end tell
end tell
EOF

# Try to run console check (may fail on some systems)
if command -v osascript >/dev/null 2>&1; then
    echo "📊 Attempting automated console inspection..."
    osascript /tmp/check_console.scpt 2>/dev/null || echo "⚠️  Console automation failed (manual inspection may be needed)"
    rm -f /tmp/check_console.scpt
else
    echo "⚠️  osascript not available - manual console inspection recommended"
fi

# Step 7: Final verification message
echo ""
echo "7️⃣ VERIFICATION COMPLETE:"
echo "✅ Browser launched to: $LOCALHOST_URL"
echo "✅ Connection verified with curl"
echo "✅ Page content received ($CONTENT_LENGTH chars)"
echo "✅ No obvious error patterns detected"
echo ""
echo "🎯 MANUAL VERIFICATION REQUIRED:"
echo "👁️  VISUALLY CONFIRM: Browser window shows $APP_NAME correctly loaded"
echo "🔍 CONSOLE CHECK: Right-click → Inspect → Console tab for any red errors"
echo ""

# Step 8: Interactive confirmation
read -p "❓ Does the page load correctly in the browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ VERIFICATION SUCCESS: $APP_NAME is running correctly on $LOCALHOST_URL"
    echo "🎖️ UNBREAKABLE RULE SATISFIED: Browser launch and verification complete"
else
    echo "❌ VERIFICATION FAILED: Page did not load correctly"
    echo "🚨 UNBREAKABLE RULE VIOLATION: Manual troubleshooting required"
    exit 1
fi
