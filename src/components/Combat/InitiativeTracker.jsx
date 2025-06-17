// src/components/Combat/InitiativeTracker.jsx
import React, { useState } from 'react';
import { Clock, Play, Pause, RotateCcw, Dice6 } from 'lucide-react';
import { rollDice } from '../../utils/diceRoller';
import { getStatModifier } from '../../utils/helpers';

const InitiativeTracker = ({ 
  characters, 
  onUpdateCharacter,
  onCombatMessage 
}) => {
  const [initiativeOrder, setInitiativeOrder] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [combatActive, setCombatActive] = useState(false);

  const rollInitiative = () => {
    const initiatives = characters.map(character => {
      const dexMod = getStatModifier(character.dex);
      const roll = rollDice('1d20');
      const total = roll ? roll.total + dexMod : 10 + dexMod;
      
      return {
        ...character,
        initiative: total,
        initiativeRoll: roll?.total || 10,
        dexMod
      };
    });

    // Sort by initiative (highest first), then by dex modifier if tied
    const sorted = initiatives.sort((a, b) => {
      if (b.initiative === a.initiative) {
        return b.dexMod - a.dexMod;
      }
      return b.initiative - a.initiative;
    });

    setInitiativeOrder(sorted);
    setCurrentTurn(0);
    setRound(1);
    setCombatActive(true);

    // Add to combat log
    onCombatMessage({
      type: 'initiative',
      text: 'Initiative rolled! Combat begins.',
      initiatives: sorted.map(char => ({
        name: char.name,
        initiative: char.initiative,
        roll: char.initiativeRoll,
        modifier: char.dexMod
      })),
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const nextTurn = () => {
    if (!combatActive || initiativeOrder.length === 0) return;

    const nextIndex = (currentTurn + 1) % initiativeOrder.length;
    
    if (nextIndex === 0) {
      setRound(prev => prev + 1);
      onCombatMessage({
        type: 'round',
        text: `Round ${round + 1} begins!`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    
    setCurrentTurn(nextIndex);
    
    const currentCharacter = initiativeOrder[nextIndex];
    onCombatMessage({
      type: 'turn',
      text: `${currentCharacter.name}'s turn`,
      character: currentCharacter.name,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const endCombat = () => {
    setCombatActive(false);
    setInitiativeOrder([]);
    setCurrentTurn(0);
    setRound(1);
    
    onCombatMessage({
      type: 'combat_end',
      text: 'Combat has ended.',
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const adjustInitiative = (index, newValue) => {
    const updated = [...initiativeOrder];
    updated[index].initiative = parseInt(newValue) || 0;
    
    // Re-sort the initiative order
    updated.sort((a, b) => {
      if (b.initiative === a.initiative) {
        return b.dexMod - a.dexMod;
      }
      return b.initiative - a.initiative;
    });
    
    setInitiativeOrder(updated);
    setCurrentTurn(0); // Reset to first in new order
  };

  const getCurrentCharacter = () => {
    if (!combatActive || initiativeOrder.length === 0) return null;
    return initiativeOrder[currentTurn];
  };

  const currentCharacter = getCurrentCharacter();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-100">
          <Clock className="inline mr-2" size={20} />
          Initiative Tracker
        </h3>
        
        <div className="flex gap-2">
          {!combatActive ? (
            <button
              onClick={rollInitiative}
              disabled={characters.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-slate-600 border border-green-400 disabled:border-slate-600 px-3 py-1 rounded text-white transition-all duration-200 text-sm"
            >
              <Dice6 size={14} className="inline mr-1" />
              Roll Initiative
            </button>
          ) : (
            <>
              <button
                onClick={nextTurn}
                className="bg-blue-500 hover:bg-blue-600 border border-blue-400 px-3 py-1 rounded text-white transition-all duration-200 text-sm"
              >
                <Play size={14} className="inline mr-1" />
                Next Turn
              </button>
              <button
                onClick={endCombat}
                className="bg-red-500 hover:bg-red-600 border border-red-400 px-3 py-1 rounded text-white transition-all duration-200 text-sm"
              >
                <Pause size={14} className="inline mr-1" />
                End Combat
              </button>
            </>
          )}
        </div>
      </div>

      {!combatActive && characters.length === 0 && (
        <div className="text-slate-400 text-center py-8 text-sm">
          <Clock className="mx-auto mb-2" size={32} />
          Add characters to start combat
        </div>
      )}

      {!combatActive && characters.length > 0 && (
        <div className="text-slate-400 text-center py-4 text-sm">
          Click "Roll Initiative" to begin combat
        </div>
      )}

      {combatActive && (
        <>
          <div className="mb-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-white">Round {round}</div>
              {currentCharacter && (
                <div className="text-sm text-blue-300">
                  Current Turn: {currentCharacter.name}
                  {currentCharacter.isMonster && (
                    <span className="ml-1 text-red-300">(Monster)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {initiativeOrder.map((character, index) => (
              <div
                key={character.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  index === currentTurn
                    ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/50'
                    : 'bg-slate-700/50 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-white min-w-[2rem]">
                      #{index + 1}
                    </div>
                    <div
                      className="w-3 h-3 rounded border"
                      style={{ 
                        backgroundColor: character.color,
                        borderColor: character.borderColor
                      }}
                    />
                    <div>
                      <div className="font-medium text-white">
                        {character.name}
                        {character.isMonster && (
                          <span className="ml-1 text-xs bg-red-500/20 text-red-300 px-1 rounded">
                            M
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        HP: {character.hp || character.maxHp}/{character.maxHp}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={character.initiative}
                      onChange={(e) => adjustInitiative(index, e.target.value)}
                      className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center text-sm focus:border-blue-500"
                      title={`Roll: ${character.initiativeRoll} + ${character.dexMod} (DEX)`}
                    />
                  </div>
                </div>

                {character.hp <= 0 && (
                  <div className="mt-2 text-xs text-red-400 font-medium">
                    💀 Defeated
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InitiativeTracker;
