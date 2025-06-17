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
