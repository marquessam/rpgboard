// src/components/Dialogue/DialoguePopup.jsx - Enhanced with smooth animations
import React from 'react';
import { X } from 'lucide-react';

const DialoguePopup = ({
  speaker,
  text,
  isTyping,
  queueLength,
  onClose
}) => {
  if (!speaker) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className="max-w-3xl mx-4 pointer-events-auto animate-scaleIn"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #1e40af 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div className="bg-slate-800/90 backdrop-blur-sm border-4 border-white rounded-lg p-6 shadow-2xl relative">
          {/* Queue indicator */}
          {queueLength > 0 && (
            <div className="absolute -top-3 -right-3 bg-yellow-500 border-2 border-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-black animate-pulse">
              {queueLength}
            </div>
          )}
          
          <div className="flex gap-4">
            {/* Portrait Frame */}
            <div className="w-24 h-24 bg-slate-900 border-2 border-white rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
              {speaker.portrait ? (
                <img
                  src={speaker.portrait}
                  alt={speaker.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600">
                  {speaker.name.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Dialogue Content */}
            <div className="flex-1 min-w-0">
              <div className="text-yellow-300 font-bold mb-3 text-lg flex items-center gap-2">
                <span>{speaker.name}</span>
                {speaker.isMonster && (
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                    Monster
                  </span>
                )}
              </div>
              
              <div className="text-white font-medium text-lg leading-relaxed min-h-[3rem] flex items-center">
                <span className="break-words">
                  {text}
                  {isTyping && (
                    <span className="animate-pulse text-yellow-300 ml-1 text-xl">▌</span>
                  )}
                </span>
              </div>
              
              {/* Character info */}
              {speaker.hp !== undefined && (
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-300">
                  <span>AC {speaker.ac || 10}</span>
                  <span>HP {speaker.hp}/{speaker.maxHp}</span>
                  {speaker.conditions && speaker.conditions.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span>✨</span>
                      {speaker.conditions.length} condition{speaker.conditions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white hover:text-red-300 transition-colors duration-200 p-1 hover:bg-red-500/10 rounded-lg flex-shrink-0"
              title="Close dialogue (or wait for auto-close)"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress indicator for typing */}
          {isTyping && (
            <div className="mt-4 w-full h-1 bg-slate-700 rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse"></div>
            </div>
          )}
          
          {/* Auto-close indicator */}
          {!isTyping && (
            <div className="mt-3 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <span>Auto-closing in a moment...</span>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialoguePopup;
