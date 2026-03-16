import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  resetKey: string;
}

interface PageErrorBoundaryState {
  error: Error | null;
}

export class PageErrorBoundary extends React.Component<
  PageErrorBoundaryProps,
  PageErrorBoundaryState
> {
  state: PageErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Page render failed:', error, info);
  }

  componentDidUpdate(prevProps: PageErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const message = this.state.error.message || 'Unknown page error';
    const isChunkIssue =
      /chunk|import|loading css chunk|loading chunk/i.test(message);

    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-10">
        <Card className="max-w-2xl w-full p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-50 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">This page failed to load</h2>
              <p className="text-sm text-slate-600 mt-2">
                {isChunkIssue
                  ? 'A stale app cache or old lazy-loaded bundle is likely being used. Refreshing the app should fix it.'
                  : 'The page hit a runtime error. Refresh the app, and if it keeps happening the error text below will help trace it.'}
              </p>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 break-words">
                {message}
              </div>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <Button
                  variant="primary"
                  icon={<RefreshCcw className="h-4 w-4" />}
                  onClick={() => window.location.reload()}
                >
                  Refresh App
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => this.setState({ error: null })}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}

export default PageErrorBoundary;
