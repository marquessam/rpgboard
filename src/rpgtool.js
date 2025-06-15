import React, { useState, useEffect, useRef } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Send, Users, MessageSquare, Upload, X, Image, Plus, Edit, Trash2, Move, Sword, Shield, Grid3X3, Eye, EyeOff } from 'lucide-react';

const RPGTool = () => {
  // Dialogue State
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [isShaking, setIsShaking] = useState(false);
  const [npcDialogue, setNpcDialogue] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [playerMessage, setPlayerMessage] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [npcName, setNpcName] = useState('Village Elder');
  const [customPortraits, setCustomPortraits] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadEmotion, setUploadEmotion] = useState('neutral');
  
  // Map State
  const [gridSize, setGridSize] = useState(20);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [draggedCharacter, setDraggedCharacter] = useState(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Default portraits
  const defaultPortraits = {
    neutral: '😐', happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
    worried: '😟', excited: '🤩', confused: '😕', suspicious: '🤨', friendly: '😌'
  };

  // Character template
  const newCharacterTemplate = {
    id: Date.now(),
    name: 'New Character',
    portrait: null,
    x: 5,
    y: 5,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    color: '#ff6b6b'
  };

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#fd79a8'];

  // Load/Save state
  useEffect(() => {
    const saved = localStorage.getItem('rpg-complete-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.npcName) setNpcName(state.npcName);
        if (state.customPortraits) setCustomPortraits(state.customPortraits);
        if (state.chatMessages) setChatMessages(state.chatMessages);
        if (state.characters) setCharacters(state.characters);
        if (state.gridSize) setGridSize(state.gridSize);
      } catch (e) {
        console.log('Could not load saved state');
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      npcName, customPortraits, chatMessages, characters, gridSize
    };
    localStorage.setItem('rpg-complete-state', JSON.stringify(state));
  }, [npcName, customPortraits, chatMessages, characters, gridSize]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Typewriter effect
  useEffect(() => {
    if (npcDialogue && isTyping) {
      setDisplayedText('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < npcDialogue.length) {
          setDisplayedText(prev => prev + npcDialogue[index]);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [npcDialogue, isTyping]);

  const getCurrentPortrait = (emotion) => {
    if (customPortraits[emotion]) {
      return <img 
        src={customPortraits[emotion]} 
        alt={emotion}
        className="w-32 h-32 object-cover rounded-full border-4 border-amber-400"
      />;
    }
    return <div className="text-8xl">{defaultPortraits[emotion]}</div>;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (uploadEmotion === 'character-portrait') {
          setEditingCharacter(prev => ({ ...prev, portrait: e.target.result }));
        } else {
          setCustomPortraits(prev => ({ ...prev, [uploadEmotion]: e.target.result }));
        }
        setShowUploadModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNPCSpeak = (text, emotion = 'neutral', shouldShake = false) => {
    setCurrentEmotion(emotion);
    setNpcDialogue(text);
    setIsTyping(true);
    
    if (shouldShake) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }

    setChatMessages(prev => [...prev, {
      type: 'npc', name: npcName, text: text, emotion: emotion,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const rollDice = (notation) => {
    try {
      const match = notation.match(/(\d*)d(\d+)([+-]\d+)?/i);
      if (!match) return null;

      const numDice = parseInt(match[1]) || 1;
      const dieSize = parseInt(match[2]);
      const modifier = parseInt(match[3]) || 0;

      if (numDice > 20 || dieSize > 100) return null;

      const rolls = [];
      let total = 0;
      
      for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * dieSize) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      total += modifier;

      return {
        notation, rolls, modifier, total,
        detail: `${rolls.join(' + ')}${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''} = ${total}`
      };
    } catch (e) {
      return null;
    }
  };

  const handlePlayerMessage = () => {
    if (!playerMessage.trim() || !playerName.trim()) return;

    let messageContent = playerMessage;
    let diceResult = null;

    const diceMatch = playerMessage.match(/\/roll\s+(.+)/i);
    if (diceMatch) {
      diceResult = rollDice(diceMatch[1].trim());
      messageContent = diceResult ? 
        `🎲 Rolled ${diceResult.notation}: ${diceResult.detail}` : 
        `🎲 Invalid dice notation: ${diceMatch[1]}`;
    }

    setChatMessages(prev => [...prev, {
      type: 'player', name: playerName, text: messageContent,
      diceResult: diceResult, timestamp: new Date().toLocaleTimeString()
    }]);

    setPlayerMessage('');
  };

  const addCharacter = () => {
    const newChar = { 
      ...newCharacterTemplate, 
      id: Date.now(),
      color: colors[characters.length % colors.length]
    };
    setCharacters(prev => [...prev, newChar]);
    setEditingCharacter(newChar);
    setShowCharacterModal(true);
  };

  const updateCharacter = (updatedChar) => {
    setCharacters(prev => prev.map(char => 
      char.id === updatedChar.id ? updatedChar : char
    ));
    setEditingCharacter(null);
    setShowCharacterModal(false);
  };

  const deleteCharacter = (id) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
    setShowCharacterModal(false);
    setEditingCharacter(null);
  };

  const handleGridClick = (e) => {
    if (draggedCharacter) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = Math.min(rect.width, rect.height) / gridSize;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    const clickedChar = characters.find(char => char.x === x && char.y === y);
    if (clickedChar) {
      setSelectedCharacter(clickedChar);
      setEditingCharacter(clickedChar);
      setShowCharacterModal(true);
    }
  };

  const handleCharacterDrag = (character, e) => {
    e.preventDefault();
    const rect = e.currentTarget.closest('.battle-grid').getBoundingClientRect();
    const cellSize = Math.min(rect.width, rect.height) / gridSize;

    const handleMouseMove = (moveEvent) => {
      const x = Math.floor((moveEvent.clientX - rect.left) / cellSize);
      const y = Math.floor((moveEvent.clientY - rect.top) / cellSize);
      
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        setCharacters(prev => prev.map(char => 
          char.id === character.id ? { ...char, x, y } : char
        ));
      }
    };

    const handleMouseUp = () => {
      setDraggedCharacter(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    setDraggedCharacter(character.id);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getStatModifier = (stat) => {
    return Math.floor((stat - 10) / 2);
  };

  const quickEmotions = [
    { key: 'neutral', label: 'Neutral' }, { key: 'happy', label: 'Happy' },
    { key: 'angry', label: 'Angry' }, { key: 'surprised', label: 'Surprised' },
    { key: 'worried', label: 'Worried' }, { key: 'friendly', label: 'Friendly' }
  ];

  return (
    <div className="max-w-full mx-auto p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-amber-400">🎭 Complete RPG Tool</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDialogue(!showDialogue)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showDialogue ? 'bg-amber-600' : 'bg-slate-600 hover:bg-slate-500'
            }`}
          >
            {showDialogue ? <EyeOff size={16} /> : <Eye size={16} />} Dialogue
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showGrid ? 'bg-blue-600' : 'bg-slate-600 hover:bg-slate-500'
            }`}
          >
            <Grid3X3 size={16} /> Grid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Battle Map - Takes up most space */}
        <div className="xl:col-span-3">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-amber-300">
                <Sword className="inline mr-2" size={20} />
                Battle Map
              </h2>
              <div className="flex gap-2 items-center">
                <label className="text-sm">Grid Size:</label>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="px-2 py-1 bg-slate-600 rounded text-white text-sm"
                >
                  <option value={10}>10x10</option>
                  <option value={15}>15x15</option>
                  <option value={20}>20x20</option>
                  <option value={25}>25x25</option>
                  <option value={30}>30x30</option>
                </select>
                <button
                  onClick={addCharacter}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus size={16} className="inline mr-1" />
                  Add Character
                </button>
              </div>
            </div>

            {/* Battle Grid */}
            <div className="relative">
              <div 
                className="battle-grid aspect-square w-full max-w-2xl mx-auto bg-slate-800 border border-slate-600 relative cursor-crosshair"
                onClick={handleGridClick}
                style={{
                  backgroundImage: showGrid ? `
                    linear-gradient(to right, rgba(148, 163, 184, 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
                  ` : 'none',
                  backgroundSize: `${100/gridSize}% ${100/gridSize}%`
                }}
              >
                {/* Characters */}
                {characters.map(character => (
                  <div
                    key={character.id}
                    className="absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                    style={{
                      left: `${(character.x + 0.5) * (100/gridSize)}%`,
                      top: `${(character.y + 0.5) * (100/gridSize)}%`,
                      zIndex: draggedCharacter === character.id ? 50 : 10
                    }}
                    onMouseDown={(e) => handleCharacterDrag(character, e)}
                    title={character.name}
                  >
                    {character.portrait ? (
                      <img
                        src={character.portrait}
                        alt={character.name}
                        className="w-8 h-8 rounded-full border-2 object-cover"
                        style={{ borderColor: character.color }}
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                        style={{ 
                          backgroundColor: character.color,
                          borderColor: character.color,
                          color: 'white'
                        }}
                      >
                        {character.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Character List */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {characters.map(character => (
                <button
                  key={character.id}
                  onClick={() => {
                    setSelectedCharacter(character);
                    setEditingCharacter(character);
                    setShowCharacterModal(true);
                  }}
                  className="p-2 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: character.color }}
                    />
                    <span className="truncate">{character.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dialogue & Chat Panel */}
        <div className="xl:col-span-1">
          {showDialogue && (
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-amber-300 mb-3">NPC Dialogue</h3>
              
              <div className="text-center mb-3">
                <div className={`transition-all duration-300 flex justify-center ${
                  isShaking ? 'animate-bounce' : ''
                }`}>
                  {getCurrentPortrait(currentEmotion)}
                </div>
                <div className="mt-1 text-amber-300 font-semibold">{npcName}</div>
              </div>

              <div className="grid grid-cols-3 gap-1 mb-3">
                {quickEmotions.map((emotion) => (
                  <button
                    key={emotion.key}
                    onClick={() => setCurrentEmotion(emotion.key)}
                    className={`p-1 rounded text-xs transition-colors ${
                      currentEmotion === emotion.key 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                    }`}
                  >
                    {defaultPortraits[emotion.key]}
                  </button>
                ))}
              </div>

              <textarea
                value={npcDialogue}
                onChange={(e) => setNpcDialogue(e.target.value)}
                placeholder="NPC dialogue..."
                className="w-full h-16 p-2 bg-slate-600 rounded border border-slate-500 text-white resize-none text-sm"
              />

              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => handleNPCSpeak(npcDialogue, currentEmotion, false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors text-xs"
                  disabled={!npcDialogue.trim()}
                >
                  💬
                </button>
                <button
                  onClick={() => handleNPCSpeak(npcDialogue, currentEmotion, true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors text-xs"
                  disabled={!npcDialogue.trim()}
                >
                  💥
                </button>
              </div>

              {displayedText && (
                <div className="mt-3 p-2 bg-slate-800 rounded border-l-2 border-amber-500">
                  <div className="text-amber-300 font-semibold text-xs mb-1">{npcName}:</div>
                  <div className="text-sm">
                    {displayedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">
              <Users className="inline mr-2" size={16} />
              Chat
            </h3>

            <div className="bg-slate-800 rounded p-2 mb-3 h-48 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-slate-400 text-center py-4 text-sm">
                  Chat will appear here...
                </div>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`${
                      message.type === 'npc' ? 'bg-amber-900/30' : 'bg-blue-900/30'
                    } p-2 rounded`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`font-semibold text-xs ${
                          message.type === 'npc' ? 'text-amber-300' : 'text-blue-300'
                        }`}>
                          {message.name}
                        </span>
                        <span className="text-xs text-slate-400">{message.timestamp}</span>
                      </div>
                      <div className="text-slate-100 text-sm">{message.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Character name"
                className="w-full px-2 py-1 bg-slate-600 rounded border border-slate-500 text-white text-sm"
              />
              <div className="flex gap-1">
                <input
                  type="text"
                  value={playerMessage}
                  onChange={(e) => setPlayerMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePlayerMessage()}
                  placeholder="Message or /roll 1d20..."
                  className="flex-1 px-2 py-1 bg-slate-600 rounded border border-slate-500 text-white text-sm"
                />
                <button
                  onClick={handlePlayerMessage}
                  disabled={!playerMessage.trim() || !playerName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-2 py-1 rounded transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Modal */}
      {showCharacterModal && editingCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-700 p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-amber-300 mb-4">
              {editingCharacter.name || 'Character Details'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingCharacter.name}
                  onChange={(e) => setEditingCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-600 rounded border border-slate-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Portrait</label>
                <div className="flex items-center gap-2">
                  {editingCharacter.portrait && (
                    <img
                      src={editingCharacter.portrait}
                      alt="Character"
                      className="w-16 h-16 object-cover rounded border-2"
                      style={{ borderColor: editingCharacter.color }}
                    />
                  )}
                  <button
                    onClick={() => {
                      setUploadEmotion('character-portrait');
                      setShowUploadModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors text-sm"
                  >
                    <Upload size={14} className="inline mr-1" />
                    Upload
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingCharacter(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded border-2 ${
                        editingCharacter.color === color ? 'border-white' : 'border-slate-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
                  <div key={stat}>
                    <label className="block text-sm font-medium mb-1 capitalize">{stat}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={editingCharacter[stat]}
                        onChange={(e) => setEditingCharacter(prev => ({ 
                          ...prev, 
                          [stat]: parseInt(e.target.value) || 10 
                        }))}
                        className="w-16 px-2 py-1 bg-slate-600 rounded border border-slate-500 text-white text-center"
                      />
                      <span className="text-sm text-slate-300">
                        ({getStatModifier(editingCharacter[stat]) >= 0 ? '+' : ''}{getStatModifier(editingCharacter[stat])})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => deleteCharacter(editingCharacter.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                <Trash2 size={16} className="inline mr-1" />
                Delete
              </button>
              <button
                onClick={() => setShowCharacterModal(false)}
                className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateCharacter(editingCharacter)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-700 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-4">
              Upload Image
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full p-2 bg-slate-600 rounded border border-slate-500 text-white mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPGTool;
