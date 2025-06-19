// src/components/UI/SessionManager.jsx - Session management for multiplayer
import React, { useState, useEffect } from 'react';
import { Users, Copy, LogIn, LogOut, Crown, Eye, Wifi, WifiOff } from 'lucide-react';

const SessionManager = ({ 
  realtimeSync,
  onSessionJoined,
  onSessionLeft 
}) => {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [userColorInput, setUserColorInput] = useState('#6366f1');
  const [isDMInput, setIsDMInput] = useState(false);
  const [joiningSession, setJoiningSession] = useState(false);

  const {
    sessionId,
    isConnected,
    connectionError,
    syncStatus,
    userName,
    userColor,
    isDM,
    sessionUsers,
    getCurrentUser,
    getOtherUsers,
    joinSession,
    leaveSession,
    generateSessionId
  } = realtimeSync;

  // Auto-show session modal if not connected
  useEffect(() => {
    if (!isConnected && !showSessionModal) {
      setShowSessionModal(true);
    }
  }, [isConnected, showSessionModal]);

  // Load saved user preferences
  useEffect(() => {
    const savedName = localStorage.getItem('rpg-username');
    const savedColor = localStorage.getItem('rpg-usercolor');
    const savedDM = localStorage.getItem('rpg-isdm') === 'true';
    
    if (savedName) setUserNameInput(savedName);
    if (savedColor) setUserColorInput(savedColor);
    setIsDMInput(savedDM);
  }, []);

  const handleJoinSession = async () => {
    if (!userNameInput.trim()) {
      alert('Please enter your name');
      return;
    }

    setJoiningSession(true);
    
    try {
      // Save preferences
      localStorage.setItem('rpg-username', userNameInput);
      localStorage.setItem('rpg-usercolor', userColorInput);
      localStorage.setItem('rpg-isdm', isDMInput.toString());

      // Use provided session ID or generate new one
      const targetSessionId = sessionIdInput.trim() || generateSessionId();
      
      const success = await joinSession(targetSessionId, userNameInput, userColorInput, isDMInput);
      
      if (success) {
        setShowSessionModal(false);
        if (onSessionJoined) {
          onSessionJoined(targetSessionId, userNameInput);
        }
      } else {
        alert('Failed to join session. Please try again.');
      }
    } catch (error) {
      alert(`Failed to join session: ${error.message}`);
    } finally {
      setJoiningSession(false);
    }
  };

  const handleLeaveSession = async () => {
    if (window.confirm('Are you sure you want to leave this session?')) {
      await leaveSession();
      setShowSessionModal(true);
      if (onSessionLeft) {
        onSessionLeft();
      }
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    // Could add a toast notification here
    alert('Session ID copied to clipboard!');
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'syncing': return 'text-blue-400';
      default: return 'text-red-400';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected':
      case 'syncing':
        return <Wifi size={16} />;
      default:
        return <WifiOff size={16} />;
    }
  };

  // Connected view - show session info and users
  if (isConnected) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users size={20} />
              Multiplayer Session
              {isDM && (
                <Crown size={16} className="text-yellow-400" title="Dungeon Master" />
              )}
            </h3>
            <div className="text-sm text-slate-400 mt-1">
              Session: <span className="font-mono">{sessionId}</span>
              <button
                onClick={copySessionId}
                className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                title="Copy session ID"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="capitalize">{syncStatus}</span>
            </div>
            <button
              onClick={handleLeaveSession}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Current User Info */}
        <div className="mb-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-white"
              style={{ backgroundColor: userColor }}
            />
            <div>
              <div className="font-medium text-white flex items-center gap-2">
                {userName}
                {isDM && <Crown size={14} className="text-yellow-400" />}
              </div>
              <div className="text-xs text-slate-400">
                {isDM ? 'Dungeon Master' : 'Player'}
              </div>
            </div>
          </div>
        </div>

        {/* Other Users */}
        <div>
          <div className="text-sm font-medium text-slate-300 mb-2">
            Other Players ({getOtherUsers().length})
          </div>
          
          {getOtherUsers().length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-4">
              <Users className="mx-auto mb-2 opacity-50" size={24} />
              <p>No other players yet</p>
              <p className="text-xs mt-1">Share the session ID above to invite others</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getOtherUsers().map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 bg-slate-700/30 rounded"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: user.user_color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm flex items-center gap-2">
                      {user.user_name}
                      {user.is_dm && <Crown size={12} className="text-yellow-400" />}
                    </div>
                    <div className="text-xs text-slate-400">
                      {user.is_dm ? 'Dungeon Master' : 'Player'}
                    </div>
                  </div>
                  <div className="text-xs text-green-400">
                    Online
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {connectionError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm">
            <div className="font-medium">Connection Error</div>
            <div>{connectionError}</div>
          </div>
        )}

        {/* Instructions for sharing */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
          <div className="text-blue-300 text-sm">
            <div className="font-medium mb-1">🎲 Playing with Friends</div>
            <p className="text-xs text-blue-200">
              Share your session ID with others so they can join your game. 
              Everyone will see the same board in real-time!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Connection modal
  return (
    <>
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Users size={20} />
                Join Multiplayer Session
              </h3>

              <div className="space-y-4">
                {/* User Info */}
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Your Color</label>
                    <input
                      type="color"
                      value={userColorInput}
                      onChange={(e) => setUserColorInput(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-600 bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Role</label>
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={isDMInput}
                        onChange={(e) => setIsDMInput(e.target.checked)}
                        className="rounded"
                      />
                      <label className="text-slate-300 text-sm flex items-center gap-1">
                        <Crown size={14} className="text-yellow-400" />
                        Dungeon Master
                      </label>
                    </div>
                  </div>
                </div>

                {/* Session Options */}
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Session</label>
                  <input
                    type="text"
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                    placeholder="Enter session ID (or leave blank for new session)"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    Leave blank to create a new session, or enter an existing session ID to join
                  </div>
                </div>

                {/* Error Display */}
                {connectionError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm">
                    <div className="font-medium">Connection Error</div>
                    <div>{connectionError}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={handleJoinSession}
                  disabled={joiningSession || !userNameInput.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2"
                >
                  {joiningSession ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      {sessionIdInput.trim() ? 'Join Session' : 'Create Session'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disconnected indicator */}
      {!showSessionModal && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <WifiOff className="text-red-400" size={20} />
            <div>
              <div className="text-red-300 font-medium">Not Connected to Session</div>
              <div className="text-red-200 text-sm">Click below to join a multiplayer session</div>
            </div>
            <button
              onClick={() => setShowSessionModal(true)}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm"
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionManager;
