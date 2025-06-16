// src/components/Dialogue/DialoguePopup.jsx
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
      <div className="max-w-2xl mx-auto pointer-events-auto" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #1e40af 100%)',
        fontFamily: 'monospace'
      }}>
        <div className="bg-blue-900 border-4 border-white rounded-lg p-6 shadow-2xl relative">
          {/* Queue indicator */}
          {queueLength > 0 && (
            <div className="absolute -top-3 -right-3 bg-yellow-500 border-2 border-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-black">
              {queueLength}
            </div>
          )}
          
          <div className="flex gap-4">
            {/* Portrait Frame */}
            <div className="w-24 h-24 bg-black border-2 border-white rounded flex-shrink-0 overflow-hidden">
              {speaker.portrait ? (
                <img
                  src={speaker.portrait}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {speaker.name.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Dialogue Text */}
            <div className="flex-1">
              <div className="text-yellow-300 font-bold mb-2 text-lg">
                {speaker.name}
              </div>
              <div className="text-white font-bold text-lg leading-relaxed">
                {text}
                {isTyping && <span className="animate-pulse text-yellow-300">▌</span>}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white hover:text-red-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialoguePopup;
