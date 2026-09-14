import React, { useState, useMemo, useRef, useEffect } from 'react';
import galleryService from '../../services/gallery/galleryService.js';

// INITIAL GALLERY MOCK DATA
const INITIAL_IMAGES = [];
const CATEGORIES = ['Rooms', 'Lobby', 'Restaurant', 'Events', 'Exterior', 'Amenities'];

const ManageGallery = () => {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery', 'upload'
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Toast Trigger
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const formatCategory = (cat) => {
    if (!cat) return 'Rooms';
    if (cat.toLowerCase() === 'rooms') return 'Rooms';
    if (cat.toLowerCase() === 'restaurant') return 'Restaurant';
    if (cat.toLowerCase() === 'events') return 'Events';
    if (cat.toLowerCase() === 'lobby') return 'Lobby';
    if (cat.toLowerCase() === 'exterior') return 'Exterior';
    if (cat.toLowerCase() === 'amenities') return 'Amenities';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 1: GALLERY
  // ==========================================
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilterCat, setActiveFilterCat] = useState('All'); // 'All' or specific category
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('Sort: Newest First');
  const [formatFilter, setFormatFilter] = useState('All Formats');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Detailed view lightbox modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [lbName, setLbName] = useState('');
  const [lbCat, setLbCat] = useState('');
  const [lbAlt, setLbAlt] = useState('');
  const [lbFeatured, setLbFeatured] = useState(false);

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true);
      try {
        const res = await galleryService.getGalleryItems();
        const items = res.data || res || [];
        const mapped = items.map(item => ({
          id: item._id,
          name: item.title || 'untitled.jpg',
          category: formatCategory(item.category),
          src: item.imageUrl,
          size: 'Unknown Size',
          sizeBytes: 0,
          dim: '1920×1280',
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
          featured: item.isFeatured || false,
          altText: item.title
        }));
        setImages(mapped);
      } catch (err) {
        console.error('Error loading gallery items:', err);
        showToast('Error loading gallery images', 'warning');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = images.length;
    const categoriesCount = new Set(images.map(i => i.category)).size;
    const featuredCount = images.filter(i => i.featured).length;
    
    // Storage used
    const totalBytes = images.reduce((sum, img) => sum + (img.sizeBytes || 800000), 0);
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
    
    return { total, categoriesCount, featuredCount, totalGB };
  }, [images]);

  // Image format analyzer helper
  const getFormat = (name) => {
    const parts = name.split('.');
    return parts[parts.length - 1].toUpperCase();
  };

  // Filtered & Sorted Images List
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (img.altText && img.altText.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = activeFilterCat === 'All' || img.category === activeFilterCat;
      
      const format = getFormat(img.name);
      const matchesFormat = formatFilter === 'All Formats' || format === formatFilter;

      return matchesSearch && matchesCategory && matchesFormat;
    }).sort((a, b) => {
      if (sortType === 'Sort: Oldest First') return new Date(a.date) - new Date(b.date);
      if (sortType === 'Sort: Name A–Z') return a.name.localeCompare(b.name);
      if (sortType === 'Sort: File Size') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      // Default: Newest First
      return new Date(b.date) - new Date(a.date);
    });
  }, [images, searchQuery, activeFilterCat, formatFilter, sortType]);

  // Count items per category helper
  const categoryCounts = useMemo(() => {
    const counts = { All: images.length };
    CATEGORIES.forEach(cat => {
      counts[cat] = images.filter(i => i.category === cat).length;
    });
    return counts;
  }, [images]);

  // Selection helpers
  const toggleSelectImage = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected images?`)) {
      try {
        for (const id of selectedIds) {
          await galleryService.deleteGalleryItem(id);
        }
        setImages(prev => prev.filter(img => !selectedIds.includes(img.id)));
        setSelectedIds([]);
        showToast('Selected images removed successfully', 'warning');
      } catch (err) {
        console.error(err);
        showToast('Error deleting selected images', 'warning');
      }
    }
  };

  const handleBulkChangeCategory = async (newCat) => {
    if (!newCat) return;
    try {
      for (const id of selectedIds) {
        await galleryService.updateGalleryItem(id, { category: newCat.toLowerCase() });
      }
      setImages(prev => prev.map(img => {
        if (selectedIds.includes(img.id)) {
          return { ...img, category: newCat };
        }
        return img;
      }));
      setSelectedIds([]);
      showToast(`Category updated for selected items`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error updating categories', 'warning');
    }
  };

  const handleDeleteSingle = async (id) => {
    if (window.confirm('Delete this image from the gallery?')) {
      try {
        await galleryService.deleteGalleryItem(id);
        setImages(prev => prev.filter(img => img.id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
        showToast('Image deleted from gallery', 'warning');
      } catch (err) {
        console.error(err);
        showToast('Error deleting image', 'warning');
      }
    }
  };

  // Lightbox controllers
  const handleOpenLightbox = (img) => {
    setSelectedImage(img);
    setLbName(img.name);
    setLbCat(img.category);
    setLbAlt(img.altText || '');
    setLbFeatured(img.featured);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handleSaveChangesLightbox = async (e) => {
    e.preventDefault();
    if (!lbName || !lbCat) {
      showToast('Name and Category are required', 'warning');
      return;
    }

    try {
      await galleryService.updateGalleryItem(selectedImage.id, {
        title: lbName,
        category: lbCat.toLowerCase(),
        isFeatured: lbFeatured
      });

      setImages(prev => prev.map(img => {
        if (img.id === selectedImage.id) {
          return {
            ...img,
            name: lbName,
            category: lbCat,
            altText: lbAlt,
            featured: lbFeatured
          };
        }
        return img;
      }));

      showToast('Image details updated', 'success');
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
      showToast('Error updating image details', 'warning');
    }
  };

  const handleDeleteLightbox = async () => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const toDeleteId = selectedImage.id;
        await galleryService.deleteGalleryItem(toDeleteId);
        setSelectedImage(null);
        setImages(prev => prev.filter(img => img.id !== toDeleteId));
        setSelectedIds(prev => prev.filter(i => i !== toDeleteId));
        showToast('Image deleted successfully', 'warning');
      } catch (err) {
        console.error(err);
        showToast('Error deleting image', 'warning');
      }
    }
  };

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 2: UPLOAD IMAGES
  // ==========================================
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Default configurations sidebar
  const [defCategory, setDefCategory] = useState('');
  const [defAltText, setDefAltText] = useState('');
  const [defTags, setDefTags] = useState('');
  
  // Switches toggles
  const [optCompress, setOptCompress] = useState(true);
  const [optThumbnails, setOptThumbnails] = useState(true);
  const [optStripEXIF, setOptStripEXIF] = useState(true);
  const [optWatermark, setOptWatermark] = useState(false);

  // Overall uploading progress metrics
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formatFileSize = (bytes) => {
    if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  const handleFilesAdded = (filesList) => {
    const filesArray = Array.from(filesList);
    const newQueueItems = filesArray.map(file => ({
      id: `queue-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      sizeBytes: file.size,
      status: 'waiting', // 'waiting', 'uploading', 'done', 'error'
      progress: 0,
      url: URL.createObjectURL(file)
    }));
    setUploadQueue(prev => [...prev, ...newQueueItems].slice(0, 20));
  };

  const handleRemoveQueueItem = (id) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleClearQueue = () => {
    setUploadQueue([]);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const startUploadSequence = async () => {
    if (uploadQueue.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    let completedCount = 0;
    const newlyUploadedImages = [];

    for (let i = 0; i < uploadQueue.length; i++) {
      const queueItem = uploadQueue[i];
      setUploadQueue(prev => prev.map(q => q.id === queueItem.id ? { ...q, status: 'uploading' } : q));

      try {
        const formData = new FormData();
        formData.append('image', queueItem.file);

        // Upload the image file to get the URL
        const uploadRes = await galleryService.uploadImage(formData);
        const imageUrl = uploadRes.data.url;

        // Create the gallery item in the database
        const itemCategory = defCategory || 'Rooms';
        const itemTitle = queueItem.name || 'Untitled Image';
        
        const createRes = await galleryService.createGalleryItem({
          title: itemTitle,
          imageUrl: imageUrl,
          category: itemCategory.toLowerCase(),
          isFeatured: false
        });

        // Update queue item status to done
        setUploadQueue(prev => prev.map(q => q.id === queueItem.id ? { ...q, status: 'done', progress: 100 } : q));
        
        const dbItem = createRes.data;
        newlyUploadedImages.push({
          id: dbItem._id,
          name: dbItem.title,
          category: formatCategory(dbItem.category),
          src: dbItem.imageUrl,
          size: queueItem.size,
          sizeBytes: queueItem.sizeBytes,
          dim: '1920×1080',
          date: new Date(dbItem.createdAt).toLocaleDateString(),
          featured: dbItem.isFeatured || false,
          altText: dbItem.title
        });
      } catch (err) {
        console.error('Upload error for file:', queueItem.name, err);
        setUploadQueue(prev => prev.map(q => q.id === queueItem.id ? { ...q, status: 'error' } : q));
        showToast(`Failed to upload ${queueItem.name}`, 'warning');
      }

      completedCount++;
      setUploadProgress(Math.round((completedCount / uploadQueue.length) * 100));
    }

    setIsUploading(false);
    if (newlyUploadedImages.length > 0) {
      showToast(`${newlyUploadedImages.length} images added to gallery`, 'success');
      setImages(prev => [...newlyUploadedImages, ...prev]);
    }
    setUploadQueue([]); // Clear queue
    setActiveTab('gallery');
  };


  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg text-xs font-semibold shadow-lg border transition-all duration-300 transform translate-y-0 animate-fade-in ${
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
          <h1 className="font-cinzel text-2xl text-white tracking-[1.5px] font-bold">MEDIA GALLERY MANAGER</h1>
          <p className="text-xs text-text-muted tracking-[1px] font-medium mt-1">
            ORGANIZE AND ORGANIZE HOTEL IMAGES, INTERIORS, AND ROOM PHOTOS
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-dark-3 p-1 rounded-lg border border-border-gold-soft">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-300 ${
              activeTab === 'gallery' 
                ? 'bg-gold text-dark-1 shadow-md' 
                : 'text-text-muted hover:text-white'
            }`}
          >
            <i className="fa-solid fa-images mr-2"></i>Manage Gallery
          </button>
          <button
            onClick={() => {
              handleClearQueue();
              setActiveTab('upload');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-300 ${
              activeTab === 'upload' 
                ? 'bg-gold text-dark-1 shadow-md' 
                : 'text-text-muted hover:text-white'
            }`}
          >
            <i className="fa-solid fa-cloud-arrow-up mr-2"></i>Upload Images
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: MANAGE GALLERY
          ======================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-12 text-center text-text-muted">
              <i className="fa-solid fa-spinner fa-spin text-2xl mb-3 text-gold animate-spin"></i>
              <p className="text-xs font-semibold">Loading gallery images from backend...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Total Images</span>
                    <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-images"></i></span>
                  </div>
                  <h3 className="font-cinzel text-3xl text-white font-bold">{stats.total}</h3>
                </div>

                <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Categories</span>
                    <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-folder-tree"></i></span>
                  </div>
                  <h3 className="font-cinzel text-3xl text-white font-bold">{stats.categoriesCount}</h3>
                </div>

                <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Featured Items</span>
                    <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-star"></i></span>
                  </div>
                  <h3 className="font-cinzel text-3xl text-white font-bold">{stats.featuredCount}</h3>
                </div>

                <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Storage Used</span>
                    <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-hard-drive"></i></span>
                  </div>
                  <h3 className="font-cinzel text-3xl text-white font-bold">{stats.totalGB} GB</h3>
                </div>
              </div>

              {/* Bulk Action Bar (displays when items are selected) */}
              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between bg-gold-glow/50 border border-gold px-5 py-3 rounded-lg animate-fade-in">
                  <div className="text-xs text-white">
                    <span className="font-mono text-gold font-bold mr-1.5">{selectedIds.length}</span>
                    images selected
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleClearSelection}
                      className="px-3 py-1.5 border border-border-gold hover:border-gold text-xs font-semibold text-white-dim hover:text-white rounded transition-colors"
                    >
                      <i className="fa-solid fa-xmark mr-1.5"></i>Deselect
                    </button>

                    <div className="relative group/bulk">
                      <button className="px-3 py-1.5 border border-border-gold text-gold hover:bg-gold hover:text-dark-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all">
                        <i className="fa-solid fa-tag"></i>Change Category
                      </button>
                      {/* Dropdown overlay */}
                      <div className="absolute right-0 bottom-full mb-1 bg-dark-2 border border-border-gold rounded shadow-xl overflow-hidden hidden group-hover/bulk:block z-[150] w-36">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleBulkChangeCategory(cat)}
                            className="w-full text-left px-4 py-2 hover:bg-gold hover:text-dark-1 text-xs text-white-dim transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleDeleteSelected}
                      className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-dark-1 font-bold text-xs rounded transition-colors"
                    >
                      <i className="fa-solid fa-trash mr-1.5"></i>Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Category Tabs filter */}
              <div className="flex border-b border-border-gold-soft overflow-x-auto">
                <button
                  onClick={() => setActiveFilterCat('All')}
                  className={`px-5 py-3.5 font-mono text-[10px] tracking-[1.5px] uppercase border-b-2 transition-all cursor-pointer ${
                    activeFilterCat === 'All'
                      ? 'text-gold border-gold font-bold'
                      : 'text-text-muted border-transparent hover:text-white'
                  }`}
                >
                  All Images <span className="ml-1 bg-gold-glow/50 px-1.5 py-0.5 rounded text-[9px] text-gold">{images.length}</span>
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilterCat(cat)}
                    className={`px-5 py-3.5 font-mono text-[10px] tracking-[1.5px] uppercase border-b-2 transition-all cursor-pointer ${
                      activeFilterCat === cat
                        ? 'text-gold border-gold font-bold'
                        : 'text-text-muted border-transparent hover:text-white'
                    }`}
                  >
                    {cat} <span className="ml-1 bg-gold-glow/50 px-1.5 py-0.5 rounded text-[9px] text-gold">{categoryCounts[cat]}</span>
                  </button>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-2 p-4 rounded-xl border border-border-gold-soft">
                <div className="flex-1 min-w-[240px] relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                  <input
                    type="text"
                    placeholder="Search images by name or caption..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted/60 focus:border-gold focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    className="bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option>Sort: Newest First</option>
                    <option>Sort: Oldest First</option>
                    <option>Sort: Name A–Z</option>
                    <option>Sort: File Size</option>
                  </select>

                  <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                    className="bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option>All Formats</option>
                    <option>JPG</option>
                    <option>PNG</option>
                    <option>WebP</option>
                  </select>

                  {/* View mode toggle */}
                  <div className="flex bg-dark-3 p-1 rounded-lg border border-border-gold-soft">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-all ${
                        viewMode === 'grid' ? 'bg-gold text-dark-1' : 'text-text-muted hover:text-white'
                      }`}
                      title="Grid View"
                    >
                      <i className="fa-solid fa-grip-vertical"></i>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-all ${
                        viewMode === 'list' ? 'bg-gold text-dark-1' : 'text-text-muted hover:text-white'
                      }`}
                      title="List Table View"
                    >
                      <i className="fa-solid fa-list"></i>
                    </button>
                  </div>

                  <span className="text-[10px] text-text-muted font-mono ml-2">
                    Showing {filteredImages.length} of {images.length}
                  </span>
                </div>
              </div>

              {/* GRID VIEW */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredImages.map(img => {
                    const isSelected = selectedIds.includes(img.id);
                    return (
                      <div
                        key={img.id}
                        className={`bg-dark-2 border rounded-lg overflow-hidden group relative hover:border-gold/50 transition-all duration-300 ${
                          isSelected ? 'border-gold ring-1 ring-gold shadow-lg' : 'border-border-gold-soft'
                        }`}
                      >
                        {/* Thumbnail area */}
                        <div 
                          onClick={() => handleOpenLightbox(img)}
                          className="aspect-[4/3] bg-dark-3 overflow-hidden relative cursor-pointer"
                        >
                          <img 
                            src={img.src} 
                            alt={img.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          
                          {/* Hover actions overlay */}
                          <div className="absolute inset-0 bg-black/60 flex items-start justify-end p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleOpenLightbox(img); }}
                                className="w-7 h-7 bg-dark-1/80 border border-border-gold rounded flex items-center justify-center text-white hover:text-gold hover:border-gold transition-colors"
                                title="Edit details"
                              >
                                <i className="fa-solid fa-pen text-[9px]"></i>
                              </button>
                              <a
                                href={img.src}
                                download
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-7 h-7 bg-dark-1/80 border border-border-gold rounded flex items-center justify-center text-white hover:text-gold hover:border-gold transition-colors"
                                title="Open Link"
                              >
                                <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                              </a>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDeleteSingle(img.id); }}
                                className="w-7 h-7 bg-dark-1/80 border border-red-500/30 rounded flex items-center justify-center text-white hover:text-red-400 hover:border-red-400 transition-colors"
                                title="Delete"
                              >
                                <i className="fa-solid fa-trash text-[9px]"></i>
                              </button>
                            </div>
                          </div>

                          {/* Select check overlay box */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleSelectImage(img.id); }}
                            className={`absolute top-2.5 left-2.5 w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-gold border-gold text-dark-1' 
                                : 'bg-black/40 border-white-dim/40 text-transparent hover:border-gold'
                            }`}
                          >
                            <i className="fa-solid fa-check text-[10px]"></i>
                          </div>

                          {/* Featured pill badge */}
                          {img.featured && (
                            <span className="absolute top-2.5 right-2.5 bg-gold text-dark-1 font-mono text-[7px] font-bold px-2 py-0.5 tracking-[0.5px] uppercase">
                              Featured
                            </span>
                          )}

                          {/* Dimension tag bottom overlay */}
                          <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-text-muted">
                            {img.dim}
                          </span>
                        </div>

                        {/* Metadata text area */}
                        <div className="p-3">
                          <h5 className="text-[11px] font-semibold text-white truncate" title={img.name}>{img.name}</h5>
                          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-border-gold-soft/50">
                            <span className="font-mono text-[8px] text-gold uppercase tracking-[0.5px]">{img.category}</span>
                            <span className="font-mono text-[8px] text-text-muted">{img.size}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredImages.length === 0 && (
                    <div className="col-span-full bg-dark-2 border border-border-gold-soft rounded-xl p-12 text-center text-text-muted">
                      <i className="fa-solid fa-images text-2xl mb-3 text-gold"></i>
                      <p className="text-xs font-semibold">No images configured in this filter category.</p>
                    </div>
                  )}
                </div>
              )}

              {/* LIST VIEW */}
              {viewMode === 'list' && (
                <div className="bg-dark-2 border border-border-gold rounded-xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-gold text-[9px] tracking-[1.5px] uppercase text-text-muted bg-dark-3/50">
                          <th className="py-4 px-4 font-bold w-12 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.length === filteredImages.length && filteredImages.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(filteredImages.map(i => i.id));
                                } else {
                                  setSelectedIds([]);
                                }
                              }}
                              className="rounded accent-gold"
                            />
                          </th>
                          <th className="py-4 px-4 font-bold w-20">Preview</th>
                          <th className="py-4 px-4 font-bold">File Name</th>
                          <th className="py-4 px-4 font-bold">Category</th>
                          <th className="py-4 px-4 font-bold">File Size</th>
                          <th className="py-4 px-4 font-bold">Dimensions</th>
                          <th className="py-4 px-4 font-bold">Upload Date</th>
                          <th className="py-4 px-4 font-bold">Featured</th>
                          <th className="py-4 px-5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-gold-soft/40 text-xs">
                        {filteredImages.map(img => {
                          const isSelected = selectedIds.includes(img.id);
                          return (
                            <tr key={img.id} className={`hover:bg-white-faint/10 transition-colors ${isSelected ? 'bg-gold-glow/20' : ''}`}>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectImage(img.id)}
                                  className="rounded accent-gold cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div 
                                  onClick={() => handleOpenLightbox(img)}
                                  className="w-12 h-9 bg-dark-3 rounded border border-border-gold-soft overflow-hidden cursor-pointer"
                                >
                                  <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="py-3 px-4 font-semibold text-white truncate max-w-[180px]">{img.name}</td>
                              <td className="py-3 px-4 text-white-dim font-mono text-[10px]">{img.category}</td>
                              <td className="py-3 px-4 text-text-muted font-mono text-[10px]">{img.size}</td>
                              <td className="py-3 px-4 text-text-muted font-mono text-[10px]">{img.dim}</td>
                              <td className="py-3 px-4 text-text-muted font-mono text-[10px]">{img.date}</td>
                              <td className="py-3 px-4">
                                {img.featured ? (
                                  <span className="text-gold"><i className="fa-solid fa-star"></i></span>
                                ) : (
                                  <span className="text-text-muted/30"><i className="fa-regular fa-star"></i></span>
                                )}
                              </td>
                              <td className="py-3 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenLightbox(img)}
                                    className="w-7 h-7 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center text-text-muted transition-colors"
                                  >
                                    <i className="fa-solid fa-pen text-[10px]"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSingle(img.id)}
                                    className="w-7 h-7 border border-red-500/20 hover:border-red-400 hover:text-red-400 rounded flex items-center justify-center text-text-muted transition-colors"
                                  >
                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredImages.length === 0 && (
                          <tr>
                            <td colSpan="9" className="py-12 px-5 text-center text-text-muted">
                              <i className="fa-solid fa-images text-xl mb-3 text-gold"></i>
                              <p className="text-xs font-semibold">No images configured in this filter category.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Simple Pagination bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-gold-soft">
                <span className="font-mono text-[10px] text-text-muted tracking-[0.5px]">
                  Page 1 of 1 · {filteredImages.length} total images
                </span>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded border border-border-gold bg-dark-2 text-text-muted hover:border-gold hover:text-gold flex items-center justify-center text-xs transition-all">
                    <i className="fa-solid fa-chevron-left text-[10px]"></i>
                  </button>
                  <button className="w-8 h-8 rounded border border-gold bg-gold text-dark-1 font-bold flex items-center justify-center text-xs transition-all">
                    1
                  </button>
                  <button className="w-8 h-8 rounded border border-border-gold bg-dark-2 text-text-muted hover:border-gold hover:text-gold flex items-center justify-center text-xs transition-all">
                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: UPLOAD IMAGES
          ======================================================== */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Upload Progress Summary (when active) */}
          {isUploading && (
            <div className="bg-dark-2 border border-border-gold p-5 rounded-xl space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[1.5px] uppercase font-bold text-text-muted">Upload Progress</span>
                <span className="font-cinzel text-sm text-gold font-bold">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-dark-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex gap-6 text-[10px] font-mono text-text-muted">
                <span>Completed: <strong className="text-white">{uploadQueue.filter(q => q.status === 'done').length}</strong></span>
                <span>Failed: <strong className="text-white">{uploadQueue.filter(q => q.status === 'error').length}</strong></span>
                <span>Total files: <strong className="text-white">{uploadQueue.length}</strong></span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Uploader dropzone & Queue (Span 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dropzone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFilesAdded(e.dataTransfer.files); }}
                onClick={() => document.getElementById('gallery-file-picker').click()}
                className={`bg-dark-2 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 relative ${
                  isDragOver ? 'border-gold bg-gold-glow/20' : 'border-border-gold-soft hover:border-gold hover:bg-gold-glow'
                }`}
              >
                <div className="w-16 h-16 bg-gold-glow border border-border-gold/30 rounded-xl flex items-center justify-center text-gold text-2xl mx-auto mb-4">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <h3 className="font-cinzel text-base font-bold text-white mb-1.5">Drop images here</h3>
                <p className="text-xs text-text-muted mb-4 leading-relaxed">
                  Drag and drop your hotel photos, or click to browse files.<br />
                  Maximum 20 files · 10 MB per file
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {['JPG', 'PNG', 'WEBP', 'HEIC', 'GIF'].map(fmt => (
                    <span key={fmt} className="font-mono text-[9px] text-gold bg-gold-glow border border-border-gold-soft px-2.5 py-1 font-semibold">
                      {fmt}
                    </span>
                  ))}
                </div>
                <input
                  type="file"
                  id="gallery-file-picker"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFilesAdded(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Upload Queue Panel */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-border-gold-soft bg-dark-3/30 flex justify-between items-center">
                  <span className="font-mono text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted">Upload Queue</span>
                  <span className="font-mono text-[10px] text-gold">{uploadQueue.length} files added</span>
                </div>

                <div className="divide-y divide-border-gold-soft/50 max-h-[380px] overflow-y-auto">
                  {uploadQueue.map(item => (
                    <div key={item.id} className="p-4 flex items-center gap-3.5 hover:bg-white-faint/10 transition-colors">
                      
                      {/* Thumbnail */}
                      <div className="w-14 h-10 bg-dark-3 rounded border border-border-gold-soft overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0">
                        <h6 className="text-xs text-white font-medium truncate">{item.name}</h6>
                        <span className="font-mono text-[9px] text-text-muted block mt-0.5">{item.size}</span>
                        {item.status === 'uploading' && (
                          <div className="h-1 w-full bg-dark-3 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-gold rounded-full" style={{ width: `${item.progress}%` }}></div>
                          </div>
                        )}
                      </div>

                      {/* Status indicator icon */}
                      <div className="flex items-center gap-3">
                        {item.status === 'done' && (
                          <span className="text-[#81c784] text-sm" title="Upload Complete"><i className="fa-solid fa-circle-check"></i></span>
                        )}
                        {item.status === 'uploading' && (
                          <span className="text-gold text-sm animate-spin" title="Uploading"><i className="fa-solid fa-spinner"></i></span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-red-400 text-sm" title="Upload Failed"><i className="fa-solid fa-circle-xmark"></i></span>
                        )}
                        {item.status === 'waiting' && (
                          <span className="text-text-muted text-sm" title="Waiting in Queue"><i className="fa-regular fa-clock"></i></span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="w-6 h-6 border border-border-gold-soft hover:border-red-400 hover:text-red-400 rounded flex items-center justify-center text-text-muted transition-colors cursor-pointer"
                          title="Remove from queue"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  {uploadQueue.length === 0 && (
                    <div className="py-12 text-center text-text-muted">
                      <div className="text-2xl mb-2 text-gold-glow"><i className="fa-solid fa-inbox"></i></div>
                      <p className="text-xs">No files added yet.<br />Drag files into dropzone to get started.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border-gold-soft bg-dark-3/20 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClearQueue}
                    className="px-4 py-2.5 border border-border-gold-soft hover:border-red-400 hover:text-red-400 text-text-muted rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                    title="Clear All Queue"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                  
                  <button
                    type="button"
                    disabled={uploadQueue.length === 0 || isUploading}
                    onClick={startUploadSequence}
                    className="flex-1 py-2.5 bg-gradient-to-r from-gold to-gold-dark disabled:opacity-40 disabled:cursor-not-allowed text-dark-1 font-bold rounded-lg text-xs hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    Upload All Files
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Upload settings & configurations */}
            <div className="space-y-6">
              
              {/* Settings Panel */}
              <div className="bg-dark-2 border border-border-gold rounded-xl p-5 space-y-4 shadow-lg">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-sliders mr-2"></i>Upload Settings
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted">Default Category</label>
                  <select
                    value={defCategory}
                    onChange={(e) => setDefCategory(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option value="">— Select Category —</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted">Default Alt Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury interior photo..."
                    value={defAltText}
                    onChange={(e) => setDefAltText(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. tsedekegrand, luxury, rooms, pool"
                    value={defTags}
                    onChange={(e) => setDefTags(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Processing Options Toggles */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-microchip mr-2"></i>Processing Options
                </h4>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs text-white font-medium">Auto-compress images</h5>
                      <span className="text-[9px] text-text-muted">Reduce size with zero quality loss.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOptCompress(!optCompress)}
                      className={`w-9 h-5 rounded-full border transition-all relative ${
                        optCompress ? 'bg-gold-glow border-gold' : 'bg-dark-4 border-border-gold-soft'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-gold absolute top-[2px] transition-all ${
                        optCompress ? 'left-[16px]' : 'left-[3px] bg-text-muted'
                      }`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border-gold-soft/50">
                    <div>
                      <h5 className="text-xs text-white font-medium">Generate thumbnails</h5>
                      <span className="text-[9px] text-text-muted">Create thumbnail preview dimensions.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOptThumbnails(!optThumbnails)}
                      className={`w-9 h-5 rounded-full border transition-all relative ${
                        optThumbnails ? 'bg-gold-glow border-gold' : 'bg-dark-4 border-border-gold-soft'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-gold absolute top-[2px] transition-all ${
                        optThumbnails ? 'left-[16px]' : 'left-[3px] bg-text-muted'
                      }`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border-gold-soft/50">
                    <div>
                      <h5 className="text-xs text-white font-medium">Strip EXIF metadata</h5>
                      <span className="text-[9px] text-text-muted">Remove GPS location and camera details.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOptStripEXIF(!optStripEXIF)}
                      className={`w-9 h-5 rounded-full border transition-all relative ${
                        optStripEXIF ? 'bg-gold-glow border-gold' : 'bg-dark-4 border-border-gold-soft'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-gold absolute top-[2px] transition-all ${
                        optStripEXIF ? 'left-[16px]' : 'left-[3px] bg-text-muted'
                      }`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border-gold-soft/50">
                    <div>
                      <h5 className="text-xs text-white font-medium">Add watermark</h5>
                      <span className="text-[9px] text-text-muted">Overlay Tsedeke Grand Hotel brand stamp.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOptWatermark(!optWatermark)}
                      className={`w-9 h-5 rounded-full border transition-all relative ${
                        optWatermark ? 'bg-gold-glow border-gold' : 'bg-dark-4 border-border-gold-soft'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-gold absolute top-[2px] transition-all ${
                        optWatermark ? 'left-[16px]' : 'left-[3px] bg-text-muted'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Storage Info status */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-3.5">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-cloud mr-2"></i>Storage capacity
                </h4>
                
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-text-muted mb-1.5">
                    <span>Space Used</span>
                    <span>{stats.totalGB} GB / 10 GB</span>
                  </div>
                  <div className="h-1.5 w-full bg-dark-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full" 
                      style={{ width: `${(Number(stats.totalGB) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <span className="text-[9px] text-text-muted leading-relaxed block mt-1 border-t border-border-gold-soft/50 pt-2.5">
                  {images.length} images currently cataloged. {10 - Number(stats.totalGB)} GB storage space remaining.
                </span>
              </div>

              {/* Tip Box */}
              <div className="bg-gold-glow/20 border border-gold/20 p-4 rounded-lg flex gap-3">
                <span className="text-gold text-sm"><i className="fa-solid fa-lightbulb"></i></span>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  For premium renders, upload high-resolution images (min. 1920×1080px) in JPG or WebP format. Landscape orientation works best for room display grids.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP LIGHTBOX MODAL & SIDEBAR EDITOR
          ======================================================== */}
      {selectedImage && (
        <div 
          onClick={handleCloseLightbox}
          className="fixed inset-0 bg-dark-1/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-dark-2 border border-border-gold rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-scale-in"
          >
            {/* Image Preview Area (Left side) */}
            <div className="flex-1 bg-dark-3 flex items-center justify-center p-4 relative min-h-[300px]">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.name} 
                className="max-w-full max-h-[70vh] object-contain" 
              />
              <span className="absolute bottom-4 left-4 bg-black/75 px-2 py-0.5 rounded font-mono text-[9px] text-text-muted">
                {selectedImage.dim}
              </span>
            </div>

            {/* Sidebar Details Editor (Right side) */}
            <form 
              onSubmit={handleSaveChangesLightbox}
              className="w-full md:w-[320px] border-t md:border-t-0 md:border-l border-border-gold-soft/60 flex flex-col max-h-[90vh] md:max-h-none overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border-gold-soft bg-dark-3/50 flex items-center justify-between">
                <h4 className="font-cinzel text-xs font-semibold text-white tracking-[0.5px]">Image Properties</h4>
                <button 
                  type="button"
                  onClick={handleCloseLightbox}
                  className="w-7 h-7 border border-border-gold-soft hover:border-gold rounded flex items-center justify-center text-text-muted hover:text-gold transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              </div>

              {/* Sidebar Form Fields */}
              <div className="p-4 space-y-4 flex-1">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted">File Name</label>
                  <input
                    type="text"
                    required
                    value={lbName}
                    onChange={(e) => setLbName(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded px-3 py-2 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted">Category</label>
                  <select
                    value={lbCat}
                    onChange={(e) => setLbCat(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded px-3 py-2 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted">Alt Text / Caption</label>
                  <input
                    type="text"
                    placeholder="Describe this image..."
                    value={lbAlt}
                    onChange={(e) => setLbAlt(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded px-3 py-2 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Read only info */}
                <div className="space-y-2 border-t border-border-gold-soft/50 pt-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-muted font-mono uppercase tracking-[0.5px]">File Size</span>
                    <span className="text-white-dim font-semibold font-mono">{selectedImage.size}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-muted font-mono uppercase tracking-[0.5px]">Dimensions</span>
                    <span className="text-white-dim font-semibold font-mono">{selectedImage.dim}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-muted font-mono uppercase tracking-[0.5px]">Uploaded</span>
                    <span className="text-white-dim font-semibold font-mono">{selectedImage.date}</span>
                  </div>
                </div>

                {/* Featured toggle switch */}
                <div className="flex items-center justify-between pt-3.5 border-t border-border-gold-soft/50">
                  <div>
                    <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block">Featured Image</span>
                    <span className="text-[9px] text-text-muted mt-0.5 block">Show on hotel home page</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLbFeatured(!lbFeatured)}
                    className={`w-9 h-5 rounded-full border transition-all relative ${
                      lbFeatured ? 'bg-gold-glow border-gold' : 'bg-dark-4 border-border-gold-soft'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-gold absolute top-[2px] transition-all ${
                      lbFeatured ? 'left-[16px]' : 'left-[3px] bg-text-muted'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Sidebar actions footer */}
              <div className="p-4 border-t border-border-gold-soft bg-dark-3/20 flex flex-col gap-2.5">
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-gold to-gold-dark text-dark-1 font-bold rounded-lg text-xs hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-floppy-disk"></i>Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLightbox}
                  className="w-full py-2 border border-red-500/30 hover:border-red-400 text-text-muted hover:text-red-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can"></i>Delete Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGallery;
