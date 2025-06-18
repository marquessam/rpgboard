// src/components/Monster/MonsterPanel.jsx - Enhanced with dropdown and generic monster
import React, { useState } from 'react';
import { Skull, Plus, ChevronDown, Copy, Edit } from 'lucide-react';
import { monsters, monsterCategories, createMonsterInstance } from '../../utils/monsters';
import { getStatModifier } from '../../utils/helpers';

const MonsterPanel = ({ onAddMonster }) => {
  const [selectedCategory, setSelectedCategory] = useState('humanoid');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState(null);

  const handleAddMonster = (monsterKey) => {
    console.log('MonsterPanel: Adding monster:', monsterKey);
    
    if (monsterKey === 'generic') {
      // Create a generic monster template
      const genericMonster = {
        id: `generic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Generic Monster',
        type: 'beast',
        cr: '1/4',
        ac: 12,
        hp: 10,
        maxHp: 10,
        speed: 30,
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        proficiencyBonus: 2,
        color: '#6b7280',
        borderColor: '#000000',
        actions: [
          {
            name: 'Basic Attack',
            type: 'weapon_attack',
            attackBonus: 2,
            damageRoll: '1d6',
            damageType: 'bludgeoning',
            range: 'melee',
            attackRoll: true
          }
        ],
        description: 'A generic monster template',
        quickMessage: '*The creature growls menacingly*',
        x: 0,
        y: 0,
        isMonster: true,
        conditions: [],
        spells: []
      };
      onAddMonster(genericMonster);
    } else {
      const monsterInstance = createMonsterInstance(monsterKey);
      console.log('MonsterPanel: Created monster instance:', monsterInstance);
      if (monsterInstance) {
        onAddMonster(monsterInstance);
      } else {
        console.error('Failed to create monster instance for:', monsterKey);
      }
    }
    
    setShowDropdown(false);
  };

  const getAllMonsters = () => {
    const allMonsters = [];
    
    // Add generic monster option first
    allMonsters.push({
      key: 'generic',
      name: 'Generic Monster',
      category: 'Templates',
      description: 'Customizable monster template',
      cr: '1/4',
      ac: 12,
      hp: 10,
      isGeneric: true
    });

    // Add all other monsters
    Object.entries(monsterCategories).forEach(([categoryKey, category]) => {
      category.monsters.forEach(monsterKey => {
        const monster = monsters[monsterKey];
        if (monster) {
          allMonsters.push({
            key: monsterKey,
            name: monster.name,
            category: category.name,
            description: monster.description,
            cr: monster.cr,
            ac: monster.ac,
            hp: monster.hp || monster.maxHp
          });
        }
      });
    });

    return allMonsters;
  };

  const allMonsters = getAllMonsters();
  const filteredMonsters = selectedCategory === 'all' 
    ? allMonsters 
    : allMonsters.filter(m => {
        if (m.isGeneric) return selectedCategory === 'all';
        return Object.entries(monsterCategories).some(([catKey, cat]) => 
          catKey === selectedCategory && cat.monsters.includes(m.key)
        );
      });

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
        <Skull className="mr-2" size={20} />
        Monster Library
      </h3>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-slate-300 font-medium mb-2 text-sm">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          <option value="all">All Categories</option>
          {Object.entries(monsterCategories).map(([key, category]) => (
            <option key={key} value={key}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Monster Dropdown */}
      <div className="relative mb-4">
        <label className="block text-slate-300 font-medium mb-2 text-sm">Select Monster</label>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600 transition-colors"
        >
          <span>
            {selectedMonster ? selectedMonster.name : 'Choose a monster...'}
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
            {filteredMonsters.map((monster) => (
              <button
                key={monster.key}
                onClick={() => {
                  setSelectedMonster(monster);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-600 transition-colors border-b border-slate-600 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {monster.name}
                      {monster.isGeneric && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          Template
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {monster.category} • CR {monster.cr} • AC {monster.ac} • HP {monster.hp}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {monster.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={() => selectedMonster && handleAddMonster(selectedMonster.key)}
        disabled={!selectedMonster}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 border border-green-400 disabled:border-slate-600 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg shadow-green-500/25 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        <Plus size={16} className="inline mr-2" />
        Add {selectedMonster?.name || 'Monster'} to Map
      </button>

      {/* Selected Monster Preview */}
      {selectedMonster && !selectedMonster.isGeneric && (
        <div className="mt-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <h4 className="font-medium text-white mb-2">{selectedMonster.name}</h4>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Type: {monsters[selectedMonster.key]?.type || 'Unknown'}</div>
            <div>CR: {selectedMonster.cr} • AC: {selectedMonster.ac} • HP: {selectedMonster.hp}</div>
            <div>Speed: {monsters[selectedMonster.key]?.speed || 30} ft</div>
          </div>
          
          {monsters[selectedMonster.key]?.actions && (
            <div className="mt-2">
              <div className="text-xs font-medium text-slate-300 mb-1">Actions:</div>
              <div className="text-xs text-slate-400">
                {monsters[selectedMonster.key].actions.map(action => action.name).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedMonster?.isGeneric && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="font-medium text-blue-300 mb-2 flex items-center">
            <Edit size={16} className="mr-2" />
            Generic Monster Template
          </h4>
          <div className="text-xs text-slate-300">
            This creates a basic monster that you can customize after adding it to the map. 
            Edit its stats, appearance, and abilities through the character sheet.
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
        <h4 className="text-sm font-medium text-slate-200 mb-2">💡 Monster Tips</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Use Generic Monster for custom creatures</li>
          <li>• Click dead monsters to search for loot</li>
          <li>• Edit monsters through their character sheet</li>
          <li>• Copy monsters by adding multiple instances</li>
        </ul>
      </div>
    </div>
  );
};

export default MonsterPanel;
