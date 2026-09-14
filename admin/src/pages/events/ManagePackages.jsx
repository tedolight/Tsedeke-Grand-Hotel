import React, { useState } from 'react';

const INITIAL_PACKAGES = [
  { id: 1, name: 'Royal Gold Wedding Package', price: 95000, type: 'Wedding', description: 'Our signature full-service wedding package offering complete hall decoration, catering, traditional coffee ceremony, and VIP services.', inclusions: ['Grand Ballroom Rental (12 hours)', 'Traditional Ethiopian Buffet (up to 300 guests)', 'Premium Flower & Gold Draping Decoration', 'Traditional Coffee Ceremony (Live)', 'Professional Sound System & Stage Lighting', 'VIP Bridal Suite (Complimentary 1 Night)', 'Dedicated Event Coordinator'] },
  { id: 2, name: 'Executive Conference Package', price: 35000, type: 'Conference', description: 'Optimized setup for corporate events, board meetings, and organizational planning sessions.', inclusions: ['Lalibela Hall Rental (8 hours)', 'Audio Visual Setup (HD Projector & High-speed WiFi)', 'Wireless Mics & Sound Recording Support', 'Twice-daily Coffee/Tea Break with Pastries', 'Executive Buffet Lunch', 'Notepads, Pens, and Mineral Water', 'Business Center Support Services'] },
  { id: 3, name: 'Tsedeke Grand Gala Banquet', price: 55000, type: 'Banquet', description: 'Perfect for charity fundraisers, corporate anniversaries, and high-profile cocktail galas.', inclusions: ['Grand Ballroom Rental (6 hours)', 'Custom Cocktail & Dinner Buffet Options', 'Elegant Ambient Lighting Design', 'Stage Backdrop & Banner Setup', 'Table linens, centerpieces, and staff service', 'Security & Valet Parking coordination'] }
];

const ManagePackages = () => {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(30000);
  const [type, setType] = useState('Wedding');
  const [description, setDescription] = useState('');
  const [inclusionInput, setInclusionInput] = useState('');

  const handleAddPackage = (e) => {
    e.preventDefault();
    if (!name) return;
    const newPackage = {
      id: packages.length + 1,
      name,
      price,
      type,
      description,
      inclusions: inclusionInput.split('\n').filter(i => i.trim() !== '')
    };
    setPackages(prev => [...prev, newPackage]);
    setShowAddModal(false);
    setName('');
    setPrice(30000);
    setDescription('');
    setInclusionInput('');
  };

  return (
    <div className="space-y-6 font-montserrat">
      <div className="flex justify-between items-center border-b border-border-gold-soft pb-5">
        <div>
          <h2 className="font-cinzel text-lg text-white font-semibold">Event Packages</h2>
          <p className="text-[10px] text-text-muted tracking-[0.5px]">Manage packages, features, and rates for venues</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fas fa-plus" /> Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-dark-3 border border-border-gold-soft hover:border-border-gold rounded-lg p-5 flex flex-col justify-between transition-all duration-300 relative group">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-gold-glow border border-border-gold text-gold text-[9px] font-bold p-1 px-2.5 rounded-full uppercase">
                  {pkg.type}
                </span>
                <span className="font-cinzel text-gold text-sm font-semibold">{(pkg.price || 0).toLocaleString()} ETB</span>
              </div>
              <h4 className="font-cinzel text-md text-white font-semibold mb-2">{pkg.name}</h4>
              <p className="text-[11px] text-text-muted mb-4 leading-relaxed">{pkg.description}</p>
              
              <div className="border-t border-border-gold-soft pt-4 mb-4">
                <span className="text-[9px] tracking-[1px] uppercase text-text-muted font-semibold block mb-2">INCLUSIONS</span>
                <ul className="space-y-1.5">
                  {pkg.inclusions.map((item, idx) => (
                    <li key={idx} className="text-xs text-white-dim flex items-start gap-2">
                      <i className="fas fa-check text-gold text-[9px] mt-1 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-border-gold-soft/50 flex gap-2 justify-end">
              <button className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-[10px] py-1.5 px-3.5 rounded transition-colors flex items-center gap-1 cursor-pointer">
                <i className="fas fa-edit" /> Edit
              </button>
              <button 
                onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}
                className="bg-transparent border border-danger/20 hover:bg-danger/10 hover:border-danger text-danger text-[10px] py-1.5 px-3.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <i className="fas fa-trash-alt" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-2 border border-border-gold rounded-lg w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-border-gold-soft flex items-center justify-between">
              <h4 className="font-cinzel text-md text-white font-semibold">Create Event Package</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-white cursor-pointer"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleAddPackage} className="p-5 space-y-4">
              <div className="field">
                <label className="field-label">Package Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bronze Cocktail Package"
                  className="field-input rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="field">
                  <label className="field-label">Package Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="field-select rounded bg-dark-3 border border-border-gold"
                  >
                    <option>Wedding</option>
                    <option>Conference</option>
                    <option>Banquet</option>
                    <option>Cocktail</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Rate (ETB)</label>
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
                  placeholder="Brief summary of the package..."
                  className="w-full bg-dark-3 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-16"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Inclusions (One per line)</label>
                <textarea
                  value={inclusionInput}
                  onChange={(e) => setInclusionInput(e.target.value)}
                  placeholder="e.g. 10 hours room hire&#10;Ethiopian buffet catering&#10;Complimentary water"
                  className="w-full bg-dark-3 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-24"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-gold-soft">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline btn-sm rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-sm rounded font-semibold"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePackages;
