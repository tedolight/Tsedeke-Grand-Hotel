import React, { useState } from 'react';
import ImageUploader from '../../components/ui/ImageUploader.jsx';

const UploadImages = ({ onSave, onCancel }) => {
  const [tag, setTag] = useState('Rooms');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    setUploadedFiles(fileList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadedFiles.length === 0) return;
    setIsUploading(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      tag,
      url: URL.createObjectURL(file),
      date: new Date().toLocaleDateString()
    }));
    
    onSave?.(results);
    setIsUploading(false);
    setUploadedFiles([]);
  };

  return (
    <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-6 max-w-xl mx-auto font-montserrat">
      <div className="border-b border-border-gold-soft pb-4 mb-6">
        <h3 className="font-cinzel text-lg text-white font-semibold flex items-center gap-2">
          <i className="fas fa-images text-gold" />
          Upload Gallery Images
        </h3>
        <p className="text-[11px] text-text-muted mt-1">Upload high-resolution images to show on the public website gallery.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="field">
          <label className="field-label">Gallery Category</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="field-select rounded bg-dark-3 border border-border-gold"
          >
            <option>Rooms</option>
            <option>Restaurant</option>
            <option>Events</option>
            <option>Coffee Bar</option>
            <option>Lobby & Exterior</option>
          </select>
          <span className="text-[10px] text-text-muted mt-1.5 block">Select where these images should be displayed in the filters.</span>
        </div>

        <div className="field">
          <label className="field-label">Select Images</label>
          <ImageUploader 
            onUpload={handleUpload} 
            multiple={true} 
            accept="image/*" 
            maxSizeMB={5} 
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border-gold-soft">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline btn-sm rounded"
              disabled={isUploading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={uploadedFiles.length === 0 || isUploading}
            className="btn btn-gold btn-sm rounded font-semibold disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Publish to Gallery'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadImages;
