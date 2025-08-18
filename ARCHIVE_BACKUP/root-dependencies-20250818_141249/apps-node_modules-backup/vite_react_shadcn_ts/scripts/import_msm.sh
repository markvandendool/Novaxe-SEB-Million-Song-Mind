#!/usr/bin/env bash
# Safe importer: add MillionSongMind as a squashed subtree into this repo
# Usage example:
#   bash scripts/import_msm.sh \
#     TARGET_REPO_SSH="git@github.com:OWNER/harmonic-oracle-lovable-braid.git" \
#     MSM_REPO_SSH="git@github.com:markvandendool/MillionSongMind.git" \
#     SUBTREE_PATH="vendor/million-song-mind" \
#     FEATURE_BRANCH="msm-import/$(date +%Y%m%d-%H%M)"

set -euo pipefail

# -----------------------------
# Config (override via env args)
# -----------------------------
TARGET_REPO_SSH=${TARGET_REPO_SSH:-"git@github.com:OWNER/harmonic-oracle-lovable-braid.git"}
TARGET_DIR=${TARGET_DIR:-"harmonic-oracle-lovable-braid"}
MSM_REPO_SSH=${MSM_REPO_SSH:-"git@github.com:markvandendool/MillionSongMind.git"}
SUBTREE_PATH=${SUBTREE_PATH:-"vendor/million-song-mind"}
FEATURE_BRANCH=${FEATURE_BRANCH:-"msm-import/$(date +%Y%m%d-%H%M)"}

# -----------------------------
# Pre-flight
# -----------------------------
if ! command -v git >/dev/null 2>&1; then
  echo "git is required"; exit 1
fi

# -----------------------------
# Clone / enter repo
# -----------------------------
if [ ! -d ".git" ]; then
  # If script is run from project root, .git exists; otherwise, try clone
  if [ ! -d "$TARGET_DIR/.git" ]; then
    echo "Cloning $TARGET_REPO_SSH into $TARGET_DIR ..."
    git clone "$TARGET_REPO_SSH" "$TARGET_DIR"
  fi
  cd "$TARGET_DIR"
fi

# Ensure we’re on a new feature branch based on default origin branch
# Try to detect origin/HEAD, fallback to main
DEFAULT_BRANCH=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | awk -F'/' '{print $2}') || true
DEFAULT_BRANCH=${DEFAULT_BRANCH:-main}

echo "Fetching origin..."
git fetch origin --prune

if git show-ref --verify --quiet "refs/heads/$FEATURE_BRANCH"; then
  echo "Checking out existing branch: $FEATURE_BRANCH"
  git checkout "$FEATURE_BRANCH"
else
  echo "Creating and checking out: $FEATURE_BRANCH (base: $DEFAULT_BRANCH)"
  git checkout -B "$FEATURE_BRANCH" "origin/$DEFAULT_BRANCH" 2>/dev/null || git checkout -b "$FEATURE_BRANCH"
fi

# -----------------------------
# Add MSM remote
# -----------------------------
if git remote get-url msm >/dev/null 2>&1; then
  echo "Remote 'msm' already exists"
else
  echo "Adding remote 'msm' → $MSM_REPO_SSH"
  git remote add msm "$MSM_REPO_SSH"
fi

echo "Fetching 'msm' ..."
git fetch msm --tags

# Detect MSM default branch
MSM_BRANCH=${MSM_BRANCH:-$(git ls-remote --symref msm HEAD | awk '/^ref:/ {print $2}' | sed 's#refs/heads/##')}
MSM_BRANCH=${MSM_BRANCH:-main}

echo "Using MSM branch: $MSM_BRANCH"

# Ensure subtree path exists (avoid surprises)
mkdir -p "$SUBTREE_PATH"

# -----------------------------
# Subtree add / pull (squash)
# -----------------------------
if git ls-tree -d HEAD "$SUBTREE_PATH" >/dev/null 2>&1; then
  echo "Subtree exists → pulling latest (squash)"
  git subtree pull --prefix="$SUBTREE_PATH" msm "$MSM_BRANCH" --squash
else
  echo "Adding subtree at $SUBTREE_PATH (squash)"
  git subtree add --prefix="$SUBTREE_PATH" msm "$MSM_BRANCH" --squash
fi

# -----------------------------
# Optional: Git LFS for large media
# -----------------------------
if find "$SUBTREE_PATH" -type f \( -name "*.wav" -o -name "*.mp3" -o -name "*.zip" \) | grep -q .; then
  if command -v git-lfs >/dev/null 2>&1; then
    echo "Configuring Git LFS for large media..."
    git lfs install
    git lfs track "$SUBTREE_PATH/**/*.wav" "$SUBTREE_PATH/**/*.mp3" "$SUBTREE_PATH/**/*.zip" || true
    git add .gitattributes || true
    git commit -m "Track media with Git LFS" || true
  else
    echo "git-lfs not found. Install from https://git-lfs.github.com if you need LFS."
  fi
fi

# -----------------------------
# Push branch and print PR URL
# -----------------------------
set +e
git push -u origin "$FEATURE_BRANCH"
PUSH_STATUS=$?
set -e

if [ $PUSH_STATUS -ne 0 ]; then
  echo "Push failed. Ensure the remote repo exists and you have access: $TARGET_REPO_SSH"
  exit 1
fi

ORIGIN_URL=$(git remote get-url origin)
PR_MSG="Feature branch pushed: $FEATURE_BRANCH"
if [[ "$ORIGIN_URL" =~ git@github.com:(.+)/(.+)\.git ]]; then
  OWNER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]}"
  PR_URL="https://github.com/$OWNER/$REPO/compare/$FEATURE_BRANCH?expand=1"
  PR_MSG="Open PR: $PR_URL"
fi

echo "$PR_MSG"
