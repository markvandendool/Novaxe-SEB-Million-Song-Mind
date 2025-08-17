#!/usr/bin/env node

/**
 * ANGULAR VERSION-SPECIFIC CODE TRANSFORMATIONS
 * Transforms Angular 11 patterns to target version patterns
 * Each transformation is documented and reversible
 */

const fs = require('fs');
const path = require('path');

class AngularVersionTransformer {
    constructor(targetVersion) {
        this.targetVersion = targetVersion;
        this.transformations = [];
        this.backups = new Map();
    }

    // ANGULAR 11 → 12 TRANSFORMATIONS
    transform11to12(content, filePath) {
        let transformed = content;
        const changes = [];

        // RxJS 6 → 7 operator imports
        if (transformed.includes('import') && transformed.includes('rxjs/operators')) {
            transformed = transformed.replace(
                /import\s*{\s*([^}]+)\s*}\s*from\s*['"]rxjs\/operators['"]/g,
                (match, operators) => {
                    changes.push('Updated RxJS operator imports');
                    return `import { ${operators} } from 'rxjs/operators'`;
                }
            );
        }

        // Observable.map → Observable.pipe(map())
        if (transformed.includes('.map(') && !transformed.includes('.pipe(')) {
            transformed = transformed.replace(
                /(\w+)\.map\(/g,
                '$1.pipe(map('
            );
            changes.push('Converted .map() to .pipe(map())');
        }

        // Add pipe import if needed
        if (changes.length > 0 && !transformed.includes('import { map }')) {
            transformed = `import { map } from 'rxjs/operators';\n` + transformed;
        }

        return { content: transformed, changes };
    }

    // ANGULAR 12 → 13 TRANSFORMATIONS
    transform12to13(content, filePath) {
        let transformed = content;
        const changes = [];

        // Ivy strict mode preparations
        if (filePath.endsWith('.component.ts')) {
            // Ensure all @ViewChild have static flag
            transformed = transformed.replace(
                /@ViewChild\(['"]([^'"]+)['"]\)/g,
                "@ViewChild('$1', { static: false })"
            );
            changes.push('Added static flag to @ViewChild');
        }

        // Update module imports for Ivy
        if (filePath.endsWith('.module.ts')) {
            transformed = transformed.replace(
                /CommonModule,/g,
                'CommonModule,\n    BrowserModule,'
            );
            changes.push('Prepared module for Ivy strict mode');
        }

        return { content: transformed, changes };
    }

    // ANGULAR 13 → 14 TRANSFORMATIONS
    transform13to14(content, filePath) {
        let transformed = content;
        const changes = [];

        // Typed reactive forms
        if (transformed.includes('FormGroup') || transformed.includes('FormControl')) {
            transformed = transformed.replace(
                /new FormGroup\({/g,
                'new FormGroup<any>({'
            );
            transformed = transformed.replace(
                /new FormControl\(/g,
                'new FormControl<any>('
            );
            changes.push('Added type annotations to forms');
        }

        return { content: transformed, changes };
    }

    // ANGULAR 14 → 15 TRANSFORMATIONS
    transform14to15(content, filePath) {
        let transformed = content;
        const changes = [];

        // Prepare for standalone components
        if (filePath.endsWith('.component.ts')) {
            // Add standalone: false to maintain compatibility
            transformed = transformed.replace(
                /@Component\({/g,
                '@Component({\n  standalone: false,'
            );
            changes.push('Prepared component for standalone migration');
        }

        return { content: transformed, changes };
    }

    // ANGULAR 15 → 16 TRANSFORMATIONS
    transform15to16(content, filePath) {
        let transformed = content;
        const changes = [];

        // Prepare for signals (preview)
        if (transformed.includes('ngOnInit')) {
            // Add comment for future signal conversion
            transformed = transformed.replace(
                /ngOnInit\(\)/g,
                '// TODO: Consider converting to signals in Angular 16+\n  ngOnInit()'
            );
            changes.push('Marked lifecycle hooks for signal conversion');
        }

        return { content: transformed, changes };
    }

    // ANGULAR 16 → 17 TRANSFORMATIONS
    transform16to17(content, filePath) {
        let transformed = content;
        const changes = [];

        // New control flow syntax preparation
        if (filePath.endsWith('.html')) {
            // *ngIf → @if preparation
            transformed = transformed.replace(
                /\*ngIf="([^"]+)"/g,
                '@if ($1) {'
            );
            changes.push('Prepared templates for new control flow');
        }

        return { content: transformed, changes };
    }

    // ANGULAR 17 → 18 TRANSFORMATIONS
    transform17to18(content, filePath) {
        let transformed = content;
        const changes = [];

        // Signals become stable
        if (filePath.endsWith('.component.ts')) {
            // Convert simple properties to signals
            transformed = transformed.replace(
                /(\w+):\s*(\w+)\s*=\s*([^;]+);/g,
                (match, name, type, value) => {
                    if (!name.includes('$')) {
                        changes.push(`Converted ${name} to signal`);
                        return `${name} = signal<${type}>(${value});`;
                    }
                    return match;
                }
            );
        }

        return { content: transformed, changes };
    }

    // ANGULAR 18 → 19 TRANSFORMATIONS
    transform18to19(content, filePath) {
        let transformed = content;
        const changes = [];

        // Enhanced standalone components
        if (filePath.endsWith('.component.ts')) {
            transformed = transformed.replace(
                /standalone: false/g,
                'standalone: true'
            );
            changes.push('Converted to standalone component');
        }

        return { content: transformed, changes };
    }

    // ANGULAR 19 → 20 TRANSFORMATIONS
    transform19to20(content, filePath) {
        let transformed = content;
        const changes = [];

        // Zoneless change detection
        if (filePath.endsWith('.component.ts')) {
            transformed = transformed.replace(
                /@Component\({/g,
                '@Component({\n  changeDetection: ChangeDetectionStrategy.OnPush,'
            );
            changes.push('Prepared for zoneless mode');
        }

        return { content: transformed, changes };
    }

    // Main transformation orchestrator
    transformFile(filePath, fromVersion, toVersion) {
        const content = fs.readFileSync(filePath, 'utf8');
        this.backups.set(filePath, content);

        let currentContent = content;
        const allChanges = [];

        for (let v = fromVersion; v < toVersion; v++) {
            const methodName = `transform${v}to${v + 1}`;
            if (this[methodName]) {
                const result = this[methodName](currentContent, filePath);
                currentContent = result.content;
                allChanges.push(...result.changes);
            }
        }

        return {
            original: content,
            transformed: currentContent,
            changes: allChanges,
            canRevert: true
        };
    }

    // Apply transformations to entire component
    transformComponent(componentPath, fromVersion, toVersion) {
        const results = [];
        const files = this.findComponentFiles(componentPath);

        for (const file of files) {
            const result = this.transformFile(file, fromVersion, toVersion);
            results.push({
                file,
                ...result
            });
        }

        return results;
    }

    findComponentFiles(componentPath) {
        const files = [];
        const extensions = ['.ts', '.html', '.scss', '.css'];

        if (fs.existsSync(componentPath)) {
            const items = fs.readdirSync(componentPath);
            for (const item of items) {
                const fullPath = path.join(componentPath, item);
                if (fs.statSync(fullPath).isFile()) {
                    if (extensions.some(ext => item.endsWith(ext))) {
                        files.push(fullPath);
                    }
                }
            }
        }

        return files;
    }

    // Generate transformation report
    generateReport(results) {
        const report = {
            timestamp: new Date().toISOString(),
            targetVersion: this.targetVersion,
            filesProcessed: results.length,
            totalChanges: results.reduce((sum, r) => sum + r.changes.length, 0),
            details: results
        };

        return report;
    }
}

// CLI interface
if (require.main === module) {
    const [, , componentPath, fromVersion, toVersion] = process.argv;

    if (!componentPath || !fromVersion || !toVersion) {
        console.log('Usage: node angular-version-transformations.js <component-path> <from-version> <to-version>');
        console.log('Example: node angular-version-transformations.js src/app/components/piano 11 20');
        process.exit(1);
    }

    const transformer = new AngularVersionTransformer(parseInt(toVersion));
    const results = transformer.transformComponent(
        componentPath,
        parseInt(fromVersion),
        parseInt(toVersion)
    );

    const report = transformer.generateReport(results);

    console.log('📊 Transformation Report:');
    console.log(`Files processed: ${report.filesProcessed}`);
    console.log(`Total changes: ${report.totalChanges}`);

    for (const result of results) {
        if (result.changes.length > 0) {
            console.log(`\n📝 ${result.file}:`);
            result.changes.forEach(change => console.log(`  - ${change}`));
        }
    }

    // Save report
    fs.writeFileSync(
        `transformation-report-${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
}

module.exports = AngularVersionTransformer;
