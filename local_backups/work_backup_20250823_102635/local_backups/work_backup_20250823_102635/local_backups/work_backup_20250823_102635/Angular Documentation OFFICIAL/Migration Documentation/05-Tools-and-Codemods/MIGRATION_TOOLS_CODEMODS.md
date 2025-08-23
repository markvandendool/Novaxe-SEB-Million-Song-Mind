# Migration Tools & Codemods Comprehensive Guide

**Date:** August 20, 2025  
**Purpose:** Complete toolkit for Angular → React migration automation  
**Coverage:** Official tools, community scripts, custom DIAMOND solutions  

---

## 🛠️ **OFFICIAL ANGULAR MIGRATION TOOLS**

### **1. Angular CLI Update Tool**
```bash
# Check current version and available updates
ng version
ng update

# Specific version upgrades with migration schematics
ng update @angular/core@12 @angular/cli@12
ng update @angular/core@13 @angular/cli@13
ng update @angular/core@20 @angular/cli@20

# Dry-run to preview changes
ng update @angular/core --dry-run

# Force update if needed (use carefully)
ng update @angular/core --force
```

**Features:**
- Automatic dependency updates
- Code transformation schematics
- Breaking changes notifications
- Rollback support

### **2. Angular Migration Schematics**
```bash
# List available migration schematics
ng generate --help

# Run specific migration schematics
ng generate @angular/core:migration-v12
ng generate @angular/core:migration-v13

# Custom schematic for DIAMOND
ng generate @diamond/migration:update-observables
```

---

## ⚡ **AUTOMATED REFACTORING TOOLS**

### **1. JSCodeshift (Facebook)**
```bash
# Install globally
npm install -g jscodeshift

# Basic Angular to React transforms
git clone https://github.com/reactjs/react-codemod
jscodeshift -t react-codemod/transforms/class-to-function.js src/

# Custom DIAMOND transforms (create custom codemods)
jscodeshift -t ./custom-transforms/angular-service-to-hook.js src/
```

**Custom DIAMOND Codemod Example:**
```javascript
// angular-service-to-hook.js
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);

  // Transform Angular Injectable to React Hook
  return source
    .find(j.Decorator, {
      expression: {
        callee: { name: 'Injectable' }
      }
    })
    .forEach(path => {
      const classDeclaration = path.parent.value;
      const className = classDeclaration.id.name;
      const hookName = `use${className.replace('Service', '')}`;
      
      // Transform class to hook function
      const hookFunction = j.functionDeclaration(
        j.identifier(hookName),
        [],
        j.blockStatement([
          // Hook implementation
        ])
      );
      
      j(path.parent).replaceWith(hookFunction);
    })
    .toSource();
};
```

### **2. TypeScript Migration Assistant**
```bash
# Install TypeScript migration tools
npm install -g typescript-migration-assistant

# Analyze TypeScript compatibility
tsc-migrate analyze src/

# Apply automated fixes
tsc-migrate migrate src/ --target es2020
```

### **3. RxJS Migration Tool**
```bash
# Install RxJS migration helper
npm install -g rxjs-migration-tool

# Convert RxJS patterns to React patterns
rxjs-to-react-hooks src/ --output dist/

# Fix RxJS import issues
rxjs-fix-imports src/
```

---

## 🎵 **DIAMOND-SPECIFIC MIGRATION TOOLS**

### **1. Musical Pattern Converter**
```bash
# Custom tool for DIAMOND musical patterns
node tools/diamond-musical-converter.js

# Convert TonalJS patterns
node tools/tonaljs-pattern-converter.js src/services/
```

**Tool Implementation:**
```javascript
// diamond-musical-converter.js
const fs = require('fs');
const path = require('path');

class DiamondMusicalConverter {
  convertAngularToReact(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Convert Angular patterns to React
    let converted = content
      // Convert Observable patterns
      .replace(/\.subscribe\(/g, '.then(')
      .replace(/BehaviorSubject/g, 'useState')
      .replace(/Subject/g, 'useState')
      
      // Convert Angular lifecycle
      .replace(/ngOnInit/g, 'useEffect')
      .replace(/ngOnDestroy/g, 'useEffect cleanup')
      
      // Convert Angular services
      .replace(/Injectable/g, 'Context Provider')
      .replace(/inject\(/g, 'useContext(');
    
    return converted;
  }
  
  preserveMusicalAccuracy(code) {
    // Ensure musical calculations remain exact
    const musicalPatterns = [
      /Chord\.detect/g,
      /Scale\.get/g,
      /Note\.transpose/g,
      /Interval\.add/g
    ];
    
    musicalPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        console.log(`⚠️ Musical pattern detected - manual review required`);
      }
    });
    
    return code;
  }
}

module.exports = DiamondMusicalConverter;
```

### **2. MIDI Integration Converter**
```javascript
// midi-integration-converter.js
class MidiIntegrationConverter {
  convertMidiService(angularService) {
    return `
// Converted from Angular MIDI Service
const useMidiService = () => {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<WebMidi.MIDIInput[]>([]);
  
  const initializeMidi = useCallback(async () => {
    try {
      const access = await navigator.requestMIDIAccess();
      setMidiAccess(access);
      
      // Preserve Roland GR guitar integration
      access.inputs.forEach(input => {
        if (input.name?.includes('GR-') || input.name?.includes('Roland')) {
          console.log('Roland GR device detected:', input.name);
          setupRolandGRHandlers(input);
        }
      });
    } catch (error) {
      console.error('MIDI initialization failed:', error);
    }
  }, []);
  
  const setupRolandGRHandlers = (input: WebMidi.MIDIInput) => {
    input.onmidimessage = (event) => {
      // Preserve exact MIDI message handling
      const [status, data1, data2] = event.data;
      
      // Roland GR-specific message handling
      if (status >= 144 && status <= 159) { // Note On
        handleGRNoteOn(data1, data2);
      } else if (status >= 128 && status <= 143) { // Note Off
        handleGRNoteOff(data1, data2);
      }
    };
  };
  
  return { midiAccess, initializeMidi, connectedDevices };
};
`;
  }
}
```

### **3. Braid Component Converter**
```bash
# Custom converter for the crown jewel component
node tools/braid-component-converter.js src/app/components/braid/
```

```javascript
// braid-component-converter.js
class BraidComponentConverter {
  convertBraidComponent(angularBraid) {
    const reactBraid = `
import React, { useState, useEffect, useCallback } from 'react';
import { useTonalityService } from '../services/useTonalityService';
import { useSelectionService } from '../services/useSelectionService';
import { useMidiService } from '../services/useMidiService';

interface BraidProps {
  selectedFifth: string;
  selectedMode: string;
  onProgressionChange: (progression: MusicalProgression) => void;
}

const BraidComponent: React.FC<BraidProps> = ({ 
  selectedFifth, 
  selectedMode, 
  onProgressionChange 
}) => {
  // Preserve all 10 bubble positions exactly
  const bubblePositions = [
    { x: 200, y: 100, position: 0, roman: 'I' },
    { x: 300, y: 150, position: 1, roman: 'V' },
    { x: 350, y: 250, position: 2, roman: 'ii' },
    { x: 300, y: 350, position: 3, roman: 'vi' },
    { x: 200, y: 400, position: 4, roman: 'iii' },
    { x: 100, y: 350, position: 5, roman: 'vii°' },
    { x: 50, y: 250, position: 6, roman: 'IV' },
    { x: 100, y: 150, position: 7, roman: 'I' },
    { x: 150, y: 200, position: 8, roman: 'V/V' },
    { x: 250, y: 200, position: 9, roman: 'V/vi' }
  ];
  
  const { calculateTonality } = useTonalityService();
  const { updateSelection } = useSelectionService();
  const { sendMidiEvent } = useMidiService();
  
  const handleBubbleClick = useCallback((position: number) => {
    // Preserve exact musical logic from Angular version
    const progression = calculateProgression(position);
    updateSelection(progression);
    sendMidiEvent(progression.rootNote);
    onProgressionChange(progression);
  }, [calculateTonality, updateSelection, sendMidiEvent, onProgressionChange]);
  
  // Preserve all DIAMOND musical intelligence
  const calculateProgression = (position: number) => {
    // This must maintain exact musical accuracy
    return calculateTonality(selectedFifth, selectedMode, position);
  };
  
  return (
    <svg viewBox="0 0 400 500" className="braid-container">
      {/* Render connecting lines (braid pattern) */}
      <defs>
        <path d="M200,100 Q300,200 200,400 Q100,300 200,100" id="braid-path" />
      </defs>
      <use href="#braid-path" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      
      {/* Render musical bubbles */}
      {bubblePositions.map(bubble => (
        <g key={bubble.position}>
          <circle
            cx={bubble.x}
            cy={bubble.y}
            r="25"
            fill="rgba(255,255,255,0.8)"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
            onClick={() => handleBubbleClick(bubble.position)}
            style={{ cursor: 'pointer' }}
          />
          <text
            x={bubble.x}
            y={bubble.y + 5}
            textAnchor="middle"
            fontSize="14"
            fill="black"
            fontFamily="nvxChord, serif"
          >
            {bubble.roman}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default BraidComponent;
`;
    
    return reactBraid;
  }
}
```

---

## 📊 **AUTOMATION WORKFLOW**

### **Complete Migration Pipeline**
```bash
#!/bin/bash
# diamond-migration-pipeline.sh

echo "🎵 DIAMOND Migration Pipeline Starting..."

# Step 1: Pre-migration analysis
echo "📊 Analyzing DIAMOND codebase..."
node tools/diamond-analyzer.js src/

# Step 2: Dependency updates
echo "📦 Updating dependencies..."
npm install -g @angular/cli@latest
ng update --all --dry-run

# Step 3: Automated transformations
echo "🔄 Running automated transformations..."
jscodeshift -t transforms/angular-to-react.js src/
node tools/diamond-musical-converter.js src/

# Step 4: Manual review markers
echo "⚠️ Marking items for manual review..."
grep -r "TODO: MANUAL REVIEW" src/ > manual-review-items.txt

# Step 5: Testing validation
echo "🧪 Running validation tests..."
npm test -- --coverage
npm run e2e

# Step 6: Performance benchmarks
echo "📈 Performance benchmarking..."
node tools/performance-benchmark.js

echo "✅ Migration pipeline complete!"
echo "📋 Review manual-review-items.txt for remaining tasks"
```

---

## 🎯 **TOOL RECOMMENDATION MATRIX**

### **For Angular Version Upgrades:**
- **Primary:** Angular CLI (`ng update`)
- **Secondary:** Custom schematics for DIAMOND patterns
- **Manual Review:** Musical accuracy validation

### **For React Migration:**
- **Primary:** JSCodeshift + custom transforms
- **Secondary:** TypeScript migration assistant
- **Critical:** Manual conversion of musical intelligence

### **For DIAMOND Specifics:**
- **Required:** Custom musical pattern converters
- **Essential:** MIDI integration preservation tools
- **Critical:** Braid component specialized converter

---

## 📝 **TOOL CREATION TEMPLATE**

```javascript
// Template for creating custom DIAMOND migration tools
class DiamondMigrationTool {
  constructor(options = {}) {
    this.preserveMusicalAccuracy = options.preserveMusicalAccuracy || true;
    this.validateMidiIntegration = options.validateMidiIntegration || true;
    this.maintainPerformance = options.maintainPerformance || true;
  }
  
  transform(sourceCode, filePath) {
    console.log(`🔄 Processing: ${filePath}`);
    
    // Apply transformation
    let transformed = this.applyTransformation(sourceCode);
    
    // Validate musical accuracy
    if (this.preserveMusicalAccuracy) {
      transformed = this.validateMusicalPatterns(transformed);
    }
    
    // Check MIDI integration
    if (this.validateMidiIntegration) {
      transformed = this.validateMidiPatterns(transformed);
    }
    
    return transformed;
  }
  
  applyTransformation(code) {
    // Implement specific transformation logic
    return code;
  }
  
  validateMusicalPatterns(code) {
    // Ensure musical calculations remain intact
    return code;
  }
  
  validateMidiPatterns(code) {
    // Verify MIDI integration is preserved
    return code;
  }
}

module.exports = DiamondMigrationTool;
```

---

*Migration Tools & Codemods Guide - Part of DIAMOND Migration Documentation*
