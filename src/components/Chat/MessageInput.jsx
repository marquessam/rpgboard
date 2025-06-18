// src/components/Chat/MessageInput.jsx - Enhanced with current actor support
import React, { useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { rollDice } from '../../utils/diceRoller';

const MessageInput = ({
  playerName,
  onPlayerNameChange,
  playerMessage,
  onPlayerMessageChange,
  onSendMessage,
  currentActor = null
}) => {
  // Auto-populate name when current actor changes
  useEffect(() => {
    if (currentActor && (!playerName || playerName === '')) {
      onPlayerNameChange(currentActor.name);
    }
  }, [currentActor, playerName, onPlayerNameChange]);

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
      <div className="flex items-center gap-2">
        <label className="text-slate-300 text-sm font-medium">Speaking as:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          placeholder="Character name"
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {currentActor && (
          <button
            onClick={() => onPlayerNameChange(currentActor.name)}
            className="bg-blue-500 hover:bg-blue-600 px-2 py-2 rounded-lg text-white transition-colors"
            title={`Speak as ${currentActor.name}`}
          >
            <User size={16} />
          </button>
        )}
      </div>
      
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
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:border-slate-600 border border-green-400 px-3 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/25"
        >
          <Send size={16} />
        </button>
      </div>
      
      <div className="text-xs text-slate-400">
        {currentActor ? (
          <>💡 Currently acting as <span className="text-blue-300">{currentActor.name}</span> - messages will appear as character dialogue</>
        ) : (
          <>💡 Select a character token to auto-populate name and control that character</>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
