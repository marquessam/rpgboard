// src/hooks/useRealtimeSync.js - Real-time multiplayer synchronization
import { useState, useEffect, useRef, useCallback } from 'react';
import * as db from '../utils/database.js';

export const useRealtimeSync = (initialSessionId = null) => {
  // Session state
  const [sessionId, setSessionId] = useState(initialSessionId || generateSessionId());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // User state
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('#6366f1');
  const [isDM, setIsDM] = useState(false);
  const [sessionUsers, setSessionUsers] = useState([]);
  
  // Sync state
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toISOString());
  const [syncStatus, setSyncStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'syncing'
  const [incomingUpdates, setIncomingUpdates] = useState([]);
  
  // Refs for intervals and cleanup
  const syncIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const syncInProgress = useRef(false);
  
  // Event handlers for external components
  const [onCharacterUpdate, setOnCharacterUpdate] = useState(null);
  const [onGameStateUpdate, setOnGameStateUpdate] = useState(null);
  const [onUserJoined, setOnUserJoined] = useState(null);
  const [onUserLeft, setOnUserLeft] = useState(null);

  // Generate a random session ID
  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Join a session
  const joinSession = useCallback(async (targetSessionId, name, color, dmMode = false) => {
    try {
      setSyncStatus('connecting');
      setConnectionError(null);
      
      console.log(`🔗 Joining session: ${targetSessionId} as ${name}`);
      
      const success = await db.joinSession(targetSessionId, userId, name, color, dmMode);
      
      if (success) {
        setSessionId(targetSessionId);
        setUserName(name);
        setUserColor(color);
        setIsDM(dmMode);
        setIsConnected(true);
        setSyncStatus('connected');
        setLastSyncTime(new Date().toISOString());
        
        console.log(`✅ Successfully joined session: ${targetSessionId}`);
        return true;
      } else {
        throw new Error('Failed to join session');
      }
    } catch (error) {
      console.error('❌ Failed to join session:', error);
      setConnectionError(error.message);
      setSyncStatus('disconnected');
      setIsConnected(false);
      return false;
    }
  }, [userId]);

  // Leave current session
  const leaveSession = useCallback(async () => {
    try {
      if (isConnected && sessionId) {
        await db.leaveSession(sessionId, userId);
        console.log(`👋 Left session: ${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to leave session:', error);
    } finally {
      setIsConnected(false);
      setSyncStatus('disconnected');
      setSessionUsers([]);
      clearIntervals();
    }
  }, [isConnected, sessionId, userId]);

  // Clear all intervals
  const clearIntervals = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Send heartbeat to keep session alive
  const sendHeartbeat = useCallback(async (cursorX = 0, cursorY = 0) => {
    if (!isConnected || !sessionId) return;
    
    try {
      await db.sendHeartbeat(sessionId, userId, cursorX, cursorY);
    } catch (error) {
      console.error('Heartbeat failed:', error);
      // Don't set error state for heartbeat failures, just log them
    }
  }, [isConnected, sessionId, userId]);

  // Fetch session users
  const fetchSessionUsers = useCallback(async () => {
    if (!isConnected || !sessionId) return;
    
    try {
      const users = await db.getSessionUsers(sessionId);
      setSessionUsers(users);
    } catch (error) {
      console.error('Failed to fetch session users:', error);
    }
  }, [isConnected, sessionId]);

  // Sync updates from other users
  const syncUpdates = useCallback(async () => {
    if (!isConnected || !sessionId || syncInProgress.current) return;
    
    try {
      syncInProgress.current = true;
      setSyncStatus('syncing');
      
      const updates = await db.getSessionUpdates(sessionId, userId, lastSyncTime);
      
      if (updates && updates.length > 0) {
        console.log(`📥 Received ${updates.length} updates from other users`);
        
        // Process updates
        for (const update of updates) {
          console.log('Processing update:', update);
          
          switch (update.update_type) {
            case 'character_updated':
              if (onCharacterUpdate) {
                onCharacterUpdate(update.data, update.updated_by);
              }
              break;
              
            case 'character_deleted':
              if (onCharacterUpdate) {
                onCharacterUpdate({ id: update.data.characterId, _deleted: true }, update.updated_by);
              }
              break;
              
            case 'game_state_updated':
              if (onGameStateUpdate) {
                onGameStateUpdate(update.data, update.updated_by);
              }
              break;
              
            case 'user_joined':
              console.log(`👋 User joined: ${update.data.userName}`);
              if (onUserJoined) {
                onUserJoined(update.data);
              }
              // Refresh user list
              fetchSessionUsers();
              break;
              
            case 'user_left':
              console.log(`👋 User left: ${update.data.userId}`);
              if (onUserLeft) {
                onUserLeft(update.data);
              }
              // Refresh user list
              fetchSessionUsers();
              break;
          }
        }
        
        // Store updates for external access
        setIncomingUpdates(prev => [...prev.slice(-20), ...updates]); // Keep last 20 updates
        
        // Update last sync time to the newest update
        const newestUpdate = updates[updates.length - 1];
        setLastSyncTime(newestUpdate.created_at);
      }
      
      setSyncStatus('connected');
    } catch (error) {
      console.error('Sync failed:', error);
      setConnectionError(error.message);
      setSyncStatus('connected'); // Don't disconnect on sync failure
    } finally {
      syncInProgress.current = false;
    }
  }, [isConnected, sessionId, userId, lastSyncTime, onCharacterUpdate, onGameStateUpdate, onUserJoined, onUserLeft, fetchSessionUsers]);

  // Start real-time sync when connected
  useEffect(() => {
    if (isConnected && sessionId) {
      console.log(`🔄 Starting real-time sync for session: ${sessionId}`);
      
      // Initial fetch of users
      fetchSessionUsers();
      
      // Set up sync interval (every 3 seconds)
      syncIntervalRef.current = setInterval(syncUpdates, 3000);
      
      // Set up heartbeat interval (every 30 seconds)
      heartbeatIntervalRef.current = setInterval(() => sendHeartbeat(), 30000);
      
      // Initial sync
      syncUpdates();
      
      return () => {
        clearIntervals();
      };
    } else {
      clearIntervals();
    }
  }, [isConnected, sessionId, syncUpdates, sendHeartbeat, fetchSessionUsers, clearIntervals]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, [leaveSession]);

  // Helper functions for external use
  const broadcastCharacterUpdate = useCallback(async (character) => {
    if (!isConnected || !sessionId) return false;
    
    try {
      return await db.saveCharacter(character, sessionId, userId);
    } catch (error) {
      console.error('Failed to broadcast character update:', error);
      return false;
    }
  }, [isConnected, sessionId, userId]);

  const broadcastCharacterDelete = useCallback(async (characterId) => {
    if (!isConnected || !sessionId) return false;
    
    try {
      return await db.deleteCharacter(characterId, sessionId, userId);
    } catch (error) {
      console.error('Failed to broadcast character delete:', error);
      return false;
    }
  }, [isConnected, sessionId, userId]);

  const broadcastGameStateUpdate = useCallback(async (gameState) => {
    if (!isConnected || !sessionId) return false;
    
    try {
      return await db.saveGameSession(gameState, sessionId, userId);
    } catch (error) {
      console.error('Failed to broadcast game state update:', error);
      return false;
    }
  }, [isConnected, sessionId, userId]);

  const getCurrentUser = useCallback(() => {
    return sessionUsers.find(user => user.id === userId);
  }, [sessionUsers, userId]);

  const getOtherUsers = useCallback(() => {
    return sessionUsers.filter(user => user.id !== userId);
  }, [sessionUsers, userId]);

  return {
    // Session state
    sessionId,
    isConnected,
    connectionError,
    syncStatus,
    
    // User state
    userId,
    userName,
    userColor,
    isDM,
    sessionUsers,
    getCurrentUser,
    getOtherUsers,
    
    // Session management
    joinSession,
    leaveSession,
    
    // Real-time updates
    incomingUpdates,
    lastSyncTime,
    sendHeartbeat,
    
    // Broadcasting functions
    broadcastCharacterUpdate,
    broadcastCharacterDelete,
    broadcastGameStateUpdate,
    
    // Event handlers (set these from your main component)
    setOnCharacterUpdate,
    setOnGameStateUpdate,
    setOnUserJoined,
    setOnUserLeft,
    
    // Utility
    generateSessionId
  };
};
