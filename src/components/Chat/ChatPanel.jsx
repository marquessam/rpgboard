// src/components/Chat/ChatPanel.jsx
import React, { useRef, useEffect } from 'react';
import { Users } from 'lucide-react';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';

const ChatPanel = ({
  chatMessages,
  onAddMessage,
  playerMessage,
  onPlayerMessageChange,
  playerName,
  onPlayerNameChange,
  characters,
  onMakeCharacterSpeak
}) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (message, diceResult = null) => {
    // Find character with this name or create a speaker
    const character = characters.find(char => 
      char.name.toLowerCase() === playerName.toLowerCase()
    );

    if (character && !diceResult) {
      // Make the character speak with dialogue popup
      onMakeCharacterSpeak(character, message);
    } else {
      // Regular chat message
      onAddMessage(prev => [...prev, {
        type: 'player', 
        name: playerName, 
        text: message,
        diceResult: diceResult, 
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-slate-100 mb-4">
        <Users className="inline mr-3" size={20} />
        Chat Log
      </h3>

      <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mb-4 h-72 overflow-y-auto">
        {chatMessages.length === 0 ? (
          <div className="text-slate-400 text-center py-8 text-sm">
            <Users className="mx-auto mb-2" size={32} />
            Messages will appear here...
          </div>
        ) : (
          <div className="space-y-3">
            {chatMessages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <MessageInput
        playerName={playerName}
        onPlayerNameChange={onPlayerNameChange}
        playerMessage={playerMessage}
        onPlayerMessageChange={onPlayerMessageChange}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatPanel;

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
