import React, { useState, useEffect, useMemo } from 'react';
import amenityService from '../../services/amenity/amenityService.js';

const ManageAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('All'); // 'All', 'Featured', 'Standard'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    isFeatured: false,
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const data = await amenityService.getAmenities();
      const items = Array.isArray(data) ? data : (data?.data || []);
      setAmenities(items);
    } catch (error) {
      showToast('Failed to load amenities data', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Compute stats for header dashboard
  const stats = useMemo(() => {
    const total = amenities.length;
    const featuredCount = amenities.filter(a => a.isFeatured).length;
    const standardCount = total - featuredCount;
    return { total, featuredCount, standardCount };
  }, [amenities]);

  // Filtered & Searched List
  const filteredAmenities = useMemo(() => {
    return amenities.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterFeatured === 'All' || 
                            (filterFeatured === 'Featured' && item.isFeatured) || 
                            (filterFeatured === 'Standard' && !item.isFeatured);
      return matchesSearch && matchesFilter;
    });
  }, [amenities, searchQuery, filterFeatured]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const openModal = (amenity = null) => {
    if (amenity) {
      setEditingId(amenity._id);
      setFormData({
        title: amenity.title,
        description: amenity.description,
        image: amenity.image,
        isFeatured: amenity.isFeatured || false,
        order: amenity.order || 0,
      });
      setFilePreview(amenity.image);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        isFeatured: false,
        order: amenities.length + 1,
      });
      setFilePreview(null);
    }
    setFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if selected locally
      if (file) {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const uploadRes = await amenityService.uploadImage(uploadData);
        imageUrl = uploadRes.data?.url || uploadRes.url;
      }

      const submitData = { ...formData, image: imageUrl };

      if (editingId) {
        await amenityService.updateAmenity(editingId, submitData);
        showToast('Amenity updated successfully', 'success');
      } else {
        await amenityService.createAmenity(submitData);
        showToast('Amenity created successfully', 'success');
      }
      
      closeModal();
      fetchAmenities();
    } catch (error) {
      showToast('Error saving amenity', 'warning');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await amenityService.deleteAmenity(id);
        showToast('Amenity removed successfully', 'warning');
        fetchAmenities();
      } catch (error) {
        showToast('Error removing amenity', 'warning');
      }
    }
  };

  return (
    <div className="space-y-6 select-none font-montserrat">
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg text-xs font-semibold shadow-lg border transition-all duration-300 transform animate-fade-in ${
              toast.type === 'success' ? 'bg-[#122e1b] text-[#81c784] border-[#4caf50]' :
              toast.type === 'warning' ? 'bg-[#3b1c1c] text-[#ef9a9a] border-[#e57373]' :
              'bg-[#1a1813] text-[#e8c97a] border-[#c9a84c]'
            }`}
          >
            <i className={`fa-solid ${
              toast.type === 'success' ? 'fa-circle-check' :
              toast.type === 'warning' ? 'fa-circle-exclamation' :
              'fa-circle-info'
            }`}></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-gold-soft pb-6">
        <div>
          <h1 className="font-cinzel text-2xl text-white tracking-[1.5px] font-bold uppercase">HOTEL AMENITIES MANAGER</h1>
          <p className="text-xs text-text-muted tracking-[1px] font-medium mt-1 uppercase">
            CONTROL WORLD-CLASS FACILITIES, SERVICES AND HOME PAGE DISPLAYS
          </p>
        </div>

        <button 
          onClick={() => openModal()}
          className="bg-gold text-dark-1 px-5 py-2.5 text-xs font-bold tracking-wider uppercase rounded-md hover:bg-gold-light transition duration-300 shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Add Amenity</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-2 border border-border-gold-soft rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase block">Total Facilities</span>
            <span className="text-2xl font-cinzel font-bold text-white mt-1 block">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <i className="fa-solid fa-concierge-bell"></i>
          </div>
        </div>

        <div className="bg-dark-2 border border-border-gold-soft rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase block">Featured Highlights</span>
            <span className="text-2xl font-cinzel font-bold text-gold mt-1 block">{stats.featuredCount}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <i className="fa-solid fa-star"></i>
          </div>
        </div>

        <div className="bg-dark-2 border border-border-gold-soft rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase block">Standard Facilities</span>
            <span className="text-2xl font-cinzel font-bold text-white-dim mt-1 block">{stats.standardCount}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-white-dim">
            <i className="fa-solid fa-layer-group"></i>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-2 border border-border-gold-soft p-3 rounded-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted"></i>
          <input 
            type="text" 
            placeholder="Search amenities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-1 border border-border-gold-soft rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-text-muted focus:border-gold outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] text-text-muted uppercase font-semibold tracking-wider mr-1 whitespace-nowrap">Filter:</span>
          {['All', 'Featured', 'Standard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterFeatured(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition duration-200 whitespace-nowrap ${
                filterFeatured === tab 
                  ? 'bg-gold text-dark-1 shadow-sm' 
                  : 'bg-dark-1 text-text-muted hover:text-white border border-border-gold-soft/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-2 border border-border-gold-soft rounded-lg text-text-muted space-y-3">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-gold"></i>
          <span className="text-xs uppercase tracking-widest">Loading Amenities Data...</span>
        </div>
      ) : filteredAmenities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-2 border border-border-gold-soft rounded-lg text-text-muted space-y-3">
          <i className="fa-solid fa-ghost text-3xl text-gold/40"></i>
          <span className="text-sm font-cinzel text-white">No Amenities Found</span>
          <p className="text-xs text-text-muted max-w-sm text-center">No facilities match your search criteria. Try resetting the filter or click "Add Amenity" to create a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAmenities.map((amenity) => (
            <div 
              key={amenity._id} 
              className="bg-dark-2 border border-border-gold-soft rounded-lg overflow-hidden group hover:border-gold/60 transition-all duration-300 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="h-44 overflow-hidden relative border-b border-border-gold-soft/40">
                  <img 
                    src={amenity.image} 
                    alt={amenity.title} 
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-2/90 via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {amenity.isFeatured && (
                      <span className="bg-gold text-dark-1 font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <i className="fa-solid fa-star text-[8px]"></i> Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur text-white-dim text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                    #{amenity.order || 0}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 flex gap-2">
                    <button 
                      onClick={() => openModal(amenity)} 
                      title="Edit Amenity"
                      className="w-8 h-8 rounded-full bg-dark-1/90 backdrop-blur border border-gold/40 text-gold hover:bg-gold hover:text-dark-1 flex items-center justify-center transition shadow"
                    >
                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(amenity._id, amenity.title)} 
                      title="Delete Amenity"
                      className="w-8 h-8 rounded-full bg-dark-1/90 backdrop-blur border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition shadow"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4.5">
                  <h3 className="font-cinzel text-sm font-bold text-gold tracking-wide uppercase mb-1.5 line-clamp-1">
                    {amenity.title}
                  </h3>
                  <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
                    {amenity.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4.5 py-3 border-t border-border-gold-soft/30 bg-dark-3/50 flex items-center justify-between text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-eye text-[10px] text-gold/70"></i> Public Display
                </span>
                <span className="font-mono text-[10px] text-white-dim">
                  {amenity.isFeatured ? 'Home Section' : 'Standard'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-gold-soft pb-3 sticky top-0 bg-dark-2 z-10">
              <h2 className="font-cinzel text-base sm:text-lg text-gold font-bold tracking-wide uppercase flex items-center gap-2">
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-circle-plus'}`}></i>
                <span>{editingId ? 'Edit Amenity' : 'Add New Amenity'}</span>
              </h2>
              <button 
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-dark-1 border border-border-gold-soft text-text-muted hover:text-white hover:border-gold flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mb-1 block font-montserrat">
                  Amenity Title
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Grand Entrance"
                  className="w-full bg-dark-1 border border-border-gold-soft rounded-md px-3 py-2 text-white text-xs font-montserrat focus:border-gold outline-none transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mb-1 block font-montserrat">
                  Description
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  rows="2"
                  placeholder="Brief overview of the amenity..."
                  className="w-full bg-dark-1 border border-border-gold-soft rounded-md px-3 py-2 text-white text-xs font-montserrat focus:border-gold outline-none transition resize-none"
                ></textarea>
              </div>

              {/* Image Preview & Upload Zone */}
              <div>
                <label className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mb-1 block font-montserrat">
                  Facility Image
                </label>
                
                {filePreview && (
                  <div className="mb-2 relative h-24 w-full rounded-md overflow-hidden border border-border-gold-soft">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 bg-black/70 px-2 py-0.5 rounded text-[9px] text-white">
                      Current Preview
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-border-gold-soft/80 hover:border-gold/60 rounded-md p-4 bg-dark-1/50 text-center transition">
                  <input 
                    type="file" 
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange} 
                    required={!editingId && !formData.image}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                    <i className="fa-solid fa-cloud-arrow-up text-xl text-gold"></i>
                    <span className="text-xs font-semibold text-white">
                      {file ? file.name : 'Click to select local image file'}
                    </span>
                    <span className="text-[10px] text-text-muted">Supports PNG, JPG, WEBP (Max 5MB)</span>
                  </label>
                </div>
              </div>

              {/* Order & Featured */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mb-1.5 block font-montserrat">
                    Display Order
                  </label>
                  <input 
                    type="number" 
                    name="order" 
                    value={formData.order} 
                    onChange={handleInputChange} 
                    min="0"
                    className="w-full bg-dark-1 border border-border-gold-soft rounded-md px-3 py-2 text-white text-xs font-montserrat focus:border-gold outline-none transition"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label htmlFor="isFeatured" className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="isFeatured" 
                      checked={formData.isFeatured} 
                      onChange={handleInputChange}
                      id="isFeatured"
                      className="w-4 h-4 accent-gold cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-white">Featured Highlight</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border-gold-soft">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-white border border-border-gold-soft rounded-md transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs bg-gold text-dark-1 font-bold uppercase tracking-wider rounded-md hover:bg-gold-light transition shadow-md flex items-center gap-2"
                >
                  {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
                  <span>{isSubmitting ? 'Saving...' : 'Save Amenity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAmenities;
