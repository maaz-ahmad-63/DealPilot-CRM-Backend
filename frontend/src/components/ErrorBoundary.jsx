import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={32} />
              <h1 className="text-2xl font-bold text-red-900">Oops! Something went wrong</h1>
            </div>

            <div className="mb-6 p-4 bg-red-100 rounded text-red-800 text-sm font-mono overflow-auto max-h-40">
              <p className="font-bold mb-2">Error:</p>
              <p>{this.state.error && this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <>
                  <p className="font-bold mt-2 mb-1">Details:</p>
                  <p className="whitespace-pre-wrap text-xs">{this.state.errorInfo.componentStack}</p>
                </>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={20} />
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
