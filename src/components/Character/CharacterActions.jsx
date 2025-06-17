// src/components/Character/CharacterActions.jsx
import React from 'react';
import { Edit } from 'lucide-react';

const CharacterActions = ({
  characters,
  onEditCharacter,
  onMakeCharacterSpeak
}) => {
  if (characters.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-slate-300 font-medium mb-3">Character Actions:</h4>
      <div className="flex flex-wrap gap-2">
        {characters.map(character => (
          <div key={character.id} className="flex gap-1">
            <button
              onClick={() => onEditCharacter(character)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg font-medium text-slate-200 transition-all duration-200"
              title="Edit character"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded border"
                  style={{ 
                    backgroundColor: character.color,
                    borderColor: character.borderColor || '#ffffff'
                  }}
                />
                <span className="text-sm">{character.name}</span>
                <Edit size={12} />
              </div>
            </button>
            <button
              onClick={() => onMakeCharacterSpeak(character, character.quickMessage || `Hello! I'm ${character.name}.`)}
              className="px-2 py-2 bg-blue-500 hover:bg-blue-600 border border-blue-400 rounded-lg text-white transition-all duration-200 shadow-lg shadow-blue-500/25"
              title={`Quick message: "${(character.quickMessage || `Hello! I'm ${character.name}.`).substring(0, 50)}${(character.quickMessage || `Hello! I'm ${character.name}.`).length > 50 ? '...' : ''}"`}
            >
              💬
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterActions;
