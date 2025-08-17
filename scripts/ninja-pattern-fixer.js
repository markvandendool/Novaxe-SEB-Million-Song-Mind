#!/usr/bin/env node

/**
 * 🥷 NINJA PATTERN FIXER - Mass Archaeological Intelligence Application
 * Applies proven fixes from COMPREHENSIVE_ERROR_SOLUTIONS_ARCHIVE.md
 * 
 * CRITICAL PATTERNS DETECTED:
 * - "public if(" -> "if("
 * - "public for(" -> "for("
 * - Missing method signatures
 * - Malformed parameter syntax
 * - RxJS pipe syntax errors
 * 
 * Usage: node ninja-pattern-fixer.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class NinjaPatternFixer {
    constructor() {
        this.projectRoot = "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/Novaxe SEB";
        this.fixCount = 0;
        this.filesProcessed = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'ninja': '🥷',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': '🔍'
        };
        console.log(`[${timestamp}] ${prefix[type]} ${message}`);
    }

    async applyArchaeologicalFixes() {
        this.log('🏺 APPLYING MASS ARCHAEOLOGICAL INTELLIGENCE...', 'ninja');

        // Find all TypeScript files
        const tsFiles = glob.sync(path.join(this.projectRoot, 'src/**/*.ts'), {
            ignore: [
                path.join(this.projectRoot, 'src/**/*.spec.ts'),
                path.join(this.projectRoot, 'src/**/*.d.ts')
            ]
        });

        this.log(`Found ${tsFiles.length} TypeScript files to process`, 'info');

        for (const filePath of tsFiles) {
            await this.fixFile(filePath);
        }

        this.log(`🎯 ARCHAEOLOGICAL FIXES COMPLETE: ${this.fixCount} patterns fixed across ${this.filesProcessed} files`, 'ninja');
    }

    async fixFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            let fileFixCount = 0;

            // PROVEN FIX 1: public if( -> if(
            const publicIfMatches = content.match(/public if\(/g);
            if (publicIfMatches) {
                content = content.replace(/public if\(/g, 'if(');
                fileFixCount += publicIfMatches.length;
                this.log(`Applied ${publicIfMatches.length} "public if" fixes in ${path.basename(filePath)}`, 'success');
            }

            // PROVEN FIX 2: public for( -> for(
            const publicForMatches = content.match(/public for\(/g);
            if (publicForMatches) {
                content = content.replace(/public for\(/g, 'for(');
                fileFixCount += publicForMatches.length;
                this.log(`Applied ${publicForMatches.length} "public for" fixes in ${path.basename(filePath)}`, 'success');
            }

            // PROVEN FIX 3: Fix malformed function parameters with ": any): void {"
            const malformedTypeMatches = content.match(/: any\): void \{/g);
            if (malformedTypeMatches) {
                content = content.replace(/: any\): void \{/g, ') {');
                fileFixCount += malformedTypeMatches.length;
                this.log(`Applied ${malformedTypeMatches.length} malformed type fixes in ${path.basename(filePath)}`, 'success');
            }

            // PROVEN FIX 4: Fix missing function parameters that end with "){" 
            const missingParamMatches = content.match(/(\w+)\(([^)]*)\)\{/g);
            if (missingParamMatches) {
                content = content.replace(/(\w+)\(([^)]*)\)\{/g, '$1($2) {');
                fileFixCount += missingParamMatches.length;
            }

            // PROVEN FIX 5: Fix double closing parentheses in return statements
            const doubleParenMatches = content.match(/return JSON\.parse\(res\)\);/g);
            if (doubleParenMatches) {
                content = content.replace(/return JSON\.parse\(res\)\);/g, 'return JSON.parse(res);');
                fileFixCount += doubleParenMatches.length;
            }

            // PROVEN FIX 6: Fix malformed console.log statements
            const malformedConsoleMatches = content.match(/console\.log\([^)]*\)\);/g);
            if (malformedConsoleMatches) {
                content = content.replace(/console\.log\(([^)]*)\)\);/g, 'console.log($1);');
                fileFixCount += malformedConsoleMatches.length;
            }

            // PROVEN FIX 7: Fix malformed map function syntax
            const malformedMapMatches = content.match(/map\(\(([^,)]*),([^,)]*),([^)]*)\)\)/g);
            if (malformedMapMatches) {
                content = content.replace(/map\(\(([^,)]*),([^,)]*),([^)]*)\)\)/g, 'map(($1, $2, $3)');
                fileFixCount += malformedMapMatches.length;
            }

            // PROVEN FIX 8: Fix method signatures with missing types
            content = content.replace(/(public|private|protected)\s+(\w+)\(([^)]*)\)\s*\{/g, (match, visibility, methodName, params) => {
                // Only add return type if it doesn't already have one
                if (!match.includes(': ')) {
                    return `${visibility} ${methodName}(${params}) {`;
                }
                return match;
            });

            // PROVEN FIX 9: Fix "object" type to "any"
            content = content.replace(/:object/g, ': any');

            // PROVEN FIX 10: Fix spacing in function declarations
            content = content.replace(/(\w+)\(([^)]*)\)\s*:/g, '$1($2):');

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content);
                this.filesProcessed++;
                this.fixCount += fileFixCount;
                this.log(`Fixed ${fileFixCount} patterns in ${path.basename(filePath)}`, 'success');
            }

        } catch (error) {
            this.log(`Error processing ${filePath}: ${error.message}`, 'error');
        }
    }
}

// Run the Ninja Pattern Fixer
async function runNinjaFixer() {
    const fixer = new NinjaPatternFixer();
    await fixer.applyArchaeologicalFixes();

    console.log('\n🥷 NINJA PATTERN FIXER COMPLETE!');
    console.log('🏺 All archaeological intelligence patterns have been applied');
    console.log('🎯 Ready for validation test...');
}

runNinjaFixer().catch(console.error);
