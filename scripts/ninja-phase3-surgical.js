#!/usr/bin/env node

/**
 * 🥷 NINJA PHASE 3 - SURGICAL ARCHAEOLOGICAL PRECISION 
 * Final targeted fixes for remaining specific patterns
 * 
 * PHASE 3 PATTERNS (surgical):
 * - Missing method declarations inside class
 * - Variable scope issues 
 * - Malformed function signatures outside class
 * - Switch statement syntax fixes
 * - Specific import issues
 * 
 * Usage: node ninja-phase3-surgical.js
 */

const fs = require('fs');
const path = require('path');

class NinjaPhase3Surgical {
    constructor() {
        this.projectRoot = "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/Novaxe SEB";
        this.fixCount = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'ninja': '🥷',
            'success': '✅',
            'error': '❌',
            'info': '🔍'
        };
        console.log(`[${timestamp}] ${prefix[type]} ${message}`);
    }

    async applySurgicalFixes() {
        this.log('🏺 PHASE 3: SURGICAL ARCHAEOLOGICAL PRECISION...', 'ninja');

        // Target the most problematic files specifically
        await this.fixMusicUtilsService();
        await this.fixNumberExtensions();
        await this.fixParsingService();

        this.log(`🎯 SURGICAL FIXES COMPLETE: ${this.fixCount} critical patterns resolved`, 'ninja');
    }

    async fixMusicUtilsService() {
        const filePath = path.join(this.projectRoot, 'src/app/services/music-utils-service/music-utils.service.ts');
        this.log('🔧 Applying surgical fixes to music-utils.service.ts...', 'ninja');

        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // SURGICAL FIX 1: Add missing variable declaration at function start
        if (content.includes("if(!hasSeventh && hasMajThirteen && !hasMajSixth)s='6'+s;")) {
            content = content.replace(
                /(getChordName2\([^{]+\{[^}]*)/,
                '$1\n  let s = "";'
            );
            this.fixCount++;
        }

        // SURGICAL FIX 2: Fix method declarations outside class - make them class methods
        content = content.replace(/^(\s*)(\w+)\(([^)]*)\)\s*\{/gm, (match, indent, methodName, params) => {
            // Skip if already properly indented (inside class)
            if (indent.length >= 2) return match;
            // Convert to proper class method
            return `  ${methodName}(${params}) {`;
        });

        // SURGICAL FIX 3: Fix else statements that are orphaned  
        content = content.replace(/^\s*\} else \{$/gm, '    } else {');

        // SURGICAL FIX 4: Fix the getCagedPosition function assignment
        content = content.replace(
            /getCagedPosition = function\(([^)]*)\)\s*\{/,
            'getCagedPosition($1) {'
        );

        // SURGICAL FIX 5: Fix switch statements - add proper switch() wrapper
        const switchPattern = /(\s+)(case\s+['"][A-Z]['"]:\s*)/g;
        if (content.match(switchPattern)) {
            content = content.replace(
                /(\s+case\s+['"][A-Z]['"]:\s*)/g,
                (match) => {
                    // Check if we need to add switch statement
                    const lines = content.split('\n');
                    const matchIndex = content.indexOf(match);
                    const linesBefore = content.substring(0, matchIndex).split('\n');
                    const currentLine = linesBefore.length - 1;

                    // Look for switch in previous lines
                    let hasSwitchBefore = false;
                    for (let i = Math.max(0, currentLine - 5); i < currentLine; i++) {
                        if (lines[i] && lines[i].includes('switch')) {
                            hasSwitchBefore = true;
                            break;
                        }
                    }

                    if (!hasSwitchBefore) {
                        return `    switch(mode) {\n${match}`;
                    }
                    return match;
                }
            );
            this.fixCount++;
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            this.log('✅ Applied surgical fixes to music-utils.service.ts', 'success');
        }
    }

    async fixNumberExtensions() {
        const filePath = path.join(this.projectRoot, 'src/app/services/music-utils-service/number.extensions.ts');
        this.log('🔧 Applying surgical fixes to number.extensions.ts...', 'ninja');

        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // SURGICAL FIX: Add missing map import at top
        if (!content.includes('import { map }')) {
            content = content.replace(
                /^(declare global)/m,
                'import { map } from "rxjs/operators";\n\n$1'
            );
            this.fixCount++;
        }

        // SURGICAL FIX: Fix the malformed object property definition
        content = content.replace(
            /\} else \{[\s\S]*?\}/g,
            `} else {
      return this.splice(Math.floor(Math.random() * this.length), 1);
    }`
        );

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            this.log('✅ Applied surgical fixes to number.extensions.ts', 'success');
        }
    }

    async fixParsingService() {
        const filePath = path.join(this.projectRoot, 'src/app/services/parsing.service.ts');
        this.log('🔧 Applying surgical fixes to parsing.service.ts...', 'ninja');

        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // SURGICAL FIX: Fix pipe operations that are incomplete
        content = content.replace(
            /\.pipe\(map\(([^)]+)\)\)[\s\n]*\.subscribe\(/g,
            '.pipe(map($1)).subscribe('
        );

        // SURGICAL FIX: Fix orphaned else statements
        content = content.replace(/^\s*\} else \{$/gm, '      } else {');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            this.log('✅ Applied surgical fixes to parsing.service.ts', 'success');
        }
    }
}

// Run Phase 3 Surgical Fixes
async function runPhase3() {
    const fixer = new NinjaPhase3Surgical();
    await fixer.applySurgicalFixes();

    console.log('\n🥷 PHASE 3 SURGICAL NINJA COMPLETE!');
    console.log('🏺 Final archaeological precision applied');
    console.log('🎯 Ready for ULTIMATE validation...');
}

runPhase3().catch(console.error);
