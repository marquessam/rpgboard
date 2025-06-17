// src/components/Scene/SceneModal.jsx
import React from 'react';
import { Upload } from 'lucide-react';

const SceneModal = ({
  sceneImage,
  sceneDescription,
  onSceneImageChange,
  onSceneDescriptionChange,
  onShowScene,
  onClose,
  onUpload
}) => {
  const handleShowScene = () => {
    if (sceneImage && sceneDescription) {
      onShowScene(sceneImage, sceneDescription);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-100 mb-4">
          Show Scene to Players
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-medium mb-2">Scene Image</label>
            {sceneImage && (
              <img 
                src={sceneImage} 
                alt="Scene" 
                className="w-full h-32 object-cover rounded-lg border border-slate-600 mb-2" 
              />
            )}
            <button
              onClick={() => onUpload('scene')}
              className="w-full bg-blue-500 hover:bg-blue-600 border border-blue-400 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200"
            >
              <Upload size={16} className="inline mr-2" />
              {sceneImage ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
          
          <div>
            <label className="block text-slate-300 font-medium mb-2">Description</label>
            <textarea
              value={sceneDescription}
              onChange={(e) => onSceneDescriptionChange(e.target.value)}
              placeholder="Describe what the players see..."
              className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 border border-slate-500 px-4 py-2 rounded-lg font-medium text-slate-300 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleShowScene}
            disabled={!sceneImage || !sceneDescription}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 border border-purple-400 disabled:border-slate-600 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            Show Scene
          </button>
        </div>
      </div>
    </div>
  );
};

export default SceneModal;
