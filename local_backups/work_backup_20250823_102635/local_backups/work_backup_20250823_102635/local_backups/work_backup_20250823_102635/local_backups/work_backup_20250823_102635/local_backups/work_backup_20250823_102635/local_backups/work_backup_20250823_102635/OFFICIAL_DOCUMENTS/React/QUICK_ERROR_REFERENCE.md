# ⚛️ REACT QUICK ERROR REFERENCE  
**Last Updated:** August 20, 2025

---

## 🔥 **MOST COMMON REACT ERRORS**

### **1. Hook Errors**
```
ERROR: Cannot read property of undefined (useState)
SOLUTION: Initialize state with proper default values

ERROR: React Hook "useState" is called conditionally
SOLUTION: Hooks must be called at the top level, never inside loops/conditions

ERROR: Too many re-renders. React limits the number of renders
SOLUTION: Check useEffect dependencies, avoid infinite re-render loops
```

### **2. JSX Syntax Errors**
```
ERROR: Adjacent JSX elements must be wrapped in an enclosing tag
SOLUTION: Use React.Fragment <></> or div wrapper

ERROR: Cannot read property 'map' of undefined
SOLUTION: Use optional chaining: data?.map() or check if data exists

ERROR: Objects are not valid as a React child
SOLUTION: Render primitive values, not objects directly
```

### **3. Component Import/Export Errors**
```
ERROR: Module not found: Can't resolve '[component]'
SOLUTION: Check file path and export/import statements

ERROR: Element type is invalid
SOLUTION: Check component is properly exported and imported

ERROR: Cannot resolve module
SOLUTION: Verify file extensions (.tsx, .jsx) and relative paths
```

### **4. TypeScript Integration Errors**
```
ERROR: Property does not exist on type
SOLUTION: Define proper TypeScript interfaces/types

ERROR: Argument of type 'string' is not assignable to parameter of type 'never'
SOLUTION: Check union types and type assertions

ERROR: Cannot find module declarations
SOLUTION: Add @types/ packages or create type declaration files
```

### **5. Event Handling Errors**
```
ERROR: Cannot read property 'target' of undefined
SOLUTION: Check event parameter is passed correctly to handler

ERROR: This is undefined in event handler
SOLUTION: Use arrow functions or bind event handlers properly

ERROR: setState is not a function
SOLUTION: Check component state management and handler context
```

---

## 🎯 **REACT-SPECIFIC PATTERNS FOR MSM PROJECT**

### **Functional Component with Hooks:**
```typescript
const BraidComponent: React.FC<BraidProps> = ({ 
  focusKey, 
  onChordClick 
}) => {
  const [tonality, setTonality] = useState('C');
  const [displayRoman, setDisplayRoman] = useState(false);
  
  useEffect(() => {
    // Side effects here
  }, [tonality]);
  
  return <div>{/* JSX here */}</div>;
};
```

### **Custom Hook Pattern:**
```typescript
const useAuthenticBraid = () => {
  const [state, setState] = useState(initialState);
  
  const rotatedArrays = useMemo(() => 
    rotateArraysForTonality(tonality, tonalities), 
    [tonality, tonalities]
  );
  
  return { state, setState, rotatedArrays };
};
```

### **TypeScript Props Interface:**
```typescript
interface BraidProps {
  focusKey?: string;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  onChordClick?: (chord: string) => void;
  selectedChords?: string[];
  displayRoman?: boolean;
}
```

---

## 📚 **QUICK REFERENCE COMMANDS**

### **React Development Commands:**
```bash
npm create react-app app-name --template typescript
npm start
npm run build
npm test
npm run eject
```

### **Debug Commands:**
```bash
# Check React version
npm list react

# Start with specific port
npm start -- --port 3001

# Build with profiling
npm run build -- --profile
```

---

## 🔧 **MSM-SPECIFIC TROUBLESHOOTING**

### **Vite + React Issues:**
```typescript
// Import path resolution
import { Component } from '@/components/Component';
// Ensure vite.config.ts has proper alias configuration

// Asset imports
import braidData from '@/data/braid_tonalities.json';
// Ensure JSON imports are typed properly
```

### **Audio Integration:**
```typescript
// Web Audio API in React
const audioContext = useMemo(() => new AudioContext(), []);

// MIDI integration
useEffect(() => {
  // MIDI setup
  return () => {
    // Cleanup
  };
}, []);
```

---

**FILE STATUS:** Ready for instant error lookup  
**CROSS-REFERENCE:** Links to main React documentation folder  
**SEARCH COMMAND:** `grep -r "error_text" /OFFICIAL_DOCUMENTS/React/`
