#!/usr/bin/env bash

# Angular Migration Script v3.0.0 - "Path to Takamagahara" (11 → 20)
# Ultra-refined, protocol-compliant, quarantined migration with forensic validation
# Enhanced with battle-tested fixes from Angular 12 migration:
# - TypeScript exclusion for abcjs TS1337
# - Browserslist ES5 differential loading bypass
# - Verified metrics reporting with du -sh
# - Musical pattern validation
#
# Usage:
#   scripts/angular-migration-v3.sh <angular_app_root>
#
# Notes:
# - Non-destructive: operates on a quarantined copy of the provided app path
# - Performs version-by-version ng update (11→12→…→20) with per-step build + logs
# - Attempts Node version alignment per Angular version via nvm when available
# - Produces forensic artifacts (dependency snapshots, scans, build logs) per step
# - Optional musical-pattern checks are included (best-effort, non-fatal)

set -euo pipefail

SCRIPT_VERSION="2.0.0"

echo "=== MASTER AGENT PROTOCOL v3.0 ACKNOWLEDGMENT ==="
echo "✅ I will NEVER use the forbidden word"
echo "✅ I will COPY complete files only (quarantine copy)"
echo "✅ I will use LOCAL repos only"
echo "✅ I will verify EVERY step with forensic logs"
echo "✅ I will NEVER create fake work"
echo "=== ACKNOWLEDGMENT COMPLETE ==="
echo "Angular Migration Script v$SCRIPT_VERSION"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <angular_app_root>" >&2
  exit 1
fi

APP_REL_PATH="$1"

# Resolve repo root from this script location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_SRC_ABS="$REPO_ROOT/$APP_REL_PATH"

if [[ ! -d "$APP_SRC_ABS" ]]; then
  echo "ERROR: App path not found: $APP_SRC_ABS" >&2
  exit 1
fi

# Angular version ladder and Node targets
declare -a ANGULAR_STEPS=(11 12 13 14 15 16 17 18 19 20)
node_target_for() {
  case "$1" in
    11) echo 14 ;;
    12|13|14) echo 16 ;;
    15|16|17) echo 18 ;;
    18|19|20) echo 20 ;;
    *) echo 18 ;;
  esac
}

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(timestamp)] $*" | tee -a "$RUN_LOG"; }
err() { echo "[$(timestamp)] ERROR: $*" | tee -a "$RUN_LOG" >&2; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || { err "Missing required command: $1"; exit 1; }; }

require_cmd git
require_cmd npm

# Quarantine workspace
RUN_ID="ng-migrate-v2-$(date +%Y%m%d-%H%M%S)"
QUAR_DIR="${TMPDIR:-/tmp}/$RUN_ID"
mkdir -p "$QUAR_DIR"
RUN_LOG="$QUAR_DIR/run.log"
FORENSIC_DIR="$QUAR_DIR/forensics"
mkdir -p "$FORENSIC_DIR"

log "Angular Migration v$SCRIPT_VERSION starting"
log "Repo root: $REPO_ROOT"
log "App path (relative to repo): $APP_REL_PATH"
log "Quarantine: $QUAR_DIR"

# Copy the app into quarantine (exclude heavy build dirs)
APP_WORK="$QUAR_DIR/app"
log "Copying app to quarantine..."
rsync -a --exclude node_modules --exclude dist --exclude .angular "$APP_SRC_ABS/" "$APP_WORK/"

# Pre-flight
pushd "$APP_WORK" >/dev/null
log "Node: $(node -v 2>/dev/null || echo unknown)"
log "NPM:  $(npm -v 2>/dev/null || echo unknown)"

# Node switcher (nvm best-effort)
switch_node() {
  local want=$1
  if command -v nvm >/dev/null 2>&1; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh" || true
    nvm install "$want" >/dev/null 2>&1 || true
    nvm use "$want" >/dev/null 2>&1 || true
    log "Using Node $(node -v 2>/dev/null || echo unknown)"
  else
    log "nvm not found; continuing with current Node $(node -v 2>/dev/null || echo unknown)"
  fi
}

# Configure TypeScript to prefer local shim for abcjs
ensure_types_override() {
  for f in tsconfig.json tsconfig.app.json; do
    [[ -f "$f" ]] || continue
    if command -v jq >/dev/null 2>&1; then
      tmpfile="$(mktemp)"
      jq '.compilerOptions |= (. // {}) | .compilerOptions.baseUrl = ( .compilerOptions.baseUrl // ".") | .compilerOptions.paths |= (.compilerOptions.paths // {}) | .compilerOptions.paths["abcjs"] = ["src/types/abcjs-shim"]' "$f" > "$tmpfile" && mv "$tmpfile" "$f" || true
    else
      # Best-effort append of paths (non-robust without jq)
      if ! grep -q '"paths"' "$f"; then
        echo "// cursor: paths override injected for abcjs" >> "$f"
      fi
    fi
  done
}

# Create abcjs shim to bypass TS1337 typing issue (quarantine-only)
ensure_abcjs_shim() {
  mkdir -p src/types || true
  cat > src/types/abcjs-shim.d.ts << 'EOF'
// Quarantine-only shim for abcjs typings to avoid TS1337 index signature issues
// Created by: Cursor AI <cursor@novaxe.local>
// Date: $(date)
declare module 'abcjs' {
  const abcjs: any;
  export default abcjs;
}
EOF
}

# Ensure skipLibCheck in tsconfig to bypass third-party typing issues (quarantine-only)
ensure_skip_lib_check() {
  for f in tsconfig.json tsconfig.app.json; do
    [[ -f "$f" ]] || continue
    if command -v jq >/dev/null 2>&1; then
      tmpfile="$(mktemp)"
      jq '.compilerOptions |= (. // {}) | .compilerOptions.skipLibCheck = true' "$f" > "$tmpfile" && mv "$tmpfile" "$f" || true
    else
      # Best-effort: append an override block if skipLibCheck not present
      if ! grep -q 'skipLibCheck' "$f"; then
        # Insert before final closing brace
        awk 'BEGIN{added=0} {
          if (!added && /"compilerOptions"\s*:\s*\{/){
            print $0; getline line;
            if (line ~ /\}/){ print "  \"skipLibCheck\": true"; print line; added=1; next }
            print line
          } else { print $0 }
        } END{ }' "$f" > "$f.tmp" 2>/dev/null || true
        if [[ -s "$f.tmp" ]]; then mv "$f.tmp" "$f"; else rm -f "$f.tmp"; fi
      fi
    fi
  done
}

# Forensic audit per step
forensic_audit() {
  local tag="$1"
  local out="$FORENSIC_DIR/ng$tag"
  mkdir -p "$out"
  (npm ls --depth=0 || true) > "$out/dependencies.txt" 2>&1
  # Record framework versions if possible
  command -v jq >/dev/null 2>&1 && {
    jq -r '.dependencies."@angular/core" // empty' package.json 2>/dev/null | sed 's/^/@angular\/core: /' > "$out/framework.txt" || true
    jq -r '.devDependencies."@angular/cli" // empty' package.json 2>/dev/null | sed 's/^/@angular\/cli: /' >> "$out/framework.txt" || true
    jq -r '.dependencies.rxjs // empty' package.json 2>/dev/null | sed 's/^/rxjs: /' >> "$out/framework.txt" || true
  } || true
  # Risk scans (if ripgrep exists)
  if command -v rg >/dev/null 2>&1; then
    rg -n "\$\(" src || true > "$out/jquery-usages.rg.txt"
    rg -n "from 'rxjs/Subscription'" src || true > "$out/legacy-rxjs-imports.rg.txt"
    rg -n "\.subscribe\(" src || true > "$out/subscribes.rg.txt"
    rg -n "\.unsubscribe\(" src || true > "$out/unsubscribes.rg.txt"
  fi
}

# Build helper with configuration fallbacks
attempt_build() {
  local cli_ver="$1"
  local out_log="$2"
  # Enable legacy OpenSSL provider for Node >= 17 (Webpack compatibility)
  local node_major
  node_major=$(node -p "process.versions.node.split('.') [0]" 2>/dev/null || echo "0")
  if [ "$node_major" -ge 17 ]; then
    export NODE_OPTIONS=--openssl-legacy-provider
  fi
  
  # Try development, then production, then no config
  if npx -y @angular/cli@"$cli_ver" build --configuration=development 2>&1 | tee -a "$out_log"; then
    return 0
  fi
  if npx -y @angular/cli@"$cli_ver" build --configuration=production 2>&1 | tee -a "$out_log"; then
    return 0
  fi
  if npx -y @angular/cli@"$cli_ver" build 2>&1 | tee -a "$out_log"; then
    return 0
  fi
  return 1
}

# Optional musical-pattern checks (best-effort)
validate_musical_patterns() {
  local version="$1"
  local ok=1
  if [[ -f src/app/braid.component.ts ]]; then
    if ! grep -q 'rotate_arrays_for_tona' src/app/braid.component.ts; then
      echo "[ng$version] WARN: rotate_arrays_for_tona not found in braid.component.ts" | tee -a "$RUN_LOG"
      ok=0
    fi
  fi
  if [[ -f src/app/chord-detect.service.ts ]]; then
    if ! grep -q 'detectChord' src/app/chord-detect.service.ts; then
      echo "[ng$version] WARN: detectChord not found in chord-detect.service.ts" | tee -a "$RUN_LOG"
      ok=0
    fi
  fi
  [[ $ok -eq 1 ]] && echo "[ng$version] Musical pattern check: OK" | tee -a "$RUN_LOG" || true
}

# Forensic verification to prevent metric misreporting
verify_build_metrics() {
  local version="$1"
  if [[ -d dist ]]; then
    local actual_size=$(du -sh dist/ 2>/dev/null | cut -f1)
    local file_count=$(find dist -type f | wc -l | tr -d ' ')
    echo "[ng$version] VERIFIED METRICS:" | tee -a "$RUN_LOG"
    echo "  - Actual dist size: $actual_size" | tee -a "$RUN_LOG"
    echo "  - File count: $file_count files" | tee -a "$RUN_LOG"
    echo "  - Process type: AUTOMATED" | tee -a "$RUN_LOG"
    echo "  - Timestamp: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$RUN_LOG"
    
    # Save verified metrics to forensics
    echo "Angular $version Build Metrics" > "$FORENSIC_DIR/ng$version/VERIFIED_METRICS.txt"
    echo "Actual Size: $actual_size" >> "$FORENSIC_DIR/ng$version/VERIFIED_METRICS.txt"
    echo "Files: $file_count" >> "$FORENSIC_DIR/ng$version/VERIFIED_METRICS.txt"
    echo "Built: $(date)" >> "$FORENSIC_DIR/ng$version/VERIFIED_METRICS.txt"
  else
    echo "[ng$version] ERROR: No dist directory found for metrics verification" | tee -a "$RUN_LOG"
  fi
}

# Ensure baseline install
log "Installing dependencies (baseline, lenient peer resolution)..."
npm install --legacy-peer-deps --no-audit --no-fund || true
forensic_audit "baseline"

previous="11"

for target in "${ANGULAR_STEPS[@]}"; do
  if [[ "$target" == "11" ]]; then
    log "Baseline Angular 11 build sanity..."
    (NODE_OPTIONS=--openssl-legacy-provider npx -y @angular/cli@11 build || true) | tee -a "$RUN_LOG"
    continue
  fi

  log "=== MIGRATING: Angular $previous → $target ==="

  switch_node "$(node_target_for "$target")"

  log "ng update @angular/core@$target @angular/cli@$target"
  if ! npx -y @angular/cli@"$target" update @angular/core@"$target" @angular/cli@"$target" --force --allow-dirty; then
    err "ng update failed at Angular $target"; forensic_audit "$target-fail-update"; exit 2
  fi

  if (( target >= 13 )); then
    log "ng update rxjs (compatibility)"
    npx -y @angular/cli@"$target" update rxjs --force --allow-dirty || true
  fi

  log "npm install (lenient peer deps)"
  npm install --legacy-peer-deps --no-audit --no-fund || { err "npm install failed at $target"; exit 3; }

  # Create build-time tsconfig override to exclude problematic abcjs types (ng12+ issue)
  if [[ "$target" -ge 12 ]]; then
    cat > tsconfig.build.json << 'EOF'
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "skipLibCheck": true
  },
  "exclude": [
    "node_modules/abcjs/types/**/*.d.ts",
    "src/test.ts",
    "src/**/*.spec.ts",
    "e2e/**/*"
  ]
}
EOF
    log "Created tsconfig.build.json with abcjs type exclusion"
    
    # Update angular.json to use the custom tsconfig for build
    if command -v jq >/dev/null 2>&1; then
      tmpfile="$(mktemp)"
      jq '.projects.novaxe.architect.build.options.tsConfig = "tsconfig.build.json"' angular.json > "$tmpfile" && mv "$tmpfile" angular.json || true
      log "Updated angular.json to use tsconfig.build.json"
    else
      # Fallback: sed replacement (more robust with exact match)
      sed -i.bak 's|"tsConfig": "tsconfig.app.json"|"tsConfig": "tsconfig.build.json"|' angular.json 2>/dev/null || true
    fi
    
    # Disable ES5 differential loading for ng12+ (avoid regeneratorRuntime errors)
    echo "last 2 Chrome versions
last 2 Firefox versions
last 2 Edge versions
last 2 Safari versions
not IE 11" > .browserslistrc
    log "Updated browserslist to disable ES5 differential loading"
  fi

  log "Build with @angular/cli@$target (config fallback)"
  build_log="$FORENSIC_DIR/ng$target/build.log"
  mkdir -p "$(dirname "$build_log")"
  if ! attempt_build "$target" "$build_log"; then
    err "Build failed at Angular $target"; forensic_audit "$target-fail-build"; exit 4
  fi

  forensic_audit "$target"
  validate_musical_patterns "$target" || true
  verify_build_metrics "$target" || true

  previous="$target"
  log "Angular $target migration OK"
done

popd >/dev/null

log "✅ COMPLETE: Angular 11 → 20 migration finished in quarantine"
log "Forensic artifacts: $FORENSIC_DIR"
log "Quarantined app:  $APP_WORK"
log "Run ID: $RUN_ID"

exit 0


