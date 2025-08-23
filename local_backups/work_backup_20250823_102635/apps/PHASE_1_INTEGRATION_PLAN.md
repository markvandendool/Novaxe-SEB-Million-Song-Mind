# Phase 1 Integration Kickoff Plan

*Minimal, working cross-app data exchange to prove the connection before scaling*

## 🎯 Goal
Establish a **data-only integration** between MSM and Novaxe without breaking either app's independence.

---

## 📋 Pre-Flight Checklist

Before starting Phase 1:

```bash
# 1. Ensure clean baseline
npm run stability-check

# 2. Create feature branch
git checkout -b phase-1-integration

# 3. Tag the starting point
git tag phase-1-start-$(date +%Y%m%d_%H%M%S)
git push origin phase-1-integration --tags
```

---

## 🏗️ Phase 1.1: Shared Foundation (Days 1-2)

### A. Consolidate Music Types
```typescript
// packages/shared/src/types/music.ts
export interface ChordData {
  root: string;
  quality: string;
  intervals: number[];
  midi: number[];
}

export interface BraidNode {
  id: string;
  chord: ChordData;
  position: { x: number; y: number };
  connections: string[];
}
```

### B. Create Adapter Pattern
```typescript
// packages/shared/src/adapters/index.ts
export interface MusicDataAdapter {
  toNovaxeFormat(data: any): NovaxeChord;
  toMSMFormat(data: any): MSMChord;
  toCanonical(data: any): ChordData;
}
```

### C. Unit Test Everything
```bash
cd packages/shared
npm test -- --coverage
# Must be 100% coverage before proceeding
```

---

## 🔌 Phase 1.2: Message Bridge (Days 3-4)

### A. Create PostMessage SDK
```typescript
// packages/msm-bridge/src/bridge.ts
export class MSMBridge {
  private channel: MessageChannel;
  
  sendChord(chord: ChordData): void {
    this.channel.port1.postMessage({
      type: 'CHORD_UPDATE',
      payload: chord
    });
  }
  
  onChordReceived(callback: (chord: ChordData) => void): void {
    this.channel.port2.onmessage = (e) => {
      if (e.data.type === 'CHORD_UPDATE') {
        callback(e.data.payload);
      }
    };
  }
}
```

### B. Add to Both Apps
```typescript
// apps/novaxe/src/app/services/msm-integration.service.ts
import { MSMBridge } from '@novaxe-oracle/msm-bridge';

@Injectable()
export class MSMIntegrationService {
  private bridge = new MSMBridge();
  
  constructor() {
    this.bridge.onChordReceived(chord => {
      // Update Novaxe state
      this.updateLocalChord(chord);
    });
  }
}
```

```typescript
// apps/msm/src/hooks/useNovaxeBridge.ts
import { MSMBridge } from '@novaxe-oracle/msm-bridge';

export function useNovaxeBridge() {
  const bridge = useRef(new MSMBridge());
  
  const sendToNovaxe = (chord: ChordData) => {
    bridge.current.sendChord(chord);
  };
  
  return { sendToNovaxe };
}
```

---

## 🧪 Phase 1.3: Proof of Concept (Day 5)

### A. Single Chord Exchange Test

1. **MSM Side**: Add button to send current chord
```tsx
// apps/msm/src/components/ChordDisplay.tsx
<button onClick={() => sendToNovaxe(currentChord)}>
  Send to Novaxe
</button>
```

2. **Novaxe Side**: Display received chord
```typescript
// apps/novaxe/src/app/components/msm-chord-display.component.ts
@Component({
  template: `
    <div *ngIf="receivedChord">
      MSM Chord: {{ receivedChord.root }} {{ receivedChord.quality }}
    </div>
  `
})
export class MSMChordDisplayComponent {
  receivedChord: ChordData | null = null;
  
  constructor(private msm: MSMIntegrationService) {
    msm.chordReceived$.subscribe(chord => {
      this.receivedChord = chord;
    });
  }
}
```

3. **Test Flow**:
   - Start both apps: `npm run serve:all`
   - Open MSM at localhost:5173
   - Open Novaxe at localhost:4200
   - Click "Send to Novaxe" in MSM
   - Verify chord appears in Novaxe

---

## 🚦 Phase 1.4: Integration Tests (Day 6)

### A. E2E Test Suite
```javascript
// e2e/integration.spec.js
describe('MSM-Novaxe Integration', () => {
  it('sends chord from MSM to Novaxe', async () => {
    // Open both apps
    await browser.newPage('http://localhost:5173');
    await browser.newPage('http://localhost:4200');
    
    // Send chord from MSM
    await msm.click('[data-test="send-chord"]');
    
    // Verify in Novaxe
    await novaxe.waitForText('C major');
  });
});
```

### B. Smoke Test
```bash
# scripts/test-integration.js
const MSMBridge = require('@novaxe-oracle/msm-bridge');

const bridge = new MSMBridge();
const testChord = { root: 'C', quality: 'major' };

bridge.sendChord(testChord);
bridge.onChordReceived((chord) => {
  assert.deepEqual(chord, testChord);
  console.log('✅ Integration working!');
});
```

---

## 📊 Success Metrics

Phase 1 is complete when:

- [ ] Both apps still run independently
- [ ] Shared package has 100% test coverage
- [ ] Single chord can be sent MSM → Novaxe
- [ ] No console errors in either app
- [ ] E2E test passes
- [ ] `npm run stability-check` still passes

---

## 🚀 Phase 1.5: Scale Up (Days 7-10)

Once basic integration works:

1. **Add More Data Types**:
   - Scales
   - Progressions
   - MIDI events
   - Braid configurations

2. **Bidirectional Flow**:
   - Novaxe → MSM updates
   - State synchronization

3. **Performance Optimization**:
   - Debounce rapid updates
   - Batch messages
   - Add request/response pattern

---

## 🛡️ Rollback Plan

If integration breaks either app:

```bash
# Immediate rollback
git checkout main
git tag phase-1-failed-$(date +%Y%m%d_%H%M%S)

# Analyze what went wrong
git diff main phase-1-integration > integration-issues.diff

# Fix in isolation
git checkout -b phase-1-fix
```

---

## 📝 Daily Checklist

Every day during Phase 1:

- [ ] Morning: Run `npm run stability-check`
- [ ] Before changes: Pull latest from main
- [ ] After changes: Run tests in both apps
- [ ] Evening: Commit with descriptive message
- [ ] End of day: Push to feature branch

---

## 🎉 Phase 1 Complete

When all success metrics pass:

```bash
# Final stability check
npm run stability-check

# Tag success
git tag phase-1-complete-$(date +%Y%m%d_%H%M%S)

# Create PR
git push origin phase-1-integration
# Open PR from phase-1-integration → main

# Document learnings
echo "## Phase 1 Learnings" >> INTEGRATION_NOTES.md
```

---

## Next: Phase 2 Preview

After Phase 1 success:
- **Phase 2.1**: Font system unification
- **Phase 2.2**: Shared audio engine
- **Phase 2.3**: Unified MIDI handling
- **Phase 2.4**: Cross-app state management
- **Phase 2.5**: Performance profiling

---

Remember: **Small, testable, reversible steps!** 🚶‍♂️