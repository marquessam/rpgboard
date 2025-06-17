// src/components/Character/EnhancedCharacterModal.jsx
import React, { useState } from 'react';
import { Upload, Trash2, Plus, X } from 'lucide-react';
import CharacterStats from './CharacterStats';
import { colorOptions, borderColorOptions } from '../../utils/constants';
import { getStatModifier, getHealthColor } from '../../utils/helpers';

const EnhancedCharacterModal = ({
  character,
  onSave,
  onDelete,
  onClose,
  onUpload
}) => {
  const [editingCharacter, setEditingCharacter] = useState({
    ...character,
    ac: character.ac || (10 + getStatModifier(character.dex)),
    proficiencyBonus: character.proficiencyBonus || 2,
    actions: character.actions || []
  });

  const [newAction, setNewAction] = useState({
    name: '',
    type: 'weapon_attack',
    attackBonus: 0,
    damageRoll: '1d8',
    damageType: 'slashing',
    range: 'melee',
    special: ''
  });

  const [showActionForm, setShowActionForm] = useState(false);

  const handleSave = () => {
    onSave(editingCharacter);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${editingCharacter.name}?`)) {
      onDelete(editingCharacter.id);
    }
  };

  const addAction = () => {
    if (newAction.name.trim()) {
      setEditingCharacter(prev => ({
        ...prev,
        actions: [...(prev.actions || []), { ...newAction }]
      }));
      setNewAction({
        name: '',
        type: 'weapon_attack',
        attackBonus: 0,
        damageRoll: '1d8',
        damageType: 'slashing',
        range: 'melee',
        special: ''
      });
      setShowActionForm(false);
    }
  };

  const removeAction = (index) => {
    setEditingCharacter(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const damageTypes = [
    'slashing', 'piercing', 'bludgeoning', 'fire', 'cold', 'lightning', 
    'thunder', 'acid', 'poison', 'psychic', 'radiant', 'necrotic', 'force'
  ];

  const actionTypes = [
    { value: 'weapon_attack', label: 'Weapon Attack' },
    { value: 'spell_attack', label: 'Spell Attack' },
    { value: 'save', label: 'Saving Throw' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-100">
            Character: {editingCharacter.name || 'New'}
            {editingCharacter.isMonster && (
              <span className="ml-2 text-sm bg-red-500/20 text-red-300 px-2 py-1 rounded">
                Monster (CR {editingCharacter.cr})
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editingCharacter.name}
                  onChange={(e) => setEditingCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Type</label>
                <input
                  type="text"
                  value={editingCharacter.type || 'humanoid'}
                  onChange={(e) => setEditingCharacter(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="humanoid, beast, undead, etc."
                />
              </div>
            </div>

            {/* Quick Message */}
            <div>
              <label className="block text-slate-300 font-medium mb-2">Quick Message</label>
              <textarea
                value={editingCharacter.quickMessage || ''}
                onChange={(e) => setEditingCharacter(prev => ({ ...prev, quickMessage: e.target.value }))}
                placeholder="What this character says when you click the 💬 button..."
                className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Sprite (Grid)</label>
                <div className="flex flex-col gap-2">
                  {editingCharacter.sprite && (
                    <img
                      src={editingCharacter.sprite}
                      alt="Sprite"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-600 mx-auto"
                    />
                  )}
                  <button
                    onClick={() => onUpload('sprite')}
                    className="bg-green-500 hover:bg-green-600 border border-green-400 px-3 py-2 rounded-lg font-medium text-white transition-all duration-200 text-sm"
                  >
                    <Upload size={14} className="inline mr-1" />
                    Upload
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Portrait (Dialogue)</label>
                <div className="flex flex-col gap-2">
                  {editingCharacter.portrait && (
                    <img
                      src={editingCharacter.portrait}
                      alt="Portrait"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-600 mx-auto"
                    />
                  )}
                  <button
                    onClick={() => onUpload('portrait')}
                    className="bg-green-500 hover:bg-green-600 border border-green-400 px-3 py-2 rounded-lg font-medium text-white transition-all duration-200 text-sm"
                  >
                    <Upload size={14} className="inline mr-1" />
                    Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Armor Class</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={editingCharacter.ac}
                  onChange={(e) => setEditingCharacter(prev => ({ 
                    ...prev, 
                    ac: parseInt(e.target.value) || 10 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Proficiency Bonus</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={editingCharacter.proficiencyBonus}
                  onChange={(e) => setEditingCharacter(prev => ({ 
                    ...prev, 
                    proficiencyBonus: parseInt(e.target.value) || 2 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Speed</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={editingCharacter.speed || 30}
                  onChange={(e) => setEditingCharacter(prev => ({ 
                    ...prev, 
                    speed: parseInt(e.target.value) || 30 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Health Points */}
            <div>
              <label className="block text-slate-300 font-medium mb-2">Health Points</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Current HP</label>
                  <input
                    type="number"
                    min="0"
                    max={editingCharacter.maxHp || 100}
                    value={editingCharacter.hp || editingCharacter.maxHp || 20}
                    onChange={(e) => setEditingCharacter(prev => ({ 
                      ...prev, 
                      hp: parseInt(e.target.value) || 0 
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Max HP</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={editingCharacter.maxHp || 20}
                    onChange={(e) => setEditingCharacter(prev => ({ 
                      ...prev, 
                      maxHp: parseInt(e.target.value) || 20 
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="mt-2 w-full h-3 bg-slate-600 rounded overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${((editingCharacter.hp || editingCharacter.maxHp || 20) / (editingCharacter.maxHp || 20)) * 100}%`,
                    backgroundColor: getHealthColor(editingCharacter.hp || editingCharacter.maxHp || 20, editingCharacter.maxHp || 20)
                  }}
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Token Color</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-white flex-shrink-0"
                    style={{ backgroundColor: editingCharacter.color }}
                  />
                  <select
                    value={editingCharacter.color}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Border Color</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-slate-400 flex-shrink-0"
                    style={{ backgroundColor: editingCharacter.borderColor || '#ffffff' }}
                  />
                  <select
                    value={editingCharacter.borderColor || '#ffffff'}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, borderColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    {borderColorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ability Scores */}
            <CharacterStats
              character={editingCharacter}
              onChange={setEditingCharacter}
            />

            {/* Actions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-slate-300 font-medium">Actions</label>
                <button
                  onClick={() => setShowActionForm(!showActionForm)}
                  className="bg-blue-500 hover:bg-blue-600 border border-blue-400 px-3 py-1 rounded text-white transition-all duration-200 text-sm"
                >
                  <Plus size={14} className="inline mr-1" />
                  Add Action
                </button>
              </div>

              {showActionForm && (
                <div className="mb-4 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Action name"
                      value={newAction.name}
                      onChange={(e) => setNewAction(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                    <select
                      value={newAction.type}
                      onChange={(e) => setNewAction(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                      {actionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <input
                      type="number"
                      placeholder="Attack bonus"
                      value={newAction.attackBonus}
                      onChange={(e) => setNewAction(prev => ({ ...prev, attackBonus: parseInt(e.target.value) || 0 }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Damage (1d8+3)"
                      value={newAction.damageRoll}
                      onChange={(e) => setNewAction(prev => ({ ...prev, damageRoll: e.target.value }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                    <select
                      value={newAction.damageType}
                      onChange={(e) => setNewAction(prev => ({ ...prev, damageType: e.target.value }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                      {damageTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Range (melee, 30 ft, etc.)"
                      value={newAction.range}
                      onChange={(e) => setNewAction(prev => ({ ...prev, range: e.target.value }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Special effects"
                      value={newAction.special}
                      onChange={(e) => setNewAction(prev => ({ ...prev, special: e.target.value }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={addAction}
                      className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-sm"
                    >
                      Add Action
                    </button>
                    <button
                      onClick={() => setShowActionForm(false)}
                      className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-white text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Actions */}
              <div className="space-y-2">
                {(editingCharacter.actions || []).map((action, index) => (
                  <div key={index} className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-white">{action.name}</div>
                        <div className="text-sm text-slate-300">
                          +{action.attackBonus} to hit • {action.damageRoll} {action.damageType}
                          {action.range && ` • ${action.range}`}
                        </div>
                        {action.special && (
                          <div className="text-sm text-yellow-300">{action.special}</div>
                        )}
                      </div>
                      <button
                        onClick={() => removeAction(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 p-4 flex-shrink-0">
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 border border-red-400 px-3 py-2 rounded-lg font-medium text-white transition-all duration-200 text-sm"
            >
              <Trash2 size={14} className="inline mr-1" />
              Delete
            </button>
            <button
              onClick={onClose}
              className="bg-slate-600 hover:bg-slate-500 border border-slate-500 px-3 py-2 rounded-lg font-medium text-slate-300 transition-all duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 border border-blue-400 px-3 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg shadow-blue-500/25 text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCharacterModal;
