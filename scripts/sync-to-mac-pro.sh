#!/bin/bash

# Mac Pro Sync Script
# Syncs migration progress to Mac Pro Beast for distributed processing

MAC_PRO_HOST="vandendool@10.0.0.115"
MAC_PRO_PATH="/Users/vandendool/Novaxe-SEB-Million-Song-Mind"

echo "=== SYNCING TO MAC PRO BEAST ==="
echo "Time: $(date)"

# Pull latest changes on Mac Pro
echo "Pulling latest changes on Mac Pro..."
ssh $MAC_PRO_HOST "cd $MAC_PRO_PATH && git pull"

# Sync quarantine workspace if needed
if [[ -d "/tmp/ng-migrate-v2-*" ]]; then
  LATEST_QUARANTINE=$(ls -td /tmp/ng-migrate-v2-* | head -1)
  echo "Syncing quarantine workspace: $LATEST_QUARANTINE"
  rsync -avz --progress "$LATEST_QUARANTINE/" "$MAC_PRO_HOST:~/quarantine-sync/"
fi

# Sync forensics
echo "Syncing forensics..."
rsync -avz --progress forensics/ "$MAC_PRO_HOST:$MAC_PRO_PATH/forensics/"

# Sync scripts
echo "Syncing migration scripts..."
rsync -avz --progress scripts/ "$MAC_PRO_HOST:$MAC_PRO_PATH/scripts/"

echo "=== SYNC COMPLETE ==="
echo "Mac Pro ready for distributed processing"
