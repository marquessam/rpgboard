// src/components/Monster/MonsterPanel.jsx
import React, { useState } from 'react';
import { Skull, Plus } from 'lucide-react';
import { monsters, monsterCategories, createMonsterInstance } from '../../utils/monsters';
import { getStatModifier } from '../../utils/helpers';

const MonsterPanel = ({ onAddMonster }) => {
  const [selectedCategory, setSelectedCategory] = useState('humanoid');
  const [expandedMonster, setExpandedMonster] = useState(null);

  const handleAddMonster = (monsterKey) => {
    console.log('MonsterPanel: Adding monster:', monsterKey);
    const monsterInstance = createMonsterInstance(monsterKey);
    console.log('MonsterPanel: Created monster instance:', monsterInstance);
    if (monsterInstance) {
      onAddMonster(monsterInstance);
    } else {
      console.error('Failed to create monster instance for:', monsterKey);
    }
  };

  const toggleMonsterDetails = (monsterKey) => {
    setExpandedMonster(expandedMonster === monsterKey ? null : monsterKey);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
      <h3 className="text-lg font-bold text-slate-100 mb-4">
        <Skull className="inline mr-2" size={20} />
        Monster Library
      </h3>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4">
        {Object.entries(monsterCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === key
                ? 'bg-red-500 border border-red-400 text-white shadow-lg shadow-red-500/25'
                : 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Monster List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {monsterCategories[selectedCategory]?.monsters.map(monsterKey => {
          const monster = monsters[monsterKey];
          const isExpanded = expandedMonster === monsterKey;
          
          return (
            <div key={monsterKey} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleMonsterDetails(monsterKey)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: monster.color,
                        borderColor: monster.borderColor
                      }}
                    />
                    <span className="font-medium text-white">{monster.name}</span>
                    <span className="text-xs text-slate-400">CR {monster.cr}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    AC {monster.ac} • HP {monster.hp} • {monster.description}
                  </div>
                </div>
                
                <button
                  onClick={() => handleAddMonster(monsterKey)}
                  className="bg-green-500 hover:bg-green-600 border border-green-400 px-2 py-1 rounded text-white transition-all duration-200 text-sm"
                  title="Add to map"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-xs">
                      <div className="text-slate-400">STR</div>
                      <div className="text-white">{monster.str} ({getStatModifier(monster.str) >= 0 ? '+' : ''}{getStatModifier(monster.str)})</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400">DEX</div>
                      <div className="text-white">{monster.dex} ({getStatModifier(monster.dex) >= 0 ? '+' : ''}{getStatModifier(monster.dex)})</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400">CON</div>
                      <div className="text-white">{monster.con} ({getStatModifier(monster.con) >= 0 ? '+' : ''}{getStatModifier(monster.con)})</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400">INT</div>
                      <div className="text-white">{monster.int} ({getStatModifier(monster.int) >= 0 ? '+' : ''}{getStatModifier(monster.int)})</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400">WIS</div>
                      <div className="text-white">{monster.wis} ({getStatModifier(monster.wis) >= 0 ? '+' : ''}{getStatModifier(monster.wis)})</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400">CHA</div>
                      <div className="text-white">{monster.cha} ({getStatModifier(monster.cha) >= 0 ? '+' : ''}{getStatModifier(monster.cha)})</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-300">Actions:</div>
                    {monster.actions.map((action, index) => (
                      <div key={index} className="text-xs bg-slate-800/50 p-2 rounded border border-slate-600">
                        <div className="font-medium text-white">{action.name}</div>
                        <div className="text-slate-300">
                          {action.type === 'weapon_attack' && (
                            <>
                              +{action.attackBonus} to hit, {action.damageRoll} {action.damageType} damage
                              {action.range && ` (${action.range})`}
                            </>
                          )}
                          {action.special && (
                            <div className="text-yellow-300 text-xs mt-1">{action.special}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonsterPanel;
