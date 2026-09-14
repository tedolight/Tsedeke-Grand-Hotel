import React, { useState, useEffect, useMemo } from 'react';
import testimonialService from '../../services/testimonial/testimonialService.js';
import { getImageUrl } from '../../utils/imageHelpers.js';

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);

  // Form inputs
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [origin, setOrigin] = useState('');
  const [rating, setRating] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await testimonialService.uploadImage(file);
      const uploadedUrl = res?.data?.url || res?.data?.path || res?.data || res?.url;
      if (uploadedUrl) {
        setImage(uploadedUrl);
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast('Failed to upload image', 'warning');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast(error.response?.data?.message || 'Error uploading image', 'warning');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await testimonialService.getTestimonials();
      setTestimonials(res.data || res);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
      showToast('Error loading testimonials', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setQuote('');
    setAuthor('');
    setImage('');
    setOrigin('');
    setRating(5);
    setIsActive(true);
    setCurrentTestimonial(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!quote || !author) {
      showToast('Quote and Author are required', 'warning');
      return;
    }

    try {
      await testimonialService.createTestimonial({ quote, author, image, origin, rating, isActive });
      showToast('Testimonial created successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      await fetchTestimonials();
    } catch (err) {
      console.error('Failed to create testimonial:', err);
      showToast('Failed to create testimonial', 'warning');
    }
  };

  const startEdit = (t) => {
    setCurrentTestimonial(t);
    setQuote(t.quote);
    setAuthor(t.author);
    setImage(t.image || '');
    setOrigin(t.origin || '');
    setRating(t.rating || 5);
    setIsActive(t.isActive !== false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentTestimonial) return;

    try {
      await testimonialService.updateTestimonial(currentTestimonial._id, { quote, author, image, origin, rating, isActive });
      showToast('Testimonial updated successfully!', 'success');
      setShowEditModal(false);
      resetForm();
      await fetchTestimonials();
    } catch (err) {
      console.error('Failed to update testimonial:', err);
      showToast('Failed to update testimonial', 'warning');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await testimonialService.deleteTestimonial(id);
        showToast('Testimonial deleted', 'warning');
        await fetchTestimonials();
      } catch (err) {
        console.error('Failed to delete testimonial:', err);
        showToast('Failed to delete testimonial', 'warning');
      }
    }
  };

  const handleToggleActive = async (t) => {
    try {
      const updatedStatus = !t.isActive;
      await testimonialService.updateTestimonial(t._id, { ...t, isActive: updatedStatus });
      showToast(`Testimonial is now ${updatedStatus ? 'active' : 'hidden'}`, 'info');
      await fetchTestimonials();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast('Failed to change status', 'warning');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gold font-montserrat">
        <i className="fas fa-spinner fa-spin text-3xl mb-4 text-gold" />
        <span className="text-xs uppercase tracking-[2px] text-text-muted">Loading Testimonials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-montserrat select-none relative pb-10">
      
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(t => {
          const c = t.type === 'success' ? { bg:'bg-[#1c3a2a]', border:'border-[#4CAF8A]', color:'text-[#4CAF8A]', icon:'circle-check' } :
                    t.type === 'warning' ? { bg:'bg-[#3a2e14]', border:'border-[#E8A84C]', color:'text-[#E8A84C]', icon:'triangle-exclamation' } :
                                           { bg:'bg-[#1a1a1a]', border:'border-[#C9A84C]', color:'text-[#C9A84C]', icon:'circle-info' };
          return (
            <div key={t.id} className={`p-3.5 px-5 rounded-lg flex items-center gap-3 shadow-2xl border text-xs ${c.bg} ${c.border} ${c.color} animate-bounce`}>
              <i className={`fas fa-${c.icon}`} /> {t.message}
            </div>
          );
        })}
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
        <div>
          <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">
            Guest <span className="font-cormorant font-light text-2xl text-gold italic">Experiences</span>
          </h1>
          <p className="text-[11px] text-text-muted tracking-[0.5px]">Communication / <span className="text-gold">Testimonials</span></p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2.5 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fas fa-plus" /> Add Testimonial
        </button>
      </div>

      {/* Grid of Testimonials */}
      {testimonials.length === 0 ? (
        <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-10 text-center">
          <p className="text-sm text-text-muted">No testimonials registered. Click the button above to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t._id} className={`bg-dark-3 border rounded-lg p-6 flex flex-col justify-between hover:border-gold transition-colors duration-300 relative ${t.isActive ? 'border-border-gold-soft' : 'border-red-500/20 opacity-75'}`}>
              {!t.isActive && (
                <span className="absolute top-3 right-3 bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[8px] uppercase tracking-[1px] px-2 py-0.5 rounded-sm">
                  Hidden
                </span>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-3xl font-cormorant text-gold opacity-20 leading-none">"</div>
                  {t.image && (
                    <img src={getImageUrl(t.image)} alt={t.author} className="w-10 h-10 rounded-full object-cover border border-gold/30" />
                  )}
                </div>
                <p className="text-xs text-white-dim leading-relaxed italic mb-4 font-montserrat font-light">
                  {t.quote}
                </p>
                <div className="text-gold text-[10px] tracking-[2px] mb-4">
                  {'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-border-gold-soft/50 pt-4 mt-2">
                <div>
                  <div className="font-cinzel text-[11px] text-gold font-semibold tracking-[1px]">{t.author}</div>
                  {t.origin && <div className="text-[9px] text-text-muted mt-0.5">{t.origin}</div>}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleActive(t)}
                    className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors border ${t.isActive ? 'bg-dark-4 border-border-gold-soft text-text-muted hover:border-gold hover:text-gold' : 'bg-gold-glow border-gold text-gold hover:bg-gold hover:text-black'}`}
                    title={t.isActive ? 'Hide testimonial' : 'Show testimonial'}
                  >
                    <i className={t.isActive ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                  </button>
                  <button 
                    onClick={() => startEdit(t)}
                    className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                    title="Edit"
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t._id)}
                    className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-danger hover:text-danger text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                    title="Delete"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-dark-2 border border-border-gold w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="p-5 px-6 border-b border-border-gold-soft bg-dark-3 flex items-center justify-between">
              <span className="font-cinzel text-sm text-gold font-bold tracking-[1px]">Add Testimonial</span>
              <button type="button" onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded border border-border-gold-soft bg-dark-4 hover:border-danger hover:text-danger flex items-center justify-center cursor-pointer transition-colors">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-white">
              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Quote / Review Content *</label>
                <textarea 
                  required
                  placeholder="Enter the guest review text here..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-28 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Testimonial Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {image && (
                    <div className="relative group/avatar">
                      <img src={getImageUrl(image)} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gold/30 shrink-0" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full flex items-center justify-center text-[8px] cursor-pointer hover:bg-danger/80"
                        title="Remove photo"
                      >
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="w-full bg-dark-4 border border-border-gold rounded p-1.5 text-xs text-white outline-none focus:border-gold file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-[1px] file:font-semibold file:bg-gold file:text-dark-1 hover:file:bg-gold-light transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                {isUploading && <span className="text-[10px] text-gold animate-pulse mt-1 block">Uploading image...</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Author Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Sarah M."
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Origin / City</label>
                  <input 
                    type="text" 
                    placeholder="e.g. London, UK"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Rating (Stars)</label>
                  <select 
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Status</label>
                  <select 
                    value={isActive}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 px-6 border-t border-border-gold-soft bg-dark-3 flex justify-end gap-2.5">
              <button type="button" onClick={() => setShowAddModal(false)} className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[10px] tracking-[1px] uppercase font-semibold py-2 px-6 rounded cursor-pointer transition-colors">Cancel</button>
              <button type="submit" className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1px] uppercase font-bold py-2 px-6 rounded cursor-pointer transition-colors">Save Testimonial</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-dark-2 border border-border-gold w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="p-5 px-6 border-b border-border-gold-soft bg-dark-3 flex items-center justify-between">
              <span className="font-cinzel text-sm text-gold font-bold tracking-[1px]">Edit Testimonial</span>
              <button type="button" onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded border border-border-gold-soft bg-dark-4 hover:border-danger hover:text-danger flex items-center justify-center cursor-pointer transition-colors">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-white">
              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Quote / Review Content *</label>
                <textarea 
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-28 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Testimonial Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {image && (
                    <div className="relative group/avatar">
                      <img src={getImageUrl(image)} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gold/30 shrink-0" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full flex items-center justify-center text-[8px] cursor-pointer hover:bg-danger/80"
                        title="Remove photo"
                      >
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="w-full bg-dark-4 border border-border-gold rounded p-1.5 text-xs text-white outline-none focus:border-gold file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-[1px] file:font-semibold file:bg-gold file:text-dark-1 hover:file:bg-gold-light transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                {isUploading && <span className="text-[10px] text-gold animate-pulse mt-1 block">Uploading image...</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Author Name *</label>
                  <input 
                    type="text" 
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Origin / City</label>
                  <input 
                    type="text" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Rating (Stars)</label>
                  <select 
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Status</label>
                  <select 
                    value={isActive}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 px-6 border-t border-border-gold-soft bg-dark-3 flex justify-end gap-2.5">
              <button type="button" onClick={() => setShowEditModal(false)} className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[10px] tracking-[1px] uppercase font-semibold py-2 px-6 rounded cursor-pointer transition-colors">Cancel</button>
              <button type="submit" className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1px] uppercase font-bold py-2 px-6 rounded cursor-pointer transition-colors">Update Testimonial</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ManageTestimonials;
