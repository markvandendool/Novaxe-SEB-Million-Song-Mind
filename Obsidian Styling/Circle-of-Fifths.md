# Circle of Fifths - Complete Styling Documentation

**Status:** ✅ Complete  
**Last Updated:** 2025-08-24  
**Component Path:** `/apps/obsidian-angular/src/app/components/fifth-circle/`

## Overview
The Circle of Fifths is a core musical visualization showing key relationships with interactive chord selection and key highlighting.

## File Structure
```
fifth-circle/
├── fifth-circle.component.ts     # Component logic
├── fifth-circle.component.html   # SVG template with 12 triangular slices  
├── fifth-circle.component.scss   # Main styling (selection backgrounds)
```

## Key Styling Elements

### 1. Selection Background (Pie Slices)
**Class:** `.selection_background`  
**Location:** `fifth-circle.component.scss:66-78`

```scss
section#thcircle .selection_background {
    opacity: 0;
    fill: var(--blue_nvx);           # Background color: #2b3990
    paint-order: markers fill stroke;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
    stroke: var(--blue_nvx);         # Border color: #2b3990
    
    &.active {
        opacity: 0.5;                # Visible when key selected
    }
}
```

**Controls:** 7-chord key highlighting (C, Dm, Em, F, G, Am, B° for C major)  
**Recent Change:** Changed from `--green_nvx` to `--blue_nvx` on 2025-08-24

### 2. Individual Chord Buttons  
**Location:** `tonality-button.component.scss`  
**Classes:**
- `.active` - Primary selection state (blue)
- `.side-active` - Secondary selection state (blue) 
- `.active-chord` - Currently selected chord in score
- `.active-midi-chord` - MIDI input active chord
- `.active-tonality` - Key center selection

```scss
# Main selection highlighting
&.active {
    fill: var(--blue_nvx);
    stroke: var(--blue_nvx);  
    opacity: 0.85;
    filter: drop-shadow(0px 0px 6px var(--blue_nvx));
}

# Side selection highlighting  
&.side-active {
    fill: var(--blue_nvx);
    stroke: var(--blue_nvx);
    opacity: 0.65;
    filter: drop-shadow(0px 0px 6px var(--blue_nvx));
}
```

## HTML Structure Analysis

### Triangular Slices (12 total)
Each slice represents one semitone in the chromatic circle:

```html
<!-- C/Am slice (0°) -->
<use xlink:href="#triangle" class="selection_background" 
     [ngClass]="{'active': selected_fifth=='C' || selected_mfifth=='Am'}"/>

<!-- G/Em slice (30°) -->  
<use xlink:href="#triangle" class="selection_background"
     [ngClass]="{'active': selected_fifth=='G' || selected_mfifth=='Em'}"
     transform="rotate(30)" style="transform-origin: 185px 188px;"/>

<!-- Pattern continues for all 12 positions -->
```

### SVG Definitions
**Triangle Path:** Defined in SVG `<defs>` section  
**Transform Origin:** `185px 188px` (center of circle)  
**Rotation:** 30° increments (360° / 12 = 30°)

## Animation Systems

### Selection Animation
- **Trigger:** Key selection change
- **Property:** `opacity: 0 → 0.5`  
- **Duration:** Instant (no transition defined)
- **Easing:** None

### Potential Animation Enhancements
```scss
/* Add smooth transitions */
.selection_background {
    transition: opacity 0.3s ease, transform 0.2s ease;
}

/* Hover effects */
.selection_background:hover {
    opacity: 0.3;
    transform: scale(1.05);
}

/* Pulse animation for active state */
.selection_background.active {
    animation: pulseBlue 2s ease-in-out infinite;
}

@keyframes pulseBlue {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
}
```

## Color Customization Guide

### Quick Color Changes
1. **Change highlight color:** Modify `var(--blue_nvx)` value in `styles.scss:230`
2. **Change opacity:** Adjust `opacity` values in `.active` and `.side-active` classes  
3. **Change glow effect:** Modify `drop-shadow` color values

### Available Color Variables
```css
--blue_nvx: #2b3990;      /* Current selection color */
--lightblue_nvx: #798aff; /* Alternative blue */  
--green_nvx: #28a745;     /* Previous selection color */
--red_nvx: #ed1c24;       /* Error/danger state */
--yellow_nvx: #ffff92;    /* Warning/active state */
```

## Interactive States

### State Priority (highest to lowest)
1. `active` - Key selection (blue, opacity 0.85)
2. `side-active` - Secondary selection (blue, opacity 0.65)  
3. `active-chord` - Score chord (light blue with glow)
4. `active-midi-chord` - MIDI input (yellow with glow)
5. `default` - Transparent

### State Combinations
- `active-chord.active-midi-chord` - Combined state (yellow/orange)
- Multiple states can be active simultaneously

## Typography Integration

### Chord Labels
**Font Family:** `nvxChord` (custom musical font)  
**Location:** Applied to chord text elements
**Styling:** Inherits from parent tonality-button component

## Responsive Behavior
- **Desktop:** Full size circle
- **Mobile:** May scale based on viewport
- **Touch:** All interactive elements remain accessible

## Known Issues & Solutions

### Issue: Slow Performance on Mobile
**Solution:** Consider CSS `will-change: transform` for animated elements

### Issue: Color Inconsistency
**Solution:** Always use CSS variables, not hard-coded colors

## Testing Checklist
- [ ] All 12 chord positions highlight correctly
- [ ] Key changes update highlighting properly  
- [ ] Multiple selection states work simultaneously
- [ ] Color variables apply consistently
- [ ] Mobile touch interactions work
- [ ] Accessibility: proper contrast ratios

## Development Notes
- SVG-based for crisp scaling
- Uses Angular `[ngClass]` for dynamic styling
- Transform origins crucial for proper rotation
- Drop-shadow effects may impact performance on lower-end devices

## Related Components
- [Tonality Buttons](./Tonality-Buttons.md) - Individual chord button styling
- [Color System](./Color-System.md) - CSS variable definitions
- [Animation System](./Animation-System.md) - Transition frameworks
