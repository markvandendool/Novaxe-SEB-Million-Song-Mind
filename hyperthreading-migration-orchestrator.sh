#!/bin/bash
# hyperthreading-migration-orchestrator.sh
# DIVIDE AND CONQUER MIGRATION STRATEGY

set -e

# Machine identification
MACHINE_TYPE=$(uname -m)
CORE_COUNT=$(sysctl -n hw.ncpu)

# Configuration
QUARANTINE_DIR="/Users/markvandendool/QUARANTINE_MIGRATION_LAB"
ORIGINAL_NOVAXE="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"
SYNC_DIR="/Users/markvandendool/MIGRATION_SYNC"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Determine machine role
identify_machine() {
    if [[ "$CORE_COUNT" -ge 20 ]]; then
        echo "MAC_PRO_BEAST"
    elif [[ "$CORE_COUNT" -ge 10 ]]; then
        echo "M2_MAX"
    else
        echo "UNKNOWN"
    fi
}

MACHINE_ROLE=$(identify_machine)

log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] [$MACHINE_ROLE]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ [$MACHINE_ROLE]${NC} $1"
}

error() {
    echo -e "${RED}❌ [$MACHINE_ROLE]${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️  [$MACHINE_ROLE]${NC} $1"
}

# Component queues based on machine capabilities
get_component_queue() {
    case $MACHINE_ROLE in
        "MAC_PRO_BEAST")
            # Heavy lifting: Complex components and build-intensive tasks
            echo "braid transport metro chords-browse midi-chord-detect-abc"
            ;;
        "M2_MAX")  
            # Fast iteration: Simple components and testing
            echo "scale-selector midi-selector chordstrip page-author page-album"
            ;;
        *)
            error "Unknown machine type - cannot assign component queue"
            exit 1
            ;;
    esac
}

# Angular version ranges by machine
get_version_range() {
    case $MACHINE_ROLE in
        "MAC_PRO_BEAST")
            # Handle the heavy versions (build-intensive)
            echo "11 12 13 14 15"
            ;;
        "M2_MAX")
            # Handle the newer versions (faster iteration)  
            echo "16 17 18 19 20"
            ;;
        *)
            error "Unknown machine type - cannot assign version range"
            exit 1
            ;;
    esac
}

# Setup sync directory for machine coordination
setup_sync_directory() {
    log "Setting up synchronization directory"
    
    mkdir -p "$SYNC_DIR"/{status,results,handoff}
    
    # Create machine status file
    cat > "$SYNC_DIR/status/${MACHINE_ROLE}_status.json" << EOF
{
    "machine": "$MACHINE_ROLE",
    "cores": $CORE_COUNT,
    "status": "initializing",
    "current_task": null,
    "started_at": "$(date -Iseconds)",
    "components_assigned": [$(get_component_queue | sed 's/ /", "/g' | sed 's/^/"/; s/$/"/')],
    "versions_assigned": [$(get_version_range | sed 's/ /, /g')]
}
EOF
    
    success "Sync directory setup complete"
}

# Update machine status
update_status() {
    local status=$1
    local task=${2:-"null"}
    
    # Use jq if available, otherwise manual JSON update
    if command -v jq >/dev/null 2>&1; then
        jq ".status = \"$status\" | .current_task = \"$task\" | .updated_at = \"$(date -Iseconds)\"" \
           "$SYNC_DIR/status/${MACHINE_ROLE}_status.json" > tmp.json && \
           mv tmp.json "$SYNC_DIR/status/${MACHINE_ROLE}_status.json"
    else
        # Fallback: simple replacement
        sed -i '' "s/\"status\": \"[^\"]*\"/\"status\": \"$status\"/" "$SYNC_DIR/status/${MACHINE_ROLE}_status.json"
        sed -i '' "s/\"current_task\": \"[^\"]*\"/\"current_task\": \"$task\"/" "$SYNC_DIR/status/${MACHINE_ROLE}_status.json"
    fi
}

# Wait for other machine synchronization
wait_for_sync_point() {
    local sync_point=$1
    log "Waiting for sync point: $sync_point"
    
    # Create sync point marker
    touch "$SYNC_DIR/status/${MACHINE_ROLE}_${sync_point}.ready"
    
    # Wait for other machine
    local other_machine
    if [ "$MACHINE_ROLE" = "MAC_PRO_BEAST" ]; then
        other_machine="M2_MAX"
    else
        other_machine="MAC_PRO_BEAST"
    fi
    
    local timeout=300  # 5 minutes
    local elapsed=0
    
    while [ ! -f "$SYNC_DIR/status/${other_machine}_${sync_point}.ready" ] && [ $elapsed -lt $timeout ]; do
        sleep 5
        elapsed=$((elapsed + 5))
        log "Waiting for $other_machine... (${elapsed}s)"
    done
    
    if [ $elapsed -ge $timeout ]; then
        warning "Timeout waiting for $other_machine - proceeding independently"
    else
        success "Synchronized with $other_machine at $sync_point"
    fi
}

# Run component migration test
test_component_migration() {
    local component=$1
    local from_version=$2
    local to_version=$3
    
    log "Testing migration: $component (Angular $from_version → $to_version)"
    update_status "migrating" "${component}_${from_version}to${to_version}"
    
    # Run quarantine validation
    if /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/quarantine-migration-validator.sh "$component" "$from_version" "$to_version"; then
        success "Component $component migration validated"
        
        # Record success
        cat > "$SYNC_DIR/results/${MACHINE_ROLE}_${component}_${from_version}to${to_version}.json" << EOF
{
    "machine": "$MACHINE_ROLE",
    "component": "$component",
    "from_version": $from_version,
    "to_version": $to_version,
    "status": "success",
    "validated_at": "$(date -Iseconds)"
}
EOF
        return 0
    else
        error "Component $component migration failed"
        
        # Record failure
        cat > "$SYNC_DIR/results/${MACHINE_ROLE}_${component}_${from_version}to${to_version}.json" << EOF
{
    "machine": "$MACHINE_ROLE", 
    "component": "$component",
    "from_version": $from_version,
    "to_version": $to_version,
    "status": "failed",
    "failed_at": "$(date -Iseconds)"
}
EOF
        return 1
    fi
}

# MAC PRO BEAST specific workflow
run_mac_pro_beast_workflow() {
    log "Starting MAC PRO BEAST migration workflow"
    
    local components=($(get_component_queue))
    local versions=($(get_version_range))
    
    # Phase 1: Test simplest component through version range
    local test_component=${components[0]}
    
    for i in $(seq 0 $((${#versions[@]} - 2))); do
        local from_version=${versions[$i]}
        local to_version=${versions[$((i + 1))]}
        
        if ! test_component_migration "$test_component" "$from_version" "$to_version"; then
            error "Migration path broken at Angular $from_version → $to_version"
            exit 1
        fi
        
        # Sync point after each version
        wait_for_sync_point "version_${to_version}_complete"
    done
    
    # Phase 2: Test all components at proven version
    local proven_version=${versions[-1]}
    
    for component in "${components[@]:1}"; do  # Skip first component (already tested)
        if ! test_component_migration "$component" "11" "$proven_version"; then
            warning "Component $component failed at Angular $proven_version"
            # Continue with other components
        fi
    done
    
    success "MAC PRO BEAST workflow complete"
}

# M2 MAX specific workflow
run_m2_max_workflow() {
    log "Starting M2 MAX migration workflow"
    
    local components=($(get_component_queue))
    local versions=($(get_version_range))
    
    # Wait for MAC PRO BEAST to validate initial path
    wait_for_sync_point "version_15_complete"
    
    # Phase 1: Continue version progression
    for i in $(seq 0 $((${#versions[@]} - 2))); do
        local from_version=${versions[$i]}
        local to_version=${versions[$((i + 1))]}
        
        # Test with simplest component first
        if ! test_component_migration "${components[0]}" "$from_version" "$to_version"; then
            error "Migration path broken at Angular $from_version → $to_version"
            exit 1
        fi
        
        wait_for_sync_point "version_${to_version}_complete"
    done
    
    # Phase 2: Rapid component testing
    for component in "${components[@]}"; do
        # Test component at final version
        if ! test_component_migration "$component" "11" "20"; then
            warning "Component $component may need manual intervention"
        fi
    done
    
    success "M2 MAX workflow complete"
}

# Generate final migration report
generate_final_report() {
    log "Generating comprehensive migration report"
    
    local report_file="$SYNC_DIR/FINAL_MIGRATION_ASSESSMENT_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# HYPERTHREADING MIGRATION ASSESSMENT REPORT

**Generated**: $(date)
**Duration**: Started at sync directory creation

## MACHINE CONTRIBUTIONS

### MAC PRO BEAST ($CORE_COUNT cores)
- **Role**: Heavy lifting and build-intensive migrations
- **Components Tested**: $(get_component_queue | wc -w) components
- **Version Range**: $(get_version_range)

### M2 MAX (Fast iteration)
- **Role**: Rapid testing and version validation  
- **Components Tested**: $(get_component_queue | wc -w) components
- **Version Range**: $(get_version_range)

## RESULTS SUMMARY

EOF

    # Analyze results files
    local total_tests=0
    local successful_tests=0
    local failed_tests=0
    
    for result_file in "$SYNC_DIR/results"/*.json; do
        if [ -f "$result_file" ]; then
            total_tests=$((total_tests + 1))
            if grep -q '"status": "success"' "$result_file"; then
                successful_tests=$((successful_tests + 1))
            else
                failed_tests=$((failed_tests + 1))
            fi
        fi
    done
    
    cat >> "$report_file" << EOF
- **Total Tests**: $total_tests
- **Successful**: $successful_tests  
- **Failed**: $failed_tests
- **Success Rate**: $(( (successful_tests * 100) / total_tests ))%

## RECOMMENDATIONS

EOF

    if [ $failed_tests -eq 0 ]; then
        cat >> "$report_file" << EOF
✅ **MIGRATION APPROVED**: All quarantine tests passed

**Recommended Action**: Proceed with full system migration using proven patterns

**Next Steps**:
1. Begin production migration with validated components
2. Use hyperthreading approach for maximum efficiency
3. Implement continuous validation at each step
EOF
    else
        cat >> "$report_file" << EOF
⚠️ **MIGRATION REQUIRES ATTENTION**: $failed_tests tests failed

**Required Actions**:
1. Review failed component migrations
2. Implement manual fixes for failed cases
3. Re-run quarantine testing for failed components  
4. Only proceed after all tests pass

**Manual Intervention Required For**:
EOF
        
        # List failed components
        grep -l '"status": "failed"' "$SYNC_DIR/results"/*.json | while read file; do
            local component=$(grep '"component"' "$file" | cut -d'"' -f4)
            echo "- $component" >> "$report_file"
        done
    fi
    
    success "Final report generated: $report_file"
}

# Main orchestration
main() {
    local mode=${1:-"full"}
    
    log "🚀 HYPERTHREADING MIGRATION ORCHESTRATOR STARTING"
    log "Machine: $MACHINE_ROLE ($CORE_COUNT cores)"
    log "Mode: $mode"
    
    # Setup synchronization
    setup_sync_directory
    update_status "started"
    
    case $mode in
        "full")
            case $MACHINE_ROLE in
                "MAC_PRO_BEAST")
                    run_mac_pro_beast_workflow
                    ;;
                "M2_MAX")
                    run_m2_max_workflow  
                    ;;
                *)
                    error "Unsupported machine for full migration"
                    exit 1
                    ;;
            esac
            ;;
        "single")
            # Single component test mode
            local component=${2:-"scale-selector"}
            local from_version=${3:-11}
            local to_version=${4:-12}
            
            test_component_migration "$component" "$from_version" "$to_version"
            ;;
        "report")
            generate_final_report
            ;;
        *)
            echo "Usage: $0 [full|single|report] [component] [from_version] [to_version]"
            exit 1
            ;;
    esac
    
    update_status "completed"
    
    # Generate final report if full mode
    if [ "$mode" = "full" ]; then
        wait_for_sync_point "all_complete"
        generate_final_report
    fi
    
    success "Migration orchestration complete"
}

# Execute with parameters
main "$@"
