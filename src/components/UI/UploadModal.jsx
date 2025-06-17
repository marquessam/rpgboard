// src/components/UI/UploadModal.jsx
import React, { useRef } from 'react';

const UploadModal = ({ uploadType, onUpload, onClose }) => {
  const fileInputRef = useRef(null);

  const getUploadTitle = () => {
    switch (uploadType) {
      case 'sprite': return 'Upload Sprite';
      case 'portrait': return 'Upload Portrait';
      case 'terrain': return 'Upload Terrain Sprite';
      case 'scene': return 'Upload Scene Image';
      default: return 'Upload Image';
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload(file, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-100 mb-4">
          {getUploadTitle()}
        </h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 border border-slate-500 px-4 py-2 rounded-lg font-medium text-slate-300 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
