// src/components/UI/DatabaseDebugPanel.jsx - Debug component for database status
import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react';

const DatabaseDebugPanel = ({ useDatabase }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    isConnected, 
    isLoading, 
    connectionError, 
    connectionStatus, 
    statusMessage,
    getDatabaseStats 
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
            <div className="font-medium text-white text-sm">Database Status</div>
            <div className="text-xs text-slate-400">{statusMessage}</div>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-700 p-3 space-y-3">
          
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
              
              <div className="text-slate-400">Environment:</div>
              <div className="text-white">{typeof window !== 'undefined' ? 'Browser' : 'Server'}</div>
            </div>
          </div>

          {/* Error Details */}
          {connectionError && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-300">Error Details</div>
              <div className="text-xs text-red-200 bg-red-900/20 p-2 rounded font-mono">
                {connectionError}
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
                  className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
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
          {connectionStatus === 'error' || connectionStatus === 'disconnected' ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-yellow-300">Setup Instructions</div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>To enable cloud database storage:</div>
                <div className="font-mono bg-slate-800 p-2 rounded">
                  npx netlify db init
                </div>
                <div>Or set up environment variables manually:</div>
                <div className="font-mono bg-slate-800 p-2 rounded text-xs">
                  NETLIFY_DATABASE_URL=your_connection_string
                </div>
              </div>
            </div>
          ) : null}

          {/* Current Mode */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">Current Storage Mode</div>
            <div className="text-xs">
              {isConnected ? (
                <div className="text-green-300">☁️ Cloud Database - Images and data saved to Neon PostgreSQL</div>
              ) : (
                <div className="text-yellow-300">💾 Local Storage - Images and data saved to browser localStorage</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDebugPanel;
