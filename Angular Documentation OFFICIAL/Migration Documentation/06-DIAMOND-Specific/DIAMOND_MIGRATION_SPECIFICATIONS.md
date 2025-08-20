# DIAMOND Application Migration Specifications

**Date:** August 20, 2025  
**Purpose:** Specialized migration documentation for DIAMOND musical intelligence application  
**Source:** Complete forensic audit of 127,000+ lines of DIAMOND code  

---

## 🎯 **DIAMOND APPLICATION PROFILE**

### **Core Statistics:**
- **Total Lines:** 127,000+ lines of code
- **Angular Version:** 11.2.14
- **TypeScript Files:** 185 files (97 implementation, 86 test files)
- **HTML Templates:** 56 files
- **SCSS Files:** 53 files
- **Asset Files:** 180 files (37MB total)
- **Dependencies:** 694 import statements
- **Observable Patterns:** 108 complex RxJS patterns
- **Services:** 20+ interconnected services
- **Components:** 42 specialized component directories

---

## 🎼 **MUSICAL INTELLIGENCE CORE**

### **1. Braid Component (Crown Jewel)**
**File:** `braid.component.ts` (39,545 bytes)
**Complexity:** EXTREME
**Key Features:**
- 10-position bubble layout system
- 17-element tonality arrays  
- Real-time MIDI chord detection
- Roman numeral notation system
- Interactive rotation with musical progressions

**Migration Challenges:**
```typescript
// Angular Pattern (simplified excerpt)
export class BraidComponent implements OnInit {
  @Input() selectedFifth: string;
  @Input() selectedMode: string;
  
  bubbleData = [
    { position: 0, chord: 'I', roman: 'I', note: 'C' },
    { position: 1, chord: 'V', roman: 'V', note: 'G' },
    // ... 8 more positions
  ];
  
  private selectionService = inject(SelectionService);
  private midiService = inject(MidiService);
  private tonalityService = inject(TonalityService);
  
  handleBubbleClick(position: number) {
    // Complex musical logic
    this.calculateProgression(position);
    this.updateMusicalState();
    this.emitMidiEvents();
  }
}

// React Conversion Requirements
interface BraidProps {
  selectedFifth: string;
  selectedMode: string;
  onProgressionChange: (progression: MusicalProgression) => void;
}

const BraidComponent: React.FC<BraidProps> = ({ 
  selectedFifth, 
  selectedMode, 
  onProgressionChange 
}) => {
  const { selectionState, updateSelection } = useSelectionContext();
  const { sendMidiEvent } = useMidiService();
  const { calculateTonality } = useTonalityService();
  
  // Need to preserve exact musical algorithm logic
};
```

### **2. Musical Intelligence Services**

**Key Services to Migrate:**
- `MidiService` - Hardware MIDI integration
- `SelectionService` - Musical state management  
- `TonalityService` - Harmonic analysis
- `ExerciseGeneratorService` - Educational content
- `AudioPlayerService` - WebAudio integration
- `TransportService` - Timing and playback

**Migration Pattern Example:**
```typescript
// Angular MidiService (simplified)
@Injectable({ providedIn: 'root' })
export class MidiService {
  private midiAccess$ = new BehaviorSubject<WebMidi.MIDIAccess | null>(null);
  private chordDetection$ = new Subject<Chord>();
  
  async initializeMidi() {
    const access = await navigator.requestMIDIAccess();
    this.midiAccess$.next(access);
    this.setupMidiHandlers(access);
  }
  
  detectChord(notes: number[]): Observable<Chord> {
    return this.chordDetection$.pipe(
      map(chord => this.processChordDetection(chord)),
      filter(chord => chord.confidence > 0.8)
    );
  }
}

// React Equivalent
const MidiContext = createContext<MidiContextType | null>(null);

export const useMidiService = () => {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [detectedChords, setDetectedChords] = useState<Chord[]>([]);
  
  const initializeMidi = useCallback(async () => {
    const access = await navigator.requestMIDIAccess();
    setMidiAccess(access);
    setupMidiHandlers(access);
  }, []);
  
  const detectChord = useCallback((notes: number[]) => {
    // Preserve exact chord detection algorithm
    return processChordDetection(notes);
  }, []);
  
  return { midiAccess, initializeMidi, detectChord, detectedChords };
};
```

---

## 🔧 **CRITICAL DEPENDENCIES**

### **Musical Libraries:**
```typescript
// TonalJS Integration (43 integration points)
import { Chord, Scale, Note, Interval } from '@tonaljs/tonal';

// Migration Requirements:
// - Preserve all 43 TonalJS integration points
// - Maintain exact musical calculations
// - Keep harmonic analysis algorithms intact
// - Ensure chord detection accuracy
```

### **Audio Processing:**
```typescript
// WebAudioFont Integration
import { WebAudioFont } from 'webaudiofont';

// WebMIDI API Usage
interface MIDIAccess {
  inputs: MIDIInputMap;
  outputs: MIDIOutputMap;
}

// Migration Requirements:
// - Preserve real-time audio processing
// - Maintain MIDI hardware compatibility
// - Keep sub-millisecond timing accuracy
// - Ensure Roland GR guitar integration works
```

### **Font System:**
```typescript
// Custom Musical Fonts (5 fonts, professional OpenType)
fonts: [
  'Font Jan16.otf',      // Primary musical notation
  'Chord_Grid_v2.otf',   // Chord symbol rendering  
  'ChordOutlines.otf',   // Musical outlines
  'nvxChord.otf',        // Specialized chord symbols
  'CamvpnAxfHeavy.otf'   // UI typography
]

// Migration Requirements:
// - Preserve all musical notation rendering
// - Maintain font loading performance
// - Keep glyph mapping accuracy
// - Ensure cross-browser compatibility
```

---

## ⚠️ **HIGH-RISK MIGRATION AREAS**

### **1. Real-Time Audio Processing**
**Risk Level:** EXTREME
**Challenge:** Sub-millisecond timing requirements for musical accuracy

```typescript
// Angular Pattern - Web Worker for timing
private worker = new Worker('./chrono.worker.ts');

startHighPrecisionTimer(interval: number) {
  this.worker.postMessage({ type: 'start', interval });
}

// React Equivalent Needed
const useHighPrecisionTimer = () => {
  const workerRef = useRef<Worker>();
  
  useEffect(() => {
    workerRef.current = new Worker('/workers/chrono.worker.js');
    return () => workerRef.current?.terminate();
  }, []);
  
  const startTimer = useCallback((interval: number) => {
    workerRef.current?.postMessage({ type: 'start', interval });
  }, []);
  
  return { startTimer };
};
```

### **2. Observable Chain Complexity**  
**Risk Level:** HIGH
**Challenge:** 108 complex observable patterns with intricate dependencies

```typescript
// Angular Pattern - Complex Observable Chain
private chordProgression$ = combineLatest([
  this.midiService.noteInput$,
  this.selectionService.selectedKey$,
  this.tonalityService.currentMode$
]).pipe(
  debounceTime(100),
  distinctUntilChanged(),
  switchMap(([notes, key, mode]) => 
    this.analyzeProgression(notes, key, mode)
  ),
  shareReplay(1)
);

// React Equivalent Challenge
// Need to preserve exact timing and behavior
```

### **3. Service Interdependency Web**
**Risk Level:** HIGH  
**Challenge:** 20+ services with complex injection patterns

```typescript
// Angular Dependency Web
constructor(
  private midiService: MidiService,
  private selectionService: SelectionService,
  private tonalityService: TonalityService,
  private exerciseService: ExerciseGeneratorService,
  private audioService: AudioPlayerService,
  private transportService: TransportService,
  private displayService: DisplayService,
  private userService: UserService
) {}

// React Context Web Needed
// Multiple providers with careful ordering
```

---

## 📋 **DIAMOND MIGRATION CHECKLIST**

### **Phase 1: Core Architecture**
- [ ] Migrate SelectionService → useSelection hook
- [ ] Migrate TonalityService → useTonality hook  
- [ ] Create MidiProvider with context
- [ ] Set up AudioProvider with WebAudio integration

### **Phase 2: Musical Intelligence**
- [ ] Preserve all 43 TonalJS integration points
- [ ] Migrate chord detection algorithms  
- [ ] Convert harmonic analysis functions
- [ ] Maintain Roman numeral notation system

### **Phase 3: UI Components**
- [ ] Convert BraidComponent (39,545 bytes)
- [ ] Migrate Piano component with MIDI integration
- [ ] Convert FretBoard component
- [ ] Update ChordSelector with musical logic

### **Phase 4: Real-Time Systems**
- [ ] Preserve Web Worker timing accuracy
- [ ] Maintain MIDI hardware compatibility
- [ ] Keep audio processing performance
- [ ] Ensure Roland GR guitar integration

### **Phase 5: Testing & Validation**
- [ ] Validate musical accuracy (E3-A3-D3-G4-B4-e5 → V7)
- [ ] Test all 40+ chord types recognition
- [ ] Verify Roman numeral calculations
- [ ] Check real-time performance metrics

---

## 🎯 **SUCCESS CRITERIA**

### **Musical Accuracy:**
- All chord detection must match DIAMOND exactly
- Roman numeral notation must be identical  
- Harmonic progressions must calculate correctly
- MIDI integration must preserve timing accuracy

### **Performance Metrics:**
- Real-time audio processing < 10ms latency
- MIDI message handling < 1ms response time  
- Font rendering performance equivalent
- Memory usage within 10% of DIAMOND

### **Feature Preservation:**
- All 108 observable patterns working
- Complete TonalJS integration functional
- WebMIDI hardware compatibility maintained
- Educational exercise generation preserved

---

*DIAMOND Application Migration Specifications - Part of DIAMOND Migration Documentation*
