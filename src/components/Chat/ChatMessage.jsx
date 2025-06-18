// src/components/Chat/ChatMessage.jsx - Enhanced to handle system messages
import React from 'react';

const ChatMessage = ({ message }) => {
  const getMessageStyle = () => {
    switch (message.type) {
      case 'character':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'player':
        return 'bg-green-500/10 border-green-500/30';
      case 'system':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  const getNameColor = () => {
    switch (message.type) {
      case 'character':
        return 'text-blue-300';
      case 'player':
        return 'text-green-300';
      case 'system':
        return 'text-yellow-300';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 hover:bg-opacity-20 ${getMessageStyle()}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-medium text-sm ${getNameColor()}`}>
          {message.type === 'system' && '🔔 '}
          {message.name}
        </span>
        <span className="text-xs text-slate-400">{message.timestamp}</span>
      </div>
      <div className="text-slate-200 text-sm">{message.text}</div>
      {message.diceResult && (
        <div className="text-xs text-yellow-300 mt-1 font-mono bg-slate-800/50 p-2 rounded">
          🎲 {message.diceResult.notation}: {message.diceResult.detail}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
