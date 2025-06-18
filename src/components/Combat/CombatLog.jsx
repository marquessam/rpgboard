// src/components/Combat/CombatLog.jsx - Enhanced with better styling and animations
import React, { useRef, useEffect } from 'react';
import { ScrollText, Trash2 } from 'lucide-react';

const CombatLog = ({ combatMessages, onClearLog }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    // Smooth scroll to bottom when new messages arrive
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatMessages]);

  const formatCombatMessage = (message, index) => {
    const baseClasses = "p-3 rounded-lg border transition-all duration-300 ease-in-out";
    const animationDelay = `animation-delay-${(index % 5) * 100}ms`;
    
    switch (message.type) {
      case 'attack':
        return (
          <div className={`${baseClasses} ${
            message.hit 
              ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' 
              : 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20'
          } ${animationDelay}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚔️</span>
              <span className="font-medium text-white">
                {message.attacker} attacks {message.target}
              </span>
              <span className="text-xs text-slate-400 ml-auto">{message.timestamp}</span>
            </div>
            
            <div className="text-sm space-y-1 ml-6">
              <div className="text-slate-300 flex items-center gap-2">
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">🎲</span>
                Attack Roll: {message.attackRoll} + {message.attackBonus} = {message.totalAttack}
                {message.hit ? (
                  <span className="text-green-400 font-semibold">✓ HIT (AC {message.targetAC})</span>
                ) : (
                  <span className="text-red-400 font-semibold">✗ MISS (AC {message.targetAC})</span>
                )}
              </div>
              
              {message.hit && (
                <div className="text-orange-300 flex items-center gap-2">
                  <span className="text-xs bg-orange-700 px-2 py-1 rounded">💥</span>
                  Damage: {message.damageRoll} = {message.damage} {message.damageType}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'damage':
        return (
          <div className={`${baseClasses} bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 ${animationDelay}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💥</span>
              <span className="font-medium text-white">
                {message.target} takes {message.amount} {message.damageType || ''} damage
              </span>
              <span className="text-xs text-slate-400 ml-auto">{message.timestamp}</span>
            </div>
            {message.newHp !== undefined && (
              <div className="text-sm text-slate-300 ml-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">❤️</span>
                  HP: {message.oldHp} → {message.newHp}
                  <div className="w-16 h-2 bg-slate-600 rounded overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-500"
                      style={{ width: `${Math.max(0, (message.newHp / message.oldHp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'death':
        return (
          <div className={`${baseClasses} bg-red-500/20 border-red-500/50 hover:bg-red-500/30 ${animationDelay}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💀</span>
              <span className="font-medium text-red-300">
                {message.target} has been defeated!
              </span>
              <span className="text-xs text-slate-400 ml-auto">{message.timestamp}</span>
            </div>
          </div>
        );
        
      case 'healing':
        return (
          <div className={`${baseClasses} bg-green-500/10 border-green-500/30 hover:bg-green-500/20 ${animationDelay}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✨</span>
              <span className="font-medium text-white">
                {message.target} heals for {message.amount} HP
              </span>
              <span className="text-xs text-slate-400 ml-auto">{message.timestamp}</span>
            </div>
            <div className="text-sm text-slate-300 ml-6">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-700 px-2 py-1 rounded">❤️</span>
                HP: {message.oldHp} → {message.newHp}
                <div className="w-16 h-2 bg-slate-600 rounded overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (message.newHp / message.oldHp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'loot':
        return (
          <div className={`${baseClasses} bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 ${animationDelay}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💰</span>
              <span className="font-medium text-white">
                {message.text}
              </span>
              <span className="text-xs text-slate-400 ml-auto">{message.timestamp}</span>
            </div>
            {message.items && (
              <div className="text-sm text-slate-300 ml-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-700 px-2 py-1 rounded">📦</span>
                  Items: {message.items.join(', ')}
                </div>
              </div>
            )}
          </div>
        );

      case 'spawn':
        return (
          <div className={`${baseClasses} bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 ${animationDelay}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <span className="font-medium text-purple-300">
                {message.text}
              </span>
              <span className="text-xs text-slate-400 ml-auto">{message.timestamp}</span>
            </div>
          </div>
        );
        
      default:
        return (
          <div className={`${baseClasses} bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20 ${animationDelay}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              <span className="text-white">{message.text}</span>
              <span className="text-xs text-slate-400 ml-auto">{message.timestamp}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-100 flex items-center">
          <ScrollText className="mr-3" size={20} />
          Combat Log
        </h3>
        {combatMessages.length > 0 && (
          <button
            onClick={onClearLog}
            className="text-slate-400 hover:text-red-400 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
            title="Clear combat log"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 h-80 overflow-y-auto transition-all duration-200">
        {combatMessages.length === 0 ? (
          <div className="text-slate-400 text-center py-8 text-sm">
            <ScrollText className="mx-auto mb-2 opacity-50" size={32} />
            <p>Combat actions will appear here...</p>
            <p className="text-xs mt-2 opacity-75">Attacks, damage, and other events</p>
          </div>
        ) : (
          <div className="space-y-2">
            {combatMessages.map((message, index) => (
              <div key={index} className="animate-fadeIn">
                {formatCombatMessage(message, index)}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
      
      {combatMessages.length > 0 && (
        <div className="mt-2 text-xs text-slate-400 text-center">
          {combatMessages.length} combat {combatMessages.length === 1 ? 'event' : 'events'} logged
        </div>
      )}
    </div>
  );
};

export default CombatLog;
