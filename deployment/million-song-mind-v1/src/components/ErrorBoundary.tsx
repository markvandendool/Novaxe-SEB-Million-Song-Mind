import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error; info?: React.ErrorInfo };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Global ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-xl w-full border border-border rounded-lg p-6 bg-card shadow-professional">
            <h1 className="text-2xl  font-bold mb-3">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred. Please try reloading the page.</p>
            {this.state.error && (
              <pre className="text-xs overflow-auto max-h-48 p-3 rounded bg-muted mb-4 whitespace-pre-wrap">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <button
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
