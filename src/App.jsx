// src/App.jsx - Clean rewrite with no syntax errors
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
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDialogue } from './hooks/useDialogue';
import { useCharacters } from './hooks/useCharacters';

const App = () => {
  // Global state
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLootModal, setShowLootModal] = useState(false);
  const [lootingCharacter, setLootingCharacter] = useState(null);
  const [uploadType, setUploadType] = useState('sprite');
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [selectedCharacterForActions, setSelectedCharacterForActions] = useState(null);
  const [activeTab, setActiveTab] = useState('actions');

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
    console.log('handleAddCharacter called');
    const newChar = addCharacter();
    console.log('New character created:', newChar);
    setEditingCharacter(newChar);
    setShowCharacterModal(true);
  };

  const handleAddMonster = (monster) => {
    console.log('handleAddMonster called with:', monster);
    
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
    console.log('Adding monster with position:', monsterWithPosition);
    
    // Use addMonster instead of updateCharacter
    const addedMonster = addMonster(monsterWithPosition);
    
    // Add combat log message
    setCombatMessages(prev => [...prev, {
      type: 'spawn',
      text: `${monster.name} appears on the battlefield!`,
      timestamp: new Date().toLocaleTimeString()
    }]);

    console.log('Monster added successfully:', addedMonster);
  };

  const handleAttack = (combatResult, targetId, damage) => {
    console.log('handleAttack called:', combatResult, targetId, damage);
    
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
      console.error('Character is null or undefined');
      return;
    }

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
    // Dead player characters don't do anything special for now
  };

  const handleTakeLoot = (lootItems) => {
    // Add loot to combat log
    setCombatMessages(prev => [...prev, {
      type: 'loot',
      text: `Looted ${lootItems.length} items from ${lootingCharacter.name}`,
      items: lootItems.map(item => `${item.name} x${item.actualQuantity}`),
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Mark the character as looted (could add a 'looted' property)
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

  const renderRightPanel = () => {
    const tabs = [
      { id: 'actions', name: 'Actions', icon: '⚔️' },
      { id: 'conditions', name: 'Conditions', icon: '🎭' },
      { id: 'spells', name: 'Spells', icon: '✨' },
      { id: 'initiative', name: 'Initiative', icon: '🎲' }
    ];

    return (
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-2">
          <div className="grid grid-cols-2 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 border border-blue-400 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'actions' && (
          <ActionPanel
            selectedCharacter={selectedCharacterForActions}
            characters={characters}
            onAttack={handleAttack}
            onClearSelection={() => setSelectedCharacterForActions(null)}
          />
        )}

        {activeTab === 'conditions' && (
          <ConditionsPanel
            selectedCharacter={selectedCharacterForActions}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            onClearSelection={() => setSelectedCharacterForActions(null)}
          />
        )}

        {activeTab === 'spells' && (
          <SpellPanel
            selectedCharacter={selectedCharacterForActions}
            characters={characters}
            onCastSpell={handleCastSpell}
            onAddSpell={addSpellToCharacter}
            onRemoveSpell={removeSpellFromCharacter}
            onClearSelection={() => setSelectedCharacterForActions(null)}
          />
        )}

        {activeTab === 'initiative' && (
          <InitiativeTracker
            characters={characters}
            onUpdateCharacter={updateCharacter}
            onCombatMessage={handleCombatMessage}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-full mx-auto p-6 text-white">
        <Header 
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

        <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
          {/* Left Panel - Monsters */}
          <div className="xl:col-span-1">
            <MonsterPanel onAddMonster={handleAddMonster} />
          </div>

          {/* Center Panel - Battle Map */}
          <div className="xl:col-span-3">
            <BattleMap
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
              characters={characters}
              onAddCharacter={handleAddCharacter}
              onEditCharacter={(char) => {
                console.log('Opening character sheet for:', char);
                if (!char) {
                  console.error('Character is null or undefined');
                  return;
                }
                setEditingCharacter(char);
                setShowCharacterModal(true);
              }}
              onSelectCharacter={handleCharacterSelect}
              selectedCharacter={selectedCharacterForActions}
              onMakeCharacterSpeak={handleMakeCharacterSpeak}
              onMoveCharacter={moveCharacter}
              terrain={terrain}
              onTerrainChange={setTerrain}
              customTerrainSprites={customTerrainSprites}
              paintMode={paintMode}
              selectedTerrain={selectedTerrain}
              onSelectedTerrainChange={setSelectedTerrain}
              showGrid={showGrid}
              gridColor={gridColor}
              showNames={showNames}
              onUpload={openUploadModal}
            />
          </div>

          {/* Right Panel - Combat Tools and Chat */}
          <div className="xl:col-span-2 space-y-6">
            {renderRightPanel()}
            
            <ChatPanel
              chatMessages={chatMessages}
              onAddMessage={setChatMessages}
              playerMessage={playerMessage}
              onPlayerMessageChange={setPlayerMessage}
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
              characters={characters}
              onMakeCharacterSpeak={handleMakeCharacterSpeak}
            />
            
            <CombatLog
              combatMessages={combatMessages}
              onClearLog={clearCombatLog}
            />
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
            onSave={(savedCharacter) => {
              console.log('Saving character from modal:', savedCharacter);
              updateCharacter(savedCharacter);
              setShowCharacterModal(false);
              setEditingCharacter(null);
            }}
            onDelete={(characterId) => {
              deleteCharacter(characterId);
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

        {showSceneModal && (
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
