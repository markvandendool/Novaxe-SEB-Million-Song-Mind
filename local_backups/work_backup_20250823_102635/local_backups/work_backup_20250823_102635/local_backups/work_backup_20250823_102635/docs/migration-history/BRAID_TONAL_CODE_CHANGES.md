# BraidTonal Font Manipulation - Code Changes Log

## Functions Removed

### 1. formatAccidentals()
```typescript
// REMOVED: Lines ~290-294
const formatAccidentals = (chord: string): string => {
  return chord.replace(/#/g, '♯').replace(/b/g, '♭');
};
```

### 2. ensureMinor()
```typescript  
// REMOVED: Lines ~296-302
const ensureMinor = (chord: string): string => {
  if (chord.includes('m') && !chord.endsWith('m')) {
    return chord;
  }
  return chord.includes('min') ? chord.replace('min', 'm') : chord + 'm';
};
```

### 3. toSuperscripts()
```typescript
// REMOVED: Lines ~304-312
const toSuperscripts = (text: string): string => {
  return text
    .replace(/7/g, '⁷')
    .replace(/9/g, '⁹')
    .replace(/11/g, '¹¹') 
    .replace(/13/g, '¹³');
};
```

### 4. prettyChord()
```typescript
// REMOVED: Lines ~314-316
const prettyChord = (chord: string): string => {
  return toSuperscripts(formatAccidentals(ensureMinor(chord)));
};
```

### 5. renderChordSVG()
```typescript
// REMOVED: Lines ~318-365
const renderChordSVG = (chord: string) => {
  return (
    <text>
      {Array.from(chord).map((char, index) => (
        <tspan key={index} dx={index > 0 ? "0.1em" : "0"}>
          {char}
        </tspan>
      ))}
    </text>
  );
};
```

## Function Added

### simpleChord()
```typescript
// ADDED: Simple passthrough for clean font display
const simpleChord = (chord: string): string => {
  return chord || '';
};
```

## Usage Site Changes

### Center Bubbles (4 changes)
```typescript
// BEFORE:
{displayRoman ? centerUp : renderChordSVG(prettyChord(centerUp)) || ''}

// AFTER:
{displayRoman ? centerUp : simpleChord(centerUp) || ''}
```

### Left Bubbles (8 changes)
```typescript
// BEFORE:
renderChordSVG(prettyChord(`${left_up_in_use[i-1]}7`))
renderChordSVG(prettyChord(`${left_down_in_use[i-1]}m7b5`))

// AFTER:
simpleChord(`${left_up_in_use[i-1]}7`)
simpleChord(`${left_down_in_use[i-1]}m7b5`)
```

### Right Bubbles (4 changes)
```typescript
// BEFORE:
renderChordSVG(prettyChord(`${right_up_in_use[i-1]}7`))
renderChordSVG(prettyChord(`${right_down_in_use[i-1]}º7`))

// AFTER:
simpleChord(`${right_up_in_use[i-1]}7`)
simpleChord(`${right_down_in_use[i-1]}º7`)
```

### Fifth Outer Bubbles (8 changes)
```typescript
// BEFORE:
renderChordSVG(prettyChord(`${fifth_left_up_in_use[i]}7`))
renderChordSVG(prettyChord(`${fifth_left_down_in_use[i]}m7b5`))
renderChordSVG(prettyChord(`${fifth_right_up_in_use[i]}7`))
renderChordSVG(prettyChord(`${fifth_right_down_in_use[i]}º7`))

// AFTER:
simpleChord(`${fifth_left_up_in_use[i]}7`)
simpleChord(`${fifth_left_down_in_use[i]}m7b5`)
simpleChord(`${fifth_right_up_in_use[i]}7`)
simpleChord(`${fifth_right_down_in_use[i]}º7`)
```

## Summary
- **Total lines removed**: ~150 lines of font manipulation logic
- **Total replacements**: 24 complex function calls → 24 simple passthroughs
- **Functions eliminated**: 5 complex manipulation functions
- **Functions added**: 1 simple passthrough function
- **TypeScript errors resolved**: 18+ undefined reference errors

## Font System
- **Current**: `font-family: "nvxChord", monospace;`
- **Font file**: `/public/fonts/Chord_Grid_v2.otf`
- **Status**: Clean, direct font rendering without manipulation
