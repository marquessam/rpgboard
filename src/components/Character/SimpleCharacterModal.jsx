// src/components/Character/SimpleCharacterModal.jsx
import React, { useState } from 'react';
import { Upload, Trash2, X, Plus, Sword, Sparkles, Heart } from 'lucide-react';
import { colorOptions, borderColorOptions } from '../../utils/constants';
import { getStatModifier, getHealthColor } from '../../utils/helpers';

const SimpleCharacterModal = ({
  character,
  characters = [],
  onSave,
  onDelete,
  onClose,
  onUpload,
  onAttack,
  onCastSpell
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

  const tabs = [
    { id: 'stats', name: 'Stats', icon: '📊' },
    { id: 'actions', name: 'Actions', icon: '⚔️' },
    { id: 'spells', name: 'Spells', icon: '✨' },
    { id: 'notes', name: 'Notes', icon: '📝' }
  ];

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

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
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
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
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
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
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
                        className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center text-lg font-bold"
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
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
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
                      className="px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Max"
                      value={maxHp}
                      onChange={(e) => setEditingCharacter(prev => ({ ...prev, maxHp: parseInt(e.target.value) || 20 }))}
                      className="px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
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
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
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
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
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
              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-slate-300 font-medium mb-2">Sprite</label>
                  <button
                    onClick={() => onUpload && onUpload('sprite')}
                    className="w-full bg-green-500 hover:bg-green-600 px-3 py-2 rounded text-white"
                  >
                    <Upload size={14} className="inline mr-1" />
                    Upload
                  </button>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Portrait</label>
                  <button
                    onClick={() => onUpload && onUpload('portrait')}
                    className="w-full bg-green-500 hover:bg-green-600 px-3 py-2 rounded text-white"
                  >
                    <Upload size={14} className="inline mr-1" />
                    Upload
                  </button>
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
                  No actions available
                </div>
              )}
            </div>
          )}

          {/* Spells Tab */}
          {activeTab === 'spells' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-white">Spells</h4>
                <button
                  onClick={() => {
                    const name = prompt('Spell name:');
                    if (name) {
                      setEditingCharacter(prev => ({
                        ...prev,
                        spells: [...(prev.spells || []), {
                          name,
                          level: 1,
                          school: 'evocation',
                          description: 'A magical spell'
                        }]
                      }));
                    }
                  }}
                  className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-white text-sm"
                >
                  <Plus size={14} className="inline mr-1" />
                  Add Spell
                </button>
              </div>

              <div className="space-y-2">
                {(editingCharacter.spells || []).map((spell, index) => (
                  <div key={index} className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">{spell.name}</div>
                        <div className="text-sm text-slate-300">Level {spell.level} {spell.school}</div>
                      </div>
                      <button
                        onClick={() => setEditingCharacter(prev => ({
                          ...prev,
                          spells: prev.spells.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(editingCharacter.spells || []).length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  No spells known
                </div>
              )}
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
                  className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Race</label>
                  <input
                    type="text"
                    value={editingCharacter.race || ''}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, race: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="e.g., Human, Elf, Dwarf"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Class</label>
                  <input
                    type="text"
                    value={editingCharacter.class || ''}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
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
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-medium"
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
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-medium"
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
