# ANGULAR 11 TO REACT QUICK REFERENCE GUIDE
## INSTANT CONVERSION PATTERNS

**PURPOSE**: Immediate reference for common Angular 11 to React conversions during DIAMOND braid component migration.

**🔬 FORENSIC NAMING PROTOCOL: [OriginalName]REACTV**

**MANDATORY NAMING EXAMPLES:**
- BraidComponent → BraidComponentREACTV ✅
- MidiService → MidiServiceREACTV ✅  
- TonalityCalculator → TonalityCalculatorREACTV ✅

**FORBIDDEN NAMING (CONTAMINATION RISK):**
- BraidComponent → ReactBraid ❌
- MidiService → ReactMidiService ❌

**LINE COUNT VERIFICATION REQUIRED FOR ALL CONVERSIONS**

---

## 🚀 INSTANT CONVERSION PATTERNS

### Component Declaration
```typescript
// FROM (Angular 11)
@Component({
  selector: 'app-braid',
  template: `<div>Content</div>`
})
export class BraidComponent implements OnInit {

// TO (React)
export const BraidComponent: React.FC<BraidProps> = (props) => {
  return <div>Content</div>;
};
```

### Props/Inputs
```typescript
// FROM
@Input() rotation: number = 0;
@Input() activeKey: string = 'C';

// TO
interface BraidProps {
  rotation?: number;
  activeKey?: string;
}
const { rotation = 0, activeKey = 'C' } = props;
```

### Events/Outputs
```typescript
// FROM
@Output() rotationChange = new EventEmitter<number>();
this.rotationChange.emit(newValue);

// TO
interface BraidProps {
  onRotationChange?: (value: number) => void;
}
onRotationChange?.(newValue);
```

### State Management
```typescript
// FROM
public currentIndex: number = 0;
setCurrentIndex(index: number) { this.currentIndex = index; }

// TO
const [currentIndex, setCurrentIndex] = useState<number>(0);
```

### Lifecycle
```typescript
// FROM
ngOnInit() { this.initialize(); }
ngOnDestroy() { this.cleanup(); }

// TO
useEffect(() => {
  initialize();
  return () => cleanup();
}, []);
```

### Template Syntax
```typescript
// FROM
<div *ngFor="let item of items; let i = index">
  <span [class.active]="i === activeIndex">{{item.name}}</span>
</div>

// TO
{items.map((item, i) => (
  <div key={item.id}>
    <span className={i === activeIndex ? 'active' : ''}>{item.name}</span>
  </div>
))}
```

### Event Handlers
```typescript
// FROM
<button (click)="handleClick($event)">Click</button>
handleClick(event: MouseEvent) { /* logic */ }

// TO
<button onClick={handleClick}>Click</button>
const handleClick = (event: React.MouseEvent) => { /* logic */ };
```

### ViewChild/Refs
```typescript
// FROM
@ViewChild('canvas', { static: false }) canvasRef: ElementRef;
const canvas = this.canvasRef.nativeElement;

// TO
const canvasRef = useRef<HTMLCanvasElement>(null);
const canvas = canvasRef.current;
```

### Services to Hooks
```typescript
// FROM
constructor(private dataService: DataService) {}
ngOnInit() {
  this.dataService.getData().subscribe(data => this.data = data);
}

// TO
const useDataService = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  return data;
};
const data = useDataService();
```

---

## 🎵 BRAID-SPECIFIC PATTERNS

### Musical Progression Logic
```typescript
// FROM (Angular)
private currentProgression: number[] = [];
updateProgression(key: string) {
  this.currentProgression = this.calculateProgression(key);
  this.triggerUpdate();
}

// TO (React)
const [currentProgression, setCurrentProgression] = useState<number[]>([]);
const updateProgression = useCallback((key: string) => {
  const newProgression = calculateProgression(key);
  setCurrentProgression(newProgression);
}, []);
```

### Canvas Animation
```typescript
// FROM
private animationLoop() {
  this.drawFrame();
  requestAnimationFrame(() => this.animationLoop());
}

// TO
const animationIdRef = useRef<number>();
const animationLoop = useCallback(() => {
  drawFrame();
  animationIdRef.current = requestAnimationFrame(animationLoop);
}, []);
```

### Font Rendering
```typescript
// FROM
@HostBinding('style.font-family') fontFamily = 'nvxChord';

// TO
<div style={{ fontFamily: 'nvxChord' }}>
```

### Audio Context
```typescript
// FROM
private audioContext: AudioContext;
ngOnInit() {
  this.audioContext = new AudioContext();
}

// TO
const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
useEffect(() => {
  setAudioContext(new AudioContext());
}, []);
```

---

## 🔧 CONVERSION SHORTCUTS

### Method Conversion
```typescript
// FROM
public calculateRotation(degrees: number): number {
  return degrees * Math.PI / 180;
}

// TO
const calculateRotation = useCallback((degrees: number): number => {
  return degrees * Math.PI / 180;
}, []);
```

### Subscription Management
```typescript
// FROM
private subscriptions: Subscription[] = [];
ngOnDestroy() {
  this.subscriptions.forEach(sub => sub.unsubscribe());
}

// TO
useEffect(() => {
  const cleanupFunctions: (() => void)[] = [];
  // Add cleanup functions to array
  return () => cleanupFunctions.forEach(cleanup => cleanup());
}, []);
```

### Conditional Classes
```typescript
// FROM
[class.active]="isActive"
[class.rotating]="isRotating"

// TO
className={`base-class ${isActive ? 'active' : ''} ${isRotating ? 'rotating' : ''}`}
// OR
className={clsx('base-class', { active: isActive, rotating: isRotating })}
```

---

## 🚫 COMMON PITFALLS

❌ **Forgetting key props** in lists
❌ **Using `this.` syntax** in React
❌ **Direct DOM manipulation** instead of refs
❌ **Class methods** instead of useCallback
❌ **Forgetting dependencies** in useEffect

✅ **Always add key props** to mapped elements
✅ **Use hooks** for all state and lifecycle
✅ **Use refs** for DOM access
✅ **Use useCallback** for event handlers
✅ **Include all dependencies** in useEffect

---

## 🎯 VALIDATION CHECKLIST

For each converted component:

- [ ] **FORENSIC NAMING**: Component named [Original]REACTV (MANDATORY)
- [ ] **FORENSIC HEADER**: Complete migration record documented
- [ ] **LINE COUNT**: Original vs React line mapping documented
- [ ] All @Input props converted to props interface
- [ ] All @Output events converted to callback props
- [ ] All lifecycle methods mapped to useEffect
- [ ] All component state converted to useState
- [ ] All methods converted to useCallback
- [ ] All template syntax converted to JSX
- [ ] All ViewChild refs converted to useRef
- [ ] All subscriptions properly cleaned up
- [ ] TypeScript types maintained
- [ ] Original functionality preserved
- [ ] **MUSICAL LOGIC**: 100% preservation verified (if applicable)
- [ ] **STYLING FIDELITY**: Pixel-perfect matching verified
- [ ] **FONT INTEGRITY**: nvxChord glyphs preserved (if applicable)
- [ ] **OUTPUT VERIFICATION**: Console logs implemented

**MANDATORY FORENSIC HEADER:**
```typescript
/**
 * FORENSIC MIGRATION RECORD
 * =========================
 * ORIGINAL: [ComponentName] (Angular 11)
 * SOURCE: [exact file path]
 * LINES: [original line count]
 * REACT VERSION: [ComponentName]REACTV
 * MIGRATION DATE: [date]
 * INTEGRITY LEVEL: 100% (VERIFIED)
 */
```

---

**NEXT STEPS**: Apply these patterns to convert `braid.component.ts` (674 lines) to `BraidComponentREACTV.tsx` while preserving all musical functionality and authenticity.
