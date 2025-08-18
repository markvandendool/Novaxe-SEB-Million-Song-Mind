#!/bin/bash

# CRITICAL WORK BACKUP SCRIPT
# Ensures all current work is preserved and never lost

echo "🛡️ BACKING UP CURRENT WORK - NEVER LOSE AGAIN"
echo "=============================================="

# Create timestamped backup directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="local_backups/work_backup_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in: $BACKUP_DIR"

# Backup critical work files
echo "📋 Backing up critical files..."

# Typography and theme files
cp src/index.css "$BACKUP_DIR/index.css"
cp tailwind.config.ts "$BACKUP_DIR/tailwind.config.ts" 2>/dev/null || cp tailwind.config.js "$BACKUP_DIR/tailwind.config.js" 2>/dev/null

# Braid system files
mkdir -p "$BACKUP_DIR/braid"
cp src/components/braid/BraidTonal.tsx "$BACKUP_DIR/braid/" 2>/dev/null
cp src/components/braid/BraidTonal.css "$BACKUP_DIR/braid/" 2>/dev/null
cp src/components/braid/BraidNew2.tsx "$BACKUP_DIR/braid/" 2>/dev/null
cp public/assets/braid_tonalities.json "$BACKUP_DIR/braid/" 2>/dev/null

# Core visualization components
cp src/components/YinYangCircle.tsx "$BACKUP_DIR/" 2>/dev/null
cp src/components/BraidExact.tsx "$BACKUP_DIR/" 2>/dev/null
cp src/components/BraidView.tsx "$BACKUP_DIR/" 2>/dev/null

# Analysis engines
cp src/components/VIPER_ULTIMATE_UNIFIED.py "$BACKUP_DIR/" 2>/dev/null
cp src/utils/cpmlParser.ts "$BACKUP_DIR/" 2>/dev/null

# Configuration files
cp package.json "$BACKUP_DIR/"
cp vite.config.ts "$BACKUP_DIR/" 2>/dev/null
cp postcss.config.js "$BACKUP_DIR/" 2>/dev/null

# Documentation
cp CRITICAL_WORK_RECOVERY_DOCUMENTATION.md "$BACKUP_DIR/" 2>/dev/null
cp DAILY_WORK_LOG_RECOVERY.md "$BACKUP_DIR/" 2>/dev/null

# Git status and log
git status > "$BACKUP_DIR/git_status.txt"
git log --oneline -20 > "$BACKUP_DIR/git_log.txt"
git diff > "$BACKUP_DIR/git_diff.txt" 2>/dev/null

# Create manifest
echo "BACKUP MANIFEST - $TIMESTAMP" > "$BACKUP_DIR/MANIFEST.txt"
echo "================================" >> "$BACKUP_DIR/MANIFEST.txt"
echo "Typography System: src/index.css, tailwind.config.*" >> "$BACKUP_DIR/MANIFEST.txt"
echo "Braid System: BraidTonal.tsx, braid_tonalities.json" >> "$BACKUP_DIR/MANIFEST.txt"
echo "YinYang Scaling: YinYangCircle.tsx (Lovable implementation)" >> "$BACKUP_DIR/MANIFEST.txt"
echo "VIPER ROSE: VIPER_ULTIMATE_UNIFIED.py" >> "$BACKUP_DIR/MANIFEST.txt"
echo "Data Pipeline: cpmlParser.ts" >> "$BACKUP_DIR/MANIFEST.txt"
echo "Documentation: CRITICAL_WORK_RECOVERY_DOCUMENTATION.md" >> "$BACKUP_DIR/MANIFEST.txt"

echo "✅ Backup completed successfully!"
echo "📍 Location: $BACKUP_DIR"
echo "📋 Files backed up:"
ls -la "$BACKUP_DIR"

echo ""
echo "🔒 WORK IS SECURE - NEVER LOSE AGAIN!"
echo "=============================================="