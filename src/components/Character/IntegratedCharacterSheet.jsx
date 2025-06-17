// src/components/Character/IntegratedCharacterSheet.jsx
import React, { useState } from 'react';
import { 
  Upload, Trash2, Plus, X, Sword, Sparkles, Heart, 
  Shield, Zap, Target, Dice6, User, Scroll 
} from 'lucide-react';
import { colorOptions, borderColorOptions, commonWeapons } from '../../utils/constants';
import { getStatModifier, getHealthColor } from '../../utils/helpers';
import { rollDice, rollAttack, rollDamage } from '../../utils/diceRoller';

const IntegratedCharacterSheet = ({
  character,
  characters,
  onSave,
  onDelete,
  onClose,
  onUpload,
  onAttack,
  onCastSpell,
  onAddCondition,
  onRemoveCondition
}) => {
  const [editingCharacter, setEditingCharacter] = useState({
    ...character,
    ac: character.ac || (10 + getStatModifier(character.dex)),
    proficiencyBonus: character.proficiencyBonus || 2,
    actions: character.actions || [],
    spells: character.spells || [],
    conditions: character.conditions || []
  });

  const [activeTab, setActiveTab] = useState('stats');
  const [targetingAction, setTargetingAction] = useState(null);
  const [targetingSpell, setTargetingSpell] = useState(null);
  const [showQuickRoll, setShowQuickRoll] = useState(false);

  const handleSave = () => {
    console.log('Saving character:', editingCharacter);
    onSave(editingCharacter);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${editingCharacter.name}?`)) {
      onDelete(editingCharacter.id);
      onClose();
    }
  };

  // Get other characters as potential targets
  const potentialTargets = characters.filter(char => char.id !== editingCharacter.id);

  // Calculate derived stats
  const spellcastingMod = getStatModifier(editingCharacter.cha || editingCharacter.int || editingCharacter.wis || 10);
  const spellcastingDC = 8 + editingCharacter.proficiencyBonus + spellcastingMod;
  const spellAttackBonus = editingCharacter.proficiencyBonus + spellcastingMod;

  const executeAction = (action, targets) => {
    targets.forEach(target => {
      if (action.attackRoll) {
        const attackRoll = rollAttack(action.attackBonus);
        const hit = attackRoll.total >= (target.ac || 10);
        
        let damage = 0;
        let damageRoll = null;
        
        if (hit) {
          damageRoll = rollDamage(action.damageRoll, attackRoll.isCrit);
          damage = damageRoll ? damageRoll.total : 0;
        }

        const combatResult = {
          attacker: editingCharacter.name,
          target: target.name,
          action: action.name,
          attackRoll: attackRoll.rolls[0],
          attackBonus: action.attackBonus,
          totalAttack: attackRoll.total,
          targetAC: target.ac || 10,
          hit,
          damage,
          damageRoll: damageRoll?.detail,
          damageType: action.damageType
        };

        onAttack(combatResult, target.id, damage);
      }
    });
    
    setTargetingAction(null);
  };

  const executeSpell = (spell, targets) => {
    if (spell.attackRoll) {
      targets.forEach(target => {
        const attackRoll = rollAttack(spellAttackBonus);
        const hit = attackRoll.total >= (target.ac || 10);
        
        let damage = 0;
        if (hit && spell.damageRoll) {
          const damageRoll = rollDamage(spell.damageRoll, attackRoll.isCrit);
          damage = damageRoll ? damageRoll.total : 0;
        }

        const spellResult = {
          type: 'spell_attack',
          caster: editingCharacter.name,
          target: target.name,
          spell: spell.name,
          hit,
          damage,
          damageType: spell.damageType
        };

        onCastSpell(spellResult, target.id, damage);
      });
    } else if (spell.healing) {
      targets.forEach(target => {
        const healingRoll = rollDice(spell.healingRoll || '1d4');
        const healing = healingRoll ? healingRoll.total + spellcastingMod : spellcastingMod;

        const spellResult = {
          type: 'spell_healing',
          caster: editingCharacter.name,
          target: target.name,
          spell: spell.name,
          healing
        };

        onCastSpell(spellResult, target.id, -healing);
      });
    }
    
    setTargetingSpell(null);
  };

  const addWeaponAction = (weaponKey) => {
    const weapon = commonWeapons[weaponKey];
    const attackMod = weapon.properties?.includes('finesse') 
      ? Math.max(getStatModifier(editingCharacter.str), getStatModifier(editingCharacter.dex))
      : getStatModifier(editingCharacter.str);
    
    const newAction = {
      name: weapon.name,
      type: 'weapon_attack',
      attackBonus: editingCharacter.proficiencyBonus + attackMod,
      damageRoll: `${weapon.damage}+${attackMod}`,
      damageType: weapon.damageType,
      range: weapon.range,
      attackRoll: true
    };

    setEditingCharacter(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  const performQuickRoll = (type) => {
    let result;
    switch (type) {
      case 'initiative':
        result = rollDice('1d20');
        if (result) result.total += getStatModifier(editingCharacter.dex);
        break;
      case 'death_save':
        result = rollDice('1d20');
        if (result) {
          result.success = result.total >= 10;
          result.critSuccess = result.total === 20;
          result.critFailure = result.total === 1;
        }
        break;
      default:
        result = rollDice('1d20');
    }
    
    // You could display this result or add it to combat log
    console.log(`${type} roll:`, result);
  };

  const tabs = [
    { id: 'stats', name: 'Stats', icon: <User size={16} /> },
    { id: 'actions', name: 'Actions', icon: <Sword size={16} /> },
    { id: 'spells', name: 'Spells', icon: <Sparkles size={16} /> },
    { id: 'conditions', name: 'Status', icon: <Heart size={16} /> },
    { id: 'inventory', name: 'Items', icon: <Scroll size={16} /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
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
              </h3>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4 text-sm">
              <span className="text-slate-300">
                AC: <span className="text-white font-medium">{editingCharacter.ac}</span>
              </span>
              <span className="text-slate-300">
                HP: <span className="text-white font-medium">
                  {editingCharacter.hp || editingCharacter.maxHp}/{editingCharacter.maxHp}
                </span>
              </span>
              <span className="text-slate-300">
                Speed: <span className="text-white font-medium">{editingCharacter.speed} ft</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickRoll(!showQuickRoll)}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-sm"
            >
              <Dice6 size={14} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Roll Dropdown */}
        {showQuickRoll && (
          <div className="absolute top-16 right-4 bg-slate-700 border border-slate-600 rounded-lg p-3 z-10">
            <div className="space-y-2">
              <button
                onClick={() => performQuickRoll('initiative')}
                className="w-full text-left px-2 py-1 hover:bg-slate-600 rounded text-sm"
              >
                🎲 Initiative (+{getStatModifier(editingCharacter.dex)})
              </button>
              <button
                onClick={() => performQuickRoll('death_save')}
                className="w-full text-left px-2 py-1 hover:bg-slate-600 rounded text-sm"
              >
                💀 Death Save
              </button>
              <button
                onClick={() => performQuickRoll('d20')}
                className="w-full text-left px-2 py-1 hover:bg-slate-600 rounded text-sm"
              >
                🎲 d20 Roll
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-4 pt-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
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
                  <label className="block text-slate-300 font-medium mb-2">Class & Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Class"
                      value={editingCharacter.class || ''}
                      onChange={(e) => setEditingCharacter(prev => ({ ...prev, class: e.target.value }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                    <input
                      type="number"
                      placeholder="Level"
                      value={editingCharacter.level || 1}
                      onChange={(e) => setEditingCharacter(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
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
                        value={editingCharacter[stat]}
                        onChange={(e) => setEditingCharacter(prev => ({ 
                          ...prev, 
                          [stat]: parseInt(e.target.value) || 10,
                          // Recalculate AC if DEX changes
                          ...(stat === 'dex' ? { ac: 10 + getStatModifier(parseInt(e.target.value) || 10) } : {})
                        }))}
                        className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center text-lg font-bold"
                      />
                      <div className="text-sm text-slate-400 mt-1">
                        {getStatModifier(editingCharacter[stat]) >= 0 ? '+' : ''}{getStatModifier(editingCharacter[stat])}
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
                    value={editingCharacter.ac}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, ac: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Hit Points</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      placeholder="Current"
                      value={editingCharacter.hp || editingCharacter.maxHp}
                      onChange={(e) => setEditingCharacter(prev => ({ ...prev, hp: parseInt(e.target.value) || 0 }))}
                      className="px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={editingCharacter.maxHp}
                      onChange={(e) => setEditingCharacter(prev => ({ ...prev, maxHp: parseInt(e.target.value) || 20 }))}
                      className="px-2 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Speed</label>
                  <input
                    type="number"
                    value={editingCharacter.speed}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, speed: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Prof. Bonus</label>
                  <input
                    type="number"
                    value={editingCharacter.proficiencyBonus}
                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, proficiencyBonus: parseInt(e.target.value) || 2 }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                  />
                </div>
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
                    onClick={() => onUpload('sprite')}
                    className="w-full bg-green-500 hover:bg-green-600 px-3 py-2 rounded text-white"
                  >
                    <Upload size={14} className="inline mr-1" />
                    Upload
                  </button>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Portrait</label>
                  <button
                    onClick={() => onUpload('portrait')}
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
                <div className="flex gap-2">
                  <select
                    onChange={(e) => e.target.value && addWeaponAction(e.target.value)}
                    value=""
                    className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  >
                    <option value="">Add Weapon...</option>
                    {Object.entries(commonWeapons).map(([key, weapon]) => (
                      <option key={key} value={key}>{weapon.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Targeting Interface */}
              {targetingAction && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-blue-400" />
                    <span className="text-blue-300 font-medium">Using {targetingAction.name}</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {potentialTargets.map(target => (
                      <button
                        key={target.id}
                        onClick={() => executeAction(targetingAction, [target])}
                        className="w-full p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-left"
                      >
                        <span className="text-white">{target.name}</span>
                        <span className="text-slate-400 ml-2">AC {target.ac || 10}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setTargetingAction(null)}
                    className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Actions List */}
              <div className="space-y-2">
                {editingCharacter.actions.map((action, index) => (
                  <div key={index} className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-white">{action.name}</div>
                        <div className="text-sm text-slate-300">
                          +{action.attackBonus} to hit • {action.damageRoll} {action.damageType}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTargetingAction(action)}
                          disabled={potentialTargets.length === 0}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-slate-600 px-3 py-1 rounded text-white text-sm"
                        >
                          Use
                        </button>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add other tabs here... */}
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

export default IntegratedCharacterSheet;
