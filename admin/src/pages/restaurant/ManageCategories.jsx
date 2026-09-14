import React, { useState } from 'react';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Local Dishes', count: 12, description: 'Traditional Ethiopian food including Injera, Wat, Kitfo, and Tibs.' },
  { id: 2, name: 'International Dishes', count: 8, description: 'Western, European, and Pan-Asian standard entrees.' },
  { id: 3, name: 'Appetizers', count: 6, description: 'Light starters, salads, and side dishes.' },
  { id: 4, name: 'Desserts', count: 4, description: 'Sweet cakes, local honey pastries, and fruit assortments.' },
  { id: 5, name: 'Beverages', count: 15, description: 'Local fruit juices, soft drinks, and Ethiopian traditional coffee.' },
  { id: 6, name: 'Wine & Cocktails', count: 11, description: 'House wines, imported spirits, and custom signature cocktails.' }
];

const ManageCategories = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [showAdd, setShowAdd] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;
    const newCat = {
      id: categories.length + 1,
      name: newCatName,
      count: 0,
      description: newCatDesc
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 font-montserrat">
      <div className="flex justify-between items-center border-b border-border-gold-soft pb-5">
        <div>
          <h2 className="font-cinzel text-lg text-white font-semibold">Menu Categories</h2>
          <p className="text-[10px] text-text-muted tracking-[0.5px]">Configure categories for the restaurant and bar menus</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className={`fas ${showAdd ? 'fa-times' : 'fa-plus'}`} /> {showAdd ? 'Close Form' : 'Add Category'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddCategory} className="bg-dark-3 border border-border-gold p-5 rounded-lg max-w-lg mx-auto space-y-4 transition-all duration-300">
          <h4 className="font-cinzel text-sm text-gold font-semibold uppercase">New Category Details</h4>
          
          <div className="field">
            <label className="field-label">Category Name</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Breakfast Specials"
              className="field-input rounded"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Description</label>
            <textarea
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Briefly describe what items are grouped under this category..."
              className="w-full bg-dark-4 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-16"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="btn btn-outline btn-sm rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold btn-sm rounded font-semibold"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-gold-soft bg-dark-2/40">
              <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">ID</th>
              <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Category Name</th>
              <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Description</th>
              <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px] text-center">Items count</th>
              <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-gold-soft/50">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-dark-4/30 transition-colors">
                <td className="p-4 text-xs font-mono text-text-muted">#{c.id}</td>
                <td className="p-4 text-xs font-semibold text-white">{c.name}</td>
                <td className="p-4 text-xs text-white-dim max-w-xs truncate">{c.description}</td>
                <td className="p-4 text-xs text-gold font-medium text-center">{c.count} items</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-[10px] py-1.5 px-3 rounded cursor-pointer transition-colors">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="bg-transparent border border-danger/20 hover:bg-danger/10 hover:border-danger text-danger text-[10px] py-1.5 px-3 rounded cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCategories;
