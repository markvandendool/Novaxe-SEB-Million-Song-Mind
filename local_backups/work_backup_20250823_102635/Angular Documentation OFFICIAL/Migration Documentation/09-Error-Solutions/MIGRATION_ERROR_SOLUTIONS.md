# Migration Error Solutions Database

**Date:** August 20, 2025  
**Purpose:** Comprehensive error solutions for Angular → React migration  
**Based on:** Archaeological evidence from previous DIAMOND migration attempts  

---

## 🚨 **CRITICAL ERRORS FROM ARCHAEOLOGICAL EVIDENCE**

### **Error Category 1: RxJS Import Issues (15+ errors)**

**Error Pattern:**
```
Error: Module '"rxjs"' has no exported member 'map'
Error: Module '"rxjs"' has no exported member 'filter'  
Error: Module '"rxjs"' has no exported member 'switchMap'
```

**Root Cause:** RxJS 6+ requires importing operators from `rxjs/operators`

**Solution:**
```typescript
// ❌ Wrong (Angular < 6 style)
import { map, filter, switchMap } from 'rxjs';

// ✅ Correct (Angular 6+ style)  
import { map, filter, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// 🔄 React Migration
// Convert to React patterns instead of fixing RxJS
const useObservableData = (source$: Observable<T>) => {
  const [data, setData] = useState<T>();
  
  useEffect(() => {
    const subscription = source$.subscribe(setData);
    return () => subscription.unsubscribe();
  }, [source$]);
  
  return data;
};
```

### **Error Category 2: TonalJS Dependency Conflicts (8+ errors)**

**Error Pattern:**
```
Error: Cannot resolve module '@tonaljs/tonal'
Error: Module '"@tonaljs/chord"' has no exported member 'detect'
Error: Property 'symbol' does not exist on type 'Chord'
```

**Root Cause:** TonalJS version incompatibility between Angular versions

**Solution:**
```bash
# Check current TonalJS version compatibility
npm ls @tonaljs/tonal

# For Angular 11-15 (DIAMOND compatible)
npm install @tonaljs/tonal@4.9.0 @tonaljs/chord@4.8.0 @tonaljs/scale@4.8.0

# For Angular 16+ / React migration
npm install @tonaljs/tonal@^5.0.0

# Update import patterns
// ❌ Old pattern (DIAMOND style)
import { Chord } from '@tonaljs/tonal';

// ✅ New pattern (Modern style)  
import { Chord } from '@tonaljs/chord';
import { Scale } from '@tonaljs/scale';
```

### **Error Category 3: WebMIDI Type Errors (12+ errors)**

**Error Pattern:**
```
Error: Property 'requestMIDIAccess' does not exist on type 'Navigator'
Error: Type 'MIDIAccess' has no property 'inputs'
Error: Cannot find name 'MIDIMessageEvent'
```

**Root Cause:** Missing WebMIDI type definitions

**Solution:**
```bash
# Install WebMIDI types
npm install --save-dev @types/webmidi

# Add to tsconfig.json
{
  "compilerOptions": {
    "types": ["webmidi"]
  }
}
```

```typescript
// Type-safe WebMIDI implementation
interface CustomMIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
}

const initializeMidi = async (): Promise<CustomMIDIAccess | null> => {
  if (!navigator.requestMIDIAccess) {
    console.warn('WebMIDI not supported');
    return null;
  }
  
  try {
    const access = await navigator.requestMIDIAccess();
    return access as CustomMIDIAccess;
  } catch (error) {
    console.error('MIDI initialization failed:', error);
    return null;
  }
};
```

### **Error Category 4: Angular Build Configuration (10+ errors)**

**Error Pattern:**
```
Error: Option "vendorChunk" is deprecated
Error: Unknown option: 'experimentalRollupPass'
Error: Cannot read property 'config' of undefined
```

**Root Cause:** Angular.json configuration incompatible with newer versions

**Solution:**
```json
// Update angular.json for Angular 20
{
  "projects": {
    "diamond-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "optimization": true,
            "sourceMap": false,
            "namedChunks": false,
            // ❌ Remove deprecated options
            // "vendorChunk": false,
            // "experimentalRollupPass": true,
            
            // ✅ Add modern options
            "buildOptimizer": true,
            "aot": true
          }
        }
      }
    }
  }
}
```

### **Error Category 5: TypeScript Version Conflicts (20+ errors)**

**Error Pattern:**
```
Error: Type 'string | undefined' is not assignable to type 'string'
Error: Object is possibly 'null'
Error: Property 'subscribe' does not exist on type 'Observable<unknown>'
```

**Root Cause:** Stricter TypeScript checking in newer versions

**Solution:**
```typescript
// ❌ Old loose typing (DIAMOND style)
class BraidComponent {
  selectedFifth: string;
  
  handleClick(event) {
    this.selectedFifth = event.target.value;
  }
}

// ✅ Strict typing (Migration ready)
interface BraidComponentProps {
  selectedFifth: string | undefined;
  onFifthChange: (fifth: string) => void;
}

const BraidComponent: React.FC<BraidComponentProps> = ({
  selectedFifth,
  onFifthChange
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.target as HTMLButtonElement;
    if (target.value) {
      onFifthChange(target.value);
    }
  };
  
  return (
    <div>
      Current Fifth: {selectedFifth ?? 'None selected'}
    </div>
  );
};
```

---

## 🔧 **SYSTEMATIC ERROR RESOLUTION APPROACH**

### **Step 1: Dependency Audit**
```bash
# Check all dependencies for version conflicts
npm ls --depth=0

# Check for security vulnerabilities  
npm audit

# Update compatible packages
npm update

# Check Angular CLI version compatibility
ng version
```

### **Step 2: TypeScript Configuration**
```json
// tsconfig.json - Migration ready configuration
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ES2020",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "types": ["node", "webmidi", "@types/web-audio-api"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **Step 3: Build System Update**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Angular CLI cache
ng cache clean

# Rebuild with verbose logging
ng build --verbose --configuration=production
```

### **Step 4: Runtime Error Monitoring**
```typescript
// Add comprehensive error boundary (React)
class MigrationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Migration Error:', {
      error,
      errorInfo,
      component: 'DIAMOND Migration',
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Migration Error Detected</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📊 **ERROR TRACKING TEMPLATE**

### **Error Log Format:**
```markdown
## Error #[NUMBER]: [BRIEF DESCRIPTION]

**File:** `path/to/file.ts:line`  
**Error Type:** [Compilation|Runtime|Build|Type]  
**Severity:** [Critical|High|Medium|Low]  

**Error Message:**
```
[Exact error message from console]
```

**Root Cause:**
[Analysis of why error occurs]

**Solution Applied:**
```typescript
// Code changes made to fix
```

**Verification:**
- [ ] Error resolved
- [ ] Functionality preserved  
- [ ] No regressions introduced
- [ ] Performance impact acceptable

**Notes:**
[Additional context, gotchas, related issues]
```

---

## 🎯 **PREVENTION STRATEGIES**

### **Before Migration:**
1. **Complete dependency audit** - Check all package compatibility
2. **Create error tracking system** - Systematic logging approach
3. **Establish rollback points** - Git checkpoints at each stage  
4. **Performance baseline** - Measure current system performance

### **During Migration:**
1. **One component at a time** - Avoid massive changes
2. **Continuous testing** - Verify functionality at each step
3. **Error documentation** - Log every error with solution
4. **Regular commits** - Frequent checkpoint saves

### **After Migration:**
1. **Comprehensive testing** - All features working
2. **Performance validation** - Meets or exceeds original
3. **Error monitoring** - Production error tracking
4. **Documentation update** - Share lessons learned

---

*Migration Error Solutions Database - Part of DIAMOND Migration Documentation*
