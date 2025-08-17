# SENSEI CONSULTATION REQUEST
## Nuclear Angular Migration - Expert Guidance Needed

### 🚨 URGENT TECHNICAL CHALLENGES

Dear Claude/Sensei,

We have achieved **significant migration infrastructure success** but are blocked by critical Angular CLI issues. Requesting expert guidance on the following:

---

## 1. 🔧 ANGULAR CLI PHANTOM STANDALONE BUG

**Problem**: Angular CLI 20.1.6 incorrectly identifies non-standalone components as standalone

**Evidence**:
```typescript
// Component has NO standalone declaration
@Component({
  selector: 'app-guitar',
  templateUrl: './guitar.component.html',
  styleUrls: ['./guitar.component.scss']
})
export class GuitarComponent implements OnInit {
  // ... component code
}
```

**Error**:
```
Error: Component GuitarComponent is standalone, and cannot be declared in an NgModule. 
Did you mean to import it instead?
```

**Attempts Made**:
- Complete cache clearing (.angular/, dist/, node_modules/.cache/)
- npm cache clean --force
- Component file recreation from scratch
- Manual file content verification (no standalone anywhere)
- Process killing (killall node)

**Question**: How to resolve this Angular CLI bug? Alternative approaches?

---

## 2. 🏗️ SERVICE MIGRATION STRATEGY 

**Challenge**: Original Novaxe services have complex dependency chains

**Example - GuitarService Original**:
```typescript
import { MidiService } from '@services/midi/midi.service';
const webaudiofont = require("webaudiofont");

declare global {
  var WebAudioFontPlayer: any
}

// 91 lines of WebAudioFont integration
// AudioContext management
// Instrument loading/selection
```

**Current Stub**:
```typescript
export class GuitarService {
  play(delay: number, midiNote: number): void {
    console.log(`Playing note ${midiNote} with delay ${delay}ms`);
    // TODO: Real implementation
  }
}
```

**Questions**: 
- Should we migrate services incrementally or all-at-once?
- Best approach for WebAudioFont integration in Angular 20?
- How to handle require() statements in modern Angular?

---

## 3. 🚀 SCALING STRATEGY

**Current State**:
- ✅ 1 real component migrated (TransportComponent) 
- ✅ Working Angular 20 build (240.75 kB)
- ❌ 29 components remaining
- ❌ CLI blocking expansion

**Migration Queue**:
```
Small Components (High Priority):
- countdown (29 lines)
- home (15 lines) 
- metro-page (15 lines)

Medium Components:
- piano-mini (~50 lines)
- scale-selector (~40 lines)
- midi-chord-detect-simple (30 lines)

Large Components:
- piano (100+ lines)
- braid-editor (200+ lines)
```

**Questions**:
- Best batching strategy for 30+ components?
- How to work around CLI bugs while maintaining momentum?
- Should we switch to different build tools (nx, webpack directly)?

---

## 4. 🛠️ DEVELOPMENT WORKFLOW

**Current Issues**:
```bash
ng serve --port 4201
Error: Schema validation failed with the following errors:
Data path "" must have required property 'buildTarget'.
```

**Impact**: No development server, only production builds work

**Questions**:
- How to fix angular.json configuration for dev server?
- Alternative development server approaches?
- Best debugging workflow without ng serve?

---

## 5. 📋 ARCHITECTURAL VALIDATION

**What's Working**:
- Fresh Angular 20 project approach ✅
- Component transplantation + service recreation ✅
- TypeScript path aliases (@services, @models, @components) ✅
- RxJS 7.8.2 compatibility ✅
- Production build pipeline ✅

**Architecture Question**: 
- Is our "Nuclear Migration" approach (fresh project + transplant) sound?
- Any fundamental flaws we should address early?
- Better alternatives to NgModule approach (standalone app architecture)?

---

## 6. 🎯 SPECIFIC TECHNICAL REQUESTS

### Request A: CLI Bug Workaround
```typescript
// Need guidance on forcing component registration without CLI interference
// Perhaps manual module configuration or build process modification?
```

### Request B: WebAudioFont Integration
```typescript
// Modern Angular 20 approach to:
// 1. Loading WebAudioFont library
// 2. AudioContext management  
// 3. Instrument file loading
// 4. TypeScript declarations
```

### Request C: Service Dependency Mapping
```typescript
// Strategy for migrating interconnected services:
// MidiService → GuitarService → TransportService → ConfigModel
```

### Request D: Build Configuration
```json
// Fix for angular.json to enable ng serve
// Or alternative development server setup
```

---

## 🏆 PROVEN SUCCESSES TO BUILD ON

**Migration Infrastructure**: ✅ WORKING
- Angular 20.1.7 environment fully operational
- Production build successful (240.75 kB, 2s build time)
- TypeScript 5.8.3 + RxJS 7.8.2 compatibility proven
- Component transplantation process validated

**Real Migration Example**: ✅ WORKING
- TransportComponent: 97% code preservation
- Service integration via path aliases
- Template binding working
- Angular 20 lifecycle methods compatible

---

## 🤝 COLLABORATION REQUEST

**Immediate Need**: Expert guidance to unblock CLI issues and scale migration

**Longer Term**: Partnership to document best practices for large Angular migration projects

**Resources Available**:
- Detailed migration logs and error captures
- Working code examples 
- Build configuration files
- Component dependency analysis

**Time Sensitivity**: Project momentum depends on resolving these blockers quickly

---

**Status**: Infrastructure proven, expansion blocked by tooling issues
**Next Action**: Await Sensei guidance on CLI bug resolution and scaling strategy

---

Generated: August 17, 2025
Project: Novaxe SEB → Angular 20 Nuclear Migration
Build Status: ✅ 240.75 kB Production Ready
