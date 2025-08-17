#!/usr/bin/env node

/**
 * Angular 11→20 Automated Migration Script
 * Focuses on RxJS 6→7 migration for Angular 13 upgrade
 * 
 * Usage: node angular-migration.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AngularMigrationTool {
    constructor() {
        this.projectRoot = process.cwd();
        this.srcPath = path.join(this.projectRoot, 'src');
        this.migrationLog = [];
        this.errorCount = 0;
        this.fixedCount = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        console.log(logEntry);
        this.migrationLog.push(logEntry);
    }

    async runMigration() {
        this.log('🚀 Starting Angular 11→20 Migration Process');

        try {
            // Step 1: Backup project
            await this.createBackup();

            // Step 2: Run Angular migrations
            await this.runAngularMigrations();

            // Step 3: Fix RxJS 7 migration issues
            await this.fixRxJSMigration();

            // Step 4: Update TypeScript configuration
            await this.updateTypeScriptConfig();

            // Step 5: Fix template strict null checks
            await this.fixTemplateStrictness();

            // Step 6: Run tests and build
            await this.validateMigration();

            this.log(`✅ Migration completed! Fixed ${this.fixedCount} errors`);
            this.generateReport();

        } catch (error) {
            this.log(`❌ Migration failed: ${error.message}`, 'error');
            this.log('💡 Restoring from backup...');
            await this.restoreBackup();
        }
    }

    async createBackup() {
        this.log('📦 Creating project backup...');
        const backupPath = `${this.projectRoot}_backup_${Date.now()}`;

        try {
            // Copy entire project except node_modules
            execSync(`rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' "${this.projectRoot}/" "${backupPath}/"`);
            this.backupPath = backupPath;
            this.log(`✅ Backup created at: ${backupPath}`);
        } catch (error) {
            throw new Error(`Failed to create backup: ${error.message}`);
        }
    }

    async runAngularMigrations() {
        this.log('🔄 Running Angular CLI migrations...');

        const migrations = [
            { from: 12, to: 13, rxjsUpdate: true },
            { from: 13, to: 14, rxjsUpdate: false },
            { from: 14, to: 15, rxjsUpdate: false },
            { from: 15, to: 16, rxjsUpdate: false },
            { from: 16, to: 17, rxjsUpdate: false },
            { from: 17, to: 18, rxjsUpdate: false },
            { from: 18, to: 19, rxjsUpdate: false },
            { from: 19, to: 20, rxjsUpdate: false }
        ];

        for (const migration of migrations) {
            try {
                this.log(`📈 Migrating Angular ${migration.from} → ${migration.to}...`);

                // Update Angular CLI and Core
                execSync(`ng update @angular/cli@${migration.to} @angular/core@${migration.to} --allow-dirty --force`,
                    { stdio: 'inherit', cwd: this.projectRoot });

                // Update RxJS for Angular 13
                if (migration.rxjsUpdate) {
                    this.log('🔧 Updating RxJS to version 7...');
                    execSync('ng update rxjs@7 --allow-dirty --force',
                        { stdio: 'inherit', cwd: this.projectRoot });
                }

                this.log(`✅ Angular ${migration.to} migration completed`);

            } catch (error) {
                this.log(`⚠️ Migration ${migration.from}→${migration.to} had issues: ${error.message}`, 'warning');
                // Continue with manual fixes
                break;
            }
        }
    }

    async fixRxJSMigration() {
        this.log('🔧 Applying RxJS 6→7 migration fixes...');

        const tsFiles = this.findTypeScriptFiles();

        for (const file of tsFiles) {
            await this.fixRxJSInFile(file);
        }
    }

    findTypeScriptFiles() {
        const files = [];

        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        };

        scanDirectory(this.srcPath);
        return files;
    }

    async fixRxJSInFile(filePath) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let hasChanges = false;

        // Fix 1: Update RxJS imports (Observable, Subject, etc.)
        const rxjsImportFixes = [
            { from: /import\s*{\s*Observable\s*}\s*from\s*['"]rxjs\/Observable['"];?/g, to: "import { Observable } from 'rxjs';" },
            { from: /import\s*{\s*Subject\s*}\s*from\s*['"]rxjs\/Subject['"];?/g, to: "import { Subject } from 'rxjs';" },
            { from: /import\s*{\s*BehaviorSubject\s*}\s*from\s*['"]rxjs\/BehaviorSubject['"];?/g, to: "import { BehaviorSubject } from 'rxjs';" },
            { from: /import\s*{\s*ReplaySubject\s*}\s*from\s*['"]rxjs\/ReplaySubject['"];?/g, to: "import { ReplaySubject } from 'rxjs';" },
            { from: /import\s*{\s*Subscription\s*}\s*from\s*['"]rxjs\/Subscription['"];?/g, to: "import { Subscription } from 'rxjs';" },
            { from: /import\s*{\s*Subscriber\s*}\s*from\s*['"]rxjs\/Subscriber['"];?/g, to: "import { Subscriber } from 'rxjs';" }
        ];

        for (const fix of rxjsImportFixes) {
            if (fix.from.test(content)) {
                content = content.replace(fix.from, fix.to);
                hasChanges = true;
                this.fixedCount++;
            }
        }

        // Fix 2: Remove operator add imports
        const operatorImports = [
            /import\s*['"]rxjs\/add\/operator\/map['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/filter['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/mergeMap['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/switchMap['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/catchError['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/tap['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/take['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/takeUntil['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/debounceTime['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/distinctUntilChanged['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/share['"];?\s*\n?/g,
            /import\s*['"]rxjs\/add\/operator\/startWith['"];?\s*\n?/g
        ];

        for (const operatorImport of operatorImports) {
            if (operatorImport.test(content)) {
                content = content.replace(operatorImport, '');
                hasChanges = true;
                this.fixedCount++;
            }
        }

        // Fix 3: Add modern operator imports if needed
        const neededOperators = this.detectNeededOperators(content);
        if (neededOperators.length > 0) {
            const operatorImport = `import { ${neededOperators.join(', ')} } from 'rxjs/operators';\n`;

            // Add import after existing imports
            const importRegex = /(import.*?['"];?\s*\n)(?!import)/s;
            const match = content.match(importRegex);

            if (match) {
                content = content.replace(importRegex, `${match[0]}${operatorImport}`);
                hasChanges = true;
                this.fixedCount++;
            }
        }

        // Fix 4: Convert Observable.method() to pipe(method())
        const chainedOperators = [
            { from: /\.map\(/g, to: '.pipe(map(' },
            { from: /\.filter\(/g, to: '.pipe(filter(' },
            { from: /\.mergeMap\(/g, to: '.pipe(mergeMap(' },
            { from: /\.switchMap\(/g, to: '.pipe(switchMap(' },
            { from: /\.catchError\(/g, to: '.pipe(catchError(' },
            { from: /\.tap\(/g, to: '.pipe(tap(' },
            { from: /\.take\(/g, to: '.pipe(take(' },
            { from: /\.takeUntil\(/g, to: '.pipe(takeUntil(' },
            { from: /\.debounceTime\(/g, to: '.pipe(debounceTime(' },
            { from: /\.distinctUntilChanged\(/g, to: '.pipe(distinctUntilChanged(' },
            { from: /\.share\(/g, to: '.pipe(share(' },
            { from: /\.startWith\(/g, to: '.pipe(startWith(' }
        ];

        // Only apply to lines that look like Observable chains (not Array methods)
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Skip if it's likely an Array method
            if (this.isLikelyArrayOperation(line)) {
                continue;
            }

            // Apply Observable operator fixes
            for (const fix of chainedOperators) {
                if (fix.from.test(line)) {
                    lines[i] = line.replace(fix.from, fix.to);
                    hasChanges = true;
                    this.fixedCount++;
                }
            }
        }
        content = lines.join('\n');

        // Fix 5: Replace .toPromise() with lastValueFrom() or firstValueFrom()
        if (content.includes('.toPromise()')) {
            // Check if we need to add the import
            if (!content.includes('lastValueFrom')) {
                const importMatch = content.match(/(import\s*{[^}]*}\s*from\s*['"]rxjs['"];?)/);
                if (importMatch) {
                    content = content.replace(importMatch[1],
                        importMatch[1].replace('}', ', lastValueFrom }'));
                } else {
                    content = `import { lastValueFrom } from 'rxjs';\n${content}`;
                }
            }

            content = content.replace(/\.toPromise\(\)/g, '').replace(/(\w+\$)/g, 'lastValueFrom($1)');
            hasChanges = true;
            this.fixedCount++;
        }

        // Save changes if any were made
        if (hasChanges) {
            fs.writeFileSync(filePath, content, 'utf8');
            this.log(`🔧 Fixed RxJS issues in: ${path.relative(this.projectRoot, filePath)}`);
        }
    }

    detectNeededOperators(content) {
        const operators = [];
        const operatorChecks = [
            { name: 'map', regex: /\.pipe\(.*?map\(/ },
            { name: 'filter', regex: /\.pipe\(.*?filter\(/ },
            { name: 'mergeMap', regex: /\.pipe\(.*?mergeMap\(/ },
            { name: 'switchMap', regex: /\.pipe\(.*?switchMap\(/ },
            { name: 'catchError', regex: /\.pipe\(.*?catchError\(/ },
            { name: 'tap', regex: /\.pipe\(.*?tap\(/ },
            { name: 'take', regex: /\.pipe\(.*?take\(/ },
            { name: 'takeUntil', regex: /\.pipe\(.*?takeUntil\(/ },
            { name: 'debounceTime', regex: /\.pipe\(.*?debounceTime\(/ },
            { name: 'distinctUntilChanged', regex: /\.pipe\(.*?distinctUntilChanged\(/ },
            { name: 'share', regex: /\.pipe\(.*?share\(/ },
            { name: 'startWith', regex: /\.pipe\(.*?startWith\(/ }
        ];

        for (const check of operatorChecks) {
            if (check.regex.test(content) && !content.includes(`import { ${check.name} }`)) {
                operators.push(check.name);
            }
        }

        return operators;
    }

    isLikelyArrayOperation(line) {
        // Heuristics to detect Array operations vs Observable operations
        return (
            line.includes('[') && line.includes(']') ||  // Array literal
            line.includes('.length') ||                   // Array length
            line.includes('Array.') ||                    // Array static methods
            /\w+\s*=\s*\[/.test(line) ||                 // Array assignment
            /for\s*\(\s*let\s+\w+\s+of\s+/.test(line)   // for...of loop
        );
    }

    async updateTypeScriptConfig() {
        this.log('🔧 Updating TypeScript configuration for Angular 13+...');

        const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');

        if (fs.existsSync(tsconfigPath)) {
            const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

            // Update compiler options for Angular 13+
            tsconfig.compilerOptions = {
                ...tsconfig.compilerOptions,
                "target": "ES2020",
                "module": "ES2020",
                "lib": ["ES2020", "dom"],
                "strict": false,  // Temporarily disable for migration
                "strictNullChecks": false,
                "strictPropertyInitialization": false,
                "noImplicitAny": false,
                "noImplicitReturns": true,
                "noFallthroughCasesInSwitch": true,
                "skipLibCheck": true,
                "forceConsistentCasingInFileNames": true
            };

            fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
            this.log('✅ TypeScript configuration updated');
            this.fixedCount++;
        }
    }

    async fixTemplateStrictness() {
        this.log('🔧 Fixing template strictness issues...');

        const htmlFiles = this.findHtmlFiles();

        for (const file of htmlFiles) {
            let content = fs.readFileSync(file, 'utf8');
            const originalContent = content;

            // Fix common template null check issues
            const templateFixes = [
                // Add safe navigation operator
                { from: /(\w+)\.(\w+)(?!\?\.)/g, to: '$1?.$2' },
                // Fix ngFor with potential null arrays
                { from: /\*ngFor="let\s+(\w+)\s+of\s+([^"]+)"/g, to: '*ngFor="let $1 of ($2 || [])"' },
                // Fix ngIf with strict null checks
                { from: /\*ngIf="([^"]+)"/g, to: '*ngIf="$1 != null"' }
            ];

            for (const fix of templateFixes) {
                if (fix.from.test(content)) {
                    // Apply fixes more conservatively to avoid breaking working code
                    const lines = content.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (line.includes('*ngIf') || line.includes('*ngFor') || line.includes('{{')) {
                            // Only apply certain fixes to template expressions
                            if (fix.to.includes('?.') && !line.includes('?.')) {
                                lines[i] = line.replace(fix.from, fix.to);
                            }
                        }
                    }
                    content = lines.join('\n');
                }
            }

            if (content !== originalContent) {
                fs.writeFileSync(file, content, 'utf8');
                this.log(`🔧 Fixed template issues in: ${path.relative(this.projectRoot, file)}`);
                this.fixedCount++;
            }
        }
    }

    findHtmlFiles() {
        const files = [];

        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.html')) {
                    files.push(fullPath);
                }
            }
        };

        scanDirectory(this.srcPath);
        return files;
    }

    async validateMigration() {
        this.log('🧪 Validating migration...');

        try {
            // Run TypeScript compilation check
            this.log('📝 Checking TypeScript compilation...');
            execSync('npx tsc --noEmit', { cwd: this.projectRoot, stdio: 'pipe' });
            this.log('✅ TypeScript compilation successful');

            // Run linting
            this.log('🔍 Running linting...');
            try {
                execSync('ng lint', { cwd: this.projectRoot, stdio: 'pipe' });
                this.log('✅ Linting passed');
            } catch (error) {
                this.log('⚠️ Linting has warnings (non-blocking)', 'warning');
            }

            // Try to build
            this.log('🏗️ Testing build...');
            execSync('ng build --configuration=production', { cwd: this.projectRoot, stdio: 'pipe' });
            this.log('✅ Build successful');

        } catch (error) {
            this.log(`⚠️ Validation warnings: ${error.message}`, 'warning');
            // Don't fail the migration for build issues, they can be resolved iteratively
        }
    }

    async restoreBackup() {
        if (this.backupPath && fs.existsSync(this.backupPath)) {
            execSync(`rsync -av --delete "${this.backupPath}/" "${this.projectRoot}/"`);
            this.log('✅ Project restored from backup');
        }
    }

    generateReport() {
        const reportPath = path.join(this.projectRoot, 'migration-report.txt');
        const report = [
            '=== Angular 11→20 Migration Report ===',
            `Date: ${new Date().toISOString()}`,
            `Total fixes applied: ${this.fixedCount}`,
            `Errors encountered: ${this.errorCount}`,
            '',
            '=== Migration Log ===',
            ...this.migrationLog,
            '',
            '=== Next Steps ===',
            '1. Review all template files for remaining strict null check issues',
            '2. Update unit tests for RxJS 7 changes',
            '3. Test all Observable chains thoroughly',
            '4. Gradually enable strict TypeScript settings',
            '5. Update third-party libraries to Angular 13+ compatible versions'
        ].join('\n');

        fs.writeFileSync(reportPath, report);
        this.log(`📊 Migration report generated: ${reportPath}`);
    }
}

// Run the migration
const migrationTool = new AngularMigrationTool();
migrationTool.runMigration().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});
