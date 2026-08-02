import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
    
    // Auto-reload on Vite dynamic import failure - ONLY ONCE
    if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
      const hasReloaded = sessionStorage.getItem('hasReloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('hasReloaded', 'true');
        window.location.reload();
        return;
      }
    }
    
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6 text-left overflow-auto">
          <div className="max-w-4xl p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full">
            <h2 className="text-xl font-bold font-heading text-red-400 mb-2">Something went wrong</h2>
            <div className="text-red-400 mb-4 text-xs font-mono whitespace-pre-wrap">
              {this.state.error?.toString()}
            </div>
            <div className="text-slate-400 mb-4 text-[10px] font-mono whitespace-pre-wrap">
              {this.state.error?.stack}
            </div>
            <div className="text-slate-500 mb-4 text-[10px] font-mono whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </div>
            <button
              onClick={() => { sessionStorage.removeItem('hasReloaded'); window.location.reload(); }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-50 cursor-pointer text-white font-medium text-sm transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
