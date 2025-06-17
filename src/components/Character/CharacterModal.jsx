// src/components/Character/CharacterModal.jsx
import React from 'react';
import { Upload, Trash2 } from 'lucide-react';
import CharacterStats from './CharacterStats';
import { colorOptions, borderColorOptions } from '../../utils/constants';
import { getStatModifier, getHealthColor } from '../../utils/helpers';

const CharacterModal = ({
  character,
  onSave,
  onDelete,
  onClose,
  onUpload
}) => {
  const [editingCharacter, setEditingCharacter] = React.useState(character);

  const handleSave = () => {
    onSave(editingCharacter);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${editingCharacter.name}?`)) {
      onDelete(editingCharacter.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md h-[85vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-100">
            Character: {editingCharacter.name || 'New'}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-4">
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
              <label className="block text-slate-300 font-medium mb-2">Quick Message</label>
              <textarea
                value={editingCharacter.quickMessage || ''}
                onChange={(e) => setEditingCharacter(prev => ({ ...prev, quickMessage: e.target.value }))}
                placeholder="What this character says when you click the 💬 button..."
                className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
              <div className="text-xs text-slate-400 mt-1">
                This message appears when you click the 💬 button next to the character name
              </div>
            </div>

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

            <CharacterStats
              character={editingCharacter}
              onChange={setEditingCharacter}
            />
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

export default CharacterModal;
