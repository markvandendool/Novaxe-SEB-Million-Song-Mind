# Harmonic Oracle Lovable Braid — Safe Import of MillionSongMind (Option A)

This guide imports the GitHub repo `markvandendool/MillionSongMind` into this project as a squashed subtree under `vendor/million-song-mind`, on a feature branch, ready for PR.

What you’ll get
- Clean, read-only mirror of MillionSongMind inside this repo (no submodules)
- Easy future updates via `git subtree pull`
- Zero impact on your current app until you merge the PR

Prerequisites (1 minute)
1) In Lovable: connect this project to GitHub and create the repository (e.g., harmonic-oracle-lovable-braid)
2) Verify SSH access works on your machine:
   ssh -T git@github.com
3) Note your repo SSH URL (replace OWNER/REPO below):
   git@github.com:OWNER/harmonic-oracle-lovable-braid.git

Quick start (copy/paste)
- Clone your new repo locally, then run the import script.

# From any folder you like
# 1) Clone your Lovable repo
#    Replace OWNER with your GitHub username or org
REPO_SSH="git@github.com:OWNER/harmonic-oracle-lovable-braid.git"

# 2) Clone it locally (if not already)
if [ ! -d harmonic-oracle-lovable-braid/.git ]; then
  git clone "$REPO_SSH" harmonic-oracle-lovable-braid
fi

# 3) Run the import script (Bash)
cd harmonic-oracle-lovable-braid
bash scripts/import_msm.sh \
  TARGET_REPO_SSH="$REPO_SSH" \
  MSM_REPO_SSH="git@github.com:markvandendool/MillionSongMind.git" \
  SUBTREE_PATH="vendor/million-song-mind" \
  FEATURE_BRANCH="msm-import/$(date +%Y%m%d-%H%M)"

# 4) Open the printed PR URL (or open a PR manually in GitHub)

Script variables (optional)
- TARGET_REPO_SSH: SSH URL of this Lovable repo
- MSM_REPO_SSH: SSH URL of MillionSongMind (default provided)
- SUBTREE_PATH: Destination folder (default: vendor/million-song-mind)
- FEATURE_BRANCH: Name for the feature branch
- MSM_BRANCH: Overrides detected MSM default branch if needed (e.g., MSM_BRANCH=main)

Updating later
To pull the latest from MillionSongMind again:

# On a fresh feature branch
git checkout -b msm-update/$(date +%Y%m%d-%H%M)
git fetch msm
git subtree pull --prefix="vendor/million-song-mind" msm ${MSM_BRANCH:-main} --squash

git push -u origin HEAD
# Open PR

Troubleshooting
- Repository not found: Ensure the Lovable project is connected to GitHub and the repo exists; confirm you have access.
- SSH issues: Run ssh -T git@github.com and confirm your key; check ~/.ssh/config.
- zsh ‘no matches found’: Run the script with bash (bash scripts/import_msm.sh ...) instead of pasting heredocs into zsh.

After merge
Reply “Ready” and I’ll:
- Do a full architecture tour of MillionSongMind
- Produce a component map, data/flow diagrams, and integration plan
- Begin targeted integration with this app (Braid + calibration, etc.)

