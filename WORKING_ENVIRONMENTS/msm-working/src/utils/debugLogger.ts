// Debug logging utility for braid mapping
export const debugLogger = {
  getAllLogs: () => {
    if (typeof window === 'undefined') return [];
    
    const allLogs = [
      ...(window.braidMappingLogs || []),
      ...(window.millionSongMindLogs || []),
      ...(window.braidTonalLogs || []),
      ...(window.harmonicChartLogs || [])
    ];
    
    return allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  
  clearLogs: () => {
    if (typeof window === 'undefined') return;
    window.braidMappingLogs = [];
    window.millionSongMindLogs = [];
    window.braidTonalLogs = [];
    window.harmonicChartLogs = [];
  },
  
  exportLogs: () => {
    const logs = debugLogger.getAllLogs();
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`
    ).join('\n');
    
    console.log('=== COMPLETE BRAID MAPPING LOGS ===');
    console.log(logText);
    console.log('=== END LOGS ===');
    
    return logText;
  }
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugLogger = debugLogger;
} 