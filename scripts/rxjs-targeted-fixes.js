#!/usr/bin/env node

/**
 * Targeted RxJS 6→7 Migration Script
 * Focuses specifically on the 325 common error patterns
 * 
 * Usage: node rxjs-targeted-fixes.js
 */

const fs = require('fs');
const path = require('path');

class RxJSTargetedMigrator {
    constructor() {
        this.projectRoot = process.cwd();
        this.srcPath = path.join(this.projectRoot, 'src');
        this.fixedFiles = [];
        this.errorPatterns = [];
        this.successCount = 0;
    }

    async migrate() {
        console.log('🎯 Starting Targeted RxJS 6→7 Migration');
        console.log('📊 Expected to resolve ~325 RxJS errors');

        // Step 1: Fix import statements (50+ errors)
        await this.fixImportStatements();

        // Step 2: Remove operator add imports (100+ errors)  
        await this.removeOperatorAddImports();

        // Step 3: Convert Observable chains to pipe (150+ errors)
        await this.convertObservableChains();

        // Step 4: Fix toPromise() usage (15+ errors)
        await this.fixToPromiseUsage();

        // Step 5: Add missing operator imports (10+ errors)
        await this.addMissingOperatorImports();

        console.log(`\n✅ Migration completed!`);
        console.log(`📈 Fixed ${this.successCount} issues across ${this.fixedFiles.length} files`);

        this.generateReport();
    }

    async fixImportStatements() {
        console.log('\n🔧 Step 1: Fixing RxJS import statements...');

        const importFixes = [
            // Core RxJS types
            {
                pattern: /import\s*{\s*Observable\s*}\s*from\s*['"]rxjs\/Observable['"];?\s*/g,
                replacement: "import { Observable } from 'rxjs';\n",
                description: "Observable import"
            },
            {
                pattern: /import\s*{\s*Subject\s*}\s*from\s*['"]rxjs\/Subject['"];?\s*/g,
                replacement: "import { Subject } from 'rxjs';\n",
                description: "Subject import"
            },
            {
                pattern: /import\s*{\s*BehaviorSubject\s*}\s*from\s*['"]rxjs\/BehaviorSubject['"];?\s*/g,
                replacement: "import { BehaviorSubject } from 'rxjs';\n",
                description: "BehaviorSubject import"
            },
            {
                pattern: /import\s*{\s*ReplaySubject\s*}\s*from\s*['"]rxjs\/ReplaySubject['"];?\s*/g,
                replacement: "import { ReplaySubject } from 'rxjs';\n",
                description: "ReplaySubject import"
            },
            {
                pattern: /import\s*{\s*Subscription\s*}\s*from\s*['"]rxjs\/Subscription['"];?\s*/g,
                replacement: "import { Subscription } from 'rxjs';\n",
                description: "Subscription import"
            },
            {
                pattern: /import\s*{\s*Subscriber\s*}\s*from\s*['"]rxjs\/Subscriber['"];?\s*/g,
                replacement: "import { Subscriber } from 'rxjs';\n",
                description: "Subscriber import"
            }
        ];

        const files = this.findTypeScriptFiles();
        let fixCount = 0;

        for (const file of files) {
            let content = fs.readFileSync(file, 'utf8');
            let hasChanges = false;

            for (const fix of importFixes) {
                if (fix.pattern.test(content)) {
                    content = content.replace(fix.pattern, fix.replacement);
                    hasChanges = true;
                    fixCount++;
                    console.log(`  ✓ Fixed ${fix.description} in ${path.basename(file)}`);
                }
            }

            if (hasChanges) {
                fs.writeFileSync(file, content, 'utf8');
                this.addToFixedFiles(file);
            }
        }

        this.successCount += fixCount;
        console.log(`  📊 Fixed ${fixCount} import statements`);
    }

    async removeOperatorAddImports() {
        console.log('\n🔧 Step 2: Removing deprecated operator add imports...');

        const operatorImports = [
            /import\s*['"]rxjs\/add\/operator\/map['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/filter['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/mergeMap['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/switchMap['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/catchError['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/catch['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/tap['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/do['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/take['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/takeUntil['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/debounceTime['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/distinctUntilChanged['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/share['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/startWith['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/delay['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/retry['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/finalize['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/finally['"];?\s*\n?/g,
            // Observable static method imports
            /import\s*['"]rxjs\/add\/observable\/of['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/observable\/from['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/observable\/throw['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/observable\/empty['"];?\s*\n?/g
        ];

        const files = this.findTypeScriptFiles();
        let fixCount = 0;

        for (const file of files) {
            let content = fs.readFileSync(file, 'utf8');
            let hasChanges = false;

            for (const operatorImport of operatorImports) {
                if (operatorImport.test(content)) {
                    content = content.replace(operatorImport, '');
                    hasChanges = true;
                    fixCount++;
                }
            }

            if (hasChanges) {
                // Clean up empty lines left by removed imports
                content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
                fs.writeFileSync(file, content, 'utf8');
                this.addToFixedFiles(file);
                console.log(`  ✓ Removed deprecated imports from ${path.basename(file)}`);
            }
        }

        this.successCount += fixCount;
        console.log(`  📊 Removed ${fixCount} deprecated operator imports`);
    }

    async convertObservableChains() {
        console.log('\n🔧 Step 3: Converting Observable chains to pipe() syntax...');

        const files = this.findTypeScriptFiles();
        let fixCount = 0;

        for (const file of files) {
            let content = fs.readFileSync(file, 'utf8');
            const originalContent = content;

            // Convert Observable method chains to pipe operations
            content = this.convertChainsInContent(content, file);

            if (content !== originalContent) {
                fs.writeFileSync(file, content, 'utf8');
                this.addToFixedFiles(file);
                const changes = this.countChanges(originalContent, content);
                fixCount += changes;
                console.log(`  ✓ Converted ${changes} chains in ${path.basename(file)}`);
            }
        }

        this.successCount += fixCount;
        console.log(`  📊 Converted ${fixCount} Observable chains to pipe() syntax`);
    }

    convertChainsInContent(content, filePath) {
        const lines = content.split('\n');
        let inObservableChain = false;
        let chainStartIndex = -1;
        let indentLevel = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip if this looks like an Array operation
            if (this.isLikelyArrayOperation(line)) {
                continue;
            }

            // Detect start of Observable chain
            if (this.isObservableChainStart(line)) {
                inObservableChain = true;
                chainStartIndex = i;
                indentLevel = line.length - line.trimStart().length;
                continue;
            }

            // Process chain operations
            if (inObservableChain && this.isChainOperation(line)) {
                // Convert .method() to method() inside pipe
                lines[i] = this.convertChainOperation(line, indentLevel);
                continue;
            }

            // End of chain detection
            if (inObservableChain && (trimmedLine.includes(';') || trimmedLine.includes('}'))) {
                // Wrap accumulated operations in pipe()
                this.wrapInPipe(lines, chainStartIndex, i, indentLevel);
                inObservableChain = false;
                chainStartIndex = -1;
            }
        }

        return lines.join('\n');
    }

    isObservableChainStart(line) {
        const observablePatterns = [
            /this\.http\.(get|post|put|delete|patch)/,
            /\w+Subject\s*\./,
            /Observable\./,
            /\w+\$\s*\./,  // Observable naming convention
            /\.asObservable\(\)/
        ];

        return observablePatterns.some(pattern => pattern.test(line)) &&
            !line.includes('.pipe(');
    }

    isChainOperation(line) {
        const chainOperations = [
            '.map(', '.filter(', '.mergeMap(', '.switchMap(', '.flatMap(',
            '.catchError(', '.catch(', '.tap(', '.do(',
            '.take(', '.takeUntil(', '.debounceTime(', '.distinctUntilChanged(',
            '.share(', '.startWith(', '.delay(', '.retry(', '.finalize(', '.finally('
        ];

        return chainOperations.some(op => line.includes(op));
    }

    convertChainOperation(line, baseIndent) {
        const conversions = [
            { from: '.map(', to: 'map(' },
            { from: '.filter(', to: 'filter(' },
            { from: '.mergeMap(', to: 'mergeMap(' },
            { from: '.switchMap(', to: 'switchMap(' },
            { from: '.flatMap(', to: 'mergeMap(' },  // flatMap is deprecated
            { from: '.catchError(', to: 'catchError(' },
            { from: '.catch(', to: 'catchError(' },  // catch is deprecated
            { from: '.tap(', to: 'tap(' },
            { from: '.do(', to: 'tap(' },  // do is deprecated
            { from: '.take(', to: 'take(' },
            { from: '.takeUntil(', to: 'takeUntil(' },
            { from: '.debounceTime(', to: 'debounceTime(' },
            { from: '.distinctUntilChanged(', to: 'distinctUntilChanged(' },
            { from: '.share(', to: 'share(' },
            { from: '.startWith(', to: 'startWith(' },
            { from: '.delay(', to: 'delay(' },
            { from: '.retry(', to: 'retry(' },
            { from: '.finalize(', to: 'finalize(' },
            { from: '.finally(', to: 'finalize(' }  // finally is deprecated
        ];

        let convertedLine = line;
        for (const conversion of conversions) {
            if (line.includes(conversion.from)) {
                convertedLine = line.replace(conversion.from, conversion.to);
                // Ensure proper indentation within pipe
                const currentIndent = line.length - line.trimStart().length;
                const newIndent = ' '.repeat(baseIndent + 2);
                convertedLine = newIndent + convertedLine.trimStart();
                break;
            }
        }

        return convertedLine;
    }

    wrapInPipe(lines, startIndex, endIndex, baseIndent) {
        if (startIndex === -1 || startIndex >= endIndex) return;

        // Add .pipe( to the end of the starting line
        lines[startIndex] = lines[startIndex].replace(/\s*$/, '.pipe(');

        // Add closing ) with proper indentation
        const closingIndent = ' '.repeat(baseIndent);
        if (endIndex < lines.length) {
            lines[endIndex] = lines[endIndex].replace(/^(\s*)/, `${closingIndent})`);
        }
    }

    isLikelyArrayOperation(line) {
        const arrayIndicators = [
            /\[\s*\]/, // Array literal
            /\.length\s*[><=]/, // Array length comparison
            /Array\.(from|of|isArray)/, // Array static methods
            /\w+\s*=\s*\[/, // Array assignment
            /for\s*\(\s*let\s+\w+\s+of\s+/, // for...of loop
            /\.forEach\(/, // Array forEach
            /\.indexOf\(/, // Array indexOf
            /\.slice\(/, // Array slice
            /\.splice\(/, // Array splice
            /\.push\(/, // Array push
            /\.pop\(/, // Array pop
            /\.shift\(/, // Array shift
            /\.unshift\(/ // Array unshift
        ];

        return arrayIndicators.some(indicator => indicator.test(line));
    }

    async fixToPromiseUsage() {
        console.log('\n🔧 Step 4: Fixing deprecated toPromise() usage...');

        const files = this.findTypeScriptFiles();
        let fixCount = 0;

        for (const file of files) {
            let content = fs.readFileSync(file, 'utf8');
            let hasChanges = false;

            if (content.includes('.toPromise()')) {
                // Add lastValueFrom import if not present
                if (!content.includes('lastValueFrom')) {
                    const rxjsImportMatch = content.match(/(import\s*{[^}]*}\s*from\s*['"]rxjs['"];?)/);
                    if (rxjsImportMatch) {
                        content = content.replace(
                            rxjsImportMatch[1],
                            rxjsImportMatch[1].replace('}', ', lastValueFrom }')
                        );
                    } else {
                        // Add new import at the top
                        content = `import { lastValueFrom } from 'rxjs';\n${content}`;
                    }
                }

                // Replace .toPromise() with lastValueFrom()
                content = content.replace(
                    /(\w+(?:\$)?(?:\.[^.]+)*?)\.toPromise\(\)/g,
                    'lastValueFrom($1)'
                );

                hasChanges = true;
                fixCount++;
            }

            if (hasChanges) {
                fs.writeFileSync(file, content, 'utf8');
                this.addToFixedFiles(file);
                console.log(`  ✓ Fixed toPromise() usage in ${path.basename(file)}`);
            }
        }

        this.successCount += fixCount;
        console.log(`  📊 Fixed ${fixCount} toPromise() usages`);
    }

    async addMissingOperatorImports() {
        console.log('\n🔧 Step 5: Adding missing operator imports...');

        const files = this.findTypeScriptFiles();
        let fixCount = 0;

        for (const file of files) {
            let content = fs.readFileSync(file, 'utf8');
            const neededOperators = this.detectNeededOperators(content);

            if (neededOperators.length > 0) {
                // Check if there's already an operators import
                const operatorImportMatch = content.match(/(import\s*{[^}]*}\s*from\s*['"]rxjs\/operators['"];?)/);

                if (operatorImportMatch) {
                    // Add to existing import
                    const existingImport = operatorImportMatch[1];
                    const existingOperators = existingImport.match(/{([^}]*)}/)[1]
                        .split(',').map(op => op.trim()).filter(op => op);

                    const newOperators = neededOperators.filter(op => !existingOperators.includes(op));

                    if (newOperators.length > 0) {
                        const allOperators = [...existingOperators, ...newOperators];
                        const newImport = `import { ${allOperators.join(', ')} } from 'rxjs/operators';`;
                        content = content.replace(operatorImportMatch[1], newImport);
                        fixCount++;
                    }
                } else {
                    // Add new operators import
                    const operatorImport = `import { ${neededOperators.join(', ')} } from 'rxjs/operators';\n`;
                    const importInsertPoint = content.match(/^((?:import.*?;\s*\n)*)/m);

                    if (importInsertPoint) {
                        content = content.replace(importInsertPoint[1], importInsertPoint[1] + operatorImport);
                    } else {
                        content = operatorImport + content;
                    }
                    fixCount++;
                }

                fs.writeFileSync(file, content, 'utf8');
                this.addToFixedFiles(file);
                console.log(`  ✓ Added operators [${neededOperators.join(', ')}] to ${path.basename(file)}`);
            }
        }

        this.successCount += fixCount;
        console.log(`  📊 Added ${fixCount} operator import statements`);
    }

    detectNeededOperators(content) {
        const operatorChecks = [
            { name: 'map', regex: /(?:^|\s)map\s*\(/gm },
            { name: 'filter', regex: /(?:^|\s)filter\s*\(/gm },
            { name: 'mergeMap', regex: /(?:^|\s)mergeMap\s*\(/gm },
            { name: 'switchMap', regex: /(?:^|\s)switchMap\s*\(/gm },
            { name: 'catchError', regex: /(?:^|\s)catchError\s*\(/gm },
            { name: 'tap', regex: /(?:^|\s)tap\s*\(/gm },
            { name: 'take', regex: /(?:^|\s)take\s*\(/gm },
            { name: 'takeUntil', regex: /(?:^|\s)takeUntil\s*\(/gm },
            { name: 'debounceTime', regex: /(?:^|\s)debounceTime\s*\(/gm },
            { name: 'distinctUntilChanged', regex: /(?:^|\s)distinctUntilChanged\s*\(/gm },
            { name: 'share', regex: /(?:^|\s)share\s*\(/gm },
            { name: 'startWith', regex: /(?:^|\s)startWith\s*\(/gm },
            { name: 'delay', regex: /(?:^|\s)delay\s*\(/gm },
            { name: 'retry', regex: /(?:^|\s)retry\s*\(/gm },
            { name: 'finalize', regex: /(?:^|\s)finalize\s*\(/gm }
        ];

        const needed = [];

        for (const check of operatorChecks) {
            if (check.regex.test(content) &&
                !content.includes(`import { ${check.name} }`) &&
                !content.includes(`{ ${check.name} }`)) {
                needed.push(check.name);
            }
        }

        return needed;
    }

    findTypeScriptFiles() {
        const files = [];

        const scanDirectory = (dir) => {
            if (!fs.existsSync(dir)) return;

            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory() &&
                    !item.startsWith('.') &&
                    item !== 'node_modules' &&
                    item !== 'dist') {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        };

        scanDirectory(this.srcPath);
        return files;
    }

    addToFixedFiles(filePath) {
        if (!this.fixedFiles.includes(filePath)) {
            this.fixedFiles.push(filePath);
        }
    }

    countChanges(originalContent, newContent) {
        const originalLines = originalContent.split('\n');
        const newLines = newContent.split('\n');
        let changes = 0;

        for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
            if (originalLines[i] !== newLines[i]) {
                changes++;
            }
        }

        return Math.ceil(changes / 2); // Approximate actual changes
    }

    generateReport() {
        const reportPath = path.join(this.projectRoot, 'rxjs-migration-report.txt');
        const report = [
            '=== RxJS 6→7 Migration Report ===',
            `Date: ${new Date().toISOString()}`,
            `Total fixes applied: ${this.successCount}`,
            `Files modified: ${this.fixedFiles.length}`,
            '',
            '=== Files Modified ===',
            ...this.fixedFiles.map(file => `- ${path.relative(this.projectRoot, file)}`),
            '',
            '=== Next Steps ===',
            '1. Run: ng build --configuration=production',
            '2. Run: npx tsc --noEmit',
            '3. Run: ng test',
            '4. Review any remaining compilation errors',
            '5. Test application functionality thoroughly',
            '',
            '=== Common Remaining Issues ===',
            '- Template strict null checks (use safe navigation: obj?.property)',
            '- Complex Observable chains may need manual review',
            '- Third-party libraries may need updates',
            '- Unit tests may need RxJS testing utilities updates',
            '',
            '=== RxJS 7 Best Practices ===',
            '- Always use pipe() for Observable operations',
            '- Import operators from rxjs/operators',
            '- Use lastValueFrom() instead of toPromise()',
            '- Consider using takeUntil() for subscription management'
        ].join('\n');

        fs.writeFileSync(reportPath, report);
        console.log(`\n📊 Migration report saved: ${reportPath}`);
    }
}

// Additional utility functions for manual fixes
class RxJSMigrationUtils {

    // Validate that all Observable chains use pipe()
    static validateObservableChains(projectRoot) {
        console.log('\n🔍 Validating Observable chains...');
        const srcPath = path.join(projectRoot, 'src');
        const issues = [];

        const files = this.findTypeScriptFiles(srcPath);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check for Observable chains without pipe()
                if (this.isObservableChainWithoutPipe(line)) {
                    issues.push({
                        file: path.relative(projectRoot, file),
                        line: i + 1,
                        content: line.trim(),
                        issue: 'Observable chain without pipe()'
                    });
                }

                // Check for deprecated operators
                if (this.hasDeprecatedOperator(line)) {
                    issues.push({
                        file: path.relative(projectRoot, file),
                        line: i + 1,
                        content: line.trim(),
                        issue: 'Deprecated operator usage'
                    });
                }
            }
        }

        if (issues.length > 0) {
            console.log(`⚠️  Found ${issues.length} potential issues:`);
            issues.forEach(issue => {
                console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
                console.log(`    ${issue.content}`);
            });
        } else {
            console.log('✅ All Observable chains appear to be properly migrated');
        }

        return issues;
    }

    static isObservableChainWithoutPipe(line) {
        const observablePatterns = [
            /this\.http\.(get|post|put|delete)/,
            /\w+Subject\./,
            /\w+\$\./
        ];

        const chainOperators = ['.map(', '.filter(', '.switchMap(', '.mergeMap('];

        return observablePatterns.some(pattern => pattern.test(line)) &&
            chainOperators.some(op => line.includes(op)) &&
            !line.includes('.pipe(');
    }

    static hasDeprecatedOperator(line) {
        const deprecatedOperators = [
            '.catch(', '.do(', '.finally(', '.flatMap('
        ];

        return deprecatedOperators.some(op => line.includes(op));
    }

    static findTypeScriptFiles(srcPath) {
        const files = [];

        const scanDirectory = (dir) => {
            if (!fs.existsSync(dir)) return;

            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory() &&
                    !item.startsWith('.') &&
                    item !== 'node_modules') {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        };

        scanDirectory(srcPath);
        return files;
    }

    // Generate a summary of RxJS usage patterns
    static analyzeRxJSUsage(projectRoot) {
        console.log('\n📊 Analyzing RxJS usage patterns...');
        const srcPath = path.join(projectRoot, 'src');
        const stats = {
            observableImports: 0,
            operatorImports: 0,
            pipeUsages: 0,
            chainOperators: {
                map: 0,
                filter: 0,
                switchMap: 0,
                mergeMap: 0,
                catchError: 0,
                tap: 0,
                take: 0,
                takeUntil: 0
            },
            deprecatedPatterns: {
                toPromise: 0,
                catch: 0,
                do: 0,
                finally: 0
            }
        };

        const files = this.findTypeScriptFiles(srcPath);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');

            // Count imports
            if (/import.*from\s*['"]rxjs['"]/.test(content)) {
                stats.observableImports++;
            }
            if (/import.*from\s*['"]rxjs\/operators['"]/.test(content)) {
                stats.operatorImports++;
            }

            // Count pipe usages
            stats.pipeUsages += (content.match(/\.pipe\(/g) || []).length;

            // Count operators
            Object.keys(stats.chainOperators).forEach(operator => {
                const regex = new RegExp(`${operator}\\s*\\(`, 'g');
                stats.chainOperators[operator] += (content.match(regex) || []).length;
            });

            // Count deprecated patterns
            Object.keys(stats.deprecatedPatterns).forEach(pattern => {
                if (pattern === 'toPromise') {
                    stats.deprecatedPatterns[pattern] += (content.match(/\.toPromise\(\)/g) || []).length;
                } else {
                    const regex = new RegExp(`\\.${pattern}\\(`, 'g');
                    stats.deprecatedPatterns[pattern] += (content.match(regex) || []).length;
                }
            });
        }

        console.log('📈 RxJS Usage Statistics:');
        console.log(`  Files with rxjs imports: ${stats.observableImports}`);
        console.log(`  Files with operator imports: ${stats.operatorImports}`);
        console.log(`  Total pipe() usages: ${stats.pipeUsages}`);
        console.log('  Operator usage:');
        Object.entries(stats.chainOperators).forEach(([op, count]) => {
            if (count > 0) console.log(`    ${op}: ${count}`);
        });

        const hasDeprecated = Object.values(stats.deprecatedPatterns).some(count => count > 0);
        if (hasDeprecated) {
            console.log('  ⚠️  Deprecated patterns found:');
            Object.entries(stats.deprecatedPatterns).forEach(([pattern, count]) => {
                if (count > 0) console.log(`    ${pattern}: ${count}`);
            });
        } else {
            console.log('  ✅ No deprecated patterns found');
        }

        return stats;
    }
}

// Main execution
const migrator = new RxJSTargetedMigrator();
migrator.migrate()
    .then(() => {
        // Run post-migration validation
        const issues = RxJSMigrationUtils.validateObservableChains(migrator.projectRoot);
        const stats = RxJSMigrationUtils.analyzeRxJSUsage(migrator.projectRoot);

        console.log('\n🎯 Migration Summary:');
        console.log(`✅ Fixed ${migrator.successCount} RxJS issues`);
        console.log(`📁 Modified ${migrator.fixedFiles.length} files`);
        console.log(`⚠️  ${issues.length} potential issues need review`);

        if (issues.length === 0 && Object.values(stats.deprecatedPatterns).every(count => count === 0)) {
            console.log('\n🚀 RxJS migration appears successful!');
            console.log('Next step: ng update @angular/core@13 --allow-dirty --force');
        } else {
            console.log('\n📋 Please review the issues above before proceeding to Angular 13');
        }
    })
    .catch(error => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
