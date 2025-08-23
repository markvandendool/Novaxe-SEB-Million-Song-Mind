# ANGULAR 11 TO REACT CONVERSION PROTOCOL
## OFFICIAL NOVAXE-SEB MIGRATION STANDARDS

**MISSION**: Convert Angular 11 components to React while preserving 100% authenticity and functionality.

**PRIMARY USE CASE**: Converting DIAMOND source (674-line braid.component.ts) to React components.

**🔬 FORENSIC NAMING ENFORCEMENT: [OriginalName]REACTV**

**CRITICAL**: This naming convention prevents contamination and ensures forensic traceability.

**EXAMPLES:**
- BraidComponent → BraidComponentREACTV
- MidiService → MidiServiceREACTV  
- TonalityCalculator → TonalityCalculatorREACTV
- ChordRenderer → ChordRendererREACTV

**FORBIDDEN (CAUSES CONTAMINATION):**
- BraidComponent → ReactBraid ❌
- MidiService → ReactMidiService ❌
- TonalityCalculator → ReactTonalityCalculator ❌

**INTEGRITY REQUIREMENTS:**
- Line count mapping documented
- Musical logic 100% preserved
- Pixel-perfect styling fidelity
- Font system integrity verified
- Output verification logs required

---

## 🎯 CONVERSION METHODOLOGY

### 1. COMPONENT STRUCTURE CONVERSION

#### Angular 11 Component Structure:
```typescript
@Component({
  selector: 'app-braid',
  templateUrl: './braid.component.html',
  styleUrls: ['./braid.component.css']
})
export class BraidComponent implements OnInit, OnDestroy {
  @Input() inputProp: string;
  @Output() eventEmitter = new EventEmitter<any>();
  
  private subscription: Subscription;
  
  constructor(private service: SomeService) {}
  
  ngOnInit() {
    // Initialization logic
  }
  
  ngOnDestroy() {
    // Cleanup logic
  }
}
```

#### React Equivalent:
```typescript
import React, { useState, useEffect, useCallback } from 'react';

interface BraidProps {
  inputProp: string;
  onEventEmitter?: (data: any) => void;
}

export const BraidComponent: React.FC<BraidProps> = ({ 
  inputProp, 
  onEventEmitter 
}) => {
  const [state, setState] = useState(initialState);
  
  // ngOnInit equivalent
  useEffect(() => {
    // Initialization logic
    
    // ngOnDestroy equivalent (cleanup)
    return () => {
      // Cleanup logic
    };
  }, []);
  
  return (
    <div className="braid-component">
      {/* JSX template */}
    </div>
  );
};
```

---

## 🔄 LIFECYCLE METHODS MAPPING

| Angular 11 | React Hook | Purpose |
|-------------|------------|---------|
| `ngOnInit` | `useEffect(() => {}, [])` | Component initialization |
| `ngOnDestroy` | `useEffect(() => { return () => {} }, [])` | Cleanup on unmount |
| `ngOnChanges` | `useEffect(() => {}, [prop])` | Respond to prop changes |
| `ngAfterViewInit` | `useLayoutEffect(() => {}, [])` | After DOM ready |

---

## 📝 TEMPLATE SYNTAX CONVERSION

### Property Binding
```typescript
// Angular
<div [className]="dynamicClass" [style.color]="textColor">

// React
<div className={dynamicClass} style={{color: textColor}}>
```

### Event Binding
```typescript
// Angular
<button (click)="handleClick($event)">

// React
<button onClick={handleClick}>
```

### Two-Way Binding
```typescript
// Angular
<input [(ngModel)]="value">

// React
<input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>
```

### Conditional Rendering
```typescript
// Angular
<div *ngIf="condition">Content</div>

// React
{condition && <div>Content</div>}
```

### List Rendering
```typescript
// Angular
<div *ngFor="let item of items; trackBy: trackByFn">
  {{item.name}}
</div>

// React
{items.map(item => (
  <div key={item.id}>
    {item.name}
  </div>
))}
```

---

## 🔧 SERVICE AND DEPENDENCY INJECTION CONVERSION

### Angular Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data$ = new BehaviorSubject<any[]>([]);
  
  getData() {
    return this.data$.asObservable();
  }
}

// Component usage
constructor(private dataService: DataService) {}

ngOnInit() {
  this.subscription = this.dataService.getData().subscribe(data => {
    this.data = data;
  });
}
```

### React Equivalent (Custom Hook)
```typescript
// Custom hook
export const useDataService = () => {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Service logic here
    const subscription = dataSource.subscribe(setData);
    return () => subscription.unsubscribe();
  }, []);
  
  return data;
};

// Component usage
const BraidComponent: React.FC = () => {
  const data = useDataService();
  // ...
};
```

---

## 🎵 ANGULAR 11 SPECIFIC PATTERNS

### ViewChild → useRef
```typescript
// Angular
@ViewChild('canvasRef', { static: false }) canvasRef: ElementRef;

ngAfterViewInit() {
  const canvas = this.canvasRef.nativeElement;
}

// React
const canvasRef = useRef<HTMLCanvasElement>(null);

useLayoutEffect(() => {
  const canvas = canvasRef.current;
}, []);
```

### HostListener → useEffect with event listeners
```typescript
// Angular
@HostListener('window:resize', ['$event'])
onResize(event) {
  // Handle resize
}

// React
useEffect(() => {
  const handleResize = (event: Event) => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 🎯 STATE MANAGEMENT CONVERSION

### Angular Component State
```typescript
export class BraidComponent {
  public rotation: number = 0;
  public activeKey: string = 'C';
  private intervals: number[] = [];
  
  setRotation(value: number) {
    this.rotation = value;
  }
}
```

### React State
```typescript
export const BraidComponent: React.FC = () => {
  const [rotation, setRotation] = useState<number>(0);
  const [activeKey, setActiveKey] = useState<string>('C');
  const [intervals, setIntervals] = useState<number[]>([]);
  
  const updateRotation = useCallback((value: number) => {
    setRotation(value);
  }, []);
  
  return (
    // JSX
  );
};
```

---

## 🔍 RXJS TO REACT PATTERNS

### Observable → useState + useEffect
```typescript
// Angular
interval$ = interval(1000);

ngOnInit() {
  this.subscription = this.interval$.subscribe(tick => {
    this.currentTick = tick;
  });
}

// React
const [currentTick, setCurrentTick] = useState(0);

useEffect(() => {
  const intervalId = setInterval(() => {
    setCurrentTick(prev => prev + 1);
  }, 1000);
  
  return () => clearInterval(intervalId);
}, []);
```

---

## 🎵 BRAID COMPONENT SPECIFIC CONVERSIONS

### Musical Data Handling
```typescript
// Angular braid pattern
private tonalities: BraidTonality[] = [];

loadTonalities() {
  this.http.get<BraidTonality[]>('/assets/braid_tonalities.json')
    .subscribe(data => this.tonalities = data);
}

// React equivalent
const [tonalities, setTonalities] = useState<BraidTonality[]>([]);

useEffect(() => {
  fetch('/data/braid_tonalities.json')
    .then(res => res.json())
    .then(setTonalities);
}, []);
```

### Canvas Animation Patterns
```typescript
// Angular animation loop
private animationId: number;

startAnimation() {
  const animate = () => {
    this.updateCanvas();
    this.animationId = requestAnimationFrame(animate);
  };
  animate();
}

// React equivalent
const animationIdRef = useRef<number>();

const startAnimation = useCallback(() => {
  const animate = () => {
    updateCanvas();
    animationIdRef.current = requestAnimationFrame(animate);
  };
  animate();
}, []);

useEffect(() => {
  return () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };
}, []);
```

---

## 🚫 CONVERSION ANTI-PATTERNS (AVOID)

❌ **DON'T**: Convert Angular templates to string concatenation
❌ **DON'T**: Use class components for new conversions
❌ **DON'T**: Ignore TypeScript types during conversion
❌ **DON'T**: Convert Angular services to singletons
❌ **DON'T**: Use document.getElementById instead of refs

✅ **DO**: Use functional components with hooks
✅ **DO**: Maintain strict TypeScript typing
✅ **DO**: Convert services to custom hooks
✅ **DO**: Use React patterns for DOM access

---

## 🎯 DIAMOND BRAID CONVERSION CHECKLIST

For converting the 674-line braid.component.ts:

### Phase 1: Structure
- [ ] Convert class component to functional component
- [ ] Map all @Input props to component props interface
- [ ] Convert @Output events to callback props
- [ ] Extract all private methods to custom hooks or helper functions

### Phase 2: State Management
- [ ] Convert all component properties to useState hooks
- [ ] Map all method bindings to useCallback hooks
- [ ] Convert subscriptions to useEffect patterns

### Phase 3: Template Conversion
- [ ] Convert Angular template syntax to JSX
- [ ] Map all *ngFor loops to .map() patterns
- [ ] Convert *ngIf conditions to conditional rendering
- [ ] Replace Angular pipes with JavaScript functions

### Phase 4: Services & Dependencies
- [ ] Convert Angular services to custom hooks
- [ ] Map HTTP requests to fetch/axios patterns
- [ ] Convert observables to Promise-based patterns

### Phase 5: Testing & Validation
- [ ] Verify all original functionality preserved
- [ ] Test musical progressions and tonalities
- [ ] Validate canvas rendering and animations
- [ ] Confirm font rendering with nvxChord glyphs

---

## 🔧 TOOLS AND UTILITIES

### Recommended Libraries
- **State Management**: useState, useReducer (built-in)
- **HTTP Requests**: fetch API or axios
- **Animations**: Framer Motion or CSS transitions
- **Canvas**: HTML5 Canvas API with useRef
- **Audio**: Web Audio API or Tone.js

### Development Tools
- **TypeScript**: Maintain strict typing throughout
- **ESLint**: React-specific linting rules
- **Testing**: Jest + React Testing Library

---

## 🎵 AUTHENTICATION PROTOCOL

**MANDATORY**: Before any Angular to React conversion:

1. ✅ Verify original Angular component functionality
2. ✅ Document all inputs, outputs, and dependencies
3. ✅ Test original component in Angular environment
4. ✅ Create comprehensive conversion plan
5. ✅ Implement conversion following this protocol
6. ✅ Test converted React component thoroughly
7. ✅ Validate 100% feature parity with original

**FAILURE TO FOLLOW**: Results in component recreation and loss of authenticity.

---

## 📚 REFERENCE IMPLEMENTATION

See `apps/million-song-mind/src/components/MusicalBubbles.tsx` for example of successful Angular to React conversion maintaining authentic Novaxe SEB functionality.

---

**STATUS**: OFFICIAL PROTOCOL - MANDATORY FOR ALL ANGULAR TO REACT CONVERSIONS
**VERSION**: 1.0.0
**LAST UPDATED**: August 20, 2025
**AUTHORITY**: Novaxe-SEB Million Song Mind Project
