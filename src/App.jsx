// src/App.jsx - Enhanced with DM/Player mode separation and polished UI
import React, { useState } from 'react';
import Header from './components/UI/Header';
import BattleMap from './components/BattleMap/BattleMap';
import ChatPanel from './components/Chat/ChatPanel';
import SimpleCharacterModal from './components/Character/SimpleCharacterModal';
import DialoguePopup from './components/Dialogue/DialoguePopup';
import SceneDisplay from './components/Scene/SceneDisplay';
import SceneModal from './components/Scene/SceneModal';
import UploadModal from './components/UI/UploadModal';
import MonsterPanel from './components/Monster/MonsterPanel';
import ActionPanel from './components/Combat/ActionPanel';
import CombatLog from './components/Combat/CombatLog';
import InitiativeTracker from './components/Combat/InitiativeTracker';
import ConditionsPanel from './components/Combat/ConditionsPanel';
import SpellPanel from './components/Combat/SpellPanel';
import LootModal from './components/Combat/LootModal';
import DMControlPanel from './components/UI/DMControlPanel';
import DMControlPanel from './components/UI/DMControlPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDialogue } from './hooks/useDialogue';
import { useCharacters } from './hooks/useCharacters';

const App = () => {
  // UI Mode state
  const [isDMMode, setIsDMMode] = useLocalStorage('isDMMode', true);
  const [collapsedPanels, setCollapsedPanels] = useLocalStorage('collapsedPanels', {});

  // Global state
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLootModal, setShowLootModal] = useState(false);
  const [lootingCharacter, setLootingCharacter] = useState(null);
  const [uploadType, setUploadType] = useState('sprite');
  const [editingCharacter, setEditingCharacter] = useState(null);
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
    damageCharacter
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
    if (!character) return;

    const currentHp = character.hp !== undefined ? character.hp : character.maxHp;
    const isDead = currentHp <= 0;
    
    if (isDead && character.isMonster) {
      // Show loot modal for dead monsters
      setLootingCharacter(character);
      setShowLootModal(true);
    } else if (!isDead) {
      // Regular selection for living characters
      setSelectedCharacterForActions(character);
    }
  };

  const handleTakeLoot = (lootItems) => {
    // Add loot to combat log
    setCombatMessages(prev => [...prev, {
      type: 'loot',
      text: `Looted ${lootItems.length} items from ${lootingCharacter.name}`,
      items: lootItems.map(item => `${item.name} x${item.actualQuantity}`),
      timestamp: new Date().toLocaleTimeString()
    }]);

    updateCharacter({
      ...lootingCharacter,
      looted: true
    });
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

  // Define which panels are DM-only
  const dmOnlyTabs = ['actions', 'conditions', 'spells', 'initiative'];
  const availableRightTabs = [
    { id: 'chat', name: 'Chat', icon: '💬', playerVisible: true },
    { id: 'actions', name: 'Actions', icon: '⚔️', playerVisible: false },
    { id: 'conditions', name: 'Conditions', icon: '🎭', playerVisible: false },
    { id: 'spells', name: 'Spells', icon: '✨', playerVisible: false },
    { id: 'initiative', name: 'Initiative', icon: '🎲', playerVisible: false },
    { id: 'log', name: 'Combat Log', icon: '📜', playerVisible: true }
  ].filter(tab => isDMMode || tab.playerVisible);

  const renderRightPanelContent = () => {
    switch (activeRightTab) {
      case 'chat':
        return (
          <ChatPanel
            chatMessages={chatMessages}
            onAddMessage={setChatMessages}
            playerMessage={playerMessage}
            onPlayerMessageChange={setPlayerMessage}
            playerName={playerName}
            onPlayerNameChange={setPlayerName}
            characters={characters}
            onMakeCharacterSpeak={handleMakeCharacterSpeak}
            autoScroll={false} // Disable auto-scroll for dialogue
          />
        );
      case 'actions':
        return (
          <ActionPanel
            selectedCharacter={selectedCharacterForActions}
            characters={characters}
            onAttack={handleAttack}
            onClearSelection={() => setSelectedCharacterForActions(null)}
          />
        );
      case 'conditions':
        return (
          <ConditionsPanel
            selectedCharacter={selectedCharacterForActions}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            onClearSelection={() => setSelectedCharacterForActions(null)}
          />
        );
      case 'spells':
        return (
          <SpellPanel
            selectedCharacter={selectedCharacterForActions}
            characters={characters}
            onCastSpell={handleCastSpell}
            onAddSpell={addSpellToCharacter}
            onRemoveSpell={removeSpellFromCharacter}
            onClearSelection={() => setSelectedCharacterForActions(null)}
          />
        );
      case 'initiative':
        return (
          <InitiativeTracker
            characters={characters}
            onUpdateCharacter={updateCharacter}
            onCombatMessage={handleCombatMessage}
          />
        );
      case 'log':
        return (
          <CombatLog
            combatMessages={combatMessages}
            onClearLog={clearCombatLog}
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
        />

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
              onAddCharacter={isDMMode ? handleAddCharacter : null}
              onEditCharacter={(char) => {
                if (!isDMMode) return; // Only DM can edit
                setEditingCharacter(char);
                setShowCharacterModal(true);
              }}
              onSelectCharacter={handleCharacterSelect}
              selectedCharacter={selectedCharacterForActions}
              onMakeCharacterSpeak={handleMakeCharacterSpeak}
              onMoveCharacter={isDMMode ? moveCharacter : ((id, x, y) => {
                // Players can only move non-monsters
                const character = characters.find(c => c.id === id);
                if (character && !character.isMonster) {
                  moveCharacter(id, x, y);
                }
              })}
              terrain={terrain}
              onTerrainChange={isDMMode ? setTerrain : null}
              customTerrainSprites={customTerrainSprites}
              paintMode={isDMMode ? paintMode : false}
              selectedTerrain={selectedTerrain}
              onSelectedTerrainChange={setSelectedTerrain}
              showGrid={showGrid}
              gridColor={gridColor}
              showNames={showNames}
              onUpload={isDMMode ? openUploadModal : null}
              isDMMode={isDMMode}
            />
          </div>

          {/* Right Panel - Split between Tools and Chat/Log */}
          <div className={`transition-all duration-300 ease-in-out ${isDMMode ? 'xl:col-span-2' : 'xl:col-span-2'} space-y-4`}>
            
            {/* Combat Tools Panel - DM Only */}
            {isDMMode && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-slate-700">
                  <div className="flex overflow-x-auto">
                    {dmOnlyTabs.map(tab => {
                      const tabInfo = availableRightTabs.find(t => t.id === tab);
                      if (!tabInfo) return null;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveRightTab(tab)}
                          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                            activeRightTab === tab
                              ? 'bg-slate-700/50 border-blue-500 text-blue-300'
                              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                          }`}
                        >
                          <span className="mr-2">{tabInfo.icon}</span>
                          {tabInfo.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="transition-all duration-200 ease-in-out">
                  {renderRightPanelContent()}
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
                        ? 'bg-slate-700/50 border-blue-500 text-blue-300'
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
                        ? 'bg-slate-700/50 border-blue-500 text-blue-300'
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
              updateCharacter(savedCharacter);
              setShowCharacterModal(false);
              setEditingCharacter(null);
            }}
            onDelete={(characterId) => {
              // Only DM can delete, or players can delete their own non-monster characters
              if (isDMMode || !editingCharacter.isMonster) {
                deleteCharacter(characterId);
                setShowCharacterModal(false);
                setEditingCharacter(null);
              }
            }}
            onClose={() => {
              setShowCharacterModal(false);
              setEditingCharacter(null);
            }}
            onUpload={isDMMode ? openUploadModal : null}
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

        {showUploadModal && isDMMode && (
          <UploadModal
            uploadType={uploadType}
            onUpload={(file, result) => {
              if (uploadType === 'portrait') {
                setEditingCharacter(prev => ({ ...prev, portrait: result }));
              } else if (uploadType === 'sprite') {
                setEditingCharacter(prev => ({ ...prev, sprite: result }));
              } else if (uploadType === 'terrain') {
                setCustomTerrainSprites(prev => ({
                  ...prev,
                  [selectedTerrain]: result
                }));
              } else if (uploadType === 'scene') {
                setSceneImage(result);
              }
              setShowUploadModal(false);
            }}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
