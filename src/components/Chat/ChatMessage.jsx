// src/components/Chat/ChatMessage.jsx
import React from 'react';

const ChatMessage = ({ message }) => {
  return (
    <div className={`p-3 rounded-lg border ${
      message.type === 'character' 
        ? 'bg-blue-500/10 border-blue-500/30' 
        : 'bg-green-500/10 border-green-500/30'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-medium text-sm ${
          message.type === 'character' ? 'text-blue-300' : 'text-green-300'
        }`}>
          {message.name}
        </span>
        <span className="text-xs text-slate-400">{message.timestamp}</span>
      </div>
      <div className="text-slate-200 text-sm">{message.text}</div>
      {message.diceResult && (
        <div className="text-xs text-yellow-300 mt-1 font-mono">
          🎲 {message.diceResult.notation}: {message.diceResult.detail}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
