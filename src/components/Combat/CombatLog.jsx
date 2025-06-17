// src/components/Combat/CombatLog.jsx
import React, { useRef, useEffect } from 'react';
import { ScrollText } from 'lucide-react';

const CombatLog = ({ combatMessages, onClearLog }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatMessages]);

  const formatCombatMessage = (message) => {
    switch (message.type) {
      case 'attack':
        return (
          <div className={`p-3 rounded-lg border ${
            message.hit 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-slate-500/10 border-slate-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">
                {message.attacker} attacks {message.target}
              </span>
              <span className="text-xs text-slate-400">{message.timestamp}</span>
            </div>
            
            <div className="text-sm space-y-1">
              <div className="text-slate-300">
                🎲 Attack Roll: {message.attackRoll} + {message.attackBonus} = {message.totalAttack}
                {message.hit ? (
                  <span className="text-green-400 ml-2">✓ HIT (AC {message.targetAC})</span>
                ) : (
                  <span className="text-red-400 ml-2">✗ MISS (AC {message.targetAC})</span>
                )}
              </div>
              
              {message.hit && (
                <div className="text-orange-300">
                  💥 Damage: {message.damageRoll} = {message.damage} {message.damageType}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'damage':
        return (
          <div className="p-3 rounded-lg border bg-orange-500/10 border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">
                {message.target} takes {message.amount} {message.damageType || ''} damage
              </span>
              <span className="text-xs text-slate-400">{message.timestamp}</span>
            </div>
            {message.newHp !== undefined && (
              <div className="text-sm text-slate-300">
                HP: {message.oldHp} → {message.newHp}
              </div>
            )}
          </div>
        );
        
      case 'death':
        return (
          <div className="p-3 rounded-lg border bg-red-500/20 border-red-500/50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-red-300">
                💀 {message.target} has been defeated!
              </span>
              <span className="text-xs text-slate-400">{message.timestamp}</span>
            </div>
          </div>
        );
        
      case 'healing':
        return (
          <div className="p-3 rounded-lg border bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">
                {message.target} heals for {message.amount} HP
              </span>
              <span className="text-xs text-slate-400">{message.timestamp}</span>
            </div>
            <div className="text-sm text-slate-300">
              HP: {message.oldHp} → {message.newHp}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-3 rounded-lg border bg-slate-500/10 border-slate-500/30">
            <div className="flex items-center gap-2">
              <span className="text-white">{message.text}</span>
              <span className="text-xs text-slate-400">{message.timestamp}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-100">
          <ScrollText className="inline mr-2" size={20} />
          Combat Log
        </h3>
        {combatMessages.length > 0 && (
          <button
            onClick={onClearLog}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            Clear Log
          </button>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 h-64 overflow-y-auto">
        {combatMessages.length === 0 ? (
          <div className="text-slate-400 text-center py-8 text-sm">
            <ScrollText className="mx-auto mb-2" size={32} />
            Combat actions will appear here...
          </div>
        ) : (
          <div className="space-y-2">
            {combatMessages.map((message, index) => (
              <div key={index}>
                {formatCombatMessage(message)}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatLog;
