# Angular to React Migration Patterns

**Date:** August 20, 2025  
**Purpose:** Comprehensive conversion patterns for Angular → React migration  
**Focus:** DIAMOND application specific patterns  

---

## 🔄 **CORE CONVERSION PATTERNS**

### **1. Component Declaration Pattern**

**Angular Pattern:**
```typescript
@Component({
  selector: 'app-musical-component',
  template: `
    <div class="musical-container">
      <h2>{{title}}</h2>
      <div *ngFor="let note of notes">{{note}}</div>
    </div>
  `,
  styleUrls: ['./musical-component.component.scss']
})
export class MusicalComponent implements OnInit {
  @Input() title: string;
  @Output() noteSelected = new EventEmitter<string>();
  
  notes: string[] = [];
  
  ngOnInit() {
    this.loadNotes();
  }
  
  loadNotes() {
    this.notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  }
}
```

**React Equivalent:**
```typescript
interface MusicalComponentProps {
  title: string;
  onNoteSelected: (note: string) => void;
}

const MusicalComponent: React.FC<MusicalComponentProps> = ({ 
  title, 
  onNoteSelected 
}) => {
  const [notes, setNotes] = useState<string[]>([]);
  
  useEffect(() => {
    const loadNotes = () => {
      setNotes(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    };
    loadNotes();
  }, []);
  
  return (
    <div className="musical-container">
      <h2>{title}</h2>
      {notes.map(note => (
        <div key={note} onClick={() => onNoteSelected(note)}>
          {note}
        </div>
      ))}
    </div>
  );
};
```

### **2. Service Injection → Context/Hook Pattern**

**Angular Service Pattern:**
```typescript
@Injectable({ providedIn: 'root' })
export class MidiService {
  private midiAccess$ = new BehaviorSubject<WebMidi.MIDIAccess | null>(null);
  private connectedDevices$ = new BehaviorSubject<WebMidi.MIDIInput[]>([]);
  
  async initializeMidi() {
    const access = await navigator.requestMIDIAccess();
    this.midiAccess$.next(access);
  }
  
  getMidiAccess() {
    return this.midiAccess$.asObservable();
  }
}

// Angular Component Usage
constructor(private midiService: MidiService) {}

ngOnInit() {
  this.midiService.getMidiAccess().subscribe(access => {
    // Handle MIDI access
  });
}
```

**React Context + Hook Pattern:**
```typescript
// Create Context
const MidiContext = createContext<MidiContextType | null>(null);

// Provider Component
export const MidiProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<WebMidi.MIDIInput[]>([]);
  
  const initializeMidi = useCallback(async () => {
    const access = await navigator.requestMIDIAccess();
    setMidiAccess(access);
  }, []);
  
  const value = {
    midiAccess,
    connectedDevices,
    initializeMidi
  };
  
  return (
    <MidiContext.Provider value={value}>
      {children}
    </MidiContext.Provider>
  );
};

// Custom Hook
export const useMidi = () => {
  const context = useContext(MidiContext);
  if (!context) {
    throw new Error('useMidi must be used within MidiProvider');
  }
  return context;
};

// Component Usage
const MyComponent: React.FC = () => {
  const { midiAccess, initializeMidi } = useMidi();
  
  useEffect(() => {
    initializeMidi();
  }, [initializeMidi]);
  
  return <div>MIDI Status: {midiAccess ? 'Connected' : 'Disconnected'}</div>;
};
```

### **3. Observable → React Query Pattern**

**Angular Observable Pattern:**
```typescript
@Injectable()
export class ChordDetectionService {
  private detectedChords$ = new Subject<Chord>();
  
  detectChord(notes: string[]): Observable<Chord> {
    return this.http.post<Chord>('/api/detect-chord', { notes })
      .pipe(
        map(chord => this.processChord(chord)),
        catchError(error => this.handleError(error))
      );
  }
  
  getDetectedChords(): Observable<Chord> {
    return this.detectedChords$.asObservable();
  }
}

// Component usage
ngOnInit() {
  this.chordService.getDetectedChords()
    .pipe(takeUntil(this.destroy$))
    .subscribe(chord => this.handleChordDetection(chord));
}
```

**React Query + Custom Hook Pattern:**
```typescript
// API functions
const detectChordApi = async (notes: string[]): Promise<Chord> => {
  const response = await fetch('/api/detect-chord', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  
  if (!response.ok) throw new Error('Chord detection failed');
  return response.json();
};

// Custom hook with React Query
const useChordDetection = () => {
  const queryClient = useQueryClient();
  
  const detectChordMutation = useMutation({
    mutationFn: detectChordApi,
    onSuccess: (chord) => {
      // Handle successful detection
      queryClient.setQueryData(['detectedChords'], (old: Chord[]) => 
        [...(old || []), chord]
      );
    },
    onError: (error) => {
      console.error('Chord detection error:', error);
    }
  });
  
  const { data: detectedChords = [] } = useQuery({
    queryKey: ['detectedChords'],
    queryFn: () => [],
    staleTime: Infinity
  });
  
  return {
    detectChord: detectChordMutation.mutate,
    isDetecting: detectChordMutation.isPending,
    detectedChords,
    error: detectChordMutation.error
  };
};

// Component usage
const ChordDetector: React.FC = () => {
  const { detectChord, isDetecting, detectedChords } = useChordDetection();
  
  const handleNoteInput = (notes: string[]) => {
    detectChord(notes);
  };
  
  return (
    <div>
      {isDetecting && <div>Detecting chord...</div>}
      {detectedChords.map(chord => (
        <div key={chord.id}>{chord.symbol}</div>
      ))}
    </div>
  );
};
```

### **4. Angular Forms → React Hook Form Pattern**

**Angular Reactive Forms:**
```typescript
export class MusicConfigComponent {
  configForm = this.fb.group({
    key: ['C', Validators.required],
    mode: ['major', Validators.required],
    tempo: [120, [Validators.required, Validators.min(60), Validators.max(200)]]
  });
  
  constructor(private fb: FormBuilder) {}
  
  onSubmit() {
    if (this.configForm.valid) {
      console.log(this.configForm.value);
    }
  }
}
```

**React Hook Form Equivalent:**
```typescript
interface MusicConfigForm {
  key: string;
  mode: string;
  tempo: number;
}

const MusicConfigComponent: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<MusicConfigForm>({
    defaultValues: {
      key: 'C',
      mode: 'major',
      tempo: 120
    }
  });
  
  const onSubmit = (data: MusicConfigForm) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('key', { required: true })}>
        <option value="C">C</option>
        <option value="G">G</option>
        {/* ... more keys */}
      </select>
      
      <select {...register('mode', { required: true })}>
        <option value="major">Major</option>
        <option value="minor">Minor</option>
      </select>
      
      <input 
        type="number" 
        {...register('tempo', { 
          required: true, 
          min: 60, 
          max: 200 
        })} 
      />
      {errors.tempo && <span>Tempo must be between 60 and 200</span>}
      
      <button type="submit">Save Configuration</button>
    </form>
  );
};
```

---

## 🎵 **DIAMOND-SPECIFIC PATTERNS**

### **MIDI Integration Pattern**
```typescript
// DIAMOND Angular Pattern
@Injectable()
export class DiamondMidiService {
  private midiInput$ = new Subject<MIDIEvent>();
  
  handleMidiMessage(event: MIDIEvent) {
    this.midiInput$.next(event);
  }
}

// React Pattern
const useDiamondMidi = () => {
  const [midiEvents, setMidiEvents] = useState<MIDIEvent[]>([]);
  
  const handleMidiMessage = useCallback((event: MIDIEvent) => {
    setMidiEvents(prev => [...prev, event]);
  }, []);
  
  return { midiEvents, handleMidiMessage };
};
```

### **Braid Component Pattern** 
```typescript
// DIAMOND Angular Braid (simplified excerpt)
export class BraidComponent {
  @Input() selectedFifth: string;
  bubblePositions = [
    { x: 200, y: 100 }, // Position 0
    { x: 300, y: 150 }, // Position 1
    // ... 8 more positions
  ];
  
  rotateBraid() {
    // Complex rotation logic
  }
}

// React Equivalent
const BraidComponent: React.FC<{ selectedFifth: string }> = ({ 
  selectedFifth 
}) => {
  const bubblePositions = [
    { x: 200, y: 100 }, // Position 0
    { x: 300, y: 150 }, // Position 1
    // ... 8 more positions
  ];
  
  const rotateBraid = useCallback(() => {
    // Complex rotation logic
  }, []);
  
  return (
    <svg viewBox="0 0 400 300">
      {bubblePositions.map((pos, index) => (
        <circle
          key={index}
          cx={pos.x}
          cy={pos.y}
          r="20"
          onClick={rotateBraid}
        />
      ))}
    </svg>
  );
};
```

---

## 📊 **CONVERSION CHECKLIST**

### **For Each Angular Component:**
- [ ] Convert `@Input()` → Props interface
- [ ] Convert `@Output()` → Callback props  
- [ ] Convert lifecycle methods → useEffect hooks
- [ ] Convert template syntax → JSX
- [ ] Convert component class → functional component

### **For Each Angular Service:**
- [ ] Create React Context if global state needed
- [ ] Create custom hook for service logic
- [ ] Convert Observables → React Query or useState
- [ ] Handle dependency injection → Context providers

### **For Complex Patterns:**
- [ ] Document original Angular behavior
- [ ] Identify React equivalent patterns
- [ ] Create conversion template
- [ ] Test functionality preservation
- [ ] Performance benchmark

---

*Angular to React Migration Patterns - Part of DIAMOND Migration Documentation*
