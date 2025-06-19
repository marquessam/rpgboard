// src/components/UI/DatabaseDebugPanel.jsx - Enhanced with better debugging and setup instructions
import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle, Loader, ChevronDown, ChevronUp, TestTube, Terminal, Cloud, Settings } from 'lucide-react';

const DatabaseDebugPanel = ({ useDatabase }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const { 
    isConnected, 
    isLoading, 
    connectionError, 
    connectionStatus, 
    statusMessage,
    getDatabaseStats,
    testConnection
  } = useDatabase;

  const refreshStats = async () => {
    if (!isConnected || !getDatabaseStats) return;
    
    setRefreshing(true);
    try {
      const newStats = await getDatabaseStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testConnection) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testConnection();
      setTestResult(result);
      
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      refreshStats();
    }
  }, [isConnected]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Loader className="animate-spin text-blue-400" size={16} />;
      case 'connected':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={16} />;
      default:
        return <Database className="text-slate-400" size={16} />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'connected':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  return (
    <div className={`border rounded-lg transition-all duration-200 ${getStatusColor()}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left flex items-center justify-between hover:bg-black/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className="font-medium text-white text-sm flex items-center gap-2">
              Database Status
              <Cloud size={14} className="text-blue-400" />
              <span className="text-xs bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded">
                Netlify Functions
              </span>
            </div>
            <div className="text-xs text-slate-400">{statusMessage}</div>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-700 p-3 space-y-4">
          
          {/* Architecture Info */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-300 flex items-center gap-2">
              <Settings size={14} />
              Architecture
            </div>
            <div className="text-xs text-slate-300 bg-slate-800 p-2 rounded">
              <div className="mb-1">🌐 <strong>Client</strong> → HTTP requests → <strong>Netlify Function</strong> → <strong>Neon Database</strong></div>
              <div className="text-slate-400">This architecture keeps your database secure by preventing direct browser access.</div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TestTube size={14} />
                Connection Test
              </div>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 px-3 py-1 rounded text-white text-xs transition-colors flex items-center gap-1"
              >
                {testing ? (
                  <>
                    <Loader size={12} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube size={12} />
                    Test Now
                  </>
                )}
              </button>
            </div>
            
            {testResult && (
              <div className={`text-xs p-2 rounded ${
                testResult.success 
                  ? 'bg-green-900/20 text-green-300 border border-green-800' 
                  : 'bg-red-900/20 text-red-300 border border-red-800'
              }`}>
                <div className="font-medium">
                  {testResult.success ? '✅ Connection Test Passed' : '❌ Connection Test Failed'}
                </div>
                <div className="mt-1">{testResult.message}</div>
              </div>
            )}
          </div>

          {/* Connection Details */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">Connection Details</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-400">Status:</div>
              <div className={`font-medium ${
                connectionStatus === 'connected' ? 'text-green-400' :
                connectionStatus === 'error' ? 'text-red-400' :
                connectionStatus === 'connecting' ? 'text-blue-400' :
                'text-slate-400'
              }`}>
                {connectionStatus}
              </div>
              
              <div className="text-slate-400">Loading:</div>
              <div className="text-white">{isLoading ? 'Yes' : 'No'}</div>
              
              <div className="text-slate-400">Function URL:</div>
              <div className="text-white text-xs">/.netlify/functions/database</div>
              
              <div className="text-slate-400">Environment:</div>
              <div className="text-white">
                {window.location.hostname === 'localhost' ? 'Development' : 'Production'}
              </div>
            </div>
          </div>

          {/* Error Details */}
          {connectionError && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-300">Error Details</div>
              <div className="text-xs text-red-200 bg-red-900/20 p-2 rounded font-mono border border-red-800">
                {connectionError}
              </div>
              
              {/* Troubleshooting */}
              <div className="text-xs text-slate-300">
                <div className="font-medium mb-1">Troubleshooting:</div>
                {connectionError.includes('Failed to fetch') ? (
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>If developing locally: Run <code className="bg-slate-800 px-1 rounded">netlify dev</code></li>
                    <li>Check that your Netlify Function deployed successfully</li>
                    <li>Verify function logs in Netlify dashboard</li>
                  </ul>
                ) : connectionError.includes('NETLIFY_DATABASE_URL') ? (
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Run <code className="bg-slate-800 px-1 rounded">netlify db init</code></li>
                    <li>Check environment variables in Netlify dashboard</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Check browser developer console for details</li>
                    <li>Verify Netlify Function logs</li>
                    <li>Test the function URL directly</li>
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Database Stats */}
          {isConnected && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-300">Database Statistics</div>
                <button
                  onClick={refreshStats}
                  disabled={refreshing}
                  className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                  <span className="text-xs">Refresh</span>
                </button>
              </div>
              
              {stats ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-400">Characters:</div>
                  <div className="text-white">{stats.characters}</div>
                  
                  <div className="text-slate-400">Images:</div>
                  <div className="text-white">{stats.images}</div>
                  
                  <div className="text-slate-400">Chat Messages:</div>
                  <div className="text-white">{stats.chatMessages}</div>
                  
                  <div className="text-slate-400">Combat Messages:</div>
                  <div className="text-white">{stats.combatMessages}</div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">No statistics available</div>
              )}
            </div>
          )}

          {/* Setup Instructions */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-yellow-300 flex items-center gap-2">
              <Terminal size={14} />
              Setup Instructions
            </div>
            
            {window.location.hostname === 'localhost' ? (
              <div className="text-xs text-slate-300 space-y-2">
                <div className="font-medium">For Local Development:</div>
                <div className="bg-slate-800 p-2 rounded font-mono">
                  <div># 1. Initialize database</div>
                  <div>netlify db init</div>
                  <div className="mt-1"># 2. Start dev server</div>
                  <div>netlify dev</div>
                </div>
                <div className="text-slate-400">
                  Make sure you're using <code>netlify dev</code> instead of <code>npm run dev</code> 
                  to enable Netlify Functions locally.
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-300 space-y-2">
                <div className="font-medium">For Production:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Database should be configured in Netlify dashboard</li>
                  <li>Environment variables should be set automatically</li>
                  <li>Function should deploy with your site</li>
                </ul>
              </div>
            )}
          </div>

          {/* Current Mode */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">Current Storage Mode</div>
            <div className="text-xs">
              {isConnected ? (
                <div className="text-green-300 flex items-center gap-2">
                  <Cloud size={14} />
                  ☁️ Cloud Database - Data saved to Neon PostgreSQL via Netlify Functions
                </div>
              ) : (
                <div className="text-yellow-300 flex items-center gap-2">
                  <Database size={14} />
                  💾 Local Storage - Data saved to browser (temporary)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDebugPanel;
