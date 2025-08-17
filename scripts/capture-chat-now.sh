#!/bin/bash
# 🤖 MANUAL CHAT CAPTURE SCRIPT
# Captures current agent chats immediately

echo "🤖 MANUAL CHAT CAPTURE INITIATED"
echo "⏰ Time: $(date)"
echo "========================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if the chat logger script exists
SCRIPT_PATH="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/scripts/chat-logger.js"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Chat logger script not found at: $SCRIPT_PATH"
    exit 1
fi

# Run the chat logger
echo "🚀 Starting chat capture..."
node "$SCRIPT_PATH"

CAPTURE_RESULT=$?

echo "========================================"
if [ $CAPTURE_RESULT -eq 0 ]; then
    echo "✅ Manual capture completed successfully"
    echo "📁 Check: logs/Full Chat Logs/ for results"
    echo "📊 View capture log: logs/chat-capture.log"
else
    echo "❌ Manual capture encountered issues (exit code: $CAPTURE_RESULT)"
    echo "🔍 Check logs for error details"
fi

echo "⏰ Next automatic capture in 2 hours"
echo "🔄 Run this script anytime for immediate capture"
