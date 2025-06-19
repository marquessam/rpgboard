// src/App.jsx - Your working implementation with fixed database integration
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
  // Database integration with fixed architecture
  const databaseHook = useDatabase();
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

  const handleAttack = (combatResult, targetId, damage) => {
    // Add attack to combat log
    setCombatMessages(prev => [...prev, {
      ...combatResult,
      type: combatResult.type || 'attack',
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Apply damage or healing
    if (targetId) {
      const target = characters.find(char => char.id === targetId);
      if (target) {
        const oldHp = target.hp || target.maxHp;
        let newHp;
        
        if (damage < 0) {
          // Healing (negative damage)
          newHp = Math.min(oldHp - damage, target.maxHp);
          updateCharacter({ ...target, hp: newHp });
          
          setCombatMessages(prev => [...prev, {
            type: 'healing',
            target: target.name,
            amount: -damage,
            oldHp,
            newHp,
            timestamp: new Date().toLocaleTimeString()
          }]);
        } else if (damage > 0) {
          // Damage
          newHp = Math.max(0, oldHp - damage);
          updateCharacter({ ...target, hp: newHp });
          
          setCombatMessages(prev => [...prev, {
            type: 'damage',
            target: target.name,
            amount: damage,
            damageType: combatResult.damageType,
            oldHp,
            newHp,
            timestamp: new Date().toLocaleTimeString()
          }]);

          // Check for death
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
    // Add spell to combat log
    setCombatMessages(prev => [...prev, {
      ...spellResult,
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Apply spell effects (reuse attack handler for damage/healing)
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
    
    // Set as current actor for living characters
    if (!isDead) {
      setCurrentActor(character);
      setSelectedCharacterForActions(character);
      
      // Auto-populate chat name if not already set
      if (!playerName || playerName === '') {
        setPlayerName(character.name);
      }
    } else if (isDead && character.isMonster) {
      // Show loot modal for dead monsters
      setLootingCharacter(character);
      setShowLootModal(true);
    }
  };

  // Updated loot handling to use currentActor properly and handle currency
  const handleTakeLoot = (lootItems) => {
    // If no character is selected, try to use the first living non-monster character
    let receivingCharacter = currentActor;
    
    if (!receivingCharacter || (receivingCharacter.hp !== undefined ? receivingCharacter.hp : receivingCharacter.maxHp) <= 0) {
      // Find the first living non-monster character
      receivingCharacter = characters.find(char => {
        const hp = char.hp !== undefined ? char.hp : char.maxHp;
        return hp > 0 && !char.isMonster;
      });
      
      if (!receivingCharacter) {
        alert('No living character available to receive loot! Please select a living character first.');
        return;
      }
    }

    // Separate currency from regular items
    const regularItems = [];
    const currencyToAdd = { copper: 0, silver: 0, gold: 0 };

    lootItems.forEach(item => {
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
          source: lootingCharacter.name,
          dateObtained: new Date().toLocaleString(),
          id: `loot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }
    });

    // Update character with new items and currency
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

    updateCharacter(updatedCharacter);
    
    // Update current actor if it's the same character
    if (currentActor && currentActor.id === receivingCharacter.id) {
      setCurrentActor(updatedCharacter);
    }

    // Add loot to combat log
    const lootSummary = [];
    if (regularItems.length > 0) {
      lootSummary.push(`${regularItems.length} items`);
    }
    if (currencyToAdd.copper > 0) lootSummary.push(`${currencyToAdd.copper} cp`);
    if (currencyToAdd.silver > 0) lootSummary.push(`${currencyToAdd.silver} sp`);
    if (currencyToAdd.gold > 0) lootSummary.push(`${currencyToAdd.gold} gp`);

    setCombatMessages(prev => [...prev, {
      type: 'loot',
      text: `${receivingCharacter.name} looted ${lootSummary.join(', ')} from ${lootingCharacter.name}`,
      items: lootItems.map(item => `${item.name} x${item.actualQuantity}`),
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Mark the character as looted
    updateCharacter({
      ...lootingCharacter,
      looted: true
    });
    
    // Show success message
    setChatMessages(prev => [...prev, {
      type: 'system',
      name: 'System',
      text: `${receivingCharacter.name} obtained ${lootSummary.join(', ')} from ${lootingCharacter.name}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearCombatLog = () => {
    setCombatMessages([]);
  };

  const addSpellToCharacter = (characterId, spell) => {
    const character = characters.find(c => c.id === characterId);
    if (character) {
      updateCharacter({
        ...character,
        spells: [...(character.spells || []), spell]
      });
    }
  };

  const removeSpellFromCharacter = (characterId, spellIndex) => {
    const character = characters.find(c => c.id === characterId);
    if (character) {
      updateCharacter({
        ...character,
        spells: (character.spells || []).filter((_, index) => index !== spellIndex)
      });
    }
  };

  const handleCombatMessage = (message) => {
    setCombatMessages(prev => [...prev, message]);
  };

  const togglePanel = (panelId) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
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

  // Enhanced upload handler with database integration
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
      
    } catch (error) {
      console.error('💥 Upload processing failed:', error);
      setUploadError(`Upload failed: ${error.message}`);
      throw error;
    }
  };

  // Define which panels are available to everyone vs DM-only
  const sharedTabs = ['actions', 'conditions', 'spells', 'inventory']; // Everyone gets these
  const dmOnlyTabs = ['initiative']; // Only DM gets these
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
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
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
              onGridSizeChange={setGridSize}
              characters={characters}
              onAddCharacter={handleAddCharacter}
              onEditCharacter={(char) => {
                setEditingCharacter(char);
                setShowCharacterModal(true);
              }}
              onSelectCharacter={handleCharacterSelect}
              selectedCharacter={selectedCharacterForActions}
              onMakeCharacterSpeak={handleMakeCharacterSpeak}
              onMoveCharacter={moveCharacter}
              terrain={terrain}
              onTerrainChange={isDMMode ? setTerrain : null}
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
            
            {/* Character Control Panel - Everyone Gets This */}
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
                  {/* Database status indicator */}
                  {isDatabaseConnected && (
                    <span className="ml-3 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
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

            {/* DM Tools Panel - DM Only */}
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

            {/* Chat and Log Panel - Always Visible */}
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
            onSave={(savedCharacter) => {
              handleCharacterUpdate(savedCharacter);
              // Update current actor if it's the same character
              if (currentActor && currentActor.id === savedCharacter.id) {
                setCurrentActor(savedCharacter);
              }
              setShowCharacterModal(false);
              setEditingCharacter(null);
            }}
            onDelete={(characterId) => {
              handleCharacterDelete(characterId);
              // Clear current actor if it was deleted
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
