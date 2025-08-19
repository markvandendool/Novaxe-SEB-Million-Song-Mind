/**
 * COMPREHENSIVE DIAGNOSTIC LOGGER
 * Phase 2A Integration Testing - Extensive Logging & Error Cataloging
 * Cross-referenced with Angular v11-v20 Official Documentation
 */

export interface DiagnosticLogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: 'COMPONENT' | 'BRIDGE' | 'FONT' | 'ANGULAR_MIGRATION' | 'PATTERN' | 'PERFORMANCE';
  message: string;
  context?: Record<string, any>;
  angularDocReference?: string;
  errorPattern?: string;
  stackTrace?: string;
  componentState?: Record<string, any>;
  performanceMetrics?: {
    executionTime: number;
    memoryUsage: number;
    renderTime?: number;
  };
}

export interface ErrorPattern {
  id: string;
  pattern: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  angularEquivalent?: string;
  possibleCause: string;
  resolution?: string;
}

export interface AngularDocReference {
  version: string;
  url: string;
  section: string;
  description: string;
  relevantAPIs: string[];
}

class ComprehensiveDiagnosticLogger {
  private logs: DiagnosticLogEntry[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private angularDocReferences: AngularDocReference[] = [];
  private performanceBaseline: Map<string, number> = new Map();

  constructor() {
    this.initializeAngularDocReferences();
    this.setupPerformanceBaselines();
  }

  /**
   * Initialize Angular documentation references for cross-validation
   * Based on official Angular v11-v20 documentation
   */
  private initializeAngularDocReferences(): void {
    this.angularDocReferences = [
      {
        version: 'v11',
        url: 'https://v11.angular.io/api/core/Component',
        section: 'Component Lifecycle',
        description: 'Component initialization, change detection, and destruction lifecycle hooks',
        relevantAPIs: ['OnInit', 'OnDestroy', 'OnChanges', 'AfterViewInit']
      },
      {
        version: 'v11',
        url: 'https://v11.angular.io/api/core/EventEmitter',
        section: 'Event Handling',
        description: 'Custom event emission and handling mechanisms',
        relevantAPIs: ['EventEmitter', 'Output', 'emit']
      },
      {
        version: 'v11',
        url: 'https://v11.angular.io/guide/template-syntax',
        section: 'Template Binding',
        description: 'Property binding, event binding, and two-way data binding',
        relevantAPIs: ['ngModel', 'property binding', 'event binding']
      },
      {
        version: 'v11',
        url: 'https://v11.angular.io/api/core/ElementRef',
        section: 'DOM Manipulation',
        description: 'Direct DOM access and manipulation in Angular components',
        relevantAPIs: ['ElementRef', 'nativeElement', 'ViewChild']
      },
      {
        version: 'v11',
        url: 'https://v11.angular.io/guide/dependency-injection',
        section: 'Service Injection',
        description: 'Dependency injection and service management',
        relevantAPIs: ['Injectable', 'Provider', 'Injector']
      }
    ];
  }

  /**
   * Set up performance baselines for comparison
   */
  private setupPerformanceBaselines(): void {
    this.performanceBaseline.set('component_init', 16.67); // 60fps baseline
    this.performanceBaseline.set('bridge_communication', 5); // 5ms baseline
    this.performanceBaseline.set('font_render', 10); // 10ms baseline
    this.performanceBaseline.set('state_update', 8); // 8ms baseline
  }

  /**
   * Log diagnostic entry with comprehensive context
   */
  public log(entry: Omit<DiagnosticLogEntry, 'timestamp'>): void {
    const logEntry: DiagnosticLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);

    // Pattern recognition for errors
    if (entry.level === 'ERROR' || entry.level === 'CRITICAL') {
      this.analyzeErrorPattern(logEntry);
    }

    // Performance monitoring
    if (logEntry.performanceMetrics) {
      this.analyzePerformanceMetrics(logEntry);
    }

    // Console output with detailed formatting
    this.outputToConsole(logEntry);
  }

  /**
   * Analyze error patterns and update pattern database
   */
  private analyzeErrorPattern(entry: DiagnosticLogEntry): void {
    const patternKey = this.extractErrorPattern(entry.message);

    if (this.errorPatterns.has(patternKey)) {
      const pattern = this.errorPatterns.get(patternKey)!;
      pattern.occurrences++;
      pattern.lastSeen = entry.timestamp;
    } else {
      const newPattern: ErrorPattern = {
        id: `ERR_${Date.now()}`,
        pattern: patternKey,
        occurrences: 1,
        firstSeen: entry.timestamp,
        lastSeen: entry.timestamp,
        category: entry.category,
        severity: entry.level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        possibleCause: this.inferCause(entry),
        angularEquivalent: this.findAngularEquivalent(entry)
      };
      this.errorPatterns.set(patternKey, newPattern);
    }
  }

  /**
   * Extract error pattern from message
   */
  private extractErrorPattern(message: string): string {
    // Remove specific identifiers and values to create pattern
    return message
      .replace(/\d+/g, '[NUMBER]')
      .replace(/["']([^"']+)["']/g, '[STRING]')
      .replace(/\b[A-Z][a-zA-Z0-9]*\b/g, '[IDENTIFIER]')
      .trim();
  }

  /**
   * Infer possible cause based on error context
   */
  private inferCause(entry: DiagnosticLogEntry): string {
    if (entry.category === 'ANGULAR_MIGRATION') {
      return 'Angular-to-React migration compatibility issue';
    }
    if (entry.category === 'BRIDGE') {
      return 'PostMessage bridge communication failure';
    }
    if (entry.category === 'FONT') {
      return 'nvxFont loading or character mapping issue';
    }
    if (entry.category === 'COMPONENT') {
      return 'React component state or lifecycle issue';
    }
    return 'Unknown cause - requires investigation';
  }

  /**
   * Find Angular equivalent behavior for comparison
   */
  private findAngularEquivalent(entry: DiagnosticLogEntry): string | undefined {
    const angularPatterns = [
      { pattern: /component.*init/i, equivalent: 'Angular OnInit lifecycle hook' },
      { pattern: /event.*emit/i, equivalent: 'Angular EventEmitter.emit()' },
      { pattern: /property.*bind/i, equivalent: 'Angular property binding [property]' },
      { pattern: /service.*inject/i, equivalent: 'Angular dependency injection' },
      { pattern: /dom.*access/i, equivalent: 'Angular ElementRef.nativeElement' }
    ];

    for (const { pattern, equivalent } of angularPatterns) {
      if (pattern.test(entry.message)) {
        return equivalent;
      }
    }
    return undefined;
  }

  /**
   * Analyze performance metrics against baselines
   */
  private analyzePerformanceMetrics(entry: DiagnosticLogEntry): void {
    if (!entry.performanceMetrics) return;

    const { executionTime, memoryUsage, renderTime } = entry.performanceMetrics;

    // Check against performance baselines
    const operations = [
      { name: 'execution', value: executionTime, baseline: 'component_init' },
      { name: 'render', value: renderTime, baseline: 'font_render' }
    ];

    operations.forEach(({ name, value, baseline }) => {
      if (value && this.performanceBaseline.has(baseline)) {
        const baselineValue = this.performanceBaseline.get(baseline)!;
        if (value > baselineValue * 2) {
          this.log({
            level: 'WARN',
            category: 'PERFORMANCE',
            message: `Performance degradation detected: ${name} took ${value}ms (baseline: ${baselineValue}ms)`,
            context: { operation: name, actual: value, baseline: baselineValue },
            angularDocReference: 'https://angular.io/guide/change-detection-strategy'
          });
        }
      }
    });
  }

  /**
   * Output formatted log entry to console
   */
  private outputToConsole(entry: DiagnosticLogEntry): void {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      CRITICAL: '\x1b[41m\x1b[37m' // Red background, white text
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level];

    console.log(`${color}[${entry.timestamp}] ${entry.level} [${entry.category}]${reset} ${entry.message}`);

    if (entry.context) {
      console.log(`${color}  Context:${reset}`, entry.context);
    }

    if (entry.angularDocReference) {
      console.log(`${color}  📚 Angular Docs:${reset} ${entry.angularDocReference}`);
    }

    if (entry.performanceMetrics) {
      console.log(`${color}  ⚡ Performance:${reset}`, entry.performanceMetrics);
    }

    if (entry.stackTrace) {
      console.log(`${color}  🔍 Stack:${reset}\n${entry.stackTrace}`);
    }
  }

  /**
   * Get all logs filtered by criteria
   */
  public getLogs(filters?: {
    level?: DiagnosticLogEntry['level'];
    category?: DiagnosticLogEntry['category'];
    since?: string;
  }): DiagnosticLogEntry[] {
    let filteredLogs = this.logs;

    if (filters?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters?.since) {
      const sinceDate = new Date(filters.since);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate);
    }

    return filteredLogs;
  }

  /**
   * Get error patterns summary
   */
  public getErrorPatterns(): ErrorPattern[] {
    return Array.from(this.errorPatterns.values())
      .sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Generate comprehensive diagnostic report
   */
  public generateDiagnosticReport(): {
    summary: {
      totalLogs: number;
      errorCount: number;
      warningCount: number;
      criticalCount: number;
      patterns: number;
    };
    topErrors: ErrorPattern[];
    performanceIssues: DiagnosticLogEntry[];
    angularMigrationIssues: DiagnosticLogEntry[];
    recommendations: string[];
  } {
    const errors = this.getLogs({ level: 'ERROR' });
    const warnings = this.getLogs({ level: 'WARN' });
    const critical = this.getLogs({ level: 'CRITICAL' });
    const migrationIssues = this.getLogs({ category: 'ANGULAR_MIGRATION' });
    const performanceIssues = this.logs.filter(log =>
      log.performanceMetrics &&
      (log.level === 'WARN' || log.level === 'ERROR')
    );

    const recommendations = this.generateRecommendations(errors, warnings, critical);

    return {
      summary: {
        totalLogs: this.logs.length,
        errorCount: errors.length,
        warningCount: warnings.length,
        criticalCount: critical.length,
        patterns: this.errorPatterns.size
      },
      topErrors: this.getErrorPatterns().slice(0, 10),
      performanceIssues,
      angularMigrationIssues: migrationIssues,
      recommendations
    };
  }

  /**
   * Generate recommendations based on error patterns
   */
  private generateRecommendations(
    errors: DiagnosticLogEntry[],
    warnings: DiagnosticLogEntry[],
    critical: DiagnosticLogEntry[]
  ): string[] {
    const recommendations: string[] = [];

    if (critical.length > 0) {
      recommendations.push('🚨 CRITICAL: Address critical errors immediately before proceeding to Phase 2B');
    }

    if (errors.length > 5) {
      recommendations.push('⚠️ High error count detected - review Angular-to-React migration patterns');
    }

    const bridgeErrors = errors.filter(e => e.category === 'BRIDGE');
    if (bridgeErrors.length > 0) {
      recommendations.push('🔗 Bridge communication issues detected - verify PostMessage protocol implementation');
    }

    const fontErrors = errors.filter(e => e.category === 'FONT');
    if (fontErrors.length > 0) {
      recommendations.push('🔤 Font system issues - validate nvxFont loading and character mapping');
    }

    if (this.errorPatterns.size > 3) {
      recommendations.push('📈 Multiple error patterns identified - implement pattern-specific fixes');
    }

    return recommendations;
  }

  /**
   * Clear all logs and reset patterns
   */
  public reset(): void {
    this.logs = [];
    this.errorPatterns.clear();
  }
}

// Global diagnostic logger instance
export const diagnosticLogger = new ComprehensiveDiagnosticLogger();

// Utility functions for common logging scenarios
export const logAngularMigration = (
  message: string,
  context?: Record<string, any>,
  angularDocRef?: string
) => {
  diagnosticLogger.log({
    level: 'INFO',
    category: 'ANGULAR_MIGRATION',
    message,
    context,
    angularDocReference: angularDocRef
  });
};

export const logBridgeOperation = (
  message: string,
  context?: Record<string, any>,
  performanceMetrics?: DiagnosticLogEntry['performanceMetrics']
) => {
  diagnosticLogger.log({
    level: 'DEBUG',
    category: 'BRIDGE',
    message,
    context,
    performanceMetrics
  });
};

export const logComponentError = (
  message: string,
  error: Error,
  componentState?: Record<string, any>
) => {
  diagnosticLogger.log({
    level: 'ERROR',
    category: 'COMPONENT',
    message,
    context: { error: error.message },
    componentState,
    stackTrace: error.stack
  });
};

export const logFontSystem = (
  message: string,
  context?: Record<string, any>,
  level: DiagnosticLogEntry['level'] = 'INFO'
) => {
  diagnosticLogger.log({
    level,
    category: 'FONT',
    message,
    context
  });
};

export const logPerformanceMetrics = (
  operation: string,
  metrics: DiagnosticLogEntry['performanceMetrics']
) => {
  diagnosticLogger.log({
    level: 'DEBUG',
    category: 'PERFORMANCE',
    message: `Performance metrics for ${operation}`,
    performanceMetrics: metrics
  });
};
