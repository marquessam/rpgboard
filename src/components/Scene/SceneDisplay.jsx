// src/components/Scene/SceneDisplay.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SceneDisplay = ({ image, description, onClose }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (description && isTyping && typeof description === 'string') {
      setDisplayedText('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < description.length) {
          const char = description.charAt(index);
          setDisplayedText(prev => prev + char);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [description, isTyping]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-4xl w-full mx-4" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #1e40af 100%)',
        fontFamily: 'monospace'
      }}>
        <div className="bg-blue-900 border-4 border-white rounded-lg p-6 shadow-2xl">
          <div className="flex gap-6">
            {/* Scene Image */}
            <div className="flex-shrink-0">
              <img
                src={image}
                alt="Scene"
                className="w-64 h-48 object-cover rounded border-2 border-white"
              />
            </div>
            
            {/* Description */}
            <div className="flex-1">
              <div className="text-yellow-300 font-bold mb-4 text-xl">
                Scene Description
              </div>
              <div className="text-white font-bold text-lg leading-relaxed">
                {displayedText}
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

export default SceneDisplay;
