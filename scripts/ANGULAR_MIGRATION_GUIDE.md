# Angular 11→20 Migration Configuration Guide

## 📋 Quick Start Instructions

1. **Save the migration scripts** in your project root:
   - `angular-migration.js` - Main migration script
   - `rxjs-targeted-fixes.js` - Targeted RxJS fixes

2. **Run the targeted RxJS fixer first:**
   ```bash
   node rxjs-targeted-fixes.js
   ```

3. **Then run the full migration:**
   ```bash
   node angular-migration.js
   ```

---

## 🔧 Essential Configuration Files

### 1. TypeScript Configuration (`tsconfig.json`)

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": false,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2020",
    "module": "ES2020",
    "lib": [
      "ES2020",
      "dom"
    ],
    "strictNullChecks": false,
    "strictPropertyInitialization": false,
    "noImplicitAny": false,
    "skipLibCheck": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": false,
    "strictNullInputTypes": false
  }
}
```

### 2. Angular Configuration (`angular.json` - key updates)

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "allowedCommonJsDependencies": ["rxjs"],
            "optimization": false,
            "sourceMap": true,
            "extractCss": true,
            "buildOptimizer": false
          }
        }
      }
    }
  }
}
```

### 3. Package.json Dependencies (Angular 13)

```json
{
  "dependencies": {
    "@angular/animations": "^13.0.0",
    "@angular/common": "^13.0.0",
    "@angular/compiler": "^13.0.0",
    "@angular/core": "^13.0.0",
    "@angular/forms": "^13.0.0",
    "@angular/platform-browser": "^13.0.0",
    "@angular/platform-browser-dynamic": "^13.0.0",
    "@angular/router": "^13.0.0",
    "rxjs": "~7.4.0",
    "zone.js": "~0.11.4",
    "tslib": "^2.3.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^13.0.0",
    "@angular/cli": "^13.0.0",
    "@angular/compiler-cli": "^13.0.0",
    "typescript": "~4.4.0"
  }
}
```

---

## 🛠️ Manual RxJS 7 Migration Patterns

### Import Pattern Fixes

#### ❌ Old RxJS 6 Imports
```typescript
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
```

#### ✅ New RxJS 7 Imports
```typescript
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, filter, catchError, tap, take } from 'rxjs/operators';
```

### Observable Chain Transformations

#### ❌ Old Chain Pattern
```typescript
return this.http.get(url)
  .map(response => response.data)
  .filter(data => data.length > 0)
  .catch(error => Observable.throw(error));
```

#### ✅ New Pipe Pattern
```typescript
return this.http.get(url).pipe(
  map(response => response.data),
  filter(data => data.length > 0),
  catchError(error => throwError(() => error))
);
```

### Promise Conversion

#### ❌ Old toPromise()
```typescript
const data = await this.service.getData().toPromise();
```

#### ✅ New lastValueFrom/firstValueFrom
```typescript
import { lastValueFrom } from 'rxjs';
const data = await lastValueFrom(this.service.getData());
```

---

## 🎯 Common Error Patterns & Solutions

### 1. Observable Import Errors (50+ errors)

**Error Pattern:**
```
Cannot find module 'rxjs/Observable'
```

**Solution:**
```bash
# Find and replace across project
find src -name "*.ts" -exec sed -i "s/import { Observable } from 'rxjs\/Observable';/import { Observable } from 'rxjs';/g" {} \;
```

### 2. Operator Add Import Errors (100+ errors)

**Error Pattern:**
```
Cannot resolve 'rxjs/add/operator/map'
```

**Solution Script:**
```bash
# Remove all add/operator imports
find src -name "*.ts" -exec sed -i "/import.*rxjs\/add\/operator/d" {} \;

# Add modern operator imports (manual review needed)
```

### 3. Observable Chain Errors (150+ errors)

**Error Pattern:**
```
Property 'map' does not exist on type 'Observable<any>'
```

**Manual Fix Required:** Each Observable chain needs individual review to distinguish from Array methods.

### 4. Template Strict Null Check Errors (25+ errors)

**Error Pattern:**
```
Object is possibly 'null' or 'undefined'
```

**Solution:**
```html
<!-- Before -->
<div *ngIf="chord.notes.length > 0">
  <span>{{ chord.notes[0].name }}</span>
</div>

<!-- After -->
<div *ngIf="chord?.notes && chord.notes.length > 0">
  <span>{{ chord.notes[0]?.name }}</span>
</div>
```

---

## 🔍 Advanced Migration Strategies

### 1. Safe Observable vs Array Detection

```typescript
// Create a helper function to identify Observable operations
function isObservableOperation(line: string): boolean {
  return (
    line.includes('this.http.') ||
    line.includes('Subject') ||
    line.includes('Observable') ||
    line.includes('.pipe(') ||
    line.includes('$') && !line.includes('[') // Observable naming convention
  );
}
```

### 2. Batch Import Updates

```bash
#!/bin/bash
# RxJS import batch update script

# Update Observable imports
find src -name "*.ts" -type f -exec grep -l "rxjs/Observable" {} \; | xargs sed -i 's/import { Observable } from '\''rxjs\/Observable'\''/import { Observable } from '\''rxjs'\''/g'

# Update Subject imports
find src -name "*.ts" -type f -exec grep -l "rxjs/Subject" {} \; | xargs sed -i 's/import { Subject } from '\''rxjs\/Subject'\''/import { Subject } from '\''rxjs'\''/g'

# Remove operator add imports
find src -name "*.ts" -type f -exec sed -i '/import.*rxjs\/add\/operator/d' {} \;
```

### 3. Template Safety Migration

```typescript
// Component property null safety helper
export class ComponentBase {
  protected safeAccess<T>(obj: T | null | undefined): T | {} {
    return obj || {} as T;
  }
}
```

---

## 🚀 Step-by-Step Migration Process

### Phase 1: Preparation (5 minutes)
```bash
# 1. Create backup
cp -r your-project your-project-backup

# 2. Install migration dependencies
npm install -g @angular/cli@13
npm install @angular-devkit/schematics-cli

# 3. Clean install
rm -rf node_modules package-lock.json
npm install
```

### Phase 2: Automated Migration (10 minutes)
```bash
# 1. Run the targeted RxJS migration script
node rxjs-targeted-fixes.js

# 2. Run the main migration script
node angular-migration.js

# 3. Update Angular CLI and Core
ng update @angular/cli@13 @angular/core@13 --allow-dirty --force

# 4. Update RxJS
ng update rxjs@7 --allow-dirty --force
```

### Phase 3: Manual Fixes (30-60 minutes)

#### 3.1 Fix Remaining RxJS Issues
```bash
# Find all remaining Observable chain issues
grep -r "\.map(" src --include="*.ts" | grep -v "Array\|pipe"

# Find all remaining import issues
grep -r "rxjs/" src --include="*.ts" | grep -v "rxjs/operators\|'rxjs'"
```

#### 3.2 Template Strict Null Fixes
```bash
# Find potential null access issues
grep -r "\." src --include="*.html" | grep -v "?\.

# Common template patterns to fix:
find src -name "*.html" -exec grep -l "\.length\|\.name\|\[0\]" {} \;
```

#### 3.3 Service Observable Chains
```typescript
// Service file pattern fixes needed:

// Before (Angular 11)
getData(): Observable<any> {
  return this.http.get(this.apiUrl)
    .map(response => response.data)
    .catch(this.handleError);
}

// After (Angular 13+)
getData(): Observable<any> {
  return this.http.get(this.apiUrl).pipe(
    map(response => response.data),
    catchError(this.handleError)
  );
}
```

### Phase 4: Validation (15 minutes)
```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Build check
ng build --configuration=production

# 3. Test check
ng test --watch=false --browsers=ChromeHeadless

# 4. Lint check
ng lint
```

---

## 🎯 Success Metrics

**Migration is successful when:**
- ✅ Application builds without errors
- ✅ All unit tests pass
- ✅ Runtime functionality matches Angular 11 version
- ✅ No RxJS deprecation warnings
- ✅ TypeScript strict mode can be gradually enabled

**Expected outcomes:**
- 🎯 325 RxJS errors → 0 errors
- 🎯 Angular 12 → Angular 13+ compatibility
- 🎯 Foundation for Angular 14-20 migration
- 🎯 Modern RxJS 7 patterns throughout codebase

---

## 🚨 Emergency Rollback Plan

If migration fails:

```bash
# 1. Stop all processes
# 2. Restore from backup
rm -rf node_modules package-lock.json
cp -r your-project-backup/* ./
npm install

# 3. Verify rollback
ng serve --port 4200
ng test
```

---

## 📞 Support Resources

- **Angular Update Guide**: https://update.angular.io/
- **RxJS Migration Guide**: https://rxjs.dev/guide/v6/migration
- **Angular 13 Breaking Changes**: Check Angular blog
- **Community Support**: Angular Discord, Stack Overflow
