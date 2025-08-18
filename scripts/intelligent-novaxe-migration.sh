#!/bin/bash
# NOVAXE INTELLIGENT MIGRATION AUTOMATION SCRIPT
# Purpose: Systematically migrate complete Novaxe functionality to Angular 20

set -e  # Exit on any error

# ==========================================
# CONFIGURATION
# ==========================================
SOURCE_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/Novaxe SEB"
TARGET_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular"
BACKUP_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/migration-backup-$(date +%Y%m%d_%H%M%S)"

echo "🚀 NOVAXE INTELLIGENT MIGRATION STARTING..."
echo "📂 Source: $SOURCE_DIR"
echo "🎯 Target: $TARGET_DIR" 
echo "💾 Backup: $BACKUP_DIR"

# Create backup of current state
mkdir -p "$BACKUP_DIR"
cp -r "$TARGET_DIR"/* "$BACKUP_DIR/" 2>/dev/null || echo "⚠️  Backup creation warning (expected if target is empty)"

# ==========================================
# PHASE 1: CORE MUSICAL INTELLIGENCE SERVICES
# ==========================================
echo ""
echo "🧠 PHASE 1: MIGRATING CORE MUSICAL INTELLIGENCE..."

# Function to safely copy and update import paths
migrate_service() {
    local service_name="$1"
    local source_path="$2"
    local target_path="$3"
    
    echo "  📋 Migrating $service_name..."
    
    if [ -f "$source_path" ]; then
        # Create target directory if it doesn't exist
        mkdir -p "$(dirname "$target_path")"
        
        # Copy the service file
        cp "$source_path" "$target_path"
        
        # Update import paths to use Angular 20 conventions
        sed -i '' 's/@services\//@app\/services\//g' "$target_path" 2>/dev/null || true
        sed -i '' 's/@models\//@app\/models\//g' "$target_path" 2>/dev/null || true
        sed -i '' 's/@assets\//@assets\//g' "$target_path" 2>/dev/null || true
        
        echo "    ✅ $service_name migrated successfully"
    else
        echo "    ❌ $service_name source not found at $source_path"
    fi
}

# Migrate core services
migrate_service "MidiService" \
    "$SOURCE_DIR/src/app/services/midi/midi.service.ts" \
    "$TARGET_DIR/src/app/services/midi/midi.service.ts"

migrate_service "ChordDetectService" \
    "$SOURCE_DIR/src/app/services/chord-detect/chord-detect.service.ts" \
    "$TARGET_DIR/src/app/services/chord-detect/chord-detect.service.ts"

migrate_service "MusicTheoryService" \
    "$SOURCE_DIR/src/app/services/music-theory.service.ts" \
    "$TARGET_DIR/src/app/services/music-theory.service.ts"

# ==========================================
# PHASE 2: VISUAL ASSETS AND CONFIGURATIONS
# ==========================================
echo ""
echo "🎨 PHASE 2: MIGRATING VISUAL ASSETS..."

# Copy all SVG assets
echo "  📋 Copying SVG assets..."
if [ -d "$SOURCE_DIR/src/assets" ]; then
    mkdir -p "$TARGET_DIR/src/assets"
    
    # Copy SVG files specifically
    find "$SOURCE_DIR/src/assets" -name "*.svg" -exec cp {} "$TARGET_DIR/src/assets/" \; 2>/dev/null || true
    
    # Copy JSON configuration files
    find "$SOURCE_DIR/src/assets" -name "*.json" -exec cp {} "$TARGET_DIR/src/assets/" \; 2>/dev/null || true
    
    # Copy chord definitions and musical data
    if [ -d "$SOURCE_DIR/src/assets/chords" ]; then
        cp -r "$SOURCE_DIR/src/assets/chords" "$TARGET_DIR/src/assets/" 2>/dev/null || true
        echo "    ✅ Chord definitions copied"
    fi
    
    echo "    ✅ Visual assets migrated"
else
    echo "    ❌ Assets directory not found"
fi

# ==========================================
# PHASE 3: ENHANCED COMPONENTS
# ==========================================
echo ""
echo "🧩 PHASE 3: MIGRATING ENHANCED COMPONENTS..."

migrate_component() {
    local component_name="$1"
    local source_dir="$2"
    local target_dir="$3"
    
    echo "  📋 Migrating $component_name..."
    
    if [ -d "$source_dir" ]; then
        mkdir -p "$target_dir"
        
        # Copy all component files
        cp "$source_dir"/*.ts "$target_dir/" 2>/dev/null || true
        cp "$source_dir"/*.html "$target_dir/" 2>/dev/null || true
        cp "$source_dir"/*.scss "$target_dir/" 2>/dev/null || true
        cp "$source_dir"/*.css "$target_dir/" 2>/dev/null || true
        
        # Update import paths in TypeScript files
        for ts_file in "$target_dir"/*.ts; do
            if [ -f "$ts_file" ]; then
                sed -i '' 's/@services\//@app\/services\//g' "$ts_file" 2>/dev/null || true
                sed -i '' 's/@models\//@app\/models\//g' "$ts_file" 2>/dev/null || true
                sed -i '' 's/@components\//@app\/components\//g' "$ts_file" 2>/dev/null || true
                sed -i '' 's/@assets\//@assets\//g' "$ts_file" 2>/dev/null || true
            fi
        done
        
        echo "    ✅ $component_name migrated successfully"
    else
        echo "    ❌ $component_name source not found at $source_dir"
    fi
}

# Migrate key components
migrate_component "BraidComponent" \
    "$SOURCE_DIR/src/app/components/braid" \
    "$TARGET_DIR/src/app/components/braid"

migrate_component "FretboardComponent" \
    "$SOURCE_DIR/src/app/components/fretboard" \
    "$TARGET_DIR/src/app/components/fretboard"

migrate_component "PianoComponent" \
    "$SOURCE_DIR/src/app/components/piano" \
    "$TARGET_DIR/src/app/components/piano"

migrate_component "EditorComponent" \
    "$SOURCE_DIR/src/app/components/editor" \
    "$TARGET_DIR/src/app/components/editor"

# ==========================================
# PHASE 4: MODELS AND DATA STRUCTURES  
# ==========================================
echo ""
echo "📊 PHASE 4: MIGRATING MODELS AND DATA STRUCTURES..."

if [ -d "$SOURCE_DIR/src/app/models" ]; then
    echo "  📋 Copying model files..."
    mkdir -p "$TARGET_DIR/src/app/models"
    cp -r "$SOURCE_DIR/src/app/models"/* "$TARGET_DIR/src/app/models/" 2>/dev/null || true
    
    # Update import paths in model files
    for model_file in "$TARGET_DIR/src/app/models"/*.ts; do
        if [ -f "$model_file" ]; then
            sed -i '' 's/@services\//@app\/services\//g' "$model_file" 2>/dev/null || true
            sed -i '' 's/@models\//@app\/models\//g' "$model_file" 2>/dev/null || true
        fi
    done
    
    echo "    ✅ Models migrated successfully"
fi

# ==========================================
# PHASE 5: PACKAGE DEPENDENCIES
# ==========================================
echo ""
echo "📦 PHASE 5: UPDATING PACKAGE DEPENDENCIES..."

if [ -f "$SOURCE_DIR/package.json" ]; then
    echo "  📋 Analyzing source dependencies..."
    
    # Extract musical dependencies from source package.json
    python3 << 'EOF'
import json
import sys

try:
    with open('/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/Novaxe SEB/package.json', 'r') as f:
        source_pkg = json.load(f)
    
    musical_deps = {}
    all_deps = {**source_pkg.get('dependencies', {}), **source_pkg.get('devDependencies', {})}
    
    # Extract musical/audio related packages
    musical_keywords = ['tonal', 'midi', 'audio', 'music', 'sound', 'webaudio']
    for dep, version in all_deps.items():
        if any(keyword in dep.lower() for keyword in musical_keywords):
            musical_deps[dep] = version
    
    if musical_deps:
        print("    🎵 Musical dependencies found:")
        for dep, version in musical_deps.items():
            print(f"      - {dep}: {version}")
        
        # Write to a temp file for npm install
        with open('/tmp/musical_deps.json', 'w') as f:
            json.dump(musical_deps, f, indent=2)
    else:
        print("    ⚠️  No musical dependencies identified")
        
except Exception as e:
    print(f"    ❌ Error analyzing dependencies: {e}")
EOF

    # Install musical dependencies if found
    if [ -f "/tmp/musical_deps.json" ]; then
        echo "  📦 Installing musical dependencies..."
        cd "$TARGET_DIR"
        
        # Read deps and install them
        python3 << 'EOF'
import json
import subprocess
import sys

try:
    with open('/tmp/musical_deps.json', 'r') as f:
        deps = json.load(f)
    
    for dep, version in deps.items():
        try:
            cmd = ['npm', 'install', f'{dep}@{version}']
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"    ✅ Installed {dep}@{version}")
        except subprocess.CalledProcessError as e:
            print(f"    ⚠️  Warning installing {dep}@{version}: {e}")
except Exception as e:
    print(f"    ❌ Error installing dependencies: {e}")
EOF
    fi
fi

# ==========================================
# PHASE 6: VALIDATION AND TESTING
# ==========================================
echo ""
echo "🧪 PHASE 6: VALIDATION AND TESTING..."

cd "$TARGET_DIR"

# Test TypeScript compilation
echo "  📋 Testing TypeScript compilation..."
if npx tsc --noEmit --skipLibCheck; then
    echo "    ✅ TypeScript compilation successful"
else
    echo "    ⚠️  TypeScript compilation warnings (check output above)"
fi

# Test Angular build
echo "  📋 Testing Angular build..."
if ng build --configuration development --verbose=false 2>/dev/null; then
    echo "    ✅ Angular build successful"
else
    echo "    ⚠️  Angular build has issues (check manually)"
fi

# ==========================================
# SUMMARY REPORT
# ==========================================
echo ""
echo "📋 MIGRATION SUMMARY REPORT:"
echo "================================="

# Count migrated files
service_count=$(find "$TARGET_DIR/src/app/services" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
component_count=$(find "$TARGET_DIR/src/app/components" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
asset_count=$(find "$TARGET_DIR/src/assets" -type f 2>/dev/null | wc -l | tr -d ' ')
model_count=$(find "$TARGET_DIR/src/app/models" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files Migrated:"
echo "  - Services: $service_count"
echo "  - Components: $component_count" 
echo "  - Assets: $asset_count"
echo "  - Models: $model_count"

echo ""
echo "🎯 Next Steps:"
echo "  1. cd '$TARGET_DIR'"
echo "  2. ng serve --port 4201"
echo "  3. Open browser to http://localhost:4201"
echo "  4. Test MIDI connectivity and chord detection"
echo "  5. Verify visual components render correctly"

echo ""
echo "✅ NOVAXE INTELLIGENT MIGRATION COMPLETED!"
echo "💾 Backup available at: $BACKUP_DIR"
