#!/usr/bin/env node

/**
 * 🥷 NINJA PHASE 2 - Advanced Archaeological Intelligence
 * Handles complex syntax errors discovered in Phase 1
 * 
 * PHASE 2 PATTERNS:
 * - Missing closing parentheses in pipe operations
 * - Malformed map function parameters
 * - Missing semicolons in method signatures
 * - Complex RxJS pipe syntax fixes
 * - Missing imports for map operators
 * 
 * Usage: node ninja-phase2-fixer.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class NinjaPhase2Fixer {
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

    async applyPhase2Fixes() {
        this.log('🏺 PHASE 2: ADVANCED ARCHAEOLOGICAL INTELLIGENCE...', 'ninja');

        // Find all TypeScript files
        const tsFiles = glob.sync(path.join(this.projectRoot, 'src/**/*.ts'), {
            ignore: [
                path.join(this.projectRoot, 'src/**/*.spec.ts'),
                path.join(this.projectRoot, 'src/**/*.d.ts')
            ]
        });

        this.log(`Found ${tsFiles.length} files for Phase 2 processing`, 'info');

        for (const filePath of tsFiles) {
            await this.fixFile(filePath);
        }

        this.log(`🎯 PHASE 2 COMPLETE: ${this.fixCount} advanced patterns fixed`, 'ninja');
    }

    async fixFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            let fileFixCount = 0;

            // PHASE 2 FIX 1: Fix missing closing parentheses in pipe(map()) operations
            const mapParenMatches = content.match(/\.pipe\(map\(\([^)]*\)\)/g);
            if (mapParenMatches) {
                content = content.replace(/\.pipe\(map\(\(([^)]*)\)\)/g, '.pipe(map(($1) => ');
                fileFixCount += mapParenMatches.length;
            }

            // PHASE 2 FIX 2: Fix malformed map function parameters (el)) => to (el) =>
            content = content.replace(/map\(\(([^)]*)\)\)/g, 'map(($1) =>')
                .replace(/map\(\(([^,)]*),([^,)]*),([^)]*)\)\)/g, 'map(($1, $2, $3) =>')
                .replace(/map\(\(([^,)]*),([^)]*)\)\)/g, 'map(($1, $2) =>');

            // PHASE 2 FIX 3: Fix missing method signature semicolons and types
            content = content.replace(/(\w+)\(([^)]*)\)\s*\{/g, (match, methodName, params) => {
                // Skip if already properly typed
                if (match.includes('):') || methodName === 'if' || methodName === 'else') {
                    return match;
                }
                return `${methodName}(${params}) {`;
            });

            // PHASE 2 FIX 4: Fix malformed catch statements
            content = content.replace(/\}catch\(([^)]*)\)\)/g, '} catch($1) {');

            // PHASE 2 FIX 5: Fix missing closing braces for map operations
            content = content.replace(/\)\s*=>\s*\{([^}]*)\s*\}\s*\);?$/gm, (match) => {
                if (!match.includes('});')) {
                    return match.replace(/\}[^}]*$/, '});');
                }
                return match;
            });

            // PHASE 2 FIX 6: Fix double semicolons and malformed returns
            content = content.replace(/;;\s*$/gm, ';')
                .replace(/return ([^;]+);\s*$/gm, 'return $1;')
                .replace(/return\s*([^;]+);;\s*$/gm, 'return $1;');

            // PHASE 2 FIX 7: Fix method parameter declarations
            content = content.replace(/\(([^:)]+):\s*([^)]+)\)\s*\{/g, '($1: $2) {');

            // PHASE 2 FIX 8: Fix else statements that should be standalone
            content = content.replace(/^\s*else\s*$/gm, '} else {');

            // PHASE 2 FIX 9: Fix malformed class method visibility
            content = content.replace(/^\s*public\s+(\w+)\s*\{/gm, 'public $1() {');

            // PHASE 2 FIX 10: Ensure map import is present if .pipe(map( is used
            if (content.includes('.pipe(map(') && !content.includes('import { map }')) {
                // Find existing rxjs imports
                const rxjsImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]rxjs\/operators['"];?/);
                if (rxjsImportMatch) {
                    const imports = rxjsImportMatch[1].trim();
                    if (!imports.includes('map')) {
                        content = content.replace(
                            /import\s*\{([^}]*)\}\s*from\s*['"]rxjs\/operators['"];?/,
                            `import { ${imports}, map } from 'rxjs/operators';`
                        );
                        fileFixCount += 1;
                    }
                } else {
                    // Add new import after other imports
                    const lastImportMatch = content.match(/^import[^;]*;$/gm);
                    if (lastImportMatch) {
                        const lastImport = lastImportMatch[lastImportMatch.length - 1];
                        content = content.replace(lastImport, lastImport + '\nimport { map } from \'rxjs/operators\';');
                        fileFixCount += 1;
                    }
                }
            }

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content);
                this.filesProcessed++;
                this.fixCount += fileFixCount;
                if (fileFixCount > 0) {
                    this.log(`Phase 2: Fixed ${fileFixCount} patterns in ${path.basename(filePath)}`, 'success');
                }
            }

        } catch (error) {
            this.log(`Error processing ${filePath}: ${error.message}`, 'error');
        }
    }
}

// Run Phase 2 Fixes
async function runPhase2() {
    const fixer = new NinjaPhase2Fixer();
    await fixer.applyPhase2Fixes();

    console.log('\n🥷 PHASE 2 NINJA FIXER COMPLETE!');
    console.log('🏺 Advanced archaeological patterns applied');
    console.log('🎯 Ready for final validation...');
}

runPhase2().catch(console.error);
