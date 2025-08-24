# 04-YouTube & MIDI Integration: Interface & Controls Forensics

## Component Locations
- **YouTube Audio**: `/apps/obsidian-angular/src/app/components/youtube-audio/youtube-audio.component.scss` (569 lines)
- **MIDI Services**: `/apps/obsidian-angular/src/app/services/midi/midi.service.ts`
- **MIDI Selectors**: `/apps/obsidian-angular/src/app/components/midi-selector/` & `/midi-control-selector/`
- **Score Assets**: `/assets/img/fretboard/score_icon.png`, `/assets/full-scores/`

## YouTube Audio Component Styling

### Main Container Architecture (Lines 1-50)
```scss
.youtube-audio-container{
  user-select: none;
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items:center;
  outline:none;
  background-color:#343a40;
}
```

### Top Control Row (Lines 10-45)
```scss
.top_row{
    display:flex;
    align-items:center;
    width:100%;    
    height: 2.5em;
    background-color:#343a40 !important;
    width: 100%;
    height: 199px;
    position: fixed;
    bottom: 0px;
    left: 0px;
    height: 45px;
    color: white;
    overflow-x: overlay;
    overflow-y: hidden;

    &.show{
        bottom : 100px;
    }
    &.show_mas{
        bottom : 600px;
    }
}

.top_row::-webkit-scrollbar{display: none;}
```

**Animation States:**
- **Default**: `bottom: 0px` (hidden/collapsed)
- **Show**: `bottom: 100px` (partially revealed)
- **Show Mas**: `bottom: 600px` (fully expanded)

### Icon Control System (Lines 35-50)
```scss
i{
    padding:10px;
    color:white;
    display: flex;
    align-items: center;
    &.active{
        color:#0bd44da6;
    }
    &.inactive{
        pointer-events:none;
        opacity: 0.6;
    }
}

.fa-volume-up:hover{color: var(--green_nvx)!important;}
```

**Icon States Available:**
- **Active**: Green highlight `#0bd44da6`
- **Inactive**: Disabled with reduced opacity (0.6)
- **Hover**: Green accent color on volume controls

### Center Control Panel (Lines 55-75)
```scss
.center-col{    
    height:35px;
  padding:2px;
  display:flex;
  color:white;
  user-select: none;
  align-items:center;
 }
.center-col span{font-size: 12px;}
.center-col input{
    border: 1px solid #ced4da;
  border-radius: .25rem;
  text-align: center;
  margin: 0 2.5px;
  width: 45px;
 }
.center-col input:focus-visible {
    outline: var(--green_nvx) auto 1px;
}
.center-col img{width: auto;height: 33px;}
```

### Link Input Row (Lines 76-95)
```scss
.link_row{
    width:50%;
    color:black;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    input{
        width:18em;
        margin:5px;
    }
    button{
        padding:4px;
        min-width:70px;
    }
}
```

## MIDI System Architecture

### Component Structure
Based on file analysis, the MIDI system includes:

1. **midi-selector.component**: Basic MIDI device selection
2. **midi-control-selector.component**: Advanced MIDI controller mapping
3. **midi-chord-display.component**: Visual chord representation from MIDI input
4. **midi-chord-detect-abc.component**: ABC notation integration
5. **midi.service.ts**: Core MIDI Web API integration service

### MIDI Integration Points in Main Components

#### Braid System MIDI Classes (Documented in 02-Braid-System.md)
```scss
&.midi_active {
    fill: var(--yellow_nvx) !important;
    filter: url(#f2) drop-shadow(4.5px 3px 3.5px var(--yellow_nvx));
}

&.midi_active_green {
    fill: var(--yellow_nvx) !important;
    filter: url(#f2) drop-shadow(4.5px 3px 3.5px var(--green_nvx));
}
```

#### Circle of Fifths MIDI Integration (Documented in 01-Circle-of-Fifths.md)
```scss
&.active-midi-chord {
    fill: var(--blue_nvx) !important;
    filter: drop-shadow(2px 2px 3px var(--blue_nvx));
}
```

#### Fretboard MIDI Fingers (Documented in 03-Fretboard-System.md)
```scss
.finger_midi {fill: #ffff00;opacity: 0;}
```

### MIDI Visual Feedback System

#### Color Coding Standards
- **Yellow (`#ffff00`, `--yellow_nvx`)**: Primary MIDI active state
- **Green (`--green_nvx`)**: Secondary MIDI state/alternative highlighting
- **Blue (`--blue_nvx`)**: MIDI chord detection (updated from green)

#### Glow Effects for MIDI
- **Standard MIDI**: Yellow fill + yellow drop-shadow
- **MIDI Green Variant**: Yellow fill + green drop-shadow
- **MIDI Chord**: Blue fill + blue drop-shadow

## Score Creation System

### Asset Structure
```
/assets/full-scores/
├── scores_easy/
├── scores_medium/
└── score_icon.png (in /img/fretboard/)
```

### Key Binding System (Not Yet Implemented)
**Documented Issues:**
- "m for measure delimiters" - requires styling for measure markers
- "p for parts" - needs part division visual indicators
- Score creation interface needs comprehensive CSS system

## Integration Architecture

### YouTube-MIDI Synchronization
The system supports synchronized playback between YouTube audio and MIDI input:
1. **YouTube provides backing track**
2. **MIDI provides real-time chord detection**
3. **Visual feedback shows chord accuracy**
4. **Score creation captures the performance**

### Cross-Component Communication
All components share common CSS variables and visual language:
- Consistent green accent color (`--green_nvx`)
- Unified active states and hover effects
- Shared font families and sizing standards
- Common animation timing (0.25s transitions)

## Broken Link Issues & Solutions

### YouTube Link Processing
**Current Issues Identified:**
1. Link validation may be failing
2. YouTube API integration needs debugging
3. URL parsing for different YouTube formats

**Forensic Investigation Needed:**
- Check youtube.service.ts for URL regex patterns
- Verify API key configuration
- Test with different URL formats (youtube.com, youtu.be, embedded)

### Score Creation Problems
**Key Binding Issues:**
1. **'m' key for measure delimiters**: 
   - Need to implement visual measure line system
   - Requires CSS for measure boundary indicators
   - Should integrate with MIDI timing data

2. **'p' key for parts**:
   - Need part section visual markers
   - Requires different background/border styling
   - Should coordinate with chord progression analysis

## Implementation Guidelines

### Adding YouTube Controls
1. **New Button States**: Follow `.active`/`.inactive` pattern
2. **Position Controls**: Use flexbox system in `.center-col`
3. **Responsive Design**: Maintain 35px height constraint
4. **Icon Integration**: Use FontAwesome with consistent padding

### MIDI Visual Feedback
1. **New MIDI States**: Follow `.midi_active` pattern naming
2. **Color Consistency**: Use established yellow/green/blue system  
3. **Animation Timing**: Maintain 0.25s transition standard
4. **Filter Effects**: Layer drop-shadows for depth

### Score Interface Design
1. **Measure Markers**: Vertical lines with subtle opacity
2. **Part Divisions**: Background color changes or border indicators
3. **Key Binding Response**: Visual confirmation of key press actions
4. **Export Controls**: Consistent button styling with main interface

## Advanced Styling Techniques

### Modal Integration
YouTube component can integrate with fretboard modal system:
```scss
.modal.youtube-expanded {
    width: 1450px;
    height: 600px; // Increased for score display
}
```

### Responsive YouTube Controls
```scss
@media (max-width: 768px) {
    .center-col input { width: 35px; }
    .link_row input { width: 12em; }
}
```

### MIDI Device Status Indicators
```scss
.midi-status {
    &.connected { color: var(--green_nvx); }
    &.disconnected { color: var(--red_nvx); }
    &.active { animation: pulse 2s infinite; }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

## CSS Variable Dependencies
- `--green_nvx`: #28a745 (primary accent, MIDI secondary)
- `--yellow_nvx`: #ffc107 (MIDI primary state)  
- `--blue_nvx`: #2b3990 (chord detection, updated system)
- `--red_nvx`: #dc3545 (error states, disconnected)
- `--gray_nvx`: #6c757d (neutral backgrounds)

## Performance Optimization
- YouTube iframe lazy loading
- MIDI input debouncing (typically 50ms)
- Visual feedback animation GPU acceleration
- Score rendering canvas optimization for large compositions

## Accessibility Considerations
- MIDI feedback should include screen reader announcements
- Keyboard navigation for all YouTube controls
- High contrast mode support for MIDI status indicators
- Focus management in modal states
