#!/usr/bin/env bash
set -euo pipefail

# Import Novaxe GitLab repo (nvx_braid_fixes2) as a squashed subtree
# Usage examples:
#   MSM_DIR=$(pwd) ./scripts/import_novaxe_gitlab.sh \
#     git@gitlab.com:delphineG/novaxe-fakebook.git nvx_braid_fixes2 vendor/novaxe-fakebook
#
#   # HTTPS + PAT (export GITLAB_PAT first)
#   export GITLAB_PAT=glpat_xxx
#   MSM_DIR=$(pwd) ./scripts/import_novaxe_gitlab.sh \
#     https://gitlab.com/delphineG/novaxe-fakebook.git nvx_braid_fixes2 vendor/novaxe-fakebook

TARGET_REPO_DIR=${MSM_DIR:-$(pwd)}
GIT_URL=${1:-"git@gitlab.com:delphineG/novaxe-fakebook.git"}
GIT_BRANCH=${2:-"nvx_braid_fixes2"}
SUBTREE_PATH=${3:-"vendor/novaxe-fakebook"}
FEATURE_BRANCH=${4:-"import/novaxe-braid-subtree"}
REMOTE_NAME=${5:-"novaxe"}

cd "$TARGET_REPO_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "fatal: git is required" >&2
  exit 1
fi

# If HTTPS with PAT is desired
if [[ "$GIT_URL" =~ ^https && -n "${GITLAB_PAT:-}" ]]; then
  # Inject PAT into URL (basic auth)
  GIT_URL_WITH_PAT="https://oauth2:${GITLAB_PAT}@${GIT_URL#https://}"
else
  GIT_URL_WITH_PAT="$GIT_URL"
fi

echo "[info] Using repository: $GIT_URL (branch: $GIT_BRANCH)"
echo "[info] Target subtree path: $SUBTREE_PATH"

git fetch origin

# Create or switch to feature branch
if git rev-parse --verify "$FEATURE_BRANCH" >/dev/null 2>&1; then
  git checkout "$FEATURE_BRANCH"
else
  git checkout -b "$FEATURE_BRANCH"
fi

# Add remote if missing
if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote add "$REMOTE_NAME" "$GIT_URL_WITH_PAT"
fi

echo "[info] Fetching from $REMOTE_NAME ..."
git fetch "$REMOTE_NAME" "$GIT_BRANCH":"refs/remotes/$REMOTE_NAME/$GIT_BRANCH"

# Ensure subtree path exists
mkdir -p "$SUBTREE_PATH"

# Try subtree add or pull (if path already has history)
if git log -- "$SUBTREE_PATH" >/dev/null 2>&1; then
  echo "[info] Subtree path has history; pulling updates..."
  git subtree pull --prefix="$SUBTREE_PATH" "$REMOTE_NAME" "$GIT_BRANCH" --squash -m "chore: subtree pull novaxe ($GIT_BRANCH) into $SUBTREE_PATH"
else
  echo "[info] Adding subtree ..."
  git subtree add --prefix="$SUBTREE_PATH" "$REMOTE_NAME" "$GIT_BRANCH" --squash -m "chore: subtree add novaxe ($GIT_BRANCH) into $SUBTREE_PATH"
fi

echo "[done] Subtree updated at $SUBTREE_PATH on branch $FEATURE_BRANCH"
echo "Next steps:"
echo "  1) Inspect imported files under $SUBTREE_PATH (especially components/braid/*)"
echo "  2) I will port braid.component.{ts,html,scss} to React and wire the route we created (/novaxe-braid)"
echo "  3) Open a PR from $FEATURE_BRANCH (we will NOT touch main)"
