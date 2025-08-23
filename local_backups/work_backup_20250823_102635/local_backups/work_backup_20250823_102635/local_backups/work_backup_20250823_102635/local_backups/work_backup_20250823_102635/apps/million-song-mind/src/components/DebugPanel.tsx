import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  type: 'success' | 'error' | 'warning' | 'info';
  filename?: string;
  format?: string;
  rowCount?: number;
  skippedRows?: number;
  message: string;
  details?: string;
  headers?: string[];
}

interface DebugPanelProps {
  logs: DebugLog[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ logs, isOpen, onClose, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('formatted');

  if (!isOpen) return null;

  const copyToClipboard = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}\n${log.details || ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[80vh] z-50">
      <Card className="bg-background/95 backdrop-blur-sm border-border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm  text-foreground">
              DEBUG PANEL
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'formatted' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('formatted')}
                  className="text-xs"
                >
                  Formatted
                </Button>
                <Button
                  variant={viewMode === 'json' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('json')}
                  className="text-xs"
                >
                  JSON
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-xs">
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={onClear} className="text-xs">
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No debug logs yet
                </div>
              ) : viewMode === 'formatted' ? (
                logs.map((log, index) => (
                  <div key={index} className="p-2 rounded border border-border/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className={getTypeColor(log.type)}>
                        {log.type.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground  text-[10px]">
                        {log.timestamp}
                      </span>
                    </div>
                    
                    {log.filename && (
                      <div className="text-foreground">
                        <strong>File:</strong> {log.filename}
                      </div>
                    )}
                    
                    {log.format && (
                      <div className="text-foreground">
                        <strong>Format:</strong> {log.format}
                      </div>
                    )}
                    
                    {log.rowCount !== undefined && (
                      <div className="text-foreground">
                        <strong>Rows:</strong> {log.rowCount} 
                        {log.skippedRows !== undefined && ` (${log.skippedRows} skipped)`}
                      </div>
                    )}
                    
                    <div className="text-foreground">{log.message}</div>
                    
                    {log.details && (
                      <div className="text-muted-foreground bg-muted/50 p-1 rounded text-[10px] ">
                        {log.details}
                      </div>
                    )}
                    
                    {log.headers && (
                      <div className="text-muted-foreground">
                        <strong>Headers:</strong> {log.headers.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <pre className="text-[10px]  text-foreground bg-muted/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(logs, null, 2)}
                </pre>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Debug logging utility
export class DebugLogger {
  private logs: DebugLog[] = [];
  private listeners: ((logs: DebugLog[]) => void)[] = [];
  private batching = false;
  private queue: DebugLog[] = [];

  log(type: DebugLog['type'], message: string, details?: Partial<DebugLog>) {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      ...details
    };
    
    this.logs.push(log);
    this.notifyListeners();
    
    // Also log to console for development
    console[type === 'error' ? 'error' : 'log'](`[${log.timestamp}] ${message}`, details);

    // Fire-and-forget POST to local dev logger (Vite middleware) to persist to .logs/app.log
    try {
      // Batch small bursts to reduce network noise
      this.queue.push(log);
      if (!this.batching) {
        this.batching = true;
        setTimeout(() => {
          const payload = this.queue.splice(0, this.queue.length).map(l => JSON.stringify(l)).join('\n');
          fetch('/__log', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
          this.batching = false;
        }, 100);
      }
    } catch {}
  }

  success(message: string, details?: Partial<DebugLog>) {
    this.log('success', message, details);
  }

  error(message: string, details?: Partial<DebugLog>) {
    this.log('error', message, details);
  }

  warning(message: string, details?: Partial<DebugLog>) {
    this.log('warning', message, details);
  }

  info(message: string, details?: Partial<DebugLog>) {
    this.log('info', message, details);
  }

  clear() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(callback: (logs: DebugLog[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getLogs() {
    return [...this.logs];
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }
}

export const debugLogger = new DebugLogger();