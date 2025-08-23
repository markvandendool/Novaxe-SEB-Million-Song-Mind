# 🔷 TYPESCRIPT QUICK ERROR REFERENCE
**Last Updated:** August 20, 2025

---

## 🔥 **MOST COMMON TYPESCRIPT ERRORS**

### **1. Type Assignment Errors**
```
ERROR: Type 'string' is not assignable to type 'number'
SOLUTION: Check variable types and ensure proper type conversion

ERROR: Property 'x' does not exist on type 'y'
SOLUTION: Define proper interface or use optional properties (?)

ERROR: Object is possibly 'null' or 'undefined'
SOLUTION: Use optional chaining (?.) or null checks
```

### **2. Function Type Errors**
```
ERROR: Expected 2 arguments, but got 1
SOLUTION: Check function signature and provide all required parameters

ERROR: Cannot invoke an expression whose type lacks a call signature
SOLUTION: Ensure function is properly typed and callable

ERROR: This expression is not callable
SOLUTION: Check function declaration and invocation syntax
```

### **3. Array and Object Type Errors**
```
ERROR: Element implicitly has an 'any' type
SOLUTION: Define proper array/object types or enable strict mode

ERROR: Index signature is missing in type
SOLUTION: Define index signature [key: string]: any or specific type

ERROR: Type 'unknown' is not assignable
SOLUTION: Use type assertions or type guards to narrow types
```

### **4. Module and Import Errors**
```
ERROR: Cannot find module 'module-name' or its corresponding type declarations
SOLUTION: Install @types/module-name or create type declaration file

ERROR: Module has no default export
SOLUTION: Use named imports or check module export syntax

ERROR: Cannot resolve module
SOLUTION: Check tsconfig paths and module resolution settings
```

### **5. Generic Type Errors**
```
ERROR: Type 'T' is not assignable to type 'U'
SOLUTION: Check generic constraints and type relationships

ERROR: Generic type 'Array<T>' requires 1 type argument(s)
SOLUTION: Provide type parameter: Array<string> or string[]

ERROR: Cannot find name 'T'
SOLUTION: Declare generic type parameter in function/class signature
```

---

## 🎯 **TYPESCRIPT PATTERNS FOR OUR PROJECT**

### **DIAMOND Angular Component Types:**
```typescript
// Service injection types
interface BraidComponent {
  _chord: Array<string>;
  _midi_chord: Array<string>;
  tonic: Array<string>;
  displayed_chord: string;
  cur_score_chord: string;
}

// Input setter type
@Input() set cur_chord(valeur: Array<any>) {
  this.change_midi_chord(valeur);
}
```

### **MSM React Component Types:**
```typescript
// Props interface
interface BraidTonalProps {
  focusKey?: string;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  onChordClick?: (chord: string) => void;
  selectedChords?: string[];
  displayRoman?: boolean;
}

// Hook return type
interface AuthenticBraidHook {
  tonality: string;
  setTonality: (t: string) => void;
  displayRoman: boolean;
  rotatedArrays: RotatedArrays;
}
```

### **Musical Data Types:**
```typescript
// Tonality structure
interface TonalSet {
  center_major: string[];
  center_minor: string[];
  left_up: string[];
  left_down: string[];
  right_up: string[];
  right_down: string[];
  outer_left_up: string[];
  outer_left_down: string[];
  outer_right_up: string[];
  outer_right_down: string[];
}

// Braid tonalities
interface BraidTonalities {
  roman: Record<string, string[]>;
  empty: Record<string, string[]>;
  [key: string]: TonalSet | Record<string, string[]>;
}
```

---

## 📚 **QUICK REFERENCE COMMANDS**

### **TypeScript Compiler Commands:**
```bash
tsc --init
tsc --watch
tsc --noEmit (type checking only)
tsc --declaration (generate .d.ts files)
```

### **Type Checking Commands:**
```bash
# Check types without compilation
npx tsc --noEmit

# Watch mode
npx tsc --watch

# Specific file
npx tsc file.ts --noEmit
```

---

## 🔧 **PROJECT-SPECIFIC CONFIGURATIONS**

### **tsconfig.json for MSM:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **Angular tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "es2020",
    "lib": ["es2018", "dom"],
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 🚨 **CRITICAL ERROR SOLUTIONS**

### **Cannot find module errors:**
```bash
# Install missing types
npm install @types/node @types/react @types/react-dom

# For custom modules, create types.d.ts:
declare module '*.json' {
  const value: any;
  export default value;
}
```

### **Strict mode errors:**
```typescript
// Use non-null assertion operator (!)
const value = getValue()!;

// Use optional chaining
const prop = obj?.property?.subProperty;

// Type guards
if (typeof value === 'string') {
  // value is now typed as string
}
```

---

**FILE STATUS:** Ready for instant error lookup  
**CROSS-REFERENCE:** Links to TypeScript documentation folder  
**SEARCH COMMAND:** `grep -r "error_text" /OFFICIAL_DOCUMENTS/TypeScript/`
