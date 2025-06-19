// src/components/UI/UploadModal.jsx - Enhanced with user feedback
import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const UploadModal = ({ uploadType, onUpload, onClose, isDatabaseConnected }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [statusMessage, setStatusMessage] = useState('');

  const getUploadTitle = () => {
    switch (uploadType) {
      case 'sprite': return 'Upload Sprite';
      case 'portrait': return 'Upload Portrait';
      case 'terrain': return 'Upload Terrain Sprite';
      case 'scene': return 'Upload Scene Image';
      default: return 'Upload Image';
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploading(true);
      setUploadStatus(null);
      setStatusMessage('');

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            setStatusMessage(isDatabaseConnected ? 'Uploading to cloud database...' : 'Processing image...');
            
            // Simulate the upload process that happens in App.jsx
            await onUpload(file, e.target.result);
            
            setUploadStatus('success');
            setStatusMessage(isDatabaseConnected ? 
              'Successfully uploaded to cloud database!' : 
              'Image processed successfully!'
            );
            
            // Auto-close after success
            setTimeout(() => {
              onClose();
            }, 1500);
            
          } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setStatusMessage(`Upload failed: ${error.message || 'Unknown error'}`);
          } finally {
            setUploading(false);
          }
        };
        
        reader.onerror = () => {
          setUploading(false);
          setUploadStatus('error');
          setStatusMessage('Failed to read file');
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        setUploading(false);
        setUploadStatus('error');
        setStatusMessage(`Upload failed: ${error.message}`);
      }
    } else {
      setUploadStatus('error');
      setStatusMessage('Please select a valid image file');
    }
  };

  const resetState = () => {
    setUploading(false);
    setUploadStatus(null);
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!uploading) {
      resetState();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center">
          <Upload className="mr-2" size={20} />
          {getUploadTitle()}
        </h3>

        {/* Database Status Indicator */}
        <div className="mb-4 p-3 rounded-lg bg-slate-700/50">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isDatabaseConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-slate-300">
              {isDatabaseConnected ? 
                '☁️ Connected to cloud database' : 
                '💾 Using local storage (database offline)'
              }
            </span>
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className={`w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />

        {/* Upload Status */}
        {(uploading || uploadStatus) && (
          <div className={`mb-4 p-3 rounded-lg border flex items-start gap-3 ${
            uploadStatus === 'success' ? 'bg-green-500/10 border-green-500/30' :
            uploadStatus === 'error' ? 'bg-red-500/10 border-red-500/30' :
            'bg-blue-500/10 border-blue-500/30'
          }`}>
            {uploading && <Loader className="animate-spin flex-shrink-0 mt-0.5" size={16} />}
            {uploadStatus === 'success' && <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />}
            {uploadStatus === 'error' && <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />}
            
            <div className="text-sm">
              <div className={`font-medium ${
                uploadStatus === 'success' ? 'text-green-300' :
                uploadStatus === 'error' ? 'text-red-300' :
                'text-blue-300'
              }`}>
                {uploading ? 'Uploading...' :
                 uploadStatus === 'success' ? 'Upload Successful' :
                 uploadStatus === 'error' ? 'Upload Failed' : ''}
              </div>
              {statusMessage && (
                <div className="text-slate-400 mt-1">{statusMessage}</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            disabled={uploading}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              uploading 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-600 hover:bg-slate-500 border border-slate-500 text-slate-300'
            }`}
          >
            {uploading ? 'Uploading...' : 'Close'}
          </button>
          
          {uploadStatus === 'error' && (
            <button
              onClick={resetState}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-slate-900 rounded text-xs text-slate-400">
            <div>Debug Info:</div>
            <div>• Upload Type: {uploadType}</div>
            <div>• Database: {isDatabaseConnected ? 'Connected' : 'Disconnected'}</div>
            <div>• Status: {uploadStatus || 'Ready'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
