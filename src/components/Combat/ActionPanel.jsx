// src/components/Combat/ActionPanel.jsx
import React, { useState } from 'react';
import { Sword, Target, Zap } from 'lucide-react';
import { getStatModifier } from '../../utils/helpers';
import { rollDice } from '../../utils/diceRoller';

const ActionPanel = ({ 
  selectedCharacter, 
  characters, 
  onAttack,
  onClearSelection 
}) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [targetingMode, setTargetingMode] = useState(false);

  if (!selectedCharacter) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          <Sword className="inline mr-2" size={20} />
          Actions
        </h3>
        <div className="text-slate-400 text-center py-8">
          Select a character to see available actions
        </div>
      </div>
    );
  }

  const getDefaultActions = (character) => {
    const actions = [];
    
    // Melee Attack (using STR or DEX)
    const meleeBonus = character.proficiencyBonus + Math.max(
      getStatModifier(character.str),
      getStatModifier(character.dex)
    );
    actions.push({
      name: 'Melee Attack',
      type: 'weapon_attack',
      attackBonus: meleeBonus,
      damageRoll: '1d8+' + Math.max(getStatModifier(character.str), getStatModifier(character.dex)),
      damageType: 'slashing',
      range: 'melee',
      icon: '⚔️'
    });

    // Ranged Attack (using DEX)
    const rangedBonus = character.proficiencyBonus + getStatModifier(character.dex);
    actions.push({
      name: 'Ranged Attack',
      type: 'weapon_attack',
      attackBonus: rangedBonus,
      damageRoll: '1d8+' + getStatModifier(character.dex),
      damageType: 'piercing',
      range: '150/600 ft',
      icon: '🏹'
    });

    return actions;
  };

  const availableActions = selectedCharacter.actions || getDefaultActions(selectedCharacter);

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setTargetingMode(true);
  };

  const handleTargetSelect = (target) => {
    if (selectedAction && target.id !== selectedCharacter.id) {
      executeAction(selectedAction, selectedCharacter, target);
      setTargetingMode(false);
      setSelectedAction(null);
    }
  };

  const executeAction = (action, attacker, target) => {
    if (action.type === 'weapon_attack') {
      executeAttack(action, attacker, target);
    }
  };

  const executeAttack = (action, attacker, target) => {
    // Roll attack
    const attackRoll = rollDice('1d20');
    const totalAttack = attackRoll.total + action.attackBonus;
    
    const hit = totalAttack >= target.ac;
    
    let damage = 0;
    let damageRoll = null;
    
    if (hit) {
      damageRoll = rollDice(action.damageRoll);
      damage = damageRoll ? damageRoll.total : 0;
    }

    const combatResult = {
      attacker: attacker.name,
      target: target.name,
      action: action.name,
      attackRoll: attackRoll.total,
      attackBonus: action.attackBonus,
      totalAttack,
      targetAC: target.ac,
      hit,
      damage,
      damageRoll: damageRoll?.detail,
      damageType: action.damageType
    };

    onAttack(combatResult, target.id, damage);
  };

  const potentialTargets = characters.filter(char => char.id !== selectedCharacter.id);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-100">
          <Sword className="inline mr-2" size={20} />
          Actions
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
          {selectedCharacter.isMonster && (
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
              CR {selectedCharacter.cr}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-400">
          AC {selectedCharacter.ac || 10 + getStatModifier(selectedCharacter.dex)} • 
          HP {selectedCharacter.hp || selectedCharacter.maxHp}/{selectedCharacter.maxHp}
        </div>
      </div>

      {targetingMode ? (
        <div>
          <div className="flex items-center gap-2 mb-3 text-yellow-300">
            <Target size={16} />
            <span className="text-sm font-medium">Select Target for {selectedAction.name}</span>
          </div>
          
          <div className="space-y-2 mb-4">
            {potentialTargets.map(target => (
              <button
                key={target.id}
                onClick={() => handleTargetSelect(target)}
                className="w-full p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded border"
                    style={{ 
                      backgroundColor: target.color,
                      borderColor: target.borderColor
                    }}
                  />
                  <span className="text-white font-medium">{target.name}</span>
                  <span className="text-xs text-slate-400">
                    AC {target.ac || 10 + getStatModifier(target.dex)}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setTargetingMode(false);
              setSelectedAction(null);
            }}
            className="w-full bg-slate-600 hover:bg-slate-500 border border-slate-500 px-3 py-2 rounded-lg text-slate-300 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300 mb-3">Available Actions:</div>
          {availableActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionSelect(action)}
              className="w-full p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-all duration-200 text-left"
              disabled={potentialTargets.length === 0}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{action.icon || '⚔️'}</span>
                <span className="font-medium text-white">{action.name}</span>
              </div>
              <div className="text-xs text-slate-400">
                +{action.attackBonus} to hit • {action.damageRoll} {action.damageType}
                {action.range && ` • ${action.range}`}
              </div>
              {action.special && (
                <div className="text-xs text-yellow-300 mt-1">{action.special}</div>
              )}
            </button>
          ))}
          
          {potentialTargets.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-4">
              No valid targets available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionPanel;
