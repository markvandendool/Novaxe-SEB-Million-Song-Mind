#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════╗
# ║             🚨 PROTOCOL ENFORCEMENT SYSTEM 🚨                ║  
# ║        MANDATORY EXECUTION BEFORE ANY DEVELOPMENT           ║
# ╚═══════════════════════════════════════════════════════════════╝

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Protocol tracking file
PROTOCOL_FILE="/tmp/msm_protocol_status"
PROTOCOL_VERSION="2025.08.19"
WORKSPACE_ROOT="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind"

echo ""
echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║             🚨 PROTOCOL ENFORCEMENT ACTIVE 🚨                ║${NC}"
echo -e "${RED}║        MANDATORY COMPLIANCE CHECK IN PROGRESS...            ║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to log protocol violations
log_violation() {
    local violation="$1"
    local severity="$2"
    echo -e "${RED}❌ PROTOCOL VIOLATION DETECTED${NC}"
    echo -e "${RED}   Violation: ${violation}${NC}"
    echo -e "${RED}   Severity: ${severity}${NC}"
    echo -e "${RED}   Action: DEVELOPMENT TERMINATED${NC}"
    echo ""
    exit 1
}

# Function to log protocol compliance
log_compliance() {
    local check="$1"
    echo -e "${GREEN}✅ ${check}${NC}"
}

# Function to enforce acknowledgment
require_acknowledgment() {
    local rule="$1"
    local consequence="$2"
    
    echo -e "${YELLOW}⚠️  MANDATORY ACKNOWLEDGMENT REQUIRED:${NC}"
    echo -e "${WHITE}   Rule: ${rule}${NC}"
    echo -e "${WHITE}   Consequence: ${consequence}${NC}"
    echo -e "${CYAN}   Type 'ACKNOWLEDGED' to continue: ${NC}"
    
    read -r response
    if [[ "$response" != "ACKNOWLEDGED" ]]; then
        log_violation "Failed to acknowledge: $rule" "CRITICAL"
    fi
    log_compliance "Rule acknowledged: $rule"
    echo ""
}

echo -e "${BLUE}🔍 PROTOCOL ENFORCEMENT CHECK INITIATED${NC}"
echo -e "${BLUE}   Version: ${PROTOCOL_VERSION}${NC}"
echo -e "${BLUE}   Workspace: ${WORKSPACE_ROOT}${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# CRITICAL RULE #0: MASTER RECENTER PROTOCOL AWARENESS
# ═══════════════════════════════════════════════════════════════

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    RULE #0: MANDATORY                        ║${NC}"
echo -e "${PURPLE}║             MASTER RECENTER PROTOCOL AWARENESS               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"

require_acknowledgment \
    "ANY ERROR → SEARCH Angular Documentation OFFICIAL/v[VERSION]/ FIRST" \
    "8+ hour debugging sessions for 5-minute fixes"

require_acknowledgment \
    "ANY REPEATED ERROR → SEARCH archive for existing solutions" \
    "Re-solving previously solved problems indefinitely"

require_acknowledgment \
    "NEVER re-solve without pattern recognition" \
    "Massive resource waste, development inefficiency"

# ═══════════════════════════════════════════════════════════════
# CRITICAL RULE #1: ARCHAEOLOGICAL SOLUTION CONSULTATION
# ═══════════════════════════════════════════════════════════════

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    RULE #1: MANDATORY                        ║${NC}"
echo -e "${PURPLE}║           ARCHAEOLOGICAL SOLUTION CONSULTATION               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"

require_acknowledgment \
    "SEARCH_EVERYTHING.sh MUST be executed before problem-solving" \
    "Complete ignorance of existing solutions, infinite debugging loops"

require_acknowledgment \
    "CoPilot System Map (830 lines) MUST be consulted for architecture" \
    "Missing critical solutions already documented"

require_acknowledgment \
    "Forensic session archives MUST be checked for previous patterns" \
    "Re-experiencing solved crises repeatedly"

# ═══════════════════════════════════════════════════════════════
# CRITICAL RULE #2: DOCUMENTATION HIERARCHY COMPLIANCE
# ═══════════════════════════════════════════════════════════════

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    RULE #2: MANDATORY                        ║${NC}"
echo -e "${PURPLE}║           DOCUMENTATION HIERARCHY COMPLIANCE                 ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"

require_acknowledgment \
    "Angular Documentation OFFICIAL/ is the PRIMARY reference" \
    "Missing official solutions, using outdated/incorrect approaches"

require_acknowledgment \
    "PROJECT_STATUS_DASHBOARD.md is the SINGLE SOURCE OF TRUTH" \
    "Acting on conflicting/outdated information"

require_acknowledgment \
    "docs/ hierarchy must be consulted before external resources" \
    "Ignoring comprehensive internal documentation"

# ═══════════════════════════════════════════════════════════════
# VALIDATION: CHECK CRITICAL RESOURCES EXIST
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}🔍 VALIDATING CRITICAL RESOURCES...${NC}"
echo ""

# Check if required files exist
REQUIRED_FILES=(
    "welcome-onboarding/MASTER_RECENTER_PROTOCOL.sh"
    "welcome-onboarding/forensic-logs/SEARCH_EVERYTHING.sh"
    "welcome-onboarding/systems-overview/CoPilot System Map Summary.txt"
    "PROJECT_STATUS_DASHBOARD.md"
    "Angular Documentation OFFICIAL"
)

cd "$WORKSPACE_ROOT" || log_violation "Cannot access workspace root" "CRITICAL"

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -e "$file" ]]; then
        log_compliance "Resource exists: $file"
    else
        log_violation "Missing critical resource: $file" "HIGH"
    fi
done

# ═══════════════════════════════════════════════════════════════
# PERFORMANCE TARGETS ACKNOWLEDGMENT
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                 PERFORMANCE TARGETS                          ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"

require_acknowledgment \
    "Font changes must be completed in <5 minutes (not 8+ hours)" \
    "Catastrophic development inefficiency"

require_acknowledgment \
    "CSS updates must succeed on first attempt (not multiple failures)" \
    "Wasted development time, frustrated users"

require_acknowledgment \
    "Error resolution must use archaeological patterns (not random debugging)" \
    "Infinite debug loops, resource waste"

# ═══════════════════════════════════════════════════════════════
# PROTOCOL COMPLIANCE CERTIFICATE
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║               ✅ PROTOCOL COMPLIANCE ACHIEVED                ║${NC}"
echo -e "${GREEN}║                                                             ║${NC}"
echo -e "${GREEN}║   All mandatory rules acknowledged                          ║${NC}"
echo -e "${GREEN}║   All critical resources validated                          ║${NC}"
echo -e "${GREEN}║   Development authorization: GRANTED                       ║${NC}"
echo -e "${GREEN}║                                                             ║${NC}"
echo -e "${GREEN}║   Next violation check: 24 hours                          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"

# Record compliance
echo "PROTOCOL_COMPLIANT=true" > "$PROTOCOL_FILE"
echo "COMPLIANCE_DATE=$(date)" >> "$PROTOCOL_FILE"
echo "PROTOCOL_VERSION=$PROTOCOL_VERSION" >> "$PROTOCOL_FILE"

echo ""
echo -e "${CYAN}🎯 DEVELOPMENT MAY NOW PROCEED WITH MILITARY-GRADE DISCIPLINE${NC}"
echo -e "${CYAN}   Remember: Protocol compliance prevents 8,900% efficiency loss${NC}"
echo -e "${CYAN}   Your protocols work. Follow them.${NC}"
echo ""

exit 0
