// src/App.jsx - Enhanced with debugging and better upload feedback
import React, { useState, useEffect } from 'react';
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
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDialogue } from './hooks/useDialogue';
import { useCharacters } from './hooks/useCharacters';
import { useDatabase } from './hooks/useDatabase';

const App = () => {
  // Database integration
  const databaseHook = useDatabase();
  const {
    isConnected: isDatabaseConnected,
    isLoading: isDatabaseLoading,
    connectionStatus,
    uploadImage,
    getImage,
    saveCharacterToDb,
    loadCharactersFromDb,
    deleteCharacterFromDb,
    saveGameState,
    loadGameState
  } = databaseHook;

  // UI Mode state
  const [isDMMode, setIsDMMode] = useLocalStorage('isDMMode', true);
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
  
  // Current actor state (based on selected token)
  const [currentActor, setCurrentActor] = useState(null);
  const [selectedCharacterForActions, setSelectedCharacterForActions] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState('chat');

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

  // Chat state
  const [chatMessages, setChatMessages] = useLocalStorage('chatMessages', []);
  const [playerMessage, setPlayerMessage] = useState('');
  const [playerName, setPlayerName] = useState('');

  // Load game state from database on startup
  useEffect(() => {
    const loadGameData = async () => {
      if (isDatabaseConnected && !isDatabaseLoading) {
        try {
          console.log('🔄 Loading game data from database...');
          
          // Load characters from database
          const dbCharacters = await loadCharactersFromDb();
          if (dbCharacters.length > 0) {
            console.log(`✅ Loaded ${dbCharacters.length} characters from database`);
            
            // Resolve image references for characters
            const charactersWithImages = await Promise.all(
              dbCharacters.map(async (char) => {
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
            
            setCharacters(charactersWithImages);
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
      }
    };

    loadGameData();
  }, [isDatabaseConnected, isDatabaseLoading]);

  // Auto-save game state to database periodically
  useEffect(() => {
    if (!isDatabaseConnected) return;

    const autoSave = async () => {
      try {
        const gameState = {
          characters,
          terrain,
          customTerrainSprites,
          gridSize,
          chatMessages: chatMessages.slice(-50), // Keep last 50 messages
          combatMessages: combatMessages.slice(-50), // Keep last 50 messages
          isDMMode,
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

    // Auto-save every 30 seconds
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
    isDMMode,
    showGrid,
    showNames,
    gridColor
  ]);

  // Enhanced makeCharacterSpeak that also adds to chat
  const handleMakeCharacterSpeak = (character, text) => {
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

  const handleAddMonster = (monster) => {
    // Find a suitable position on the map
    let x = Math.floor(Math.random() * (gridSize - 5)) + 2;
    let y = Math.floor(Math.random() * (gridSize - 5)) + 2;
    
    // Check if position is occupied and find a nearby free spot
    const occupied = characters.some(char => char.x === x && char.y === y);
    if (occupied) {
      for (let attempts = 0; attempts < 10; attempts++) {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
        if (!characters.some(char => char.x === x && char.y === y)) {
          break;
        }
      }
    }
    
    const monsterWithPosition = { ...monster, x, y };
    const addedMonster = addMonster(monsterWithPosition);
    
    // Add combat log message
    setCombatMessages(prev => [...prev, {
      type: 'spawn',
      text: `${monster.name} appears on the battlefield!`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Enhanced upload handler with better error handling and feedback
  const handleUpload = async (file, result) => {
    try {
      setUploadError(null);
      let finalResult = result;
      
      // If database is connected, upload image to database
      if (isDatabaseConnected && uploadImage) {
        try {
          const fileName = file.name || `${uploadType}_${Date.now()}`;
          console.log(`📤 Uploading ${uploadType} to database:`, fileName);
          
          const imageId = await uploadImage(result, uploadType, fileName);
          
          if (imageId) {
            finalResult = imageId; // Store database ID instead of data URL
            console.log(`✅ Image uploaded to database: ${imageId}`);
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
      
      // Apply the result (either database ID or data URL)
      if (uploadType === 'portrait') {
        setEditingCharacter(prev => ({ ...prev, portrait: finalResult }));
      } else if (uploadType === 'sprite') {
        setEditingCharacter(prev => ({ ...prev, sprite: finalResult }));
      } else if (uploadType === 'terrain') {
        setCustomTerrainSprites(prev => ({
          ...prev,
          [selectedTerrain]: finalResult
        }));
      } else if (uploadType === 'scene') {
        setSceneImage(finalResult);
      }
      
      // Don't automatically close the modal - let the UploadModal handle it
      // setShowUploadModal(false);
      
    } catch (error) {
      console.error('💥 Upload processing failed:', error);
      setUploadError(`Upload failed: ${error.message}`);
      throw error; // Re-throw so UploadModal can handle it
    }
  };

  // Enhanced character update function that saves to database
  const handleCharacterUpdate = async (character) => {
    updateCharacter(character);
    
    // Save to database if connected
    if (isDatabaseConnected) {
      try {
        await saveCharacterToDb(character);
        console.log(`💾 Character ${character.name} saved to database`);
      } catch (error) {
        console.warn(`⚠️ Failed to save character ${character.name} to database:`, error);
      }
    }
  };

  // Enhanced character deletion that removes from database
  const handleCharacterDelete = async (characterId) => {
    deleteCharacter(characterId);
    
    // Delete from database if connected
    if (isDatabaseConnected) {
      try {
        await deleteCharacterFromDb(characterId);
        console.log(`🗑️ Character deleted from database: ${characterId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete character from database:`, error);
      }
    }
  };

  // Rest of the component remains the same...
  // [Previous implementation for combat, UI, etc.]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-full mx-auto p-4 text-white">
        <Header 
          isDMMode={isDMMode}
          onToggleDMMode={() => setIsDMMode(!isDMMode)}
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
        />

        {/* Database Debug Panel - Only in DM mode or when there are issues */}
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

        {/* DM Control Panel - Only visible in DM mode */}
        {isDMMode && (
          <div className="mb-4 transition-all duration-300 ease-in-out">
            <DMControlPanel
              isCollapsed={collapsedPanels.dmControls}
              onToggleCollapse={() => togglePanel('dmControls')}
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
              onAddCharacter={handleAddCharacter}
              paintMode={paintMode}
              selectedTerrain={selectedTerrain}
              onSelectedTerrainChange={setSelectedTerrain}
              customTerrainSprites={customTerrainSprites}
              onClearTerrain={() => setTerrain({})}
              onUpload={openUploadModal}
            />
          </div>
        )}

        {/* Upload Modal with Enhanced Feedback */}
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

        {/* Rest of the UI components... */}
        {/* This would include all your existing map, chat, modals, etc. */}
        {/* For brevity, I'm not repeating the entire component here */}
        
      </div>
    </div>
  );
};

export default App;
