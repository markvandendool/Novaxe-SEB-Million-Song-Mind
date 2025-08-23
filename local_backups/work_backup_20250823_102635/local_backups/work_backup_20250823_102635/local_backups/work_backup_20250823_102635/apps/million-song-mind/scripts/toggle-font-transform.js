#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, '../src/components/braid/BraidTonal.tsx');

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Check current state
const transformOnPattern = /const useTransform = true;/;
const transformOffPattern = /const useTransform = false;/;

let newContent;
let newState;

if (transformOnPattern.test(content)) {
    // Currently ON, turn OFF
    newContent = content.replace(transformOnPattern, 'const useTransform = false;');
    newState = 'OFF';
} else if (transformOffPattern.test(content)) {
    // Currently OFF, turn ON
    newContent = content.replace(transformOffPattern, 'const useTransform = true;');
    newState = 'ON';
} else {
    console.error('❌ Could not find useTransform setting in BraidTonal.tsx');
    process.exit(1);
}

// Write the file
fs.writeFileSync(filePath, newContent);

console.log(`
✅ Font transformation is now ${newState}

${newState === 'ON' ?
        '🔄 Transformation ON: Bb → Bl (for ligature fonts)' :
        '📝 Transformation OFF: Bb stays as Bb (like Angular)'}

Refresh your browser to see the change!
`);
