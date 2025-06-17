// src/components/Combat/SpellPanel.jsx
import React, { useState } from 'react';
import { Sparkles, Plus, X, Target } from 'lucide-react';
import { spellLevels, spellSchools, calculateDistance, isInRange, getRangeDescription } from '../../utils/constants';
import { rollDice, rollSavingThrow } from '../../utils/diceRoller';
import { getStatModifier } from '../../utils/helpers';

// Sample spells database
const sampleSpells = {
  // Cantrips (Level 0)
  firebolt: {
    name: 'Fire Bolt',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    description: 'Ranged spell attack for 1d10 fire damage',
    attackRoll: true,
    damageRoll: '1d10',
    damageType: 'fire',
    scalingDamage: { diceIncrease: 1, levelInterval: 5 }
  },
  mageHand: {
    name: 'Mage Hand',
    level: 0,
    school: 'conjuration',
    castingTime: '1 action',
    range: '30 feet',
    components: ['V', 'S'],
    duration: '1 minute',
    description: 'Create a spectral hand that can manipulate objects',
    utility: true
  },
  
  // 1st Level
  magicMissile: {
    name: 'Magic Missile',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    description: 'Three darts of magical force, each dealing 1d4+1 force damage',
    autoHit: true,
    damageRoll: '3*(1d4+1)', // Represents 3 missiles
    damageType: 'force',
    upcastDamage: '+1d4+1 per level'
  },
  healingWord: {
    name: 'Healing Word',
    level: 1,
    school: 'evocation',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: ['V'],
    duration: 'Instantaneous',
    description: 'Heal a creature for 1d4 + spellcasting modifier HP',
    healing: true,
    healingRoll: '1d4',
    upcastHealing: '+1d4 per level'
  },
  
  // 2nd Level
  scorchingRay: {
    name: 'Scorching Ray',
    level: 2,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    description: 'Three rays of fire, each requiring an attack roll for 2d6 fire damage',
    multipleAttacks: 3,
    damageRoll: '2d6',
    damageType: 'fire',
    upcastDamage: '+1 ray per level'
  },
  
  // 3rd Level
  fireball: {
    name: 'Fireball',
    level: 3,
    school: 'evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: ['V', 'S', 'M'],
    duration: 'Instantaneous',
    description: 'Explosion in 20-foot radius, DEX save for half damage',
    savingThrow: 'dex',
    damageRoll: '8d6',
    damageType: 'fire',
    upcastDamage: '+1d6 per level',
    areaEffect: '20-foot radius'
  }
};

const SpellPanel = ({ 
  selectedCharacter, 
  characters,
  onCastSpell,
  onAddSpell,
  onRemoveSpell,
  onClearSelection 
}) => {
  const [showAddSpell, setShowAddSpell] = useState(false);
  const [targetingSpell, setTargetingSpell] = useState(null);
  const [selectedTargets, setSelectedTargets] = useState([]);

  // Check if character is alive
  const isCharacterAlive = (char) => {
    const currentHp = char.hp !== undefined ? char.hp : char.maxHp;
    return currentHp > 0;
  };

  if (!selectedCharacter || !isCharacterAlive(selectedCharacter)) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          <Sparkles className="inline mr-2" size={20} />
          Spells
        </h3>
        <div className="text-slate-400 text-center py-8">
          {!selectedCharacter ? 'Select a spellcaster to manage spells' : 'This character is defeated and cannot cast spells'}
        </div>
      </div>
    );
  }

  const spellcastingMod = getStatModifier(selectedCharacter.cha || selectedCharacter.int || selectedCharacter.wis || 10);
  const spellcastingDC = 8 + (selectedCharacter.proficiencyBonus || 2) + spellcastingMod;
  const spellAttackBonus = (selectedCharacter.proficiencyBonus || 2) + spellcastingMod;

  const knownSpells = selectedCharacter.spells || [];

  const handleCastSpell = (spell, upcastLevel = null) => {
    const effectiveLevel = upcastLevel || spell.level;
    
    if (spell.attackRoll || spell.multipleAttacks) {
      // Spell requires targeting
      setTargetingSpell({ ...spell, upcastLevel: effectiveLevel });
      setSelectedTargets([]);
    } else if (spell.savingThrow) {
      // Area effect spell - cast immediately with save DC
      executeSpell({ ...spell, upcastLevel: effectiveLevel }, []);
    } else if (spell.healing) {
      // Healing spell - needs target selection
      setTargetingSpell({ ...spell, upcastLevel: effectiveLevel });
      setSelectedTargets([]);
    } else {
      // Utility spell - cast immediately
      executeSpell({ ...spell, upcastLevel: effectiveLevel }, []);
    }
  };

  const executeSpell = (spell, targets) => {
    const results = [];
    
    if (spell.attackRoll || spell.multipleAttacks) {
      // Handle attack spells
      const numAttacks = spell.multipleAttacks || 1;
      
      targets.forEach(target => {
        for (let i = 0; i < numAttacks; i++) {
          const attackRoll = rollDice('1d20');
          const totalAttack = attackRoll.total + spellAttackBonus;
          const hit = totalAttack >= (target.ac || 10);
          
          let damage = 0;
          let damageRoll = null;
          
          if (hit) {
            damageRoll = rollDice(spell.damageRoll);
            damage = damageRoll ? damageRoll.total : 0;
            
            // Apply upcasting
            if (spell.upcastDamage && spell.upcastLevel > spell.level) {
              // Simple implementation - could be more sophisticated
              const extraLevels = spell.upcastLevel - spell.level;
              const extraDamage = rollDice(`${extraLevels}d6`); // Simplified
              if (extraDamage) damage += extraDamage.total;
            }
          }
          
          results.push({
            type: 'spell_attack',
            spell: spell.name,
            caster: selectedCharacter.name,
            target: target.name,
            attackRoll: attackRoll.total,
            attackBonus: spellAttackBonus,
            totalAttack,
            hit,
            damage,
            damageType: spell.damageType,
            upcastLevel: spell.upcastLevel
          });
          
          if (hit && damage > 0) {
            onCastSpell(results[results.length - 1], target.id, damage);
          }
        }
      });
    } else if (spell.savingThrow) {
      // Handle save-or-suck spells
      const baseDamage = rollDice(spell.damageRoll);
      let damage = baseDamage ? baseDamage.total : 0;
      
      // Apply upcasting
      if (spell.upcastDamage && spell.upcastLevel > spell.level) {
        const extraLevels = spell.upcastLevel - spell.level;
        const extraDamage = rollDice(`${extraLevels}d6`); // Simplified
        if (extraDamage) damage += extraDamage.total;
      }
      
      results.push({
        type: 'spell_save',
        spell: spell.name,
        caster: selectedCharacter.name,
        saveType: spell.savingThrow,
        saveDC: spellcastingDC,
        damage,
        damageType: spell.damageType,
        upcastLevel: spell.upcastLevel,
        areaEffect: spell.areaEffect
      });
      
      onCastSpell(results[0], null, 0); // Let DM handle saves
    } else if (spell.healing) {
      // Handle healing spells
      targets.forEach(target => {
        const healingRoll = rollDice(spell.healingRoll);
        let healing = healingRoll ? healingRoll.total + spellcastingMod : spellcastingMod;
        
        // Apply upcasting
        if (spell.upcastHealing && spell.upcastLevel > spell.level) {
          const extraLevels = spell.upcastLevel - spell.level;
          const extraHealing = rollDice(`${extraLevels}d4`); // Simplified
          if (extraHealing) healing += extraHealing.total;
        }
        
        results.push({
          type: 'spell_healing',
          spell: spell.name,
          caster: selectedCharacter.name,
          target: target.name,
          healing,
          upcastLevel: spell.upcastLevel
        });
        
        onCastSpell(results[results.length - 1], target.id, -healing); // Negative damage = healing
      });
    }
    
    // Clear targeting
    setTargetingSpell(null);
    setSelectedTargets([]);
  };

  const handleTargetSelect = (target) => {
    if (targetingSpell?.multipleAttacks || !targetingSpell?.attackRoll) {
      // For multi-attack spells or non-attack spells, allow multiple targets
      setSelectedTargets(prev => 
        prev.find(t => t.id === target.id) 
          ? prev.filter(t => t.id !== target.id)
          : [...prev, target]
      );
    } else {
      // For single-attack spells, check range first
      const spellRange = targetingSpell.range || '60 feet';
      if (isInRange(selectedCharacter, target, spellRange)) {
        setSelectedTargets([target]);
      } else {
        const distance = calculateDistance(selectedCharacter, target);
        alert(`Target is out of range! Distance: ${distance} squares. ${targetingSpell.name} range: ${getRangeDescription(spellRange)}`);
      }
    }
  };

  const getValidSpellTargets = (spell) => {
    if (!spell) return [];
    
    const spellRange = spell.range || '60 feet';
    return characters.filter(char => 
      char.id !== selectedCharacter.id && 
      isCharacterAlive(char) &&
      isInRange(selectedCharacter, char, spellRange)
    );
  };

  const getAllPotentialTargets = () => {
    return characters.filter(char => 
      char.id !== selectedCharacter.id && 
      isCharacterAlive(char)
    );
  };

  const addKnownSpell = (spellKey) => {
    const spell = sampleSpells[spellKey];
    if (spell && !knownSpells.find(s => s.key === spellKey)) {
      onAddSpell(selectedCharacter.id, { ...spell, key: spellKey });
      setShowAddSpell(false);
    }
  };

  // Group spells by level
  const spellsByLevel = knownSpells.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});

  const potentialTargets = getAllPotentialTargets();
  const validTargets = targetingSpell ? getValidSpellTargets(targetingSpell) : [];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-100">
          <Sparkles className="inline mr-2" size={20} />
          Spells
        </h3>
        <button
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Clear Selection
        </button>
      </div>

      {/* Character Info */}
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
          Spell Attack: +{spellAttackBonus} • Spell DC: {spellcastingDC} •
          Position ({selectedCharacter.x}, {selectedCharacter.y})
        </div>
      </div>

      {/* Targeting Interface */}
      {targetingSpell && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-blue-300">
            <Target size={16} />
            <span className="text-sm font-medium">Casting {targetingSpell.name}</span>
          </div>
          
          <div className="text-xs text-slate-400 mb-3">
            Range: {getRangeDescription(targetingSpell.range || '60 feet')} • 
            Valid Targets: {validTargets.length}/{potentialTargets.length}
          </div>
          
          <div className="space-y-2 mb-3">
            {potentialTargets.map(target => {
              const spellRange = targetingSpell.range || '60 feet';
              const inRange = isInRange(selectedCharacter, target, spellRange);
              const distance = calculateDistance(selectedCharacter, target);
              const isSelected = selectedTargets.find(t => t.id === target.id);
              
              return (
                <button
                  key={target.id}
                  onClick={() => handleTargetSelect(target)}
                  disabled={!inRange}
                  className={`w-full p-2 rounded border transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : inRange 
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-800 border-red-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ 
                          backgroundColor: target.color,
                          borderColor: target.borderColor
                        }}
                      />
                      <span className="text-white text-sm">{target.name}</span>
                    </div>
                    <div className="text-xs">
                      <span className={inRange ? 'text-green-400' : 'text-red-400'}>
                        {distance} sq {inRange ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => executeSpell(targetingSpell, selectedTargets)}
              disabled={selectedTargets.length === 0}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 px-3 py-1 rounded text-white text-sm"
            >
              Cast Spell
            </button>
            <button
              onClick={() => {
                setTargetingSpell(null);
                setSelectedTargets([]);
              }}
              className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-white text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Known Spells */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-300">Known Spells</span>
          <button
            onClick={() => setShowAddSpell(!showAddSpell)}
            className="bg-purple-500 hover:bg-purple-600 border border-purple-400 px-2 py-1 rounded text-white transition-all duration-200 text-sm"
          >
            <Plus size={12} className="inline mr-1" />
            Add
          </button>
        </div>

        {Object.keys(spellsByLevel).length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-4">
            No spells known
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(spellsByLevel)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, spells]) => (
                <div key={level}>
                  <div className="text-xs font-medium text-slate-400 mb-1">
                    {level === '0' ? 'Cantrips' : `Level ${level}`}
                  </div>
                  <div className="space-y-1">
                    {spells.map((spell, index) => (
                      <div key={index} className="p-2 bg-slate-700/50 border border-slate-600 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">{spell.name}</div>
                            <div className="text-xs text-slate-400">{spell.description}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {spell.castingTime} • Range: {getRangeDescription(spell.range)} • {spell.components?.join(', ')}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleCastSpell(spell)}
                              className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-xs"
                            >
                              Cast
                            </button>
                            <button
                              onClick={() => onRemoveSpell(selectedCharacter.id, index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Spell Interface */}
      {showAddSpell && (
        <div className="border-t border-slate-600 pt-4">
          <div className="text-sm font-medium text-slate-300 mb-3">Add Spell:</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(sampleSpells).map(([key, spell]) => (
              <button
                key={key}
                onClick={() => addKnownSpell(key)}
                className="w-full p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-left transition-all duration-200"
                disabled={knownSpells.find(s => s.key === key)}
              >
                <div className="font-medium text-white text-sm">{spell.name}</div>
                <div className="text-xs text-slate-400">
                  Level {spell.level} {spell.school} • {spell.description}
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAddSpell(false)}
            className="w-full mt-3 bg-slate-600 hover:bg-slate-500 border border-slate-500 px-3 py-2 rounded text-slate-300 transition-all duration-200 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default SpellPanel;
