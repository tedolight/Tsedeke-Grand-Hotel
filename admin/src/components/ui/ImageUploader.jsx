import React, { useRef, useState } from 'react';

const ImageUploader = ({ onUpload, multiple = false, accept = 'image/*', maxSizeMB = 5, showPreviews = true }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const handleFiles = (files) => {
    setError('');
    const valid = [];
    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit.`);
        continue;
      }
      valid.push(file);
      if (showPreviews) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviews((prev) => [...prev, { name: file.name, src: e.target.result }]);
        reader.readAsDataURL(file);
      }
    }
    if (valid.length > 0) onUpload?.(multiple ? valid : valid[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles([...e.dataTransfer.files]);
  };

  const removePreview = (i) => setPreviews((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-gold bg-gold-glow' : 'border-border-gold hover:border-gold'
        }`}
      >
        <i className="fas fa-cloud-upload-alt text-3xl text-text-muted mb-3 block" />
        <p className="text-xs text-text-muted">Drag & drop images here or <span className="text-gold">browse files</span></p>
        <p className="text-[10px] text-text-muted mt-1">Max {maxSizeMB}MB per file</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles([...e.target.files]);
            }
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {showPreviews && previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative group">
              <img src={p.src} alt={p.name} className="w-full h-24 object-cover rounded-lg" />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <i className="fas fa-times text-white text-[10px]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
