// src/App.jsx - Enhanced with improved null checking and error handling
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/UI/Header';
import BattleMap from './components/BattleMap/BattleMap';
import ChatPanel from './components/Chat/ChatPanel';
import SimpleCharacterModal from './components/Character/SimpleCharacterModal';
import DialoguePopup from './components/Dialogue/DialoguePopup';
import SceneDisplay from './components/Scene/SceneDisplay';
import SceneModal from './components/Scene/SceneModal';
import UploadModal from './components/UI/UploadModal';
import DatabaseDebugPanel from './components/UI/DatabaseDebugPanel';
import MonsterPanel from './components/Monster/MonsterPanel';
import ActionPanel from './components/Combat/ActionPanel';
import CombatLog from './components/Combat/CombatLog';
import InitiativeTracker from './components/Combat/InitiativeTracker';
import ConditionsPanel from './components/Combat/ConditionsPanel';
import SpellPanel from './components/Combat/SpellPanel';
import InventoryPanel from './components/Combat/InventoryPanel';
import LootModal from './components/Combat/LootModal';
import DMControlPanel from './components/UI/DMControlPanel';
import SessionManager from './components/UI/SessionManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDialogue } from './hooks/useDialogue';
import { useCharacters } from './hooks/useCharacters';
import { useDatabase } from './hooks/useDatabase';
import { useRealtimeSync } from './hooks/useRealtimeSync';

const App = () => {
  // Safely initialize hooks with error boundaries
  let realtimeSync, databaseHook;
  
  try {
    realtimeSync = useRealtimeSync();
  } catch (error) {
    console.error('Error initializing realtime sync:', error);
    realtimeSync = {
      sessionId: 'offline',
      isConnected: false,
      userName: 'Local Player',
      isDM: true,
      broadcastCharacterUpdate: async () => false,
      broadcastCharacterDelete: async () => false,
      broadcastGameStateUpdate: async () => false,
      setOnCharacterUpdate: () => {},
      setOnGameStateUpdate: () => {},
      setOnUserJoined: () => {},
      setOnUserLeft: () => {}
    };
  }

  try {
    databaseHook = useDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    databaseHook = {
      isConnected: false,
      isLoading: false,
      connectionStatus: 'error',
      statusMessage: 'Database initialization failed',
      uploadImage: async () => null,
      getImage: async () => null,
      saveCharacterToDb: async () => false,
      loadCharactersFromDb: async () => [],
      deleteCharacterFromDb: async () => false,
      saveGameState: async () => false,
      loadGameState: async () => null
    };
  }

  const {
    sessionId,
    isConnected: isSessionConnected,
    userName: sessionUserName,
    isDM: sessionIsDM,
    broadcastCharacterUpdate,
    broadcastCharacterDelete,
    broadcastGameStateUpdate,
    setOnCharacterUpdate,
    setOnGameStateUpdate,
    setOnUserJoined,
    setOnUserLeft
  } = realtimeSync;

  const {
    isConnected: isDatabaseConnected,
    isLoading: isDatabaseLoading,
    connectionStatus,
    statusMessage,
    uploadImage,
    getImage,
    saveCharacterToDb,
    loadCharactersFromDb,
    deleteCharacterFromDb,
    saveGameState,
    loadGameState
  } = databaseHook;

  // UI Mode state - use session DM status when connected
  const [localIsDMMode, setLocalIsDMMode] = useLocalStorage('isDMMode', true);
  const isDMMode = isSessionConnected ? sessionIsDM : localIsDMMode;
  const [collapsedPanels, setCollapsedPanels] = useLocalStorage('collapsedPanels', {});

  // Global state
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLootModal, setShowLootModal] = useState(false);
  const [showDatabaseDebug, setShowDatabaseDebug] = useState(false);
  const [lootingCharacter, setLootingCharacter] = useState(null);
  const [uploadType, setUploadType] = useState('sprite');
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  
  // Current actor state
  const [currentActor, setCurrentActor] = useState(null);
  const [selectedCharacterForActions, setSelectedCharacterForActions] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState('actions');

  // Map state
  const [gridSize, setGridSize] = useLocalStorage('gridSize', 20);
  const [showGrid, setShowGrid] = useLocalStorage('showGrid', true);
  const [showNames, setShowNames] = useLocalStorage('showNames', false);
  const [gridColor, setGridColor] = useLocalStorage('gridColor', 'white');
  const [terrain, setTerrain] = useLocalStorage('terrain', {});
  const [customTerrainSprites, setCustomTerrainSprites] = useLocalStorage('customTerrainSprites', {});
  const [paintMode, setPaintMode] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState('grass');

  // Scene state
  const [showSceneDisplay, setShowSceneDisplay] = useState(false);
  const [sceneImage, setSceneImage] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');

  // Combat state
  const [combatMessages, setCombatMessages] = useLocalStorage('combatMessages', []);

  // Chat state
  const [chatMessages, setChatMessages] = useLocalStorage('chatMessages', []);
  const [playerMessage, setPlayerMessage] = useState('');
  const [playerName, setPlayerName] = useState('');

  // Update player name when session user name changes
  useEffect(() => {
    if (isSessionConnected && sessionUserName && (!playerName || playerName === '')) {
      setPlayerName(sessionUserName);
    }
  }, [isSessionConnected, sessionUserName, playerName]);

  // Custom hooks
  const { 
    characters, 
    addCharacter, 
    addMonster,
    updateCharacter, 
    deleteCharacter, 
    moveCharacter,
    addCondition,
    removeCondition,
    healCharacter,
    damageCharacter,
    setCharacters
  } = useCharacters();
  
  const { 
    dialogueQueue, 
    showDialoguePopup, 
    currentSpeaker, 
    displayedText, 
    isTyping,
    makeCharacterSpeak,
    closeDialogue 
  } = useDialogue();

  // Helper function to resolve image data
  const resolveImageData = async (imageReference) => {
    if (!imageReference) return null;
    
    // If it's already a data URL, return as-is
    if (imageReference.startsWith('data:')) {
      return imageReference;
    }
    
    // If it's a database ID and we're connected, fetch the image
    if (imageReference.startsWith('img_') && isDatabaseConnected && getImage) {
      try {
        const imageData = await getImage(imageReference);
        return imageData || imageReference; // Return original if fetch fails
      } catch (error) {
        console.warn('Failed to resolve image:', error);
        return imageReference;
      }
    }
    
    return imageReference;
  };

  // ENHANCED: Real-time sync event handlers with improved null checking and error handling
  const handleIncomingCharacterUpdate = useCallback((characterData, updatedBy) => {
    try {
      // Enhanced null and validity checks
      if (!characterData) {
        console.warn('📥 Received null character data, ignoring update');
        return;
      }

      // Check if it's a deletion
      if (characterData._deleted) {
        if (!characterData.id) {
          console.warn('📥 Received character deletion without ID, ignoring');
          return;
        }
        
        console.log(`📥 Incoming character deletion from ${updatedBy || 'unknown'}:`, characterData.id);
        deleteCharacter(characterData.id);
        
        // Add notification to chat
        setChatMessages(prev => [...prev, {
          type: 'system',
          name: 'System',
          text: `Character deleted by ${updatedBy || 'another player'}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }

      // Validate character data for updates
      if (!characterData.id || !characterData.name) {
        console.warn('📥 Received invalid character data, missing required fields:', characterData);
        return;
      }

      console.log(`📥 Incoming character update from ${updatedBy || 'unknown'}:`, {
        id: characterData.id,
        name: characterData.name,
        hasSprite: !!characterData.sprite,
        hasPortrait: !!characterData.portrait
      });
      
      // Check if this is a new character
      const existingChar = characters.find(c => c && c.id === characterData.id);
      const isNewCharacter = !existingChar;
      
      // Update character with validation
      updateCharacter(characterData);
      
      // Add notification to chat for new characters only
      if (isNewCharacter) {
        setChatMessages(prev => [...prev, {
          type: 'system',
          name: 'System',
          text: `${characterData.name} added by ${updatedBy || 'another player'}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      
    } catch (error) {
      console.error('💥 Error handling incoming character update:', error);
    }
  }, [updateCharacter, deleteCharacter, characters, setChatMessages]);

  const handleIncomingGameStateUpdate = useCallback((gameStateData, updatedBy) => {
    try {
      // Enhanced null and validity checks
      if (!gameStateData || typeof gameStateData !== 'object') {
        console.warn('📥 Received invalid game state data, ignoring update:', gameStateData);
        return;
      }

      console.log(`📥 Incoming game state update from ${updatedBy || 'unknown'}:`, {
        hasTerrain: gameStateData.terrain !== undefined,
        hasGridSize: gameStateData.gridSize !== undefined,
        keys: Object.keys(gameStateData)
      });
      
      // Update terrain if present and valid
      if (gameStateData.terrain !== undefined) {
        if (typeof gameStateData.terrain === 'object') {
          setTerrain(gameStateData.terrain);
        } else {
          console.warn('📥 Received invalid terrain data:', gameStateData.terrain);
        }
      }
      
      // Update grid size if present and valid
      if (gameStateData.gridSize !== undefined) {
        const gridSize = parseInt(gameStateData.gridSize);
        if (!isNaN(gridSize) && gridSize >= 10 && gridSize <= 50) {
          setGridSize(gridSize);
        } else {
          console.warn('📥 Received invalid grid size:', gameStateData.gridSize);
        }
      }
      
      // Add notification to chat
      setChatMessages(prev => [...prev, {
        type: 'system',
        name: 'System',
        text: `Map updated by ${updatedBy || 'another player'}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      console.error('💥 Error handling incoming game state update:', error);
    }
  }, [setTerrain, setGridSize, setChatMessages]);

  const handleUserJoined = useCallback((userData) => {
    try {
      // Enhanced null and validity checks
      if (!userData || typeof userData !== 'object') {
        console.warn('📥 Received invalid user data for join event:', userData);
        return;
      }

      const userName = userData.userName || userData.user_name || 'Unknown Player';
      const isDM = userData.isDM || userData.is_dm || false;
      
      console.log(`📥 User joined:`, { userName, isDM });

      setChatMessages(prev => [...prev, {
        type: 'system',
        name: 'System',
        text: `${userName} joined the session${isDM ? ' as DM' : ''}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      console.error('💥 Error handling user joined event:', error);
    }
  }, [setChatMessages]);

  const handleUserLeft = useCallback((userData) => {
    try {
      // Enhanced null and validity checks
      if (!userData || typeof userData !== 'object') {
        console.warn('📥 Received invalid user data for leave event:', userData);
        return;
      }

      console.log(`📥 User left:`, userData);

      setChatMessages(prev => [...prev, {
        type: 'system',
        name: 'System',
        text: `A player left the session`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      console.error('💥 Error handling user left event:', error);
    }
  }, [setChatMessages]);

  // Enhanced session management handlers with better error handling
  const handleSessionJoined = useCallback((newSessionId, userName) => {
    try {
      if (!newSessionId || !userName) {
        console.warn('Session joined with incomplete data:', { newSessionId, userName });
        return;
      }
      
      console.log(`🎉 Joined session: ${newSessionId} as ${userName}`);
      
      setChatMessages(prev => [...prev, {
        type: 'system',
        name: 'System',
        text: `Connected to session as ${userName}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('💥 Error handling session joined:', error);
    }
  }, [setChatMessages]);

  const handleSessionLeft = useCallback(() => {
    try {
      console.log(`👋 Left session`);
      
      setChatMessages(prev => [...prev, {
        type: 'system',
        name: 'System',
        text: `Disconnected from session`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('💥 Error handling session left:', error);
    }
  }, [setChatMessages]);

  // Set up real-time sync event handlers with enhanced error catching
  useEffect(() => {
    try {
      if (setOnCharacterUpdate) {
        setOnCharacterUpdate(handleIncomingCharacterUpdate);
      }
      if (setOnGameStateUpdate) {
        setOnGameStateUpdate(handleIncomingGameStateUpdate);
      }
      if (setOnUserJoined) {
        setOnUserJoined(handleUserJoined);
      }
      if (setOnUserLeft) {
        setOnUserLeft(handleUserLeft);
      }
      
      console.log('✅ Real-time sync event handlers registered');
    } catch (error) {
      console.error('💥 Error setting up real-time sync handlers:', error);
    }
  }, [
    handleIncomingCharacterUpdate,
    handleIncomingGameStateUpdate,
    handleUserJoined,
    handleUserLeft,
    setOnCharacterUpdate,
    setOnGameStateUpdate,
    setOnUserJoined,
    setOnUserLeft
  ]);

  // Enhanced character update function that broadcasts to other users and resolves images
  const handleCharacterUpdate = useCallback(async (character) => {
    // Add null check
    if (!character) {
      console.warn('Attempted to update null character');
      return;
    }

    let updatedCharacter = { ...character };
    
    // Resolve image references if they're database IDs
    try {
      if (character.sprite && character.sprite.startsWith('img_')) {
        const resolvedSprite = await resolveImageData(character.sprite);
        if (resolvedSprite !== character.sprite) {
          updatedCharacter.sprite = resolvedSprite;
        }
      }
      
      if (character.portrait && character.portrait.startsWith('img_')) {
        const resolvedPortrait = await resolveImageData(character.portrait);
        if (resolvedPortrait !== character.portrait) {
          updatedCharacter.portrait = resolvedPortrait;
        }
      }
    } catch (error) {
      console.warn('Error resolving character images:', error);
    }
    
    // Update locally first
    updateCharacter(updatedCharacter);
    
    // Update current actor if it's the same character
    if (currentActor && currentActor.id === updatedCharacter.id) {
      setCurrentActor(updatedCharacter);
    }
    
    // Broadcast to other users if connected
    if (isSessionConnected && broadcastCharacterUpdate) {
      try {
        await broadcastCharacterUpdate(character); // Broadcast original with database IDs
        console.log(`📤 Broadcasted character update: ${character.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to broadcast character update:`, error);
      }
    }
    
    // Save to database if connected (for persistence) - save original with database IDs
    if (isDatabaseConnected && saveCharacterToDb) {
      try {
        await saveCharacterToDb(character);
        console.log(`💾 Character ${character.name} saved to database`);
      } catch (error) {
        console.warn(`⚠️ Failed to save character ${character.name} to database:`, error);
      }
    }
  }, [
    updateCharacter,
    currentActor,
    isSessionConnected,
    broadcastCharacterUpdate,
    isDatabaseConnected,
    saveCharacterToDb,
    resolveImageData
  ]);

  // Enhanced character delete function
  const handleCharacterDelete = useCallback(async (characterId) => {
    // Add null check
    if (!characterId) {
      console.warn('Attempted to delete character with null ID');
      return;
    }

    // Delete locally first
    deleteCharacter(characterId);
    
    // Broadcast to other users if connected
    if (isSessionConnected && broadcastCharacterDelete) {
      try {
        await broadcastCharacterDelete(characterId);
        console.log(`📤 Broadcasted character deletion: ${characterId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to broadcast character deletion:`, error);
      }
    }
    
    // Delete from database if connected
    if (isDatabaseConnected && deleteCharacterFromDb) {
      try {
        await deleteCharacterFromDb(characterId);
        console.log(`🗑️ Character deleted from database: ${characterId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete character from database:`, error);
      }
    }
  }, [
    deleteCharacter,
    isSessionConnected,
    broadcastCharacterDelete,
    isDatabaseConnected,
    deleteCharacterFromDb
  ]);

  // Enhanced terrain/game state update function
  const handleTerrainChange = useCallback(async (newTerrain) => {
    // Update locally first
    setTerrain(newTerrain);
    
    // Broadcast to other users if connected
    if (isSessionConnected && broadcastGameStateUpdate) {
      try {
        const gameState = { terrain: newTerrain, gridSize };
        await broadcastGameStateUpdate(gameState);
        console.log(`📤 Broadcasted terrain update`);
      } catch (error) {
        console.warn(`⚠️ Failed to broadcast terrain update:`, error);
      }
    }
  }, [setTerrain, isSessionConnected, broadcastGameStateUpdate, gridSize]);

  // Enhanced grid size change function
  const handleGridSizeChange = useCallback(async (newGridSize) => {
    // Update locally first
    setGridSize(newGridSize);
    
    // Broadcast to other users if connected
    if (isSessionConnected && broadcastGameStateUpdate) {
      try {
        const gameState = { terrain, gridSize: newGridSize };
        await broadcastGameStateUpdate(gameState);
        console.log(`📤 Broadcasted grid size update`);
      } catch (error) {
        console.warn(`⚠️ Failed to broadcast grid size update:`, error);
      }
    }
  }, [setGridSize, isSessionConnected, broadcastGameStateUpdate, terrain]);

  // Enhanced character movement that broadcasts updates
  const handleCharacterMove = useCallback(async (characterId, x, y) => {
    // Find the character
    const character = characters.find(c => c && c.id === characterId);
    if (!character) {
      console.warn('Attempted to move character that does not exist:', characterId);
      return;
    }
    
    // Update position
    const updatedCharacter = { ...character, x, y };
    
    // Use the enhanced update function which will broadcast
    await handleCharacterUpdate(updatedCharacter);
  }, [characters, handleCharacterUpdate]);

  // Enhanced upload handler with better image resolution
  const handleUpload = async (file, result) => {
    try {
      setUploadError(null);
      let finalResult = result;
      let databaseId = null;
      
      // If database is connected, upload image to database
      if (isDatabaseConnected && uploadImage) {
        try {
          const fileName = file.name || `${uploadType}_${Date.now()}`;
          console.log(`📤 Uploading ${uploadType} to database:`, fileName);
          
          databaseId = await uploadImage(result, uploadType, fileName);
          
          if (databaseId) {
            console.log(`✅ Image uploaded to database: ${databaseId}`);
            // For immediate display, keep the data URL
            // Store database ID for later saving
          } else {
            throw new Error('Upload returned no image ID');
          }
        } catch (error) {
          console.error('💥 Database upload failed:', error);
          setUploadError(`Database upload failed: ${error.message}`);
          // Continue with local storage as fallback
          console.log('📋 Falling back to local storage');
        }
      }
      
      // Apply the result - use data URL for immediate display
      if (uploadType === 'portrait') {
        const updatedCharacter = { 
          ...editingCharacter, 
          portrait: finalResult,
          // Store database reference separately for saving
          _portraitDbId: databaseId
        };
        console.log('🖼️ Setting portrait on character:', { 
          characterId: updatedCharacter.id, 
          portraitType: finalResult?.startsWith?.('data:') ? 'data URL' : 'other',
          portraitLength: finalResult?.length 
        });
        setEditingCharacter(updatedCharacter);
      } else if (uploadType === 'sprite') {
        const updatedCharacter = { 
          ...editingCharacter, 
          sprite: finalResult,
          // Store database reference separately for saving
          _spriteDbId: databaseId
        };
        console.log('🖼️ Setting sprite on character:', { 
          characterId: updatedCharacter.id, 
          spriteType: finalResult?.startsWith?.('data:') ? 'data URL' : 'other',
          spriteLength: finalResult?.length 
        });
        setEditingCharacter(updatedCharacter);
      } else if (uploadType === 'terrain') {
        setCustomTerrainSprites(prev => ({
          ...prev,
          [selectedTerrain]: finalResult
        }));
      } else if (uploadType === 'scene') {
        setSceneImage(finalResult);
      }
      
    } catch (error) {
      console.error('💥 Upload processing failed:', error);
      setUploadError(`Upload failed: ${error.message}`);
      throw error;
    }
  };

  // Modified save function for character modal
  const handleCharacterSave = async (savedCharacter) => {
    if (!savedCharacter) {
      console.warn('Attempted to save null character');
      return;
    }

    let characterToSave = { ...savedCharacter };
    
    // If we have database IDs from recent uploads, use those for saving
    if (savedCharacter._spriteDbId) {
      // Save with database ID for database storage
      const dbCharacter = { ...savedCharacter, sprite: savedCharacter._spriteDbId };
      delete dbCharacter._spriteDbId;
      
      // Update local state with data URL for display
      delete characterToSave._spriteDbId;
    }
    
    if (savedCharacter._portraitDbId) {
      // Save with database ID for database storage
      const dbCharacter = { ...savedCharacter, portrait: savedCharacter._portraitDbId };
      delete dbCharacter._portraitDbId;
      
      // Update local state with data URL for display
      delete characterToSave._portraitDbId;
    }
    
    // Use enhanced update function which handles database saving and broadcasting
    await handleCharacterUpdate(characterToSave);
    
    setShowCharacterModal(false);
    setEditingCharacter(null);
  };

  // Load initial data when session is connected
  useEffect(() => {
    if (isSessionConnected && isDatabaseConnected && loadCharactersFromDb && loadGameState && getImage) {
      // Load session-specific data
      const loadSessionData = async () => {
        try {
          console.log(`🔄 Loading data for session: ${sessionId}`);
          
          // Load characters
          const sessionCharacters = await loadCharactersFromDb();
          if (sessionCharacters && sessionCharacters.length > 0) {
            // Resolve image references for characters
            const charactersWithImages = await Promise.all(
              sessionCharacters.map(async (char) => {
                if (!char) return null; // Skip null characters
                
                const updatedChar = { ...char };
                
                // Load sprite if it's a database reference
                if (char.sprite && char.sprite.startsWith('img_')) {
                  try {
                    const spriteData = await getImage(char.sprite);
                    if (spriteData) {
                      updatedChar.sprite = spriteData;
                    }
                  } catch (error) {
                    console.warn(`Failed to load sprite for ${char.name}:`, error);
                  }
                }
                
                // Load portrait if it's a database reference
                if (char.portrait && char.portrait.startsWith('img_')) {
                  try {
                    const portraitData = await getImage(char.portrait);
                    if (portraitData) {
                      updatedChar.portrait = portraitData;
                    }
                  } catch (error) {
                    console.warn(`Failed to load portrait for ${char.name}:`, error);
                  }
                }
                
                return updatedChar;
              })
            );
            
            // Filter out any null characters
            const validCharacters = charactersWithImages.filter(char => char !== null);
            
            setCharacters(validCharacters);
            console.log(`✅ Loaded ${validCharacters.length} characters for session`);
          }
          
          // Load game state
          const gameState = await loadGameState();
          if (gameState) {
            if (gameState.terrain) setTerrain(gameState.terrain);
            if (gameState.customTerrainSprites) setCustomTerrainSprites(gameState.customTerrainSprites);
            if (gameState.gridSize) setGridSize(gameState.gridSize);
            if (gameState.chatMessages) setChatMessages(gameState.chatMessages);
            if (gameState.combatMessages) setCombatMessages(gameState.combatMessages);
            console.log(`✅ Loaded game state for session`);
          }
        } catch (error) {
          console.warn('⚠️ Failed to load session data:', error);
        }
      };
      
      loadSessionData();
    }
  }, [isSessionConnected, isDatabaseConnected, sessionId, loadCharactersFromDb, loadGameState, setCharacters, setTerrain, setGridSize, setChatMessages, setCombatMessages, setCustomTerrainSprites, getImage]);

  // Load game state from database on startup (for non-session mode)
  useEffect(() => {
    if (isDatabaseConnected && !isDatabaseLoading && !isSessionConnected && loadCharactersFromDb && loadGameState && getImage) {
      const loadGameData = async () => {
        try {
          console.log('🔄 Loading game data from database...');
          
          // Load characters from database
          const dbCharacters = await loadCharactersFromDb();
          if (dbCharacters && dbCharacters.length > 0) {
            console.log(`✅ Loaded ${dbCharacters.length} characters from database`);
            
            // Resolve image references for characters
            const charactersWithImages = await Promise.all(
              dbCharacters.map(async (char) => {
                if (!char) return null; // Skip null characters
                
                const updatedChar = { ...char };
                
                // Load sprite if it's a database reference
                if (char.sprite && char.sprite.startsWith('img_')) {
                  try {
                    const spriteData = await getImage(char.sprite);
                    if (spriteData) {
                      updatedChar.sprite = spriteData;
                    }
                  } catch (error) {
                    console.warn(`Failed to load sprite for ${char.name}:`, error);
                  }
                }
                
                // Load portrait if it's a database reference
                if (char.portrait && char.portrait.startsWith('img_')) {
                  try {
                    const portraitData = await getImage(char.portrait);
                    if (portraitData) {
                      updatedChar.portrait = portraitData;
                    }
                  } catch (error) {
                    console.warn(`Failed to load portrait for ${char.name}:`, error);
                  }
                }
                
                return updatedChar;
              })
            );
            
            // Filter out any null characters
            const validCharacters = charactersWithImages.filter(char => char !== null);
            
            setCharacters(validCharacters);
          }
          
          // Load game session data
          const gameState = await loadGameState();
          if (gameState) {
            console.log('✅ Loaded game state from database');
            
            // Apply game state to relevant components
            if (gameState.terrain) setTerrain(gameState.terrain);
            if (gameState.customTerrainSprites) setCustomTerrainSprites(gameState.customTerrainSprites);
            if (gameState.gridSize) setGridSize(gameState.gridSize);
            if (gameState.chatMessages) setChatMessages(gameState.chatMessages);
            if (gameState.combatMessages) setCombatMessages(gameState.combatMessages);
          }
          
        } catch (error) {
          console.warn('⚠️ Failed to load game data from database:', error);
        }
      };

      loadGameData();
    }
  }, [isDatabaseConnected, isDatabaseLoading, isSessionConnected]);

  // Auto-save game state to database periodically
  useEffect(() => {
    if (!isDatabaseConnected || !saveGameState) return;

    const autoSave = async () => {
      try {
        const gameState = {
          characters,
          terrain,
          customTerrainSprites,
          gridSize,
          chatMessages: chatMessages.slice(-50),
          combatMessages: combatMessages.slice(-50),
          isDMMode: localIsDMMode, // Save local DM mode, not session-based
          showGrid,
          showNames,
          gridColor
        };

        await saveGameState(gameState);
        console.log('💾 Game state auto-saved to database');
      } catch (error) {
        console.warn('⚠️ Failed to auto-save game state:', error);
      }
    };

    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [
    isDatabaseConnected, 
    characters, 
    terrain, 
    customTerrainSprites, 
    gridSize, 
    chatMessages, 
    combatMessages,
    localIsDMMode,
    showGrid,
    showNames,
    gridColor,
    saveGameState
  ]);

  // Enhanced makeCharacterSpeak that also adds to chat
  const handleMakeCharacterSpeak = (character, text) => {
    if (!character || !text) {
      console.warn('Attempted to make character speak with invalid data');
      return;
    }

    makeCharacterSpeak(character, text);
    setChatMessages(prev => [...prev, {
      type: 'character',
      name: character.name,
      text: text,
      character: character,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const showScene = (image, description) => {
    setSceneImage(image);
    setSceneDescription(description);
    setShowSceneDisplay(true);
  };

  const openUploadModal = (type) => {
    setUploadType(type);
    setUploadError(null);
    setShowUploadModal(true);
  };

  const handleAddCharacter = () => {
    const newChar = addCharacter();
    setEditingCharacter(newChar);
    setShowCharacterModal(true);
  };

  const handleAddMonster = async (monster) => {
    if (!monster) {
      console.warn('Attempted to add null monster');
      return;
    }

    let x = Math.floor(Math.random() * (gridSize - 5)) + 2;
    let y = Math.floor(Math.random() * (gridSize - 5)) + 2;
    
    const occupied = characters.some(char => char && char.x === x && char.y === y);
    if (occupied) {
      for (let attempts = 0; attempts < 10; attempts++) {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
        if (!characters.some(char => char && char.x === x && char.y === y)) {
          break;
        }
      }
    }
    
    const monsterWithPosition = { ...monster, x, y };
    const addedMonster = addMonster(monsterWithPosition);
    
    // Broadcast the new monster if in session
    if (isSessionConnected) {
      await handleCharacterUpdate(addedMonster);
    }
    
    setCombatMessages(prev => [...prev, {
      type: 'spawn',
      text: `${monster.name || 'A monster'} appears on the battlefield!`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Enhanced DM mode toggle
  const handleToggleDMMode = () => {
    if (!isSessionConnected) {
      // Only allow local toggle when not in a session
      setLocalIsDMMode(!localIsDMMode);
    }
    // When in a session, DM mode is controlled by session role
  };

  const handleAttack = (combatResult, targetId, damage) => {
    if (!combatResult) {
      console.warn('Received null combat result');
      return;
    }

    setCombatMessages(prev => [...prev, {
      ...combatResult,
      type: combatResult.type || 'attack',
      timestamp: new Date().toLocaleTimeString()
    }]);

    if (targetId) {
      const target = characters.find(char => char && char.id === targetId);
      if (target) {
        const oldHp = target.hp || target.maxHp;
        let newHp;
        
        if (damage < 0) {
          newHp = Math.min(oldHp - damage, target.maxHp);
          handleCharacterUpdate({ ...target, hp: newHp });
          
          setCombatMessages(prev => [...prev, {
            type: 'healing',
            target: target.name,
            amount: -damage,
            oldHp,
            newHp,
            timestamp: new Date().toLocaleTimeString()
          }]);
        } else if (damage > 0) {
          newHp = Math.max(0, oldHp - damage);
          handleCharacterUpdate({ ...target, hp: newHp });
          
          setCombatMessages(prev => [...prev, {
            type: 'damage',
            target: target.name,
            amount: damage,
            damageType: combatResult.damageType,
            oldHp,
            newHp,
            timestamp: new Date().toLocaleTimeString()
          }]);

          if (newHp <= 0) {
            setCombatMessages(prev => [...prev, {
              type: 'death',
              target: target.name,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        }
      }
    }
  };

  const handleCastSpell = (spellResult, targetId, effect) => {
    if (!spellResult) {
      console.warn('Received null spell result');
      return;
    }

    setCombatMessages(prev => [...prev, {
      ...spellResult,
      timestamp: new Date().toLocaleTimeString()
    }]);

    if (targetId && effect !== 0) {
      handleAttack(spellResult, targetId, effect);
    }
  };

  const handleCharacterSelect = (character) => {
    if (!character) {
      setCurrentActor(null);
      setSelectedCharacterForActions(null);
      return;
    }

    const currentHp = character.hp !== undefined ? character.hp : character.maxHp;
    const isDead = currentHp <= 0;
    
    if (!isDead) {
      setCurrentActor(character);
      setSelectedCharacterForActions(character);
      
      if (!playerName || playerName === '') {
        setPlayerName(character.name);
      }
    } else if (isDead && character.isMonster) {
      setLootingCharacter(character);
      setShowLootModal(true);
    }
  };

  const handleTakeLoot = (lootItems) => {
    if (!lootItems || !Array.isArray(lootItems)) {
      console.warn('Invalid loot items provided');
      return;
    }

    let receivingCharacter = currentActor;
    
    if (!receivingCharacter || (receivingCharacter.hp !== undefined ? receivingCharacter.hp : receivingCharacter.maxHp) <= 0) {
      receivingCharacter = characters.find(char => {
        if (!char) return false;
        const hp = char.hp !== undefined ? char.hp : char.maxHp;
        return hp > 0 && !char.isMonster;
      });
      
      if (!receivingCharacter) {
        alert('No living character available to receive loot! Please select a living character first.');
        return;
      }
    }

    const regularItems = [];
    const currencyToAdd = { copper: 0, silver: 0, gold: 0 };

    lootItems.forEach(item => {
      if (!item || !item.name) return;
      
      const itemName = item.name.toLowerCase();
      if (itemName.includes('copper pieces') || itemName.includes('copper coins') || itemName === 'cp') {
        currencyToAdd.copper += item.actualQuantity || 1;
      } else if (itemName.includes('silver pieces') || itemName.includes('silver coins') || itemName === 'sp') {
        currencyToAdd.silver += item.actualQuantity || 1;
      } else if (itemName.includes('gold pieces') || itemName.includes('gold coins') || itemName === 'gp') {
        currencyToAdd.gold += item.actualQuantity || 1;
      } else {
        regularItems.push({
          ...item,
          source: lootingCharacter?.name || 'Unknown',
          dateObtained: new Date().toLocaleString(),
          id: `loot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }
    });

    const currentCurrency = receivingCharacter.currency || { copper: 0, silver: 0, gold: 0 };
    const updatedCharacter = {
      ...receivingCharacter,
      inventory: [
        ...(receivingCharacter.inventory || []),
        ...regularItems
      ],
      currency: {
        copper: currentCurrency.copper + currencyToAdd.copper,
        silver: currentCurrency.silver + currencyToAdd.silver,
        gold: currentCurrency.gold + currencyToAdd.gold
      }
    };

    handleCharacterUpdate(updatedCharacter);
    
    if (currentActor && currentActor.id === receivingCharacter.id) {
      setCurrentActor(updatedCharacter);
    }

    const lootSummary = [];
    if (regularItems.length > 0) {
      lootSummary.push(`${regularItems.length} items`);
    }
    if (currencyToAdd.copper > 0) lootSummary.push(`${currencyToAdd.copper} cp`);
    if (currencyToAdd.silver > 0) lootSummary.push(`${currencyToAdd.silver} sp`);
    if (currencyToAdd.gold > 0) lootSummary.push(`${currencyToAdd.gold} gp`);

    setCombatMessages(prev => [...prev, {
      type: 'loot',
      text: `${receivingCharacter.name} looted ${lootSummary.join(', ')} from ${lootingCharacter?.name || 'unknown source'}`,
      items: lootItems.map(item => `${item.name} x${item.actualQuantity}`),
      timestamp: new Date().toLocaleTimeString()
    }]);

    if (lootingCharacter) {
      handleCharacterUpdate({
        ...lootingCharacter,
        looted: true
      });
    }
    
    setChatMessages(prev => [...prev, {
      type: 'system',
      name: 'System',
      text: `${receivingCharacter.name} obtained ${lootSummary.join(', ')} from ${lootingCharacter?.name || 'unknown source'}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearCombatLog = () => {
    setCombatMessages([]);
  };

  const addSpellToCharacter = (characterId, spell) => {
    if (!characterId || !spell) return;
    
    const character = characters.find(c => c && c.id === characterId);
    if (character) {
      handleCharacterUpdate({
        ...character,
        spells: [...(character.spells || []), spell]
      });
    }
  };

  const removeSpellFromCharacter = (characterId, spellIndex) => {
    if (!characterId || spellIndex < 0) return;
    
    const character = characters.find(c => c && c.id === characterId);
    if (character) {
      handleCharacterUpdate({
        ...character,
        spells: (character.spells || []).filter((_, index) => index !== spellIndex)
      });
    }
  };

  const handleCombatMessage = (message) => {
    if (!message) return;
    
    setCombatMessages(prev => [...prev, message]);
  };

  const togglePanel = (panelId) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  // Define available tabs
  const availableSharedTabs = [
    { id: 'actions', name: 'Actions', icon: '⚔️' },
    { id: 'conditions', name: 'Conditions', icon: '🎭' },
    { id: 'spells', name: 'Spells', icon: '✨' },
    { id: 'inventory', name: 'Inventory', icon: '🎒' }
  ];
  const availableDMTabs = [
    { id: 'initiative', name: 'Initiative', icon: '🎲' }
  ];

  const renderCharacterToolsContent = () => {
    switch (activeRightTab) {
      case 'actions':
        return (
          <ActionPanel
            selectedCharacter={currentActor}
            characters={characters}
            onAttack={handleAttack}
            onClearSelection={() => {
              setCurrentActor(null);
              setSelectedCharacterForActions(null);
            }}
          />
        );
      case 'conditions':
        return (
          <ConditionsPanel
            selectedCharacter={currentActor}
            onAddCondition={(characterId, condition) => {
              const character = characters.find(c => c && c.id === characterId);
              if (character) {
                const updatedCharacter = {
                  ...character,
                  conditions: [...(character.conditions || []), condition]
                };
                handleCharacterUpdate(updatedCharacter);
              }
            }}
            onRemoveCondition={(characterId, conditionIndex) => {
              const character = characters.find(c => c && c.id === characterId);
              if (character) {
                const updatedCharacter = {
                  ...character,
                  conditions: (character.conditions || []).filter((_, index) => index !== conditionIndex)
                };
                handleCharacterUpdate(updatedCharacter);
              }
            }}
            onClearSelection={() => {
              setCurrentActor(null);
              setSelectedCharacterForActions(null);
            }}
          />
        );
      case 'spells':
        return (
          <SpellPanel
            selectedCharacter={currentActor}
            characters={characters}
            onCastSpell={handleCastSpell}
            onAddSpell={addSpellToCharacter}
            onRemoveSpell={removeSpellFromCharacter}
            onClearSelection={() => {
              setCurrentActor(null);
              setSelectedCharacterForActions(null);
            }}
          />
        );
      case 'inventory':
        return (
          <InventoryPanel
            selectedCharacter={currentActor}
            onRemoveInventoryItem={(index) => {
              if (currentActor && currentActor.inventory) {
                const updatedActor = {
                  ...currentActor,
                  inventory: currentActor.inventory.filter((_, i) => i !== index)
                };
                handleCharacterUpdate(updatedActor);
                setCurrentActor(updatedActor);
              }
            }}
            onAddInventoryItem={(item) => {
              if (currentActor) {
                const updatedActor = {
                  ...currentActor,
                  inventory: [...(currentActor.inventory || []), item]
                };
                handleCharacterUpdate(updatedActor);
                setCurrentActor(updatedActor);
              }
            }}
            onUpdateCharacterCurrency={(newCurrency) => {
              if (currentActor) {
                const updatedActor = {
                  ...currentActor,
                  currency: newCurrency
                };
                handleCharacterUpdate(updatedActor);
                setCurrentActor(updatedActor);
              }
            }}
            onClearSelection={() => {
              setCurrentActor(null);
              setSelectedCharacterForActions(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderDMToolsContent = () => {
    switch (activeRightTab) {
      case 'initiative':
        return (
          <InitiativeTracker
            characters={characters}
            onUpdateCharacter={handleCharacterUpdate}
            onCombatMessage={handleCombatMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-full mx-auto p-4 text-white">
        
        {/* Session Manager - Shows at top when not connected */}
        {!isSessionConnected && (
          <div className="mb-4">
            <SessionManager
              realtimeSync={realtimeSync}
              onSessionJoined={handleSessionJoined}
              onSessionLeft={handleSessionLeft}
            />
          </div>
        )}

        <Header 
          isDMMode={isDMMode}
          onToggleDMMode={handleToggleDMMode}
          onShowScene={() => setShowSceneModal(true)}
          paintMode={paintMode}
          onTogglePaint={() => setPaintMode(!paintMode)}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          gridColor={gridColor}
          onGridColorChange={setGridColor}
          showNames={showNames}
          onToggleNames={() => setShowNames(!showNames)}
          isDatabaseConnected={isDatabaseConnected}
          isDatabaseLoading={isDatabaseLoading}
          gridSize={gridSize}
          onGridSizeChange={handleGridSizeChange}
          // Add session info to header
          isSessionConnected={isSessionConnected}
          sessionUserName={sessionUserName}
          sessionId={sessionId}
        />

        {/* Session Manager - Compact view when connected */}
        {isSessionConnected && (
          <div className="mb-4">
            <SessionManager
              realtimeSync={realtimeSync}
              onSessionJoined={handleSessionJoined}
              onSessionLeft={handleSessionLeft}
            />
          </div>
        )}

        {/* Database Debug Panel */}
        {(isDMMode || connectionStatus === 'error' || showDatabaseDebug) && (
          <div className="mb-4">
            <DatabaseDebugPanel useDatabase={databaseHook} />
          </div>
        )}

        {/* Upload Error Display */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-red-300 text-sm font-medium">Upload Error</div>
            <div className="text-red-200 text-sm">{uploadError}</div>
            <button
              onClick={() => setUploadError(null)}
              className="mt-2 text-xs text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* DM Control Panel */}
        {isDMMode && (
          <div className="mb-4 transition-all duration-300 ease-in-out">
            <DMControlPanel
              isCollapsed={collapsedPanels.dmControls}
              onToggleCollapse={() => togglePanel('dmControls')}
              gridSize={gridSize}
              onGridSizeChange={handleGridSizeChange}
              onAddCharacter={handleAddCharacter}
              paintMode={paintMode}
              selectedTerrain={selectedTerrain}
              onSelectedTerrainChange={setSelectedTerrain}
              customTerrainSprites={customTerrainSprites}
              onClearTerrain={() => handleTerrainChange({})}
              onUpload={openUploadModal}
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
          {/* Left Panel - Monster Panel (DM Only) */}
          {isDMMode && (
            <div className="xl:col-span-1 transition-all duration-300 ease-in-out">
              <MonsterPanel onAddMonster={handleAddMonster} />
            </div>
          )}

          {/* Center Panel - Battle Map */}
          <div className={`transition-all duration-300 ease-in-out ${isDMMode ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
            <BattleMap
              gridSize={gridSize}
              onGridSizeChange={handleGridSizeChange}
              characters={characters}
              onAddCharacter={handleAddCharacter}
              onEditCharacter={(char) => {
                setEditingCharacter(char);
                setShowCharacterModal(true);
              }}
              onSelectCharacter={handleCharacterSelect}
              selectedCharacter={selectedCharacterForActions}
              onMakeCharacterSpeak={handleMakeCharacterSpeak}
              onMoveCharacter={handleCharacterMove}
              terrain={terrain}
              onTerrainChange={isDMMode ? handleTerrainChange : null}
              customTerrainSprites={customTerrainSprites}
              paintMode={isDMMode ? paintMode : false}
              selectedTerrain={selectedTerrain}
              onSelectedTerrainChange={setSelectedTerrain}
              showGrid={showGrid}
              gridColor={gridColor}
              showNames={showNames}
              onUpload={openUploadModal}
              isDMMode={isDMMode}
            />
          </div>

          {/* Right Panel - Character Tools and Chat/Log */}
          <div className={`transition-all duration-300 ease-in-out ${isDMMode ? 'xl:col-span-2' : 'xl:col-span-2'} space-y-4`}>
            
            {/* Character Control Panel */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-slate-100 flex items-center">
                  ⚡ Character Controls
                  {currentActor && (
                    <span className="ml-3 text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      Acting as: {currentActor.name}
                    </span>
                  )}
                  {!currentActor && (
                    <span className="ml-3 text-sm bg-slate-500/20 text-slate-400 px-2 py-1 rounded">
                      No character selected
                    </span>
                  )}
                  {isSessionConnected && (
                    <span className="ml-3 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      🌐 Live Session
                    </span>
                  )}
                  {isDatabaseConnected && (
                    <span className="ml-3 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      ☁️ Cloud Sync
                    </span>
                  )}
                </h3>
              </div>
              
              {/* Tab Navigation */}
              <div className="border-b border-slate-700">
                <div className="flex overflow-x-auto">
                  {availableSharedTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveRightTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                        activeRightTab === tab.id
                          ? 'bg-slate-700/50 border-blue-500 text-blue-300'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="transition-all duration-200 ease-in-out">
                {renderCharacterToolsContent()}
              </div>
            </div>

            {/* DM Tools Panel */}
            {isDMMode && availableDMTabs.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center">
                    🎲 DM Tools
                    <span className="ml-3 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      DM Only
                    </span>
                  </h3>
                </div>
                
                {/* DM Tab Navigation */}
                <div className="border-b border-slate-700">
                  <div className="flex overflow-x-auto">
                    {availableDMTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveRightTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                          activeRightTab === tab.id
                            ? 'bg-slate-700/50 border-red-500 text-red-300'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DM Tab Content */}
                <div className="transition-all duration-200 ease-in-out">
                  {renderDMToolsContent()}
                </div>
              </div>
            )}

            {/* Chat and Log Panel */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-slate-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveRightTab('chat')}
                    className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 flex-1 ${
                      activeRightTab === 'chat'
                        ? 'bg-slate-700/50 border-green-500 text-green-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                  >
                    <span className="mr-2">💬</span>
                    Chat
                    {isSessionConnected && (
                      <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-1 py-0.5 rounded">
                        Live
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveRightTab('log')}
                    className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 flex-1 ${
                      activeRightTab === 'log'
                        ? 'bg-slate-700/50 border-green-500 text-green-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                  >
                    <span className="mr-2">📜</span>
                    Combat Log
                    {combatMessages.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {combatMessages.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="transition-all duration-200 ease-in-out">
                {activeRightTab === 'chat' && (
                  <ChatPanel
                    chatMessages={chatMessages}
                    onAddMessage={setChatMessages}
                    playerMessage={playerMessage}
                    onPlayerMessageChange={setPlayerMessage}
                    playerName={playerName}
                    onPlayerNameChange={setPlayerName}
                    characters={characters}
                    onMakeCharacterSpeak={handleMakeCharacterSpeak}
                    autoScroll={false}
                    currentActor={currentActor}
                  />
                )}
                {activeRightTab === 'log' && (
                  <CombatLog
                    combatMessages={combatMessages}
                    onClearLog={clearCombatLog}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals and Overlays */}
        {showDialoguePopup && (
          <DialoguePopup
            speaker={currentSpeaker}
            text={displayedText}
            isTyping={isTyping}
            queueLength={dialogueQueue.length}
            onClose={closeDialogue}
          />
        )}

        {showCharacterModal && editingCharacter && (
          <SimpleCharacterModal
            character={editingCharacter}
            characters={characters}
            isDMMode={isDMMode}
            onSave={handleCharacterSave}
            onDelete={(characterId) => {
              handleCharacterDelete(characterId);
              if (currentActor && currentActor.id === characterId) {
                setCurrentActor(null);
                setSelectedCharacterForActions(null);
              }
              setShowCharacterModal(false);
              setEditingCharacter(null);
            }}
            onClose={() => {
              setShowCharacterModal(false);
              setEditingCharacter(null);
            }}
            onUpload={openUploadModal}
            onAttack={handleAttack}
            onCastSpell={handleCastSpell}
            // Add database integration props
            isDatabaseConnected={isDatabaseConnected}
            getImage={getImage}
          />
        )}

        {showSceneModal && isDMMode && (
          <SceneModal
            sceneImage={sceneImage}
            sceneDescription={sceneDescription}
            onSceneImageChange={setSceneImage}
            onSceneDescriptionChange={setSceneDescription}
            onShowScene={showScene}
            onClose={() => {
              setShowSceneModal(false);
              setSceneImage('');
              setSceneDescription('');
            }}
            onUpload={openUploadModal}
          />
        )}

        {showSceneDisplay && (
          <SceneDisplay
            image={sceneImage}
            description={sceneDescription}
            onClose={() => setShowSceneDisplay(false)}
          />
        )}

        {showLootModal && lootingCharacter && (
          <LootModal
            deadCharacter={lootingCharacter}
            onClose={() => {
              setShowLootModal(false);
              setLootingCharacter(null);
            }}
            onTakeLoot={handleTakeLoot}
          />
        )}

        {showUploadModal && (
          <UploadModal
            uploadType={uploadType}
            onUpload={handleUpload}
            onClose={() => {
              setShowUploadModal(false);
              setUploadError(null);
            }}
            isDatabaseConnected={isDatabaseConnected}
          />
        )}
      </div>
    </div>
  );
};

export default App;
