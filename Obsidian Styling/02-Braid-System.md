# 02-Braid System: Complete Forensic Styling Audit

## Component Location
**Primary File**: `/apps/obsidian-angular/src/app/components/braid/braid.component.scss`
**Size**: 940 lines of SCSS
**Dependencies**: CSS variables from `styles.scss`, SVG gradients, font-face definitions

## Typography System Analysis

### Font Family Definitions (Lines 1-20)
```scss
@font-face {
    font-family: "Bahnschrift";
    src: url('assets/fonts/BAHNSCHRIFT 1.TTF') format("truetype");
}

@font-face {
    font-family: "nvxRoman";
    src: url('assets/fonts/LATINWD1.TTF') format("truetype");
}

@font-face {
    font-family: "nvxChord";
    src: url('assets/fonts/FUGHETTA.TTF') format("truetype");
}

@font-face {
    font-family: "nvxChordBold";
    src: url('assets/fonts/MuseJazz.otf') format("opentype");
}
```

### Text Styling Controls (Lines 889-925)
```scss
section#braid2 text.braid-chords{
  font-size:5.5px;
  font-family:'nvxChord';
  text-align:start;
  writing-mode:lr-tb;
  text-anchor:start;
  display:inline;
  fill:#000000;

  &.small{
    font-size:2px;
  }
  &.big{
    font-size: 6.5px;
    stroke-width: 0.2px;
    stroke: black;
    &.roman{
      font-size: 5px;
    }
  }
  &.roman{
    font-size: 4.2px;
  }
}
```

**Typography Modifiers Available:**
- `.small`: 2px font size
- `.big`: 6.5px with black stroke
- `.roman`: 4.2px (5px when combined with `.big`)

## Color System Architecture

### Tonal Section Colors (Lines 120-220)
**Base greenCircle**: `stroke:#769987` (opacity: 0.5)

**Active States:**
1. **Standard Active**: `stroke:var(--green_nvx)` + complex drop-shadow filter
2. **MIDI Active**: `fill:var(--yellow_nvx)` + yellow glow
3. **MIDI Active Green**: `fill:var(--yellow_nvx)` + green glow filter

### Blues Section Colors (Lines 235-290)
**Base greenCircle**: `stroke:#769987` (opacity: 0.5, stroke-width: 22.09639931)
**Active State**: `stroke:var(--green_nvx)` + saturate(2.5) filter

### Arrow System Colors (Lines 185-215)
**Base arrows-2**: `fill:#3f4683`
**Active arrows-2**: `fill:#1f27ff` + white drop-shadow
**MIDI Active arrows-2**: `fill:#f8f8b9` (light yellow)
**MIDI Active Green arrows-2**: `fill:#1f27ff` (blue override)

## Animation System Analysis

### Core Transitions
**Universal Transition**: `transition: all 0.25s ease;`

### Keyframe Animations

#### 1. transitionClassic (Lines 165-181)
**Purpose**: Erase animation for tonal braid elements
**Duration**: 0.25s forwards
**Effect**: Progressive gradient fade from grey to erase
```scss
@keyframes transitionClassic {
  0% {fill: url("#greyGradient");}
  8% {fill: url("#greyGradient0");}
  16% {fill: url("#greyGradient1");}
  // ... continues through 9 gradient steps
  100% {fill: url("#eraseGradient"); stroke: #000;}
}
```

#### 2. transitionBlues (Lines 274-290)
**Purpose**: Erase animation for blues braid elements
**Duration**: 0.25s forwards
**Effect**: Similar progressive fade using blues-specific gradients

### Zoom System (Commented Out)
**Lines 69-71**: 
```scss
// section#braid-tonal .bub.zoom{transform: scale(2) translate(2px, -15px);transition: 0.5s;}
// section#braid-tonal .bub.zoom text{font-size: 0.9em; transition: 2s; z-index: 9999;}
```

## Light-Up Animation States

### MIDI Activation System
**Class Structure:**
1. `.midi_active`: Yellow fill + yellow glow
2. `.midi_active_green`: Yellow fill + green glow
3. `.active`: Standard blue activation

### Drop-Shadow Effects
**Standard Active**: `filter: url(#f2) drop-shadow(4.5px 3px 3.5px var(--lightblue_nvx))`
**MIDI Yellow**: `filter: url(#f2) drop-shadow(4.5px 3px 3.5px var(--yellow_nvx))`
**MIDI Green**: `filter: url(#f2) drop-shadow(4.5px 3px 3.5px var(--green_nvx))`

## Braid Toggle System Analysis

### Section Identifiers
1. **#braid-tonal**: Main tonal braid display
2. **#braid-blues**: Blues-specific braid variant
3. **#braid2**: Secondary braid system with different styling

### Shape Classes Available
1. **`.greenCircle`**: Primary highlight circles
2. **`.largeCircle`**: Structural outline circles  
3. **`.simpleShape`**: Basic geometric elements
4. **`.rect-arrow`**: Rectangular arrow indicators
5. **`.arrows-2`**: Secondary arrow system

### State Modifiers
1. **`.active`**: Primary selection state
2. **`.midi_active`**: MIDI device activation
3. **`.midi_active_green`**: Green MIDI variant
4. **`.erase`**: Element removal animation
5. **`.erasenot`**: Persistent element styling

## Skin System Architecture

### Gradient System References
**Tonal Gradients:**
- `#greyGradient` through `#greyGradient9`
- `#eraseGradient`
- Custom filter `url(#f2)`

**Blues Gradients:**
- `#greyGradientBlues` through `#greyGradient9Blues`
- `#eraseGradientBlues`
- Custom filter `url(#f2Blues)`

### Filter Effects Available
1. `url(#f2)`: Standard glow filter
2. `url(#f2Blues)`: Blues-specific filter
3. `url(#darkGlowN2)`: Dark glow effect
4. `saturate(2.5)`: Color saturation boost
5. `blur(1.8px)`: Soft blur effect

## Advanced UI Control Points

### Stroke System
**Standard**: `stroke-width: 0.15px`
**Heavy Circles**: `stroke-width: 22.09639931` (blues section)
**Text Strokes**: `stroke-width: 0.2px` (big text only)

### Opacity Controls
**Base Elements**: `opacity: 0.5`
**Active Elements**: `opacity: 1`
**Erase State**: `fill-opacity: 0`

### Transform Effects
**Zoom Transform**: `transform: scale(2) translate(2px, -15px)`
**Position Offset**: `transform: translate(0px, 21.5px)` (.token.middle)

## Implementation Guidelines

### Changing Braid Colors
1. **Tonal Braid**: Modify `.active` stroke in section#braid-tonal .greenCircle
2. **Blues Braid**: Modify `.active` stroke in section#braid-blues .greenCircle
3. **Arrow Colors**: Update `.active` fill in respective .arrows-2 classes

### Customizing Animations
1. **Speed**: Modify transition duration (default: 0.25s)
2. **Erase Effect**: Customize keyframe percentages and gradient references
3. **Glow Intensity**: Adjust drop-shadow blur radius values

### Typography Modifications
1. **Font Changes**: Update font-family references to custom fonts
2. **Size Scaling**: Modify base font-size and size modifier classes
3. **Stroke Effects**: Adjust stroke-width and stroke color for text outline

### Toggle System Customization
1. **Section Switching**: Target specific #braid-[variant] selectors
2. **State Management**: Combine classes (.active.midi_active_green)
3. **Shape Variants**: Utilize different shape classes for visual variety

## CSS Variable Dependencies
- `--green_nvx`: #28a745 (primary green)
- `--yellow_nvx`: #ffc107 (MIDI yellow)  
- `--lightblue_nvx`: #17a2b8 (glow effects)
- `--blue_nvx`: #2b3990 (now used in circle of fifths)

## Advanced Customization Notes
- Braid system supports multiple simultaneous skin variants
- Animation sequences can be chained using forwards fill-mode
- Filter effects stack multiplicatively for complex visual combinations
- Font loading requires TTF/OTF files in assets/fonts directory
- SVG gradient references must be defined in parent component templates
