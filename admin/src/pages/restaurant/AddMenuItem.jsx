import React, { useState } from 'react';
import ImageUploader from '../../components/ui/ImageUploader.jsx';

const AddMenuItem = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(150);
  const [category, setCategory] = useState('Local Dishes');
  const [status, setStatus] = useState('Available');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    const newItem = {
      id: `food-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      price,
      category,
      status,
      image: file ? URL.createObjectURL(file) : null
    };
    onSave?.(newItem);
  };

  return (
    <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-6 max-w-xl mx-auto font-montserrat">
      <div className="border-b border-border-gold-soft pb-4 mb-6">
        <h3 className="font-cinzel text-lg text-white font-semibold flex items-center gap-2">
          <i className="fas fa-plus text-gold" />
          Add Restaurant Menu Item
        </h3>
        <p className="text-[11px] text-text-muted mt-1">Register a food or drink item to showcase in the dining/bar menus.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="field">
          <label className="field-label">Item Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kitfo Special"
            className="field-input rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="field">
            <label className="field-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>Local Dishes</option>
              <option>International Dishes</option>
              <option>Appetizers</option>
              <option>Desserts</option>
              <option>Beverages</option>
              <option>Wine & Cocktails</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Price (ETB)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="field-input rounded"
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter ingredients, portion sizes, preparation details..."
            className="w-full bg-dark-3 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-20"
          />
        </div>

        <div className="field">
          <label className="field-label">Availability Status</label>
          <div className="flex gap-4 mt-1">
            {['Available', 'Sold Out'].map((s) => (
              <label key={s} className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-gold"
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Item Photo</label>
          <ImageUploader onUpload={(f) => setFile(f)} maxSizeMB={3} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border-gold-soft">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline btn-sm rounded"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-gold btn-sm rounded font-semibold"
          >
            Add Menu Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMenuItem;
