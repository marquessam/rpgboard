// src/components/Chat/ChatPanel.jsx - Enhanced with inventory display
import React, { useRef, useEffect, useState } from 'react';
import { Users, Package, X } from 'lucide-react';
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
  autoScroll = true, // New prop to control auto-scroll
  playerInventory = [], // Add inventory prop
  onRemoveInventoryItem = null // Add inventory management
}) => {
  const chatEndRef = useRef(null);
  const lastMessageCountRef = useRef(chatMessages.length);
  const [showInventory, setShowInventory] = useState(false);

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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-100 flex items-center">
          <Users className="mr-3" size={20} />
          Chat
        </h3>
        
        {/* Inventory Button */}
        {playerInventory && playerInventory.length > 0 && (
          <button
            onClick={() => setShowInventory(!showInventory)}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg text-white text-sm transition-colors"
          >
            <Package size={16} />
            Inventory ({playerInventory.length})
          </button>
        )}
      </div>

      {/* Inventory Display */}
      {showInventory && playerInventory && (
        <div className="mb-4 bg-slate-700/50 border border-slate-600 rounded-lg p-3">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-yellow-300 flex items-center gap-2">
              <Package size={16} />
              Your Inventory
            </h4>
            <button
              onClick={() => setShowInventory(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {playerInventory.map((item, index) => (
              <div key={item.id || index} className="flex justify-between items-center p-2 bg-slate-800/50 rounded border border-slate-600">
                <div>
                  <div className="text-white text-sm font-medium">
                    {item.name} {item.actualQuantity > 1 && `x${item.actualQuantity}`}
                  </div>
                  <div className="text-xs text-slate-400">
                    From: {item.source} • {item.dateObtained}
                  </div>
                </div>
                {onRemoveInventoryItem && (
                  <button
                    onClick={() => onRemoveInventoryItem(index)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {playerInventory.length === 0 && (
            <div className="text-slate-400 text-center py-4 text-sm">
              No items in inventory
            </div>
          )}
        </div>
      )}

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
