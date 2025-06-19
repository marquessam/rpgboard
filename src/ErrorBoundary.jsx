// src/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              ⚠️ Something went wrong
            </h1>
            <div className="bg-slate-800 border border-red-500 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-semibold mb-2">Error Details:</h2>
              <pre className="text-sm text-red-300 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>
            
            {this.state.errorInfo && (
              <div className="bg-slate-800 border border-yellow-500 rounded-lg p-4 mb-4">
                <h2 className="text-lg font-semibold mb-2">Component Stack:</h2>
                <pre className="text-sm text-yellow-300 whitespace-pre-wrap overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
            >
              Reload Page
            </button>
            
            <div className="mt-6 text-sm text-slate-400">
              <p><strong>Troubleshooting tips:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check the browser console for more details</li>
                <li>Try refreshing the page</li>
                <li>If using database features, ensure Netlify Functions are running</li>
                <li>For local development, run: <code className="bg-slate-700 px-1 rounded">netlify dev</code></li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
