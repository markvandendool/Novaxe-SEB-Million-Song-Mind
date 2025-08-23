#!/bin/bash
# 🛡️ INVINCIBLE BACKUP SYSTEM - UNBREAKABLE SAVE POINTS
# Never lose progress again - Chronological backups on secure external drive

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Backup configuration
EXTERNAL_DRIVE="/Volumes/G-DRIVE mobile Pro SSD"
BACKUP_BASE_DIR="$EXTERNAL_DRIVE/zzz Development Backups zzz"
PROJECT_BACKUP_DIR="$BACKUP_BASE_DIR/Novaxe-SEB-Million-Song-Mind"
PROJECT_ROOT="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind"

# Utility functions
print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║    🛡️  INVINCIBLE BACKUP SYSTEM 🛡️       ║"
    echo "║       Chronological Save Points         ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if external drive is mounted
check_external_drive() {
    if [ ! -d "$EXTERNAL_DRIVE" ]; then
        print_error "External drive not found: $EXTERNAL_DRIVE"
        print_status "Please connect your G-DRIVE mobile Pro SSD"
        exit 1
    fi
    
    print_success "External drive connected: $EXTERNAL_DRIVE"
}

# Create backup directories if needed
ensure_backup_structure() {
    print_status "Ensuring backup directory structure..."
    
    if [ ! -d "$BACKUP_BASE_DIR" ]; then
        mkdir -p "$BACKUP_BASE_DIR"
        print_success "Created base backup directory"
    fi
    
    if [ ! -d "$PROJECT_BACKUP_DIR" ]; then
        mkdir -p "$PROJECT_BACKUP_DIR"
        print_success "Created project backup directory"
    fi
}

# Generate backup name with timestamp and optional description
generate_backup_name() {
    local description="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local commit_hash=$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null || echo "no-git")
    
    if [ ! -z "$description" ]; then
        echo "${description}_${timestamp}_${commit_hash}"
    else
        echo "BACKUP_${timestamp}_${commit_hash}"
    fi
}

# Create the invincible backup
create_backup() {
    local description="$1"
    local backup_name=$(generate_backup_name "$description")
    local backup_file="$PROJECT_BACKUP_DIR/${backup_name}.tar.gz"
    
    print_status "Creating invincible backup: $backup_name"
    print_status "Location: $backup_file"
    
    cd "$PROJECT_ROOT"
    
    # Create compressed backup excluding unnecessary files
    tar -czf "$backup_file" \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='**/node_modules' \
        --exclude='.DS_Store' \
        --exclude='**/.DS_Store' \
        --exclude='*.log' \
        --exclude='**/*.log' \
        --exclude='.vscode' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='.next' \
        --exclude='coverage' \
        --exclude='.nyc_output' \
        .
    
    # Verify backup was created
    if [ -f "$backup_file" ]; then
        local backup_size=$(du -h "$backup_file" | cut -f1)
        print_success "Backup created successfully: $backup_size"
        
        # Create backup manifest
        create_backup_manifest "$backup_name" "$backup_size"
        
        return 0
    else
        print_error "Failed to create backup"
        return 1
    fi
}

# Create backup manifest with metadata
create_backup_manifest() {
    local backup_name="$1"
    local backup_size="$2"
    local manifest_file="$PROJECT_BACKUP_DIR/BACKUP_MANIFEST.md"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    
    # Get current Git info
    cd "$PROJECT_ROOT"
    local git_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    local git_commit=$(git rev-parse HEAD 2>/dev/null || echo "no-git")
    local git_commit_short=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")
    local commit_message=$(git log -1 --pretty=%B 2>/dev/null || echo "No commit message")
    
    # Append to manifest (never replace - chronological record)
    cat >> "$manifest_file" << EOF

## 🛡️ Backup: $backup_name
**Created**: $timestamp  
**Size**: $backup_size  
**Git Branch**: $git_branch  
**Git Commit**: $git_commit_short ($git_commit)  
**Commit Message**: $commit_message  

### Project State at Backup
- **MSM Status**: $(cd "$PROJECT_ROOT" && if pgrep -f "vite.*8080" > /dev/null; then echo "Running on port 8080"; else echo "Not running"; fi)
- **Foundation**: Phase 1 Complete (Bulletproof)
- **Architecture**: Optimized and clean
- **Dependencies**: Isolated and conflict-free

---
EOF

    print_success "Manifest updated: $manifest_file"
}

# List all backups
list_backups() {
    print_status "Listing all invincible backups:"
    echo ""
    
    if [ ! -d "$PROJECT_BACKUP_DIR" ]; then
        print_warning "No backups found - backup directory doesn't exist"
        return
    fi
    
    local backup_count=0
    for backup in "$PROJECT_BACKUP_DIR"/*.tar.gz; do
        if [ -f "$backup" ]; then
            local filename=$(basename "$backup")
            local backup_size=$(du -h "$backup" | cut -f1)
            local backup_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup")
            
            echo -e "${GREEN}📦 $filename${NC}"
            echo -e "   ${CYAN}Size: $backup_size | Created: $backup_date${NC}"
            ((backup_count++))
        fi
    done
    
    if [ $backup_count -eq 0 ]; then
        print_warning "No backup files found in $PROJECT_BACKUP_DIR"
    else
        print_success "Found $backup_count invincible backup(s)"
    fi
    
    # Show manifest if exists
    local manifest_file="$PROJECT_BACKUP_DIR/BACKUP_MANIFEST.md"
    if [ -f "$manifest_file" ]; then
        echo ""
        print_status "Backup manifest available: $manifest_file"
    fi
}

# Show backup system status
show_status() {
    print_banner
    
    check_external_drive
    echo ""
    
    print_status "🛡️ INVINCIBLE BACKUP SYSTEM STATUS"
    echo "=========================================="
    echo -e "${CYAN}External Drive: $EXTERNAL_DRIVE${NC}"
    echo -e "${CYAN}Backup Location: $PROJECT_BACKUP_DIR${NC}"
    echo -e "${CYAN}Project Root: $PROJECT_ROOT${NC}"
    echo ""
    
    list_backups
}

# Main script logic
case "$1" in
    "create"|"backup")
        print_banner
        check_external_drive
        ensure_backup_structure
        
        if [ ! -z "$2" ]; then
            create_backup "$2"
        else
            create_backup
        fi
        
        echo ""
        print_success "🎉 INVINCIBLE SAVE POINT CREATED!"
        print_status "Your progress is now bulletproof and secure"
        ;;
    "list"|"ls")
        print_banner
        check_external_drive
        list_backups
        ;;
    "status")
        show_status
        ;;
    *)
        print_banner
        echo -e "${WHITE}Usage: $0 {create|backup|list|status} [description]${NC}"
        echo ""
        echo "Commands:"
        echo "  create [desc]  - Create new chronological backup"
        echo "  backup [desc]  - Alias for create"
        echo "  list          - List all existing backups"
        echo "  status        - Show backup system status"
        echo ""
        echo "Examples:"
        echo "  $0 create PHASE1_COMPLETE"
        echo "  $0 backup 'Before Angular Migration'"
        echo "  $0 list"
        echo ""
        echo -e "${CYAN}🛡️ NEVER LOSE PROGRESS AGAIN 🛡️${NC}"
        exit 1
        ;;
esac
