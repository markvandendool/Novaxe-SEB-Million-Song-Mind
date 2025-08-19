#!/bin/bash

echo "🚀 LAUNCHING DUAL-MACHINE VIPER PROCESSING!"
echo "🖥️  Mac Pro (10.0.0.115): Processing rows 0-300,000"
echo "💻 Mac Studio (local): Processing rows 300,001+"
echo ""

# Launch Mac Pro processing in background
echo "🔄 Starting Mac Pro processing via SSH..."
ssh vandendool@10.0.0.115 "cd ~/Harmonic\ Oracle\ MacPro/untitled\ folder && python3 'Claude Viper Ultimate 2.0.py' --input chordonomicon_v2.csv --force" &
MAC_PRO_PID=$!

# Launch Mac Studio processing in background
echo "🔄 Starting Mac Studio processing locally..."
python "Claude Viper Ultimate 2.0.py" --input ../../chordonomicon_v2.csv --force &
MAC_STUDIO_PID=$!

echo "⏳ Both machines are now processing in parallel..."
echo "🖥️  Mac Pro PID: $MAC_PRO_PID"
echo "💻 Mac Studio PID: $MAC_STUDIO_PID"
echo ""

# Wait for both processes to complete
wait $MAC_PRO_PID
MAC_PRO_EXIT=$?

wait $MAC_STUDIO_PID
MAC_STUDIO_EXIT=$?

echo ""
echo "🎉 DUAL-MACHINE PROCESSING COMPLETE!"
echo "🖥️  Mac Pro exit code: $MAC_PRO_EXIT"
echo "💻 Mac Studio exit code: $MAC_STUDIO_EXIT"

if [ $MAC_PRO_EXIT -eq 0 ] && [ $MAC_STUDIO_EXIT -eq 0 ]; then
    echo "✅ Both machines completed successfully!"
    exit 0
else
    echo "❌ One or both machines failed!"
    exit 1
fi
