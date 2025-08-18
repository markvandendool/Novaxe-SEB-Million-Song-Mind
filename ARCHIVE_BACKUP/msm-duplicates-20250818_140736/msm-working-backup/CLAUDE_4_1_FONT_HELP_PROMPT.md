# 🚨 CLAUDE 4.1 FONT DEBUGGING HELP REQUEST

## **CRITICAL ISSUE**: Fontdec13 font not rendering properly in React/SVG braid visualization

### **CONTEXT**:
- React/Vite application with SVG-based braid visualization
- Fontdec13.otf font should be primary font for all text elements
- Text positioning is incorrect and font doesn't appear to be Fontdec13
- Multiple font override systems may be interfering

### **WHAT WE'VE TRIED**:

1. **@font-face declaration in src/index.css**:
```css
@font-face {
  font-family: "Fontdec13";
  src: url("/fonts/Fontdec13.otf") format("opentype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

2. **Fixed Tailwind config** - font-mono now includes Fontdec13 first
3. **Removed system font overrides** from BraidTonal.css 
4. **Applied braid-label classes** with proper font-family stacks
5. **Fixed SVG text positioning** with textAnchor and dominantBaseline

### **CURRENT PROBLEM**:
- Text in SVG bubbles still appears to use system fonts, not Fontdec13
- Text positioning is off-center (too far left in bubbles)
- Font doesn't have the distinctive Fontdec13 characteristics
- Both braid AND harmonic profile should use Fontdec13 but don't appear to

### **FILE STRUCTURE**:
```
src/
  index.css (has @font-face and .braid-label classes)
  components/
    YinYangCircle.tsx (SVG text elements)
    braid/
      BraidTonal.tsx (main braid component)
      BraidTonal.css (text styling)
public/
  fonts/
    Fontdec13.otf (font file location)
tailwind.config.ts (font-mono definition)
```

### **SPECIFIC QUESTIONS**:

1. **Font Loading**: Is our @font-face declaration correct for Vite? Should it be `/fonts/` or `./fonts/`?

2. **SVG Text Fonts**: Do SVG `<text>` elements respect CSS font-family the same way as HTML elements?

3. **CSS Specificity**: Could there be other CSS rules overriding our font declarations we haven't found?

4. **React/Vite**: Are there any Vite-specific font loading issues we should know about?

5. **Font Fallback**: If Fontdec13.otf isn't loading, how can we debug which font is actually being used?

6. **SVG Text Positioning**: What's the relationship between font choice and SVG text positioning (textAnchor, dominantBaseline, x, y coordinates)?

### **DEBUGGING HELP NEEDED**:
- Browser dev tools techniques to verify which font is actually loading
- CSS debugging strategies for font cascading issues
- SVG-specific font rendering troubleshooting
- Vite font asset handling best practices

### **EXPECTED OUTCOME**:
All text in both the braid visualization AND harmonic profile should render in Fontdec13 font with proper positioning inside the SVG elements.

Please provide specific debugging steps and potential solutions for ensuring Fontdec13 loads and renders correctly in our React/SVG application.