// src/components/Chat/ChatPanel.jsx - Enhanced with controlled auto-scroll
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
  onMakeCharacterSpeak,
  autoScroll = true // New prop to control auto-scroll
}) => {
  const chatEndRef = useRef(null);
  const lastMessageCountRef = useRef(chatMessages.length);

  useEffect(() => {
    // Only auto-scroll if enabled and new messages were added by players
    if (autoScroll && chatMessages.length > lastMessageCountRef.current) {
      const newMessages = chatMessages.slice(lastMessageCountRef.current);
      
      // Only scroll for player messages, not character dialogue
      const shouldScroll = newMessages.some(msg => msg.type === 'player');
      
      if (shouldScroll) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    lastMessageCountRef.current = chatMessages.length;
  }, [chatMessages, autoScroll]);

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
    <div className="p-4">
      <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center">
        <Users className="mr-3" size={20} />
        Chat
      </h3>

      <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mb-4 h-80 overflow-y-auto transition-all duration-200">
        {chatMessages.length === 0 ? (
          <div className="text-slate-400 text-center py-8 text-sm">
            <Users className="mx-auto mb-2 opacity-50" size={32} />
            <p>Messages will appear here...</p>
            <p className="text-xs mt-2 opacity-75">Type messages or use /roll for dice</p>
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
