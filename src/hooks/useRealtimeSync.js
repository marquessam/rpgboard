// src/hooks/useRealtimeSync.js - Fixed version with better null handling and error recovery
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

  // Safely process update data with null checks
  const safeProcessUpdate = useCallback((update) => {
    if (!update) {
      console.warn('📥 Received null update, skipping');
      return false;
    }

    if (!update.update_type || !update.updated_by) {
      console.warn('📥 Received incomplete update, skipping:', update);
      return false;
    }

    // Additional null check for data
    if (update.data === null || update.data === undefined) {
      console.warn('📥 Received update with null data, skipping:', update.update_type);
      return false;
    }

    return true;
  }, []);

  // Join a session with better error handling
  const joinSession = useCallback(async (targetSessionId, name, color, dmMode = false) => {
    try {
      setSyncStatus('connecting');
      setConnectionError(null);
      
      console.log(`🔗 Joining session: ${targetSessionId} as ${name} (${dmMode ? 'DM' : 'Player'})`);
      
      // Validate inputs
      if (!targetSessionId || !name || !color) {
        throw new Error('Missing required session parameters');
      }

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
        throw new Error('Join session returned false - check server logs');
      }
    } catch (error) {
      console.error('❌ Failed to join session:', error);
      setConnectionError(`Failed to join session: ${error.message}`);
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
      setConnectionError(null);
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
      console.warn('Heartbeat failed:', error);
      // Don't set error state for heartbeat failures, just log them
    }
  }, [isConnected, sessionId, userId]);

  // Fetch session users with error handling
  const fetchSessionUsers = useCallback(async () => {
    if (!isConnected || !sessionId) return;
    
    try {
      const users = await db.getSessionUsers(sessionId);
      
      // Validate users array
      if (Array.isArray(users)) {
        // Filter out any null or invalid users
        const validUsers = users.filter(user => 
          user && 
          user.id && 
          user.user_name && 
          user.session_id === sessionId
        );
        
        setSessionUsers(validUsers);
        console.log(`👥 Fetched ${validUsers.length} valid users for session ${sessionId}`);
      } else {
        console.warn('⚠️ Received invalid users data:', users);
        setSessionUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch session users:', error);
      // Don't clear users on fetch error, keep existing ones
    }
  }, [isConnected, sessionId]);

  // Sync updates from other users with better error handling
  const syncUpdates = useCallback(async () => {
    if (!isConnected || !sessionId || syncInProgress.current) return;
    
    try {
      syncInProgress.current = true;
      setSyncStatus('syncing');
      
      const updates = await db.getSessionUpdates(sessionId, userId, lastSyncTime);
      
      if (Array.isArray(updates) && updates.length > 0) {
        console.log(`📥 Received ${updates.length} raw updates from other users`);
        
        let processedCount = 0;
        
        // Process updates with null checks
        for (const update of updates) {
          if (!safeProcessUpdate(update)) {
            continue;
          }
          
          console.log('Processing update:', {
            type: update.update_type,
            by: update.updated_by,
            hasData: !!update.data
          });
          
          try {
            switch (update.update_type) {
              case 'character_updated':
                if (onCharacterUpdate && update.data) {
                  onCharacterUpdate(update.data, update.updated_by);
                  processedCount++;
                }
                break;
                
              case 'character_deleted':
                if (onCharacterUpdate && update.data && update.data.characterId) {
                  onCharacterUpdate({ 
                    id: update.data.characterId, 
                    _deleted: true 
                  }, update.updated_by);
                  processedCount++;
                }
                break;
                
              case 'game_state_updated':
                if (onGameStateUpdate && update.data) {
                  onGameStateUpdate(update.data, update.updated_by);
                  processedCount++;
                }
                break;
                
              case 'user_joined':
                console.log(`👋 User joined: ${update.data?.userName || 'Unknown'}`);
                if (onUserJoined && update.data) {
                  onUserJoined(update.data);
                }
                // Refresh user list
                fetchSessionUsers();
                processedCount++;
                break;
                
              case 'user_left':
                console.log(`👋 User left: ${update.data?.userId || 'Unknown'}`);
                if (onUserLeft && update.data) {
                  onUserLeft(update.data);
                }
                // Refresh user list
                fetchSessionUsers();
                processedCount++;
                break;
                
              default:
                console.warn('Unknown update type:', update.update_type);
            }
          } catch (updateError) {
            console.error('Error processing individual update:', updateError, update);
          }
        }
        
        console.log(`✅ Successfully processed ${processedCount} out of ${updates.length} updates`);
        
        // Store updates for external access (keep only valid ones)
        const validUpdates = updates.filter(safeProcessUpdate);
        setIncomingUpdates(prev => [...prev.slice(-20), ...validUpdates]); // Keep last 20 updates
        
        // Update last sync time to the newest valid update
        if (validUpdates.length > 0) {
          const newestUpdate = validUpdates[validUpdates.length - 1];
          if (newestUpdate.created_at) {
            setLastSyncTime(newestUpdate.created_at);
          }
        }
      }
      
      setSyncStatus('connected');
    } catch (error) {
      console.error('Sync failed:', error);
      setConnectionError(`Sync error: ${error.message}`);
      setSyncStatus('connected'); // Don't disconnect on sync failure
    } finally {
      syncInProgress.current = false;
    }
  }, [
    isConnected, 
    sessionId, 
    userId, 
    lastSyncTime, 
    onCharacterUpdate, 
    onGameStateUpdate, 
    onUserJoined, 
    onUserLeft, 
    fetchSessionUsers, 
    safeProcessUpdate
  ]);

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
      
      // Initial sync after a short delay
      setTimeout(syncUpdates, 1000);
      
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
      if (isConnected) {
        leaveSession();
      }
    };
  }, []); // Only run on unmount

  // Helper functions for external use with validation
  const broadcastCharacterUpdate = useCallback(async (character) => {
    if (!isConnected || !sessionId) {
      console.warn('Cannot broadcast character update - not connected');
      return false;
    }
    
    if (!character || !character.id || !character.name) {
      console.warn('Cannot broadcast invalid character:', character);
      return false;
    }
    
    try {
      return await db.saveCharacter(character, sessionId, userId);
    } catch (error) {
      console.error('Failed to broadcast character update:', error);
      return false;
    }
  }, [isConnected, sessionId, userId]);

  const broadcastCharacterDelete = useCallback(async (characterId) => {
    if (!isConnected || !sessionId) {
      console.warn('Cannot broadcast character delete - not connected');
      return false;
    }
    
    if (!characterId) {
      console.warn('Cannot broadcast delete for invalid character ID:', characterId);
      return false;
    }
    
    try {
      return await db.deleteCharacter(characterId, sessionId, userId);
    } catch (error) {
      console.error('Failed to broadcast character delete:', error);
      return false;
    }
  }, [isConnected, sessionId, userId]);

  const broadcastGameStateUpdate = useCallback(async (gameState) => {
    if (!isConnected || !sessionId) {
      console.warn('Cannot broadcast game state update - not connected');
      return false;
    }
    
    if (!gameState) {
      console.warn('Cannot broadcast invalid game state:', gameState);
      return false;
    }
    
    try {
      return await db.saveGameSession(gameState, sessionId, userId);
    } catch (error) {
      console.error('Failed to broadcast game state update:', error);
      return false;
    }
  }, [isConnected, sessionId, userId]);

  const getCurrentUser = useCallback(() => {
    return sessionUsers.find(user => user && user.id === userId);
  }, [sessionUsers, userId]);

  const getOtherUsers = useCallback(() => {
    return sessionUsers.filter(user => user && user.id !== userId);
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
    sessionUsers: sessionUsers.filter(user => user), // Filter out any null users
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
    setOnCharacterUpdate: useCallback((handler) => {
      setOnCharacterUpdate(() => handler);
    }, []),
    setOnGameStateUpdate: useCallback((handler) => {
      setOnGameStateUpdate(() => handler);
    }, []),
    setOnUserJoined: useCallback((handler) => {
      setOnUserJoined(() => handler);
    }, []),
    setOnUserLeft: useCallback((handler) => {
      setOnUserLeft(() => handler);
    }, []),
    
    // Utility
    generateSessionId
  };
};
