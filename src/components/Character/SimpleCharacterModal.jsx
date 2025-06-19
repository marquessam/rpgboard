// src/components/Character/SimpleCharacterModal.jsx - Fixed with proper image display
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, X, Plus, Sword, Sparkles, Heart } from 'lucide-react';
import { colorOptions, borderColorOptions } from '../../utils/constants';
import { getStatModifier, getHealthColor } from '../../utils/helpers';

const SimpleCharacterModal = ({
  character,
  characters = [],
  isDMMode = true,
  onSave,
  onDelete,
  onClose,
  onUpload,
  onAttack,
  onCastSpell,
  // Add these props to get database image resolution
  isDatabaseConnected = false,
  getImage = null
}) => {
  // Safely handle character data
  const safeCharacter = character || {
    id: Date.now(),
    name: 'New Character',
    hp: 20,
    maxHp: 20,
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    ac: 10,
    proficiencyBonus: 2,
    speed: 30,
    color: '#6366f1',
    borderColor: '#ffffff',
    actions: [],
    spells: [],
    conditions: [],
    x: 0,
    y: 0
  };

  const [editingCharacter, setEditingCharacter] = useState(safeCharacter);
  const [activeTab, setActiveTab] = useState('stats');
  
  // State for resolved images
  const [resolvedSprite, setResolvedSprite] = useState(null);
  const [resolvedPortrait, setResolvedPortrait] = useState(null);
  const [loadingSprite, setLoadingSprite] = useState(false);
  const [loadingPortrait, setLoadingPortrait] = useState(false);

  // Sync with prop changes (for when uploads complete)
  useEffect(() => {
    console.log('🔄 Character prop changed:', { 
      propCharacter: character?.id, 
      editingCharacter: editingCharacter?.id,
      propSprite: character?.sprite?.substring?.(0, 50),
      propPortrait: character?.portrait?.substring?.(0, 50)
    });
    
    if (character && character.id === editingCharacter.id) {
      console.log('✅ Syncing modal state with prop changes');
      setEditingCharacter(character);
    }
  }, [character]);

  // Helper function to check if an image reference is a database ID
  const isDatabaseImageId = (imageRef) => {
    return imageRef && typeof imageRef === 'string' && imageRef.startsWith('img_');
  };

  // Helper function to resolve image data
  const resolveImageData = async (imageReference) => {
    if (!imageReference) return null;
    
    // If it's already a data URL, return as-is
    if (imageReference.startsWith('data:')) {
      return imageReference;
    }
    
    // If it's a database ID and we're connected, fetch the image
    if (isDatabaseImageId(imageReference) && isDatabaseConnected && getImage) {
      try {
        const imageData = await getImage(imageReference);
        return imageData || null;
      } catch (error) {
        console.warn('Failed to resolve image:', error);
        return null;
      }
    }
    
    return imageReference;
  };

  // Resolve images when character changes
  useEffect(() => {
    const resolveImages = async () => {
      // Resolve sprite
      if (editingCharacter.sprite) {
        // If it's already a data URL, use it directly
        if (editingCharacter.sprite.startsWith('data:')) {
          setResolvedSprite(editingCharacter.sprite);
          setLoadingSprite(false);
        } else if (isDatabaseImageId(editingCharacter.sprite)) {
          setLoadingSprite(true);
          const resolved = await resolveImageData(editingCharacter.sprite);
          setResolvedSprite(resolved);
          setLoadingSprite(false);
        } else {
          setResolvedSprite(editingCharacter.sprite);
          setLoadingSprite(false);
        }
      } else {
        setResolvedSprite(null);
        setLoadingSprite(false);
      }

      // Resolve portrait
      if (editingCharacter.portrait) {
        // If it's already a data URL, use it directly
        if (editingCharacter.portrait.startsWith('data:')) {
          setResolvedPortrait(editingCharacter.portrait);
          setLoadingPortrait(false);
        } else if (isDatabaseImageId(editingCharacter.portrait)) {
          setLoadingPortrait(true);
          const resolved = await resolveImageData(editingCharacter.portrait);
          setResolvedPortrait(resolved);
          setLoadingPortrait(false);
        } else {
          setResolvedPortrait(editingCharacter.portrait);
          setLoadingPortrait(false);
        }
      } else {
        setResolvedPortrait(null);
        setLoadingPortrait(false);
      }
    };

    resolveImages();
  }, [editingCharacter.sprite, editingCharacter.portrait, isDatabaseConnected, getImage]);

  const handleSave = () => {
    try {
      onSave(editingCharacter);
      onClose();
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Error saving character. Please try again.');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${editingCharacter.name}?`)) {
      try {
        onDelete(editingCharacter.id);
        onClose();
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('Error deleting character. Please try again.');
      }
    }
  };

  // Safe HP calculation
  const currentHp = editingCharacter.hp !== undefined ? editingCharacter.hp : editingCharacter.maxHp;
  const maxHp = editingCharacter.maxHp || 20;
  const isAlive = currentHp > 0;

  // Safe calculations
  const safeGetStatModifier = (stat) => {
    try {
      return getStatModifier(stat || 10);
    } catch {
      return 0;
    }
  };

  const canEdit = true;
  const canDelete = true;

  const tabs = [
    { id: 'stats', name: 'Stats', icon: '📊' },
    { id: 'actions', name: 'Actions', icon: '⚔️' },
    { id: 'spells', name: 'Spells', icon: '✨' },
    { id: 'notes', name: 'Notes', icon: '📝' }
  ];

  // Image display component
  const ImageDisplay = ({ src, loading, alt, className, placeholder }) => {
    // Debug logging
    useEffect(() => {
      console.log(`ImageDisplay: ${alt}`, { src, loading });
    }, [src, loading, alt]);

    if (loading) {
      return (
        <div className={`flex items-center justify-center bg-slate-700 animate-pulse ${className}`}>
          <div className="text-slate-400 text-xs">Loading...</div>
        </div>
      );
    }

    if (src) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={(e) => {
            console.error(`Failed to load image: ${alt}`, src);
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          onLoad={() => {
            console.log(`Successfully loaded image: ${alt}`, src);
          }}
        />
      );
    }

    return (
      <div className={`flex items-center justify-center bg-slate-700 ${className}`}>
        <div className="text-slate-400 text-xs">{placeholder}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border-2"
                style={{ 
                  backgroundColor: editingCharacter.color,
                  borderColor: editingCharacter.borderColor
                }}
              />
              <h3 className="text-xl font-bold text-slate-100">
                {editingCharacter.name || 'New Character'}
                {!isAlive && <span className="ml-2 text-red-400">💀</span>}
                {editingCharacter.isMonster && (
                  <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                    Monster
                  </span>
                )}
              </h3>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4 text-sm">
              <span className="text-slate-300">
                AC: <span className="text-white font-medium">{editingCharacter.ac || 10}</span>
              </span>
              <span className="text-slate-300">
                HP: <span className="text-white font-medium">{currentHp}/{maxHp}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
              Full Access
            </span>
            {isDatabaseConnected && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                ☁️ Cloud Sync
              </span>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={editingCharacter.name}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Level</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingCharacter.level || 1}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Images with proper resolution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Sprite (Grid Token)</label>
                  <div className="flex flex-col gap-2">
                    <div className="w-16 h-16 mx-auto">
                      <ImageDisplay
                        src={resolvedSprite}
                        loading={loadingSprite}
                        alt="Character sprite"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-600"
                        placeholder="No Sprite"
                      />
                      <div className="w-16 h-16 flex items-center justify-center bg-slate-700 rounded-lg border border-slate-600" style={{ display: 'none' }}>
                        <div className="text-slate-400 text-xs">No Sprite</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onUpload && onUpload('sprite')}
                      disabled={!onUpload}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 px-3 py-2 rounded text-white transition-colors text-sm"
                    >
                      <Upload size={14} className="inline mr-1" />
                      Upload Sprite
                    </button>
                    {isDatabaseImageId(editingCharacter.sprite) && (
                      <div className="text-xs text-blue-300 text-center">Cloud Image</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-2">Portrait (Dialogue)</label>
                  <div className="flex flex-col gap-2">
                    <div className="w-16 h-16 mx-auto">
                      <ImageDisplay
                        src={resolvedPortrait}
                        loading={loadingPortrait}
                        alt="Character portrait"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-600"
                        placeholder="No Portrait"
                      />
                      <div className="w-16 h-16 flex items-center justify-center bg-slate-700 rounded-lg border border-slate-600" style={{ display: 'none' }}>
                        <div className="text-slate-400 text-xs">No Portrait</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onUpload && onUpload('portrait')}
                      disabled={!onUpload}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 px-3 py-2 rounded text-white transition-colors text-sm"
                    >
                      <Upload size={14} className="inline mr-1" />
                      Upload Portrait
                    </button>
                    {isDatabaseImageId(editingCharacter.portrait) && (
                      <div className="text-xs text-blue-300 text-center">Cloud Image</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ability Scores */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Ability Scores</h4>
                <div className="grid grid-cols-3 gap-4">
                  {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => (
                    <div key={stat} className="text-center">
                      <label className="block text-slate-300 font-medium mb-1 uppercase text-sm">
                        {stat}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={editingCharacter[stat] || 10}
                        onChange={(e) => setEditingCharacter(prev => ({ 
                          ...prev, 
                          [stat]: parseInt(e.target.value) || 10
                        }))}
                        className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center text-lg font-bold focus:border-blue-500"
                      />
                      <div className="text-sm text-slate-400 mt-1">
                        {safeGetStatModifier(editingCharacter[stat]) >= 0 ? '+' : ''}{safeGetStatModifier(editingCharacter[stat])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combat Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Armor Class</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editingCharacter.ac || 10}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, ac: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Hit Points</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      min="0"
                      placeholder="Current"
                      value={currentHp}
                      onChange={(e) => setEditingCharacter(prev => ({ ...prev, hp: parseInt(e.target.value) || 0 }))}
                      className="px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center focus:border-blue-500"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Max"
                      value={maxHp}
                      onChange={(e) => setEditingCharacter(prev => ({ ...prev, maxHp: parseInt(e.target.value) || 20 }))}
                      className="px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Speed</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCharacter.speed || 30}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, speed: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Prof. Bonus</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editingCharacter.proficiencyBonus || 2}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, proficiencyBonus: parseInt(e.target.value) || 2 }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Health Bar */}
              <div className="w-full h-4 bg-slate-600 rounded overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${(currentHp / maxHp) * 100}%`,
                    backgroundColor: getHealthColor(currentHp, maxHp)
                  }}
                />
              </div>

              {/* Appearance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Token Color</label>
                  <select
                    value={editingCharacter.color}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Border Color</label>
                  <select
                    value={editingCharacter.borderColor}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, borderColor: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    {borderColorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-white">Combat Actions</h4>
                <button
                  onClick={() => {
                    const name = prompt('Action name:');
                    if (name) {
                      setEditingCharacter(prev => ({
                        ...prev,
                        actions: [...(prev.actions || []), {
                          name,
                          attackBonus: prev.proficiencyBonus + safeGetStatModifier(prev.str),
                          damageRoll: '1d8',
                          damageType: 'slashing',
                          range: 'melee'
                        }]
                      }));
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-sm"
                >
                  <Plus size={14} className="inline mr-1" />
                  Add Action
                </button>
              </div>

              <div className="space-y-2">
                {(editingCharacter.actions || []).map((action, index) => (
                  <div key={index} className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">{action.name}</div>
                        <div className="text-sm text-slate-300">
                          +{action.attackBonus} to hit • {action.damageRoll} {action.damageType}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingCharacter(prev => ({
                          ...prev,
                          actions: prev.actions.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(editingCharacter.actions || []).length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  No actions available. Click "Add Action" to create combat abilities.
                </div>
              )}
            </div>
          )}

          {/* Spells Tab */}
          {activeTab === 'spells' && (
            <div className="space-y-4">
              <div className="text-center text-slate-400 py-8">
                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                <p>Spell management coming soon...</p>
                <p className="text-xs mt-2">Use the Spells panel in the character controls for now</p>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Character Notes</label>
                <textarea
                  value={editingCharacter.notes || ''}
                  onChange={(e) => setEditingCharacter(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Character backstory, personality traits, important notes..."
                  className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white resize-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Quick Message</label>
                <textarea
                  value={editingCharacter.quickMessage || ''}
                  onChange={(e) => setEditingCharacter(prev => ({ ...prev, quickMessage: e.target.value }))}
                  placeholder="What this character says when you click the 💬 button..."
                  className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Race</label>
                  <input
                    type="text"
                    value={editingCharacter.race || ''}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, race: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500"
                    placeholder="e.g., Human, Elf, Dwarf"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Class</label>
                  <input
                    type="text"
                    value={editingCharacter.class || ''}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500"
                    placeholder="e.g., Fighter, Wizard, Rogue"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 flex justify-between">
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className="bg-red-500 hover:bg-red-600 disabled:bg-slate-600 px-4 py-2 rounded text-white font-medium"
          >
            <Trash2 size={16} className="inline mr-1" />
            Delete
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded text-white font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canEdit}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 px-4 py-2 rounded text-white font-medium"
            >
              Save Character
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCharacterModal;
