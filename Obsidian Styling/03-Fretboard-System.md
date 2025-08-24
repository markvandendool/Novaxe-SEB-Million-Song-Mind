# 03-Fretboard System: Complete Animation & Styling Forensics

## Component Location
**Primary File**: `/apps/obsidian-angular/src/app/components/fretboard/fretboard.component.scss`
**Size**: 705 lines of SCSS
**Assets**: SVG backgrounds in `/assets/img/fretboard/`
**Dependencies**: Font families (nvxScale), CSS variables, SVG filters

## Animation System Architecture

### Finger Animation Classes
The fretboard implements three distinct finger animation styles for rocksmith-style visual feedback:

#### 1. Misty Animation (Lines 206-225)
```scss
.p-misty{
    fill: white;
    fill-opacity: 0;
    transform-origin: 50% 50%;
    animation-duration: 0.5s;
    animation-name: p-misty;
    animation-iteration-count: 1;
    transform-origin:50%;
}

@keyframes p-misty {
    from {
      stroke-width: 5px;
      stroke-opacity: 1;
      transform: scale(1.7) translate(1px, 1px);
      filter: url(#f2) blur(5px) drop-shadow(0px 0px 0px white);
    }
    to {
      stroke-width: 0;
      stroke-opacity: 0;
      transform: scale(1.2);
    }
}
```
**Effect**: Shrinking white glow with blur, single iteration

#### 2. Summertime Animation (Lines 232-250)
```scss
.p-summer{
    fill: white;
    fill-opacity: 0;
    transform-origin: 50% 50%;
    animation-name: p-summer;
    animation-iteration-count: infinite;
}

@keyframes p-summer {
    from {
      stroke-width: 25px;
      stroke-opacity: 1;
      transform: scale(0.3);
    }
    to {
      stroke-width: 0;
      stroke-opacity: 0;
      transform: scale(2) translate(1px, 1px);
    }
}
```
**Effect**: Continuous expanding pulse, infinite loop

#### 3. Fever Animation (Lines 252-307)
```scss
.p-fever{
    animation:p-fever 4s infinite; 
    fill:transparent; 
    stroke:#fffc00; 
    stroke-width:10px;
    stroke-linejoin: bevel;
    stroke-linecap: round;
}

@keyframes p-fever {
    0% {
      filter: drop-shadow(-0.75px 0px 6px #fffc00)drop-shadow(-0.75px 0px 6px #fffc00);
      stroke: #fffc00;
    }
    // ... 8 color progression steps
    100% {
      filter: drop-shadow(-0.75px 0px 6px #ffca00)drop-shadow(-0.75px 0px 10px #ffca00);
      stroke: #ffca00;
    }
}
```
**Effect**: Complex 8-step color progression from yellow through red spectrum, 4s infinite loop

#### 4. Glow Animation (Lines 335-346)
```scss
.bubble.glow{
    filter: contrast(1.5) blur(1px);
    animation-duration: 0.3s;
    animation-name: p-glow;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
}

@keyframes p-glow {
    from {transform: scale(1);}
    to {transform: scale(1.8);}
}
```
**Effect**: Quick scale expansion with contrast/blur enhancement

## String & Fret System Styling

### Finger Position Classes
```scss
.finger_midi {fill: #ffff00;opacity: 0;}
.lh_finger {fill: black;opacity: 0;}
.finger-diamond{
    stroke:none; 
    fill:black; 
    filter:none;
    font-family:'nvxScale';
    transform: translate(10px, 24px);
    font-size: 19px;
}
```

### Bubble System (Lines 347-358)
```scss
.bubble{
    transform-box: fill-box;
    transform:scale(1.2);
    transform-origin: center;
    &.transp{
      opacity: 0.6;
    }
}
```
**Purpose**: Note position indicators with scale and transparency modifiers

### String Toggle System (Lines 451-452)
```scss
.stringToggle{fill: url(#closedEye);}
.stringToggle.active{fill: url(#openedEye);}
```
**Purpose**: String visibility controls using eye icon gradients

## Typography & Scale System

### Font Integration
```scss
.chords_notes_labels {
  font-size: 17px;
  font-family: "nvxScale";
  fill: black;
  stroke: none;
  text-anchor: middle;
}
```

### Chord Name Display (Lines 453-462)
```scss
.chord-name{
    font-size: 35px;
    position: absolute;
    bottom: 0;
    color: #28a745;
    line-height: 1.4em;
    filter: drop-shadow(2px 3px 1px black);
}
```

## CAGED System Integration

### CAGED Button Styling (Lines 365-384)
```scss
.caged_btn {
    transform: rotate(45deg);
    margin: 10px;
    border: 5px solid var(--green_nvx);
    color: var(--green_nvx);
    width: 2em;
    height: 2em;
    cursor: pointer;
    outline: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: var(--gray_nvx);

    &.active {background-color: #28a74570;}
}

.caged_btn:hover {background-color: #28a74570;}
```

## Control Panel Systems

### Glow Toggle Control (Lines 331-333)
```scss
.glow-toggle{display: flex; flex-direction: row; align-items:center;}
.glow-toggle i{margin: 2.5px 3px 0 10px;color: #30a348;text-shadow: 0 0 6px #5ab16e;}
.glow-toggle .tgl-btn{margin-bottom:0px;}
```

### Animation Display Controls (Lines 315-325)
```scss
.finger_anim_display{
    position: absolute;
    bottom: 0;
    right: 0;
    color: #fff;
    font-size: 0.75rem;
    margin-right: 80px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
}
```

### Switch System (Lines 393-425)
```scss
.apply-btns .switch {
    position: relative;
    display: inline-block;
    width: 25px; 
    height: 14.8px;
    margin-bottom: 0px;
}

.apply-btns .slider {
    position: absolute;
    cursor: pointer;
    top: 5px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    -webkit-transition: .4s;
    transition: .4s;
}

.apply-btns .slider:before{
    position: absolute;
    content: "";
    height: 13px;
    width: 13px;
    left: 0.5px;
    top: 0.5px;
    background-color: var(--green_nvx);
    -webkit-transition: .4s;
    transition: .4s;
}
```

## Modal System Integration

### Modal Positioning (Lines 27-54)
```scss
section#fretboard.modal{
  width: 1450px; 
  height: 385px; 
  overflow: hidden;
  bottom: auto;
  right: auto;
}

section#fretboard.modal.ui-draggable-dragging {
  -moz-transition: none;
  -o-transition: none;
  -webkit-transition: none;
  transition: none;
}

section#fretboard.modal.nofly {
  top: 18%;     
  left: 3%;      
  -webkit-transition: opacity 0.3s linear;
  -moz-transition: opacity 0.3s linear;
  -o-transition: opacity 0.3s linear;
  transition: opacity 0.3s linear;
}
```

## Background & Layout System

### Main Container (Lines 1-12)
```scss
section#fretboard{
  background-color:#49525bdb;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
}
```

### Menu System Layout (Lines 69-90)
```scss
.menus{
    height:80px;
    width: 100%;
    display:flex;
    flex-direction:row;
    justify-content:space-around;
    align-items:center;
}

.menus .scaleandchords{flex-direction: column;align-items: flex-start;}
.menus .scaleandchords img{padding: 5px; width: 30px; height: 30px;}
```

## Hand Direction Indicators (Lines 440-449)
```scss
.btns div .fas.hands{font-size: 15px;padding: 3px;}
.btns div .fa-hand-point-right{color: var(--green_nvx);}
.btns div .fa-hand-point-left{color: var(--red_nvx);}
```

## Implementation Guidelines

### Adding New Animation Patterns
1. **Create Animation Class**: Follow `.p-[name]` pattern
2. **Define Keyframes**: Use `@keyframes p-[name]` with specific effects
3. **Set Properties**: Configure duration, iteration, fill-mode
4. **Apply to Elements**: Target specific fret position bubbles

### Customizing Finger Animations
1. **Misty Style**: Single-shot shrinking glow (good for note hits)
2. **Summer Style**: Continuous pulse (good for sustained notes)
3. **Fever Style**: Color-shifting intensity (good for dynamic passages)
4. **Glow Style**: Quick expansion (good for chord changes)

### String System Modifications
1. **Toggle Icons**: Modify gradient references in `.stringToggle` classes
2. **Hand Indicators**: Update colors in `.fa-hand-point-[direction]` classes
3. **Position Markers**: Adjust `.finger-diamond` transform and font-size

### CAGED System Customization
1. **Button Shape**: Modify rotation, border-width, dimensions in `.caged_btn`
2. **Active States**: Update background colors for `.active` and `:hover`
3. **Layout**: Adjust margin and flex properties in `.btns`

## Advanced Effects Integration

### Filter System Usage
- `url(#f2)`: Standard glow filter (defined in SVG)
- `blur()`: Gaussian blur effects
- `contrast()`: Color intensity adjustment
- `drop-shadow()`: Multi-layer shadow effects

### Transform Origins
- `50% 50%`: Center-based scaling
- `fill-box`: SVG coordinate system reference
- Custom transforms for finger positioning

### Color Progression Techniques
The fever animation demonstrates 8-step color progression:
`#fffc00 → #ffca00 → #ffb200 → #ff9b00 → #ff7700 → #ff5400 → #ff2500`

## CSS Variable Dependencies
- `--green_nvx`: #28a745 (CAGED buttons, hand indicators)
- `--red_nvx`: #dc3545 (left hand indicator)
- `--gray_nvx`: #6c757d (button backgrounds)
- `--light_prim`: #f8f9fa (UI elements)
- `--yellow_nvx`: #ffc107 (accent colors)

## Performance Considerations
- Animations use GPU-accelerated transforms where possible
- Complex filter chains may impact performance on lower-end devices
- Infinite animations should be pausable for accessibility
- Transform-origin optimization reduces repaints
