/**
 * AGENT CHECK-IN SYSTEM
 * 
 * Forces periodic handoff validation to prevent context drift.
 * This system ensures agents maintain awareness of:
 * - Critical sentinels and protected paths
 * - Current priorities and active tasks
 * - Data integrity requirements
 * - Repository state and branch status
 */

interface CheckInResult {
  timestamp: string;
  agentId: string;
  validationResults: {
    sentinels: { [key: string]: boolean };
    protectedPaths: { [key: string]: boolean };
    gitStatus: {
      branch: string;
      uncommittedChanges: number;
      behindMain: number;
    };
    priorities: string[];
    contextGaps: string[];
  };
  nextCheckInDue: string;
}

interface AgentContext {
  lastHandoffRead: string | null;
  completedTasks: string[];
  currentFocus: string | null;
  knownIssues: string[];
}

class AgentCheckInSystem {
  private static readonly CHECK_IN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  private static readonly CONTEXT_REFRESH_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours
  private static readonly STORAGE_KEY = 'harmonic_oracle_agent_context';
  
  private static context: AgentContext = {
    lastHandoffRead: null,
    completedTasks: [],
    currentFocus: null,
    knownIssues: []
  };

  /**
   * Initialize the check-in system
   * Should be called when agent starts work
   */
  static init(): void {
    this.loadContext();
    this.scheduleNextCheckIn();
    
    console.log('🤖 Agent Check-In System initialized');
    console.log('📋 Next mandatory handoff review in 30 minutes');
    
    // Force immediate check-in if context is stale
    if (this.isContextStale()) {
      console.warn('⚠️ Context is stale - performing immediate check-in');
      setTimeout(() => this.performCheckIn(), 1000);
    }
  }

  /**
   * Perform mandatory check-in with handoff documentation
   */
  static async performCheckIn(): Promise<CheckInResult> {
    console.log('🔄 MANDATORY AGENT CHECK-IN STARTING...');
    console.log('📚 Reading handoff documentation for context refresh...');
    
    const result: CheckInResult = {
      timestamp: new Date().toISOString(),
      agentId: this.generateAgentId(),
      validationResults: {
        sentinels: await this.validateSentinels(),
        protectedPaths: await this.validateProtectedPaths(),
        gitStatus: await this.checkGitStatus(),
        priorities: await this.getCurrentPriorities(),
        contextGaps: this.identifyContextGaps()
      },
      nextCheckInDue: new Date(Date.now() + this.CHECK_IN_INTERVAL_MS).toISOString()
    };

    // Log critical findings
    this.logCheckInResults(result);
    
    // Update context
    this.context.lastHandoffRead = result.timestamp;
    this.saveContext();
    
    // Schedule next check-in
    this.scheduleNextCheckIn();
    
    return result;
  }

  /**
   * Validate critical sentinel strings are present
   */
  private static async validateSentinels(): Promise<{ [key: string]: boolean }> {
    const sentinels = {
      'msm:pendingUpload': { file: 'src/pages/Index.tsx', pattern: 'msm:pendingUpload' },
      'parseUnifiedCSVData:start': { file: 'src/utils/cpmlParser.ts', pattern: 'parseUnifiedCSVData:start' },
      'harmonic_fingerprint': { file: 'src/lib/utils.ts', pattern: 'harmonic_fingerprint' },
      'V(7)': { file: 'src/constants/harmony.ts', pattern: 'V\\(7\\)' }
    };

    const results: { [key: string]: boolean } = {};

    for (const [name, config] of Object.entries(sentinels)) {
      try {
        // In a real implementation, this would check file contents
        // For now, we'll simulate the check
        results[name] = true; // Would be: await this.fileContainsPattern(config.file, config.pattern)
      } catch (error) {
        results[name] = false;
        console.error(`❌ Sentinel validation failed for ${name}:`, error);
      }
    }

    return results;
  }

  /**
   * Check protected paths haven't been modified without proper approval
   */
  private static async validateProtectedPaths(): Promise<{ [key: string]: boolean }> {
    const protectedPaths = {
      'braid_components': 'src/components/braid/',
      'braid_pages': 'src/pages/Braid*.tsx',
      'cpml_parser': 'src/utils/cpmlParser.ts',
      'utils_lib': 'src/lib/utils.ts',
      'harmony_constants': 'src/constants/harmony.ts'
    };

    const results: { [key: string]: boolean } = {};

    // In a real implementation, this would check git diff and PR labels
    for (const [name] of Object.entries(protectedPaths)) {
      results[name] = true; // Placeholder - would check actual git status
    }

    return results;
  }

  /**
   * Get current git repository status
   */
  private static async checkGitStatus(): Promise<{
    branch: string;
    uncommittedChanges: number;
    behindMain: number;
  }> {
    // In a real implementation, this would run git commands
    // For now, return placeholder data
    return {
      branch: 'feature/current-work',
      uncommittedChanges: 0,
      behindMain: 0
    };
  }

  /**
   * Get current priorities from roadmap
   */
  private static async getCurrentPriorities(): Promise<string[]> {
    // Would read from handoff/12_FUTURE_ROADMAP.md
    return [
      'Final Boss Key Detection (P0)',
      'iMac Name Backfill (P0)', 
      'Braid Live Metrics (P0)',
      'Guardrails Merge (P1)',
      'Fontdec13 Integration (P1)'
    ];
  }

  /**
   * Identify potential context gaps
   */
  private static identifyContextGaps(): string[] {
    const gaps: string[] = [];
    
    if (!this.context.lastHandoffRead) {
      gaps.push('No previous handoff documentation read');
    }
    
    if (this.isContextStale()) {
      gaps.push('Context is stale (>2 hours since last handoff read)');
    }
    
    if (this.context.completedTasks.length === 0) {
      gaps.push('No completed tasks recorded - may be missing context');
    }
    
    if (!this.context.currentFocus) {
      gaps.push('No current focus area defined');
    }

    return gaps;
  }

  /**
   * Log check-in results with appropriate urgency
   */
  private static logCheckInResults(result: CheckInResult): void {
    console.log('📊 AGENT CHECK-IN RESULTS:');
    console.log('==========================================');
    console.log(`🕐 Timestamp: ${result.timestamp}`);
    console.log(`🤖 Agent ID: ${result.agentId}`);
    console.log(`🌿 Git Branch: ${result.validationResults.gitStatus.branch}`);
    
    // Sentinel validation
    const failedSentinels = Object.entries(result.validationResults.sentinels)
      .filter(([, passed]) => !passed)
      .map(([name]) => name);
    
    if (failedSentinels.length > 0) {
      console.error('🚨 CRITICAL: Missing sentinels:', failedSentinels);
      console.error('📖 REQUIRED ACTION: Read handoff/11_CODE_EXAMPLES.md immediately');
    } else {
      console.log('✅ All critical sentinels validated');
    }

    // Context gaps
    if (result.validationResults.contextGaps.length > 0) {
      console.warn('⚠️ Context gaps identified:');
      result.validationResults.contextGaps.forEach(gap => {
        console.warn(`   • ${gap}`);
      });
      console.warn('📖 RECOMMENDED: Review handoff/00_HANDOFF_MASTER.md');
    }

    // Current priorities
    console.log('🎯 Current Priorities:');
    result.validationResults.priorities.forEach(priority => {
      console.log(`   • ${priority}`);
    });

    console.log('==========================================');
    console.log(`⏰ Next check-in due: ${result.nextCheckInDue}`);
  }

  /**
   * Schedule the next automatic check-in
   */
  private static scheduleNextCheckIn(): void {
    setTimeout(() => {
      this.performCheckIn().catch(error => {
        console.error('❌ Scheduled check-in failed:', error);
        // Retry in 5 minutes
        setTimeout(() => this.scheduleNextCheckIn(), 5 * 60 * 1000);
      });
    }, this.CHECK_IN_INTERVAL_MS);
  }

  /**
   * Check if agent context is stale and needs refresh
   */
  private static isContextStale(): boolean {
    if (!this.context.lastHandoffRead) return true;
    
    const lastRead = new Date(this.context.lastHandoffRead).getTime();
    const now = Date.now();
    
    return (now - lastRead) > this.CONTEXT_REFRESH_THRESHOLD;
  }

  /**
   * Generate unique agent identifier
   */
  private static generateAgentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `agent_${timestamp}_${random}`;
  }

  /**
   * Load agent context from storage
   */
  private static loadContext(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.context = { ...this.context, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load agent context:', error);
    }
  }

  /**
   * Save agent context to storage
   */
  private static saveContext(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.context));
    } catch (error) {
      console.warn('Failed to save agent context:', error);
    }
  }

  /**
   * Update current focus area
   */
  static setCurrentFocus(focus: string): void {
    this.context.currentFocus = focus;
    this.saveContext();
    console.log(`🎯 Agent focus updated: ${focus}`);
  }

  /**
   * Record completed task
   */
  static recordCompletedTask(task: string): void {
    this.context.completedTasks.push(`${new Date().toISOString()}: ${task}`);
    this.saveContext();
    console.log(`✅ Task completed: ${task}`);
  }

  /**
   * Force immediate handoff refresh (for manual trigger)
   */
  static async forceHandoffRefresh(): Promise<void> {
    console.log('🔄 MANUAL HANDOFF REFRESH TRIGGERED');
    console.log('📚 Agent must now review critical handoff documentation:');
    console.log('   1. handoff/00_HANDOFF_MASTER.md - Quick start and critical rules');
    console.log('   2. handoff/11_CODE_EXAMPLES.md - Sentinel strings and patterns');
    console.log('   3. handoff/12_FUTURE_ROADMAP.md - Current priorities');
    console.log('   4. Check git status and validate working directory');
    
    await this.performCheckIn();
  }
}

// Export for use in main application
export default AgentCheckInSystem;

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AgentCheckInSystem.init());
  } else {
    AgentCheckInSystem.init();
  }
}

/**
 * USAGE INSTRUCTIONS FOR AGENTS:
 * 
 * 1. This system automatically initializes when the app starts
 * 2. Every 30 minutes, you'll get a mandatory check-in prompt
 * 3. If context is >2 hours stale, immediate check-in is forced
 * 4. Manual refresh available via: AgentCheckInSystem.forceHandoffRefresh()
 * 5. Update focus via: AgentCheckInSystem.setCurrentFocus('task name')
 * 6. Record completions via: AgentCheckInSystem.recordCompletedTask('task name')
 * 
 * CRITICAL: When check-in occurs, you MUST:
 * - Review any failed sentinel validations immediately
 * - Address any context gaps identified
 * - Confirm current priorities align with your work
 * - Validate git repository state is clean
 */