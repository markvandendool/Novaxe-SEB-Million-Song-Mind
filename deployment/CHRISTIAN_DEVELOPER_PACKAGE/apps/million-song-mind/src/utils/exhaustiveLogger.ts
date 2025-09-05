/**
 * EXHAUSTIVE DEBUG LOGGER - TRACE EVERY ELECTRON PULSE
 * TOTAL SURVEILLANCE MODE - NOTHING ESCAPES
 * Created: August 21, 2025
 */

export interface LogEntry {
    timestamp: string;
    level: 'MOUSE' | 'CLICK' | 'STATE' | 'FUNCTION' | 'MAPPING' | 'RENDER' | 'ERROR' | 'SELECTION';
    component: string;
    action: string;
    data: any;
    stackTrace?: string;
    coords?: { x: number, y: number };
    target?: string;
}

class ExhaustiveLogger {
    private logs: LogEntry[] = [];
    private startTime = Date.now();

    private getTimestamp(): string {
        const now = Date.now();
        const elapsed = now - this.startTime;
        return `[${new Date(now).toISOString()}] +${elapsed}ms`;
    }

    private addLog(level: LogEntry['level'], component: string, action: string, data?: any, coords?: { x: number, y: number }, target?: string) {
        const entry: LogEntry = {
            timestamp: this.getTimestamp(),
            level,
            component,
            action,
            data: data ? JSON.parse(JSON.stringify(data)) : null,
            stackTrace: level === 'ERROR' ? new Error().stack : undefined,
            coords,
            target
        };

        this.logs.push(entry);

        // Console output with extreme detail
        const colors = {
            'MOUSE': '🖱️',
            'CLICK': '👆',
            'STATE': '🔄',
            'FUNCTION': '⚙️',
            'MAPPING': '🗺️',
            'RENDER': '🎨',
            'ERROR': '💥',
            'SELECTION': '🎯'
        };

        console.log(
            `%c${colors[level]} ${entry.timestamp} [${component}] ${action}${coords ? ` @(${coords.x},${coords.y})` : ''}${target ? ` TARGET:${target}` : ''}`,
            `color: ${this.getColor(level)}; font-weight: bold;`,
            data || ''
        );

        // Store in window for easy access
        if (typeof window !== 'undefined') {
            if (!window.exhaustiveDebugLogs) window.exhaustiveDebugLogs = [];
            window.exhaustiveDebugLogs.push(entry);
        }
    }

    private getColor(level: LogEntry['level']): string {
        switch (level) {
            case 'MOUSE': return '#666';
            case 'CLICK': return '#00ff00';
            case 'STATE': return '#0088ff';
            case 'FUNCTION': return '#ff8800';
            case 'MAPPING': return '#ff0088';
            case 'RENDER': return '#8800ff';
            case 'ERROR': return '#ff0000';
            case 'SELECTION': return '#ffff00';
            default: return '#000';
        }
    }

    // Public logging methods with mouse coordinates
    mouse(component: string, action: string, data?: any, event?: MouseEvent) {
        const coords = event ? { x: event.clientX, y: event.clientY } : undefined;
        const target = event?.target ? (event.target as Element).tagName + ((event.target as Element).className ? '.' + (event.target as Element).className : '') : undefined;
        this.addLog('MOUSE', component, action, data, coords, target);
    }

    click(component: string, action: string, data?: any, event?: MouseEvent) {
        const coords = event ? { x: event.clientX, y: event.clientY } : undefined;
        const target = event?.target ? (event.target as Element).tagName + ((event.target as Element).className ? '.' + (event.target as Element).className : '') : undefined;
        this.addLog('CLICK', component, action, data, coords, target);
    }

    state(component: string, action: string, data?: any) {
        this.addLog('STATE', component, action, data);
    }

    func(component: string, action: string, data?: any) {
        this.addLog('FUNCTION', component, action, data);
    }

    mapping(component: string, action: string, data?: any) {
        this.addLog('MAPPING', component, action, data);
    }

    render(component: string, action: string, data?: any) {
        this.addLog('RENDER', component, action, data);
    }

    error(component: string, action: string, data?: any) {
        this.addLog('ERROR', component, action, data);
    }

    selection(component: string, action: string, data?: any) {
        this.addLog('SELECTION', component, action, data);
    }

    // Get all logs for analysis
    getFullLog(): LogEntry[] {
        return [...this.logs];
    }

    // Export to readable format
    exportLog(): string {
        return this.logs
            .map(entry => {
                const coord = entry.coords ? `@(${entry.coords.x},${entry.coords.y})` : '';
                const target = entry.target ? ` TARGET:${entry.target}` : '';
                return `${entry.timestamp} [${entry.level}] [${entry.component}] ${entry.action}${coord}${target}\n${entry.data ? 'DATA: ' + JSON.stringify(entry.data, null, 2) : ''}`;
            })
            .join('\n\n');
    }

    clear() {
        this.logs = [];
        this.startTime = Date.now();
        if (typeof window !== 'undefined') {
            window.exhaustiveDebugLogs = [];
        }
        console.clear();
        console.log('🔥🔥🔥 EXHAUSTIVE DEBUG LOGGER ARMED - TOTAL SURVEILLANCE MODE ACTIVE 🔥🔥🔥');
    }
}

export const exhaustiveLogger = new ExhaustiveLogger();

// Global access for debugging
declare global {
    interface Window {
        exhaustiveDebugLogs: LogEntry[];
        exhaustiveLogger: ExhaustiveLogger;
    }
}

if (typeof window !== 'undefined') {
    window.exhaustiveLogger = exhaustiveLogger;
    window.exhaustiveDebugLogs = [];

    // Add global log checker function
    (window as any).checkLog = () => {
        console.log('='.repeat(80));
        console.log('🔥🔥🔥 EXHAUSTIVE DEBUG LOG ANALYSIS 🔥🔥🔥');
        console.log('='.repeat(80));

        const logs = exhaustiveLogger.getFullLog();
        console.log(`Total log entries: ${logs.length}`);

        // Group by level
        const byLevel = logs.reduce((acc, log) => {
            if (!acc[log.level]) acc[log.level] = [];
            acc[log.level].push(log);
            return acc;
        }, {} as Record<string, LogEntry[]>);

        Object.keys(byLevel).forEach(level => {
            console.log(`${level}: ${byLevel[level].length} entries`);
        });

        // Show recent clicks and selections
        const recentClicks = logs.filter(log => log.level === 'CLICK').slice(-10);
        const recentSelections = logs.filter(log => log.level === 'SELECTION').slice(-10);
        const recentMappings = logs.filter(log => log.level === 'MAPPING').slice(-10);

        console.log('\n🖱️ RECENT CLICKS:');
        recentClicks.forEach(log => {
            console.log(`  ${log.timestamp} [${log.component}] ${log.action}`, log.data);
        });

        console.log('\n🎯 RECENT SELECTIONS:');
        recentSelections.forEach(log => {
            console.log(`  ${log.timestamp} [${log.component}] ${log.action}`, log.data);
        });

        console.log('\n🗺️ RECENT MAPPINGS:');
        recentMappings.forEach(log => {
            console.log(`  ${log.timestamp} [${log.component}] ${log.action}`, log.data);
        });

        console.log('\n📊 FULL LOG EXPORT:');
        console.log(exhaustiveLogger.exportLog());

        return logs;
    };
}
