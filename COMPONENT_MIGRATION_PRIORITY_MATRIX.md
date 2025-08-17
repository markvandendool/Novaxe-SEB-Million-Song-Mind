# 🎯 COMPONENT MIGRATION PRIORITY MATRIX

**Date**: August 17, 2025  
**Phase**: 2 - Component Migration Strategy  
**Source**: Novaxe SEB (97 Components) → Nuclear Angular 20  

---

## 📊 **TIER CLASSIFICATION SYSTEM**

### 🟢 **TIER 1: FOUNDATION COMPONENTS** 
**Complexity**: LOW | **Dependencies**: Minimal | **Priority**: IMMEDIATE

| Component | Type | Lines Est. | Service Deps | Migration Effort |
|-----------|------|------------|--------------|------------------|
| `navbar` | Navigation | 50-100 | Router only | 🟢 **2 hours** |
| `home` | Page | 30-80 | None | 🟢 **1 hour** |
| `testpage` | Utility | 20-50 | Basic | 🟢 **1 hour** |

**Total Tier 1**: 3 components | **Estimated Time**: 4 hours

---

### 🟡 **TIER 2: SIMPLE UI COMPONENTS**
**Complexity**: LOW-MEDIUM | **Dependencies**: Light Service | **Priority**: PHASE 2A

| Component | Type | Lines Est. | Service Deps | Migration Effort |
|-----------|------|------------|--------------|------------------|
| `tonality-button` | UI Control | 40-80 | MusicUtils (stub) | 🟡 **2 hours** |
| `dico` | Reference | 60-120 | None | 🟡 **2 hours** |
| `donate` | Utility | 30-60 | None | 🟡 **1 hour** |
| `draft` | Data Mgmt | 50-100 | Storage basic | 🟡 **2 hours** |

**Total Tier 2**: 4 components | **Estimated Time**: 7 hours

---

### 🟠 **TIER 3: CORE MUSIC COMPONENTS**  
**Complexity**: MEDIUM-HIGH | **Dependencies**: Service Stubs | **Priority**: PHASE 2B

| Component | Type | Lines Est. | Service Deps | Migration Effort |
|-----------|------|------------|--------------|------------------|
| `transport` | Music Control | 100-200 | Audio, Transport | 🟠 **4 hours** |
| `piano-mini` | Instrument | 80-150 | MusicUtils, Audio | 🟠 **3 hours** |
| `scale-selector` | Music Theory | 60-120 | MusicUtils | 🟠 **3 hours** |
| `metro` | Metronome | 80-160 | Audio, Transport | 🟠 **4 hours** |
| `browse` | Navigation | 100-180 | Data, Search | 🟠 **4 hours** |

**Total Tier 3**: 5 components | **Estimated Time**: 18 hours

---

### 🔴 **TIER 4: COMPLEX MUSIC COMPONENTS**
**Complexity**: HIGH | **Dependencies**: Full Service Integration | **Priority**: PHASE 2C

| Component | Type | Lines Est. | Service Deps | Migration Effort |
|-----------|------|------------|--------------|------------------|
| `piano` | Full Instrument | 200-400 | MusicUtils, MIDI, Audio | 🔴 **8 hours** |
| `guitar` | Full Instrument | 200-400 | MusicUtils, MIDI, Audio | 🔴 **8 hours** |
| `fretboard` | Visualization | 150-300 | MusicUtils, Display | 🔴 **6 hours** |
| `editor` | Core Editor | 300-500 | Parsing, MusicUtils, Storage | 🔴 **12 hours** |
| `chordstrip` | Chord Analysis | 150-250 | Parsing, MusicUtils | 🔴 **6 hours** |

**Total Tier 4**: 5 components | **Estimated Time**: 40 hours

---

### ⚫ **TIER 5: ADVANCED SYSTEMS**
**Complexity**: CRITICAL | **Dependencies**: Full Business Logic | **Priority**: PHASE 2D

| Component | Type | Lines Est. | Service Deps | Migration Effort |
|-----------|------|------------|--------------|------------------|
| `million-song-mind` | Core System | 500-800 | All Services | ⚫ **20 hours** |
| `midi-chord-detect-abc` | Advanced MIDI | 200-400 | MIDI, Parsing, Analysis | ⚫ **10 hours** |
| `youtube-audio` | External API | 200-350 | YouTube, Audio, Parsing | ⚫ **8 hours** |
| `chords-from-youtube` | AI Integration | 250-400 | YouTube, Parsing, AI | ⚫ **12 hours** |
| `harmonic-chart` | Music Theory Viz | 200-300 | MusicUtils, Display, SVG | ⚫ **10 hours** |

**Total Tier 5**: 5 components | **Estimated Time**: 60 hours

---

## 🎯 **EDUCATIONAL COMPONENTS MATRIX**

### 📚 **Learning & Exercises (7 components)**
| Component | Complexity | Service Deps | Priority | Effort |
|-----------|------------|--------------|----------|---------|
| `fifth-circle` | 🟠 Medium | MusicUtils | Phase 2B | 4h |
| `page-fifth-circle` | 🟡 Simple | MusicUtils | Phase 2A | 2h |  
| `exercises` | 🔴 High | MusicUtils, Storage | Phase 2C | 8h |
| `learn-fifths` | 🟠 Medium | MusicUtils | Phase 2B | 4h |
| `create-fifths-exercise` | 🔴 High | MusicUtils, Storage | Phase 2C | 6h |
| `tonality-button` | 🟡 Simple | MusicUtils (stub) | Phase 2A | 2h |
| `harmonic-chart` | ⚫ Critical | Full MusicUtils | Phase 2D | 10h |

**Total Educational**: 36 hours

---

## 🎛️ **MIDI & AUDIO COMPONENTS MATRIX**

### 🎹 **MIDI Processing (8 components)**
| Component | Complexity | Service Deps | Priority | Effort |
|-----------|------------|--------------|----------|---------|
| `midi-selector` | 🟡 Simple | MIDI basic | Phase 2A | 2h |
| `midi-control-selector` | 🟠 Medium | MIDI, Transport | Phase 2B | 4h |
| `midi-chord-display` | 🟠 Medium | MIDI, MusicUtils | Phase 2B | 4h |
| `midi-chord-detect-simple` | 🔴 High | MIDI, MusicUtils | Phase 2C | 6h |
| `midi-chord-detect-abc` | ⚫ Critical | MIDI, Parsing, ABC | Phase 2D | 10h |

**Total MIDI**: 26 hours

---

## 📈 **MIGRATION TIMELINE & RESOURCE ALLOCATION**

### **Phase 2A: Foundation (Week 1)**
- **Tier 1**: 3 components (4 hours)
- **Simple Tier 2**: 4 components (7 hours)  
- **Simple Educational**: 2 components (4 hours)
- **Total Phase 2A**: 9 components | **15 hours**

### **Phase 2B: Core Systems (Week 2-3)**  
- **Tier 3**: 5 components (18 hours)
- **Medium Educational**: 3 components (12 hours)
- **Simple MIDI**: 3 components (10 hours)
- **Total Phase 2B**: 11 components | **40 hours**

### **Phase 2C: Advanced Features (Week 4-5)**
- **Tier 4**: 5 components (40 hours) 
- **Complex Educational**: 2 components (14 hours)
- **Advanced MIDI**: 2 components (12 hours)
- **Total Phase 2C**: 9 components | **66 hours**

### **Phase 2D: Critical Systems (Week 6-7)**
- **Tier 5**: 5 components (60 hours)
- **Critical Educational**: 1 component (10 hours)  
- **Critical MIDI**: 1 component (10 hours)
- **Total Phase 2D**: 7 components | **80 hours**

---

## 🎪 **COMPLETE MIGRATION ROADMAP**

**Total Components to Migrate**: **36 components**  
**Total Estimated Effort**: **201 hours** (5 weeks of focused development)  
**Parallel Service Implementation**: **Additional 80 hours** (ParsingService + MusicUtilsService)  

### **Success Criteria per Tier**:
1. **Tier 1**: Build remains <400kB, basic navigation functional
2. **Tier 2**: UI components operational with stub services  
3. **Tier 3**: Core music functionality with enhanced stubs
4. **Tier 4**: Complex music features with partial service implementation
5. **Tier 5**: Full Novaxe functionality with complete service integration

**🚀 STRATEGIC APPROACH**: Tier-based migration enables continuous progress validation and risk mitigation throughout the complete Novaxe SEB integration!
