#!/bin/bash

# Magic18 IDML Coordinate Extraction Script
# Extract precise coordinates for all Magic18 elements from IDML

cd "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/idml_analysis"

echo "=== MAGIC18 IDML COORDINATE EXTRACTION ==="
echo "Source: charts interactive for Copilot.idml"
echo "Target: Spread_u14a.xml (Pages 8-9 or 116-117)"
echo ""

# Extract all Magic18 rectangle elements with coordinates
sed -n '/<Rectangle.*magic18/,/<\/Rectangle>/p' Spreads/Spread_u14a.xml > magic18_rectangles.xml

# Parse each Magic18 element
echo "EXTRACTED COORDINATES:"
echo "======================"

grep -o 'magic18[^"]*\.svg' Spreads/Spread_u14a.xml | sort -u | while read svg_file; do
    echo "Processing: $svg_file"
    
    # Find the rectangle containing this SVG
    sed -n "/<Rectangle.*$svg_file/,/<\/Rectangle>/p" Spreads/Spread_u14a.xml | while IFS= read line; do
        if [[ $line =~ ItemTransform=\"([^\"]+)\" ]]; then
            transform="${BASH_REMATCH[1]}"
            echo "  Transform: $transform"
        fi
        if [[ $line =~ GeometricBounds=\"([^\"]+)\" ]]; then
            bounds="${BASH_REMATCH[1]}"
            echo "  Bounds: $bounds"
        fi
    done
    echo "  ---"
done

echo ""
echo "COORDINATE SYSTEM: IDML Points (1/72 inch)"
echo "CONVERSION: Multiply by 1.333 for pixels at 96dpi"
echo "EXTRACTION COMPLETE"
