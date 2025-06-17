// src/components/Chat/MessageInput.jsx
import React from 'react';
import { Send } from 'lucide-react';
import { rollDice } from '../../utils/diceRoller';

const MessageInput = ({
  playerName,
  onPlayerNameChange,
  playerMessage,
  onPlayerMessageChange,
  onSendMessage
}) => {
  const handleSend = () => {
    if (!playerMessage.trim() || !playerName.trim()) return;

    let messageContent = playerMessage;
    let diceResult = null;

    const diceMatch = playerMessage.match(/\/roll\s+(.+)/i);
    if (diceMatch) {
      diceResult = rollDice(diceMatch[1].trim());
      messageContent = diceResult ? 
        `🎲 Rolled ${diceResult.notation}: ${diceResult.detail}` : 
        `🎲 Invalid dice notation: ${diceMatch[1]}`;
    }

    onSendMessage(diceResult ? messageContent : playerMessage, diceResult);
    onPlayerMessageChange('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={playerName}
        onChange={(e) => onPlayerNameChange(e.target.value)}
        placeholder="Your character name"
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={playerMessage}
          onChange={(e) => onPlayerMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message or /roll 1d20..."
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!playerMessage.trim() || !playerName.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:border-slate-600 border border-blue-400 px-3 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          <Send size={16} />
        </button>
      </div>
      <div className="text-xs text-slate-400">
        💡 Tip: If your name matches a character, your message will appear as dialogue
      </div>
    </div>
  );
};

export default MessageInput;
