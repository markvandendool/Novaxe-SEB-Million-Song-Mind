#!/usr/bin/env bash

# Generates or updates executive Morning/Midday/Evening/Night reports from forensic data
# Usage: scripts/report-pipeline.sh <forensics_dir> <period>
# period: morning|midday|evening|night

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <forensics_dir> <period>" >&2
  exit 1
fi

FORENSICS_DIR="$1"
PERIOD="$2"
DATE_TAG="$(date +%Y%m%d)"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$REPO_ROOT/EVENING_REPORTS"
mkdir -p "$OUT_DIR"

REPORT_FILE="$OUT_DIR/${PERIOD^^}_REPORT_${DATE_TAG}.md"

bundle_line() {
  local fdir="$1"
  local sz="N/A"
  if [[ -f "$fdir/build.log" ]]; then
    sz=$(grep -Eo '[0-9]+\.[0-9]+\s?MB' "$fdir/build.log" | head -1 || true)
    [[ -z "$sz" ]] && sz="N/A"
  fi
  echo "$sz"
}

versions_present=$(ls -1 "$FORENSICS_DIR" | grep -E '^ng[0-9]+' | sed 's/^ng//' | sort -n | xargs | sed 's/ /, /g' || true)

{
  echo "# ${PERIOD^^} REPORT - $(date +%B\ %d,\ %Y)"
  echo "## VERIFIED MIGRATION EVIDENCE"
  echo
  if [[ -z "$versions_present" ]]; then
    echo "- No forensic versions found in $FORENSICS_DIR"
  else
    echo "- Angular versions with evidence: $versions_present"
  fi
  for d in "$FORENSICS_DIR"/ng*/; do
    [[ -d "$d" ]] || continue
    ver=$(basename "$d" | sed 's/^ng//')
    deps_count=$(wc -l < "$d/dependencies.txt" 2>/dev/null || echo 0)
    bundle=$(bundle_line "$d")
    echo "  - ng$ver: dependencies.txt lines=$deps_count, bundle=$bundle"
  done
  echo
  echo "## NOTES"
  echo "- This report is generated from committed forensics only."
} > "$REPORT_FILE"

echo "Report generated: $REPORT_FILE"


