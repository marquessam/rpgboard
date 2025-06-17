// src/hooks/useDialogue.js
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useDialogue = () => {
  const [dialogueQueue, setDialogueQueue] = useLocalStorage('dialogueQueue', []);
  const [showDialoguePopup, setShowDialoguePopup] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [currentDialogue, setCurrentDialogue] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Queue processor
  useEffect(() => {
    if (dialogueQueue.length > 0 && !isProcessingQueue) {
      const nextDialogue = dialogueQueue[0];
      setDialogueQueue(prev => prev.slice(1));
      setIsProcessingQueue(true);
      
      setCurrentSpeaker(nextDialogue.character);
      setCurrentDialogue(nextDialogue.text);
      setIsTyping(true);
      setShowDialoguePopup(true);
    }
  }, [dialogueQueue, isProcessingQueue]);

  // Typewriter effect
  useEffect(() => {
    if (currentDialogue && isTyping && typeof currentDialogue === 'string') {
      setDisplayedText('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < currentDialogue.length) {
          const char = currentDialogue.charAt(index);
          setDisplayedText(prev => prev + char);
          index++;
        } else {
          setIsTyping(false);
          
          const hasMoreMessages = dialogueQueue.length > 0;
          const waitTime = hasMoreMessages ? 4000 : 10000;
          
          setTimeout(() => {
            setShowDialoguePopup(false);
            setDisplayedText('');
            setCurrentSpeaker(null);
            setIsProcessingQueue(false);
          }, waitTime);
          
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [currentDialogue, isTyping, dialogueQueue.length]);

  const makeCharacterSpeak = (character, text) => {
    const dialogueEntry = {
      character: character,
      text: text,
      timestamp: Date.now()
    };
    
    setDialogueQueue(prev => [...prev, dialogueEntry]);
  };

  const closeDialogue = () => {
    setShowDialoguePopup(false);
    setDisplayedText('');
    setCurrentSpeaker(null);
    setIsProcessingQueue(false);
  };

  return {
    dialogueQueue,
    showDialoguePopup,
    currentSpeaker,
    displayedText,
    isTyping,
    makeCharacterSpeak,
    closeDialogue
  };
};
