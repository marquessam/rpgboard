// src/components/Combat/ConditionsPanel.jsx
import React, { useState } from 'react';
import { Heart, Zap, X, Plus } from 'lucide-react';

const conditions = {
  blinded: { name: 'Blinded', icon: '🙈', color: '#6b7280', description: 'Cannot see, attacks have disadvantage' },
  charmed: { name: 'Charmed', icon: '💖', color: '#ec4899', description: 'Cannot attack the charmer' },
  deafened: { name: 'Deafened', icon: '🙉', color: '#6b7280', description: 'Cannot hear, auto-fail hearing checks' },
  frightened: { name: 'Frightened', icon: '😱', color: '#7c2d12', description: 'Disadvantage on attacks and abilities while source is in sight' },
  grappled: { name: 'Grappled', icon: '🤝', color: '#059669', description: 'Speed becomes 0, cannot move' },
  incapacitated: { name: 'Incapacitated', icon: '😵', color: '#ef4444', description: 'Cannot take actions or reactions' },
  invisible: { name: 'Invisible', icon: '👻', color: '#6366f1', description: 'Cannot be seen, attacks have advantage' },
  paralyzed: { name: 'Paralyzed', icon: '🥶', color: '#06b6d4', description: 'Incapacitated, auto-fail STR and DEX saves' },
  petrified: { name: 'Petrified', icon: '🗿', color: '#78716c', description: 'Turned to stone, incapacitated and resistant to damage' },
  poisoned: { name: 'Poisoned', icon: '🤢', color: '#84cc16', description: 'Disadvantage on attack rolls and ability checks' },
  prone: { name: 'Prone', icon: '🤕', color: '#f59e0b', description: 'Lying down, disadvantage on attacks' },
  restrained: { name: 'Restrained', icon: '⛓️', color: '#64748b', description: 'Speed 0, disadvantage on attacks and DEX saves' },
  stunned: { name: 'Stunned', icon: '😵‍💫', color: '#fbbf24', description: 'Incapacitated, auto-fail STR and DEX saves' },
  unconscious: { name: 'Unconscious', icon: '😴', color: '#1e293b', description: 'Incapacitated, prone, auto-fail STR and DEX saves' },
  
  // Beneficial conditions
  blessed: { name: 'Blessed', icon: '✨', color: '#fbbf24', description: '+1d4 to attack rolls and saving throws' },
  hasted: { name: 'Hasted', icon: '💨', color: '#06b6d4', description: 'Extra action, +2 AC, advantage on DEX saves' },
  inspired: { name: 'Inspired', icon: '🎵', color: '#8b5cf6', description: 'Add bardic inspiration die to one roll' },
  raging: { name: 'Raging', icon: '😡', color: '#dc2626', description: 'Advantage on STR checks, +damage, resistance to physical' }
};

const ConditionsPanel = ({ 
  selectedCharacter, 
  onAddCondition, 
  onRemoveCondition,
  onClearSelection 
}) => {
  const [showAddCondition, setShowAddCondition] = useState(false);

  if (!selectedCharacter) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          <Zap className="inline mr-2" size={20} />
          Conditions
        </h3>
        <div className="text-slate-400 text-center py-8">
          Select a character to manage conditions
        </div>
      </div>
    );
  }

  const handleAddCondition = (conditionKey) => {
    const condition = {
      ...conditions[conditionKey],
      key: conditionKey,
      appliedAt: new Date().toLocaleTimeString(),
      duration: null // Could be expanded to track duration
    };
    onAddCondition(selectedCharacter.id, condition);
    setShowAddCondition(false);
  };

  const activeConditions = selectedCharacter.conditions || [];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-100">
          <Zap className="inline mr-2" size={20} />
          Conditions
        </h3>
        <button
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Clear Selection
        </button>
      </div>

      <div className="mb-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded border"
            style={{ 
              backgroundColor: selectedCharacter.color,
              borderColor: selectedCharacter.borderColor
            }}
          />
          <span className="font-medium text-white">{selectedCharacter.name}</span>
        </div>
        <div className="text-xs text-slate-400">
          HP {selectedCharacter.hp || selectedCharacter.maxHp}/{selectedCharacter.maxHp} • 
          AC {selectedCharacter.ac || 10}
        </div>
      </div>

      {/* Active Conditions */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-300">Active Conditions</span>
          <button
            onClick={() => setShowAddCondition(!showAddCondition)}
            className="bg-blue-500 hover:bg-blue-600 border border-blue-400 px-2 py-1 rounded text-white transition-all duration-200 text-sm"
          >
            <Plus size={12} className="inline mr-1" />
            Add
          </button>
        </div>

        {activeConditions.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-4">
            No active conditions
          </div>
        ) : (
          <div className="space-y-2">
            {activeConditions.map((condition, index) => (
              <div
                key={index}
                className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{condition.icon}</span>
                    <div>
                      <div 
                        className="font-medium text-sm"
                        style={{ color: condition.color }}
                      >
                        {condition.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Applied: {condition.appliedAt}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveCondition(selectedCharacter.id, index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="text-xs text-slate-300 mt-1 ml-6">
                  {condition.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Condition Interface */}
      {showAddCondition && (
        <div className="border-t border-slate-600 pt-4">
          <div className="text-sm font-medium text-slate-300 mb-3">Add Condition:</div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {Object.entries(conditions).map(([key, condition]) => (
              <button
                key={key}
                onClick={() => handleAddCondition(key)}
                className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-left transition-all duration-200"
                disabled={activeConditions.some(ac => ac.key === key)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{condition.icon}</span>
                  <div>
                    <div 
                      className="text-xs font-medium"
                      style={{ color: condition.color }}
                    >
                      {condition.name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAddCondition(false)}
            className="w-full mt-3 bg-slate-600 hover:bg-slate-500 border border-slate-500 px-3 py-2 rounded text-slate-300 transition-all duration-200 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-slate-600 pt-4">
        <div className="text-sm font-medium text-slate-300 mb-2">Quick Actions:</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const amount = parseInt(prompt('Heal amount:'));
              if (amount > 0) {
                // This would need to be connected to the healing function
                console.log(`Heal ${selectedCharacter.name} for ${amount}`);
              }
            }}
            className="bg-green-500 hover:bg-green-600 border border-green-400 px-3 py-2 rounded text-white transition-all duration-200 text-sm"
          >
            <Heart size={14} className="inline mr-1" />
            Heal
          </button>
          
          <button
            onClick={() => {
              const amount = parseInt(prompt('Damage amount:'));
              if (amount > 0) {
                // This would need to be connected to the damage function
                console.log(`Damage ${selectedCharacter.name} for ${amount}`);
              }
            }}
            className="bg-red-500 hover:bg-red-600 border border-red-400 px-3 py-2 rounded text-white transition-all duration-200 text-sm"
          >
            <Zap size={14} className="inline mr-1" />
            Damage
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionsPanel;
