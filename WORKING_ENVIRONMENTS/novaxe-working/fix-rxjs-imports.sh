#!/bin/bash
find src -name "*.ts" -type f -exec sed -i '' \
  -e 's|from '\''rxjs/Subject'\''|from '\''rxjs'\''|g' \
  -e 's|from '\''rxjs/Observable'\''|from '\''rxjs'\''|g' \
  -e 's|from '\''rxjs/Subscription'\''|from '\''rxjs'\''|g' \
  -e 's|from '\''rxjs/BehaviorSubject'\''|from '\''rxjs'\''|g' \
  {} \;
echo "RxJS imports fixed for Angular 12+ compatibility"
