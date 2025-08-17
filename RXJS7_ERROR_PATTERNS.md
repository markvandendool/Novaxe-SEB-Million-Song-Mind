# RxJS 7 Error Patterns - Complete Analysis

## 🔴 ERROR PATTERN CATALOG (325 Total)

### Pattern 1: Observable Import Errors (50+ occurrences)
```typescript
// ERROR:
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

// FIX:
import { Observable, Subject, Subscription } from 'rxjs';
```

### Pattern 2: Operator Import Errors (100+ occurrences)
```typescript
// ERROR:
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';

// FIX:
import { map, filter, debounceTime } from 'rxjs/operators';
```

### Pattern 3: Observable.map() vs Array.map() (150+ occurrences)
```typescript
// OBSERVABLE (in services):
// ERROR:
return this.http.get(url).map(res => res.data);

// FIX:
return this.http.get(url).pipe(map(res => res.data));

// ARRAY (in components):
// CORRECT - DO NOT CHANGE:
this.items = data.map(item => item.name);
```

### Pattern 4: Chained Operators (25+ occurrences)
```typescript
// ERROR:
observable
  .map(x => x * 2)
  .filter(x => x > 10)
  .debounceTime(300);

// FIX:
observable.pipe(
  map(x => x * 2),
  filter(x => x > 10),
  debounceTime(300)
);
```

## 📁 FILES REQUIRING MANUAL REVIEW

### High Priority Services (Definitely Observables):
1. `src/app/services/auth/auth.service.ts`
2. `src/app/services/spotify/spotify.service.ts`
3. `src/app/services/payment/payment.service.ts`
4. `src/app/services/user/user.service.ts`
5. `src/app/services/song/song.service.ts`

### Components with Mixed Usage:
1. `src/app/components/chord-editor/chord-editor.component.ts`
2. `src/app/components/song-list/song-list.component.ts`
3. `src/app/pages/dashboard/dashboard.component.ts`

### Special Cases:
1. **Musical Pattern Arrays** (DO NOT CHANGE):
   ```typescript
   // This is an ARRAY operation, not Observable:
   const notes = scale.map(Note.midi);
   const chords = progression.map(chord => chord.root);
   ```

2. **Template Arrays** (DO NOT CHANGE):
   ```html
   <!-- This is array map in template -->
   <div *ngFor="let item of items.map(transformItem)">
   ```

## 🛠️ AUTOMATED FIX SCRIPT (Use with caution)

```bash
#!/bin/bash
# rxjs7-smart-fix.sh

# Step 1: Fix imports (SAFE)
find src -name "*.ts" -exec sed -i.bak \
  -e "s|from 'rxjs/Observable'|from 'rxjs'|g" \
  -e "s|from 'rxjs/Subject'|from 'rxjs'|g" \
  -e "s|from 'rxjs/Subscription'|from 'rxjs'|g" \
  -e "s|from 'rxjs/BehaviorSubject'|from 'rxjs'|g" \
  {} \;

# Step 2: Remove old operator imports (SAFE)
find src -name "*.ts" -exec sed -i.bak '/rxjs\/add\/operator/d' {} \;

# Step 3: Add new operator imports to services only (TARGETED)
for file in src/app/services/**/*.service.ts; do
  if ! grep -q "from 'rxjs/operators'" "$file"; then
    sed -i.bak "1a\\
import { map, filter, catchError, tap, switchMap } from 'rxjs/operators';" "$file"
  fi
done

# Step 4: Fix Observable operations in services (TARGETED)
for file in src/app/services/**/*.service.ts; do
  # Only fix if file contains HttpClient
  if grep -q "HttpClient" "$file"; then
    perl -i -pe 's/\.map\(/\.pipe\(map\(/g' "$file"
    perl -i -pe 's/\.filter\(/\.pipe\(filter\(/g' "$file"
    perl -i -pe 's/\.catch\(/\.pipe\(catchError\(/g' "$file"
  fi
done

echo "Smart fixes applied. Manual review still required."
```

## 🔍 MANUAL VERIFICATION CHECKLIST

- [ ] All service files return Observables properly
- [ ] Component arrays still use native .map()
- [ ] No syntax errors from malformed pipe() calls
- [ ] All operator imports are from 'rxjs/operators'
- [ ] No duplicate imports on same line
- [ ] Template bindings still work
- [ ] Musical pattern logic unchanged

## 💡 COPILOT TIPS

1. **Use TypeScript to your advantage:**
   ```typescript
   // Let TypeScript tell you if it's Observable or Array
   const result = this.service.getData(); // Hover to see type
   ```

2. **Search for HttpClient usage:**
   ```bash
   grep -r "HttpClient" src/ | cut -d: -f1 | sort -u
   # These files definitely use Observables
   ```

3. **Test incrementally:**
   - Fix one service completely
   - Run `ng build`
   - If successful, continue
   - If errors, revert and try different approach

---

**Error patterns documented. Copilot armed with knowledge. RxJS 7 conquest awaits.**
