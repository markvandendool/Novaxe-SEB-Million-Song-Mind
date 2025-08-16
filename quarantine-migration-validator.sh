#!/bin/bash
# quarantine-migration-validator.sh
# SURGICAL MIGRATION TESTING FRAMEWORK

set -e  # Exit on any error

# Configuration
QUARANTINE_DIR="/Users/markvandendool/QUARANTINE_MIGRATION_LAB"
ORIGINAL_NOVAXE="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"
LOG_FILE="$QUARANTINE_DIR/migration-forensic-log.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Function: Setup quarantine environment
setup_quarantine() {
    local component_name=$1
    local angular_version=$2
    
    log "Setting up quarantine environment for $component_name (Angular $angular_version)"
    
    # Create isolated directory
    mkdir -p "$QUARANTINE_DIR/ng${angular_version}-test"
    cd "$QUARANTINE_DIR/ng${angular_version}-test"
    
    # Create minimal Angular project
    if [ ! -d "quarantine-test" ]; then
        log "Creating fresh Angular $angular_version project..."
        ng new quarantine-test --version="$angular_version" --routing=false --style=scss --skip-git --minimal --skip-tests
        cd quarantine-test
    else
        cd quarantine-test
        log "Using existing Angular project"
    fi
    
    # Copy essential files from original Novaxe
    log "Copying component and dependencies..."
    mkdir -p "src/app/components"
    cp -r "$ORIGINAL_NOVAXE/src/app/components/$component_name" "src/app/components/" 2>/dev/null || {
        error "Failed to copy component $component_name"
        return 1
    }
    
    # Copy essential services and models (minimal dependencies)
    mkdir -p "src/app/services" "src/app/models"
    cp -r "$ORIGINAL_NOVAXE/src/app/services"/* "src/app/services/" 2>/dev/null || log "No services to copy"
    cp -r "$ORIGINAL_NOVAXE/src/app/models"/* "src/app/models/" 2>/dev/null || log "No models to copy"
    
    success "Quarantine environment setup complete"
}

# Function: Calculate component metrics
calculate_baseline_metrics() {
    local component_path=$1
    
    log "Calculating baseline metrics for component..."
    
    # Line count
    local line_count=$(find "$component_path" -name "*.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')
    
    # Dependency count
    local import_count=$(find "$component_path" -name "*.ts" -exec grep -c "^import" {} + 2>/dev/null | awk '{sum+=$1} END {print sum}')
    
    # File count
    local file_count=$(find "$component_path" -name "*.ts" | wc -l)
    
    echo "BASELINE_METRICS_START" >> "$LOG_FILE"
    echo "COMPONENT_LINES=$line_count" >> "$LOG_FILE"
    echo "IMPORT_COUNT=$import_count" >> "$LOG_FILE"
    echo "FILE_COUNT=$file_count" >> "$LOG_FILE"
    echo "BASELINE_METRICS_END" >> "$LOG_FILE"
    
    log "Baseline: $line_count lines, $import_count imports, $file_count files"
}

# Function: Run build validation
validate_build() {
    log "Running build validation..."
    
    # Clean install
    npm ci > /dev/null 2>&1 || {
        error "npm ci failed"
        return 1
    }
    
    # Build test
    local build_start=$(date +%s)
    if ng build --configuration production > build.log 2>&1; then
        local build_end=$(date +%s)
        local build_time=$((build_end - build_start))
        success "Build completed in ${build_time}s"
        
        # Calculate bundle size
        local bundle_size=$(find dist/ -name "*.js" -exec stat -f%z {} + | awk '{sum+=$1} END {print sum}')
        log "Bundle size: $bundle_size bytes"
        
        echo "BUILD_SUCCESS=true" >> "$LOG_FILE"
        echo "BUILD_TIME=${build_time}" >> "$LOG_FILE"
        echo "BUNDLE_SIZE=${bundle_size}" >> "$LOG_FILE"
        return 0
    else
        error "Build failed"
        cat build.log | tail -20 | tee -a "$LOG_FILE"
        echo "BUILD_SUCCESS=false" >> "$LOG_FILE"
        return 1
    fi
}

# Function: Run test validation
validate_tests() {
    log "Running test validation..."
    
    if ng test --watch=false --browsers=ChromeHeadless > test.log 2>&1; then
        local test_count=$(grep -c "✓" test.log || echo "0")
        local failure_count=$(grep -c "✗" test.log || echo "0")
        
        if [ "$failure_count" -eq 0 ]; then
            success "All $test_count tests passed"
            echo "TEST_SUCCESS=true" >> "$LOG_FILE"
            echo "TEST_COUNT=${test_count}" >> "$LOG_FILE"
            return 0
        else
            error "$failure_count tests failed"
            echo "TEST_SUCCESS=false" >> "$LOG_FILE"
            return 1
        fi
    else
        error "Test execution failed"
        cat test.log | tail -10 | tee -a "$LOG_FILE"
        echo "TEST_SUCCESS=false" >> "$LOG_FILE"
        return 1
    fi
}

# Function: Validate TypeScript compilation
validate_typescript() {
    log "Running TypeScript validation..."
    
    if npx tsc --noEmit > ts.log 2>&1; then
        success "TypeScript compilation successful"
        echo "TYPESCRIPT_SUCCESS=true" >> "$LOG_FILE"
        return 0
    else
        error "TypeScript compilation failed"
        cat ts.log | tee -a "$LOG_FILE"
        echo "TYPESCRIPT_SUCCESS=false" >> "$LOG_FILE"
        return 1
    fi
}

# Function: Generate forensic report
generate_forensic_report() {
    local component_name=$1
    local from_version=$2
    local to_version=$3
    
    log "Generating forensic validation report..."
    
    local report_file="$QUARANTINE_DIR/FORENSIC_REPORT_${component_name}_${from_version}to${to_version}_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# FORENSIC MIGRATION VALIDATION REPORT

**Component**: $component_name
**Migration**: Angular $from_version → $to_version
**Date**: $(date)
**Environment**: Quarantine Lab

## VALIDATION RESULTS

$(grep "BUILD_SUCCESS\|TEST_SUCCESS\|TYPESCRIPT_SUCCESS" "$LOG_FILE" | while read line; do
    key=$(echo $line | cut -d'=' -f1)
    value=$(echo $line | cut -d'=' -f2)
    if [ "$value" = "true" ]; then
        echo "✅ $key: PASS"
    else
        echo "❌ $key: FAIL"
    fi
done)

## METRICS

$(grep "COMPONENT_LINES\|IMPORT_COUNT\|FILE_COUNT\|BUILD_TIME\|BUNDLE_SIZE\|TEST_COUNT" "$LOG_FILE" | while read line; do
    key=$(echo $line | cut -d'=' -f1)
    value=$(echo $line | cut -d'=' -f2)
    echo "- $key: $value"
done)

## RECOMMENDATIONS

EOF

    # Add pass/fail recommendation
    if grep -q "BUILD_SUCCESS=false\|TEST_SUCCESS=false\|TYPESCRIPT_SUCCESS=false" "$LOG_FILE"; then
        echo "❌ **DO NOT PROCEED**: Validation failures detected" >> "$report_file"
        echo "" >> "$report_file"
        echo "**Required Actions:**" >> "$report_file"
        echo "1. Fix all compilation errors" >> "$report_file"
        echo "2. Ensure all tests pass" >> "$report_file"
        echo "3. Re-run quarantine validation" >> "$report_file"
    else
        echo "✅ **SAFE TO PROCEED**: All validations passed" >> "$report_file"
        echo "" >> "$report_file"
        echo "**Next Steps:**" >> "$report_file"
        echo "1. Test next component in migration queue" >> "$report_file"
        echo "2. Proceed to Angular $(($to_version + 1)) when ready" >> "$report_file"
    fi
    
    success "Forensic report generated: $report_file"
    echo "FORENSIC_REPORT=$report_file" >> "$LOG_FILE"
}

# Main execution function
main() {
    local component_name=${1:-"scale-selector"}
    local from_version=${2:-11}
    local to_version=${3:-12}
    
    log "🧪 QUARANTINE MIGRATION VALIDATION STARTING"
    log "Component: $component_name"
    log "Migration: Angular $from_version → $to_version"
    
    # Initialize log
    echo "QUARANTINE_VALIDATION_SESSION_START=$(date)" > "$LOG_FILE"
    echo "COMPONENT=$component_name" >> "$LOG_FILE"
    echo "FROM_VERSION=$from_version" >> "$LOG_FILE"
    echo "TO_VERSION=$to_version" >> "$LOG_FILE"
    
    # Create quarantine directory
    mkdir -p "$QUARANTINE_DIR"
    
    # Setup environment
    if ! setup_quarantine "$component_name" "$to_version"; then
        error "Failed to setup quarantine environment"
        exit 1
    fi
    
    # Calculate baseline metrics
    calculate_baseline_metrics "src/app/components/$component_name"
    
    # Run validations
    local validation_failed=false
    
    if ! validate_typescript; then
        validation_failed=true
    fi
    
    if ! validate_build; then
        validation_failed=true
    fi
    
    if ! validate_tests; then
        validation_failed=true
    fi
    
    # Generate report
    generate_forensic_report "$component_name" "$from_version" "$to_version"
    
    if [ "$validation_failed" = true ]; then
        error "QUARANTINE VALIDATION FAILED - DO NOT PROCEED TO FULL MIGRATION"
        exit 1
    else
        success "QUARANTINE VALIDATION PASSED - SAFE TO PROCEED"
        exit 0
    fi
}

# Script usage
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 <component-name> [from-version] [to-version]"
    echo "Example: $0 scale-selector 11 12"
    echo ""
    echo "Available components to test:"
    echo "  - scale-selector (simple, 147 lines)"
    echo "  - midi-selector (medium, ~200 lines)"
    echo "  - chords-browse (complex, ~400 lines)"
    exit 1
fi

# Execute main function with parameters
main "$@"
