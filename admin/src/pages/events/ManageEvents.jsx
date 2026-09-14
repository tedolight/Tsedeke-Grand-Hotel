import React, { useState, useEffect, useMemo } from 'react';
import eventsService from '../../services/events/eventsService.js';
import EventEnquiries from './EventEnquiries.jsx';

const ALL_AMENITY_TAGS = [
  'Sound System', 'AV / Projector', 'Free Wi-Fi', 'Catering',
  'Open Bar', 'Decoration', 'Photography', 'Valet Parking',
  'A/C', 'Lighting Setup', 'Kids Area', 'Event Coordinator'
];

const ManageEvents = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'add', 'packages'
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Toast Trigger
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 1: EVENTS LIST
  // ==========================================
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortType, setSortType] = useState('Sort: Newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Details Modal state
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 2: ADD/EDIT EVENT
  // ==========================================
  const [editingEventId, setEditingEventId] = useState(null);
  const [evtName, setEvtName] = useState('');
  const [evtCategory, setEvtCategory] = useState('');
  const [evtVenue, setEvtVenue] = useState('');
  const [evtShortDesc, setEvtShortDesc] = useState('');
  const [evtFullDesc, setEvtFullDesc] = useState('');
  const [evtStartDate, setEvtStartDate] = useState('');
  const [evtEndDate, setEvtEndDate] = useState('');
  const [evtStartTime, setEvtStartTime] = useState('');
  const [evtEndTime, setEvtEndTime] = useState('');
  const [evtIsMultiDay, setEvtIsMultiDay] = useState(false);
  const [evtIsRecurring, setEvtIsRecurring] = useState(false);
  const [evtMaxCapacity, setEvtMaxCapacity] = useState('');
  const [evtMinGuests, setEvtMinGuests] = useState('');
  const [evtTables, setEvtTables] = useState('');
  const [evtBasePrice, setEvtBasePrice] = useState('');
  const [evtPricePerPerson, setEvtPricePerPerson] = useState('');
  const [evtPriceNote, setEvtPriceNote] = useState('');
  const [evtInclusions, setEvtInclusions] = useState([]);
  const [evtStatus, setEvtStatus] = useState('Draft');
  const [evtFeatured, setEvtFeatured] = useState(false);
  const [evtAllowEnquiry, setEvtAllowEnquiry] = useState(true);
  const [evtVisibleWebsite, setEvtVisibleWebsite] = useState(true);
  const [evtCoordinatorName, setEvtCoordinatorName] = useState('');
  const [evtCoordinatorPhone, setEvtCoordinatorPhone] = useState('');
  const [evtCoordinatorEmail, setEvtCoordinatorEmail] = useState('');
  const [evtLinkedPackageId, setEvtLinkedPackageId] = useState('');

  // Local upload previews state (stored as basic object URLs or mock data)
  const [uploadedImages, setUploadedImages] = useState([]);

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 3: PACKAGES
  // ==========================================
  const [packages, setPackages] = useState([]);
  const [expandedPackageId, setExpandedPackageId] = useState(null);

  // Package list filters
  const [pkgCatFilter, setPkgCatFilter] = useState('All Categories');
  const [pkgStatusFilter, setPkgStatusFilter] = useState('All Statuses');

  // Package Form state
  const [pkgEditingId, setPkgEditingId] = useState(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgTier, setPkgTier] = useState('standard'); // 'standard', 'gold', 'platinum', 'vip'
  const [pkgCategory, setPkgCategory] = useState('');
  const [pkgStatus, setPkgStatus] = useState('Active');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgMaxGuests, setPkgMaxGuests] = useState('');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgInclusions, setPkgInclusions] = useState(['Full Catering Service', 'Event Coordinator']);
  const [pkgInclusionInput, setPkgInclusionInput] = useState('');
  const [pkgPopular, setPkgPopular] = useState(false);
  const [pkgShowWebsite, setPkgShowWebsite] = useState(true);

  const fetchEventsAndPackages = async () => {
    try {
      setLoading(true);
      const [eventsRes, packagesRes] = await Promise.all([
        eventsService.getEvents(),
        eventsService.getPackages()
      ]);

      const eventsData = eventsRes.data || eventsRes;
      const packagesData = packagesRes.data || packagesRes;

      const mappedEvents = (Array.isArray(eventsData) ? eventsData : []).map(e => {
        const rawEvtId = String(e._id || e.id || '101');
        const price = Number(e.price ?? e.fullDayPrice ?? e.price_etb ?? 5000);
        return {
          _id: rawEvtId,
          id: `EVT-${rawEvtId.padStart(3, '0').slice(-3).toUpperCase()}`,
          name: e.name || e.title || 'Event Venue',
          category: e.category || (e.name?.toLowerCase().includes('ballroom') ? 'Wedding' : e.name?.toLowerCase().includes('hall') ? 'Conference' : 'Birthday / Private'),
          venue: e.venue || e.name || e.title || 'Main Ballroom',
          images: e.images || (e.image_url ? [e.image_url] : []),
          date: e.date || (e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          time: e.time || '10:00 AM',
          enquiries: e.enquiries || 0,
          capacity: e.capacity || 150,
          maxCapacity: e.maxCapacity || e.capacity || 150,
          minGuests: e.minGuests || 10,
          status: e.status || (e.availability === 'available' ? 'Upcoming' : 'Ongoing'),
          price,
          pricePerPerson: e.pricePerPerson || 250,
          shortDescription: e.description || e.shortDescription || '',
          fullDescription: e.description || e.fullDescription || '',
          coordinator: e.coordinator || { name: 'Dawit Tesfaye', phone: '+251 911 234 567', email: 'd.tesfaye@tsedekegrandhotel.com' },
          inclusions: e.inclusions || e.avEquipment || [],
          featured: e.featured !== undefined ? e.featured : true,
          imagePlaceholder: e.icon || '🏢',
          allowEnquiry: true,
          visibleWebsite: true
        };
      });

      const mappedPackages = (Array.isArray(packagesData) ? packagesData : []).map(p => {
        const rawPkgId = String(p._id || p.id || '101');
        const pkgPrice = Number(p.price ?? p.price_etb ?? 25000);
        return {
          _id: rawPkgId,
          id: `PKG-${rawPkgId.padStart(3, '0').slice(-3).toUpperCase()}`,
          name: p.name || 'Event Package',
          category: p.name?.toLowerCase().includes('wedding') ? 'Wedding' : p.name?.toLowerCase().includes('corporate') ? 'Corporate' : p.name?.toLowerCase().includes('conference') ? 'Conference' : 'Birthday',
          price: pkgPrice,
          maxGuests: p.maxGuests ? Number(p.maxGuests) : (p.capacity ? (parseInt(String(p.capacity).replace(/[^0-9]/g, '')) || 200) : 200),
          description: p.description || (p.name + ' - premium package'),
          inclusions: Array.isArray(p.inclusions) ? p.inclusions : (p.features || []),
          exclusions: [],
          tier: p.badge ? 'gold' : 'standard',
          status: p.status || 'Active',
          popular: p.isFeatured || p.popular || false,
          showWebsite: true,
          icon: p.name?.toLowerCase().includes('wedding') ? '💍' : p.name?.toLowerCase().includes('corporate') ? '🏢' : '🎙️',
          linkedEventsCount: 0
        };
      });

      setEvents(mappedEvents);
      setPackages(mappedPackages);
      if (mappedPackages.length > 0) {
        setExpandedPackageId(mappedPackages[0].id);
      }
    } catch (err) {
      console.error('Failed to load events/packages:', err);
      showToast('Error loading event data', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndPackages();
  }, []);

  // Stats Counters
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter(e => e.status === 'Upcoming').length;
    const ongoing = events.filter(e => e.status === 'Ongoing').length;
    const draft = events.filter(e => e.status === 'Draft').length;
    const totalEnquiries = events.reduce((sum, e) => sum + e.enquiries, 0);
    const totalRevenue = events.reduce((sum, e) => sum + e.price, 0);

    return { total, upcoming, ongoing, draft, totalEnquiries, totalRevenue };
  }, [events]);

  // Filter & Sort Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All Statuses' || e.status === statusFilter;
      const matchesCategory = categoryFilter === 'All Categories' ||
        e.category.toLowerCase().includes(categoryFilter.toLowerCase().split(' ')[0]);

      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => {
      if (sortType === 'Sort: Date ↑') return new Date(a.date) - new Date(b.date);
      if (sortType === 'Sort: Date ↓') return new Date(b.date) - new Date(a.date);
      if (sortType === 'Sort: Capacity') return b.maxCapacity - a.maxCapacity;
      return b.id.localeCompare(a.id);
    });
  }, [events, searchQuery, statusFilter, categoryFilter, sortType]);

  const deleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event venue?')) {
      const itemToDelete = events.find(e => e.id === id);
      if (!itemToDelete) return;
      try {
        await eventsService.deleteEvent(itemToDelete._id);
        await fetchEventsAndPackages();
        showToast(`Venue "${itemToDelete?.name}" has been deleted.`, 'warning');
      } catch (err) {
        console.error('Failed to delete event:', err);
        showToast('Failed to delete event venue', 'warning');
      }
    }
  };

  const handleOpenDetails = (eventItem) => {
    setSelectedEventDetails(eventItem);
    setShowViewModal(true);
  };

  const handleToggleInclusion = (tag) => {
    setEvtInclusions(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const res = await eventsService.uploadImage(file);
        // res = { success, data: cloudinaryUrl }
        const imageUrl = res.data || res;
        setUploadedImages(prev => [...prev, { name: file.name, url: imageUrl }].slice(0, 6));
        showToast('Image uploaded successfully!', 'success');
      } catch (err) {
        console.error('Failed to upload image:', err);
        showToast('Failed to upload image', 'warning');
      }
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const startEditEvent = (eventItem) => {
    setEditingEventId(eventItem._id);
    setEvtName(eventItem.name);
    setEvtCategory(eventItem.category);
    setEvtVenue(eventItem.venue);
    setEvtShortDesc(eventItem.shortDescription);
    setEvtFullDesc(eventItem.fullDescription || '');
    setEvtStartDate(eventItem.date || '');
    setEvtEndDate(eventItem.endDate || '');
    setEvtStartTime(eventItem.time || '');
    setEvtEndTime(eventItem.endTime || '');
    setEvtIsMultiDay(eventItem.isMultiDay || false);
    setEvtIsRecurring(eventItem.isRecurring || false);
    setEvtMaxCapacity(eventItem.maxCapacity || '');
    setEvtMinGuests(eventItem.minGuests || '');
    setEvtTables(eventItem.tables || '');
    setEvtBasePrice(eventItem.price || '');
    setEvtPricePerPerson(eventItem.pricePerPerson || '');
    setEvtPriceNote(eventItem.priceNote || '');
    setEvtInclusions(eventItem.inclusions || []);
    setEvtStatus(eventItem.status || 'Draft');
    setEvtFeatured(eventItem.featured || false);
    setEvtAllowEnquiry(eventItem.allowEnquiry !== undefined ? eventItem.allowEnquiry : true);
    setEvtVisibleWebsite(eventItem.visibleWebsite !== undefined ? eventItem.visibleWebsite : true);
    setEvtCoordinatorName(eventItem.coordinator?.name || '');
    setEvtCoordinatorPhone(eventItem.coordinator?.phone || '');
    setEvtCoordinatorEmail(eventItem.coordinator?.email || '');
    setEvtLinkedPackageId(eventItem.linkedPackageId || '');
    setUploadedImages((eventItem.images || []).map(url => ({ name: 'Event Image', url })));

    setActiveTab('add');
    showToast(`Loaded "${eventItem.name}" for editing.`, 'info');
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEvtName('');
    setEvtCategory('');
    setEvtVenue('');
    setEvtShortDesc('');
    setEvtFullDesc('');
    setEvtStartDate('');
    setEvtEndDate('');
    setEvtStartTime('');
    setEvtEndTime('');
    setEvtIsMultiDay(false);
    setEvtIsRecurring(false);
    setEvtMaxCapacity('');
    setEvtMinGuests('');
    setEvtTables('');
    setEvtBasePrice('');
    setEvtPricePerPerson('');
    setEvtPriceNote('');
    setEvtInclusions([]);
    setEvtStatus('Draft');
    setEvtFeatured(false);
    setEvtAllowEnquiry(true);
    setEvtVisibleWebsite(true);
    setEvtCoordinatorName('');
    setEvtCoordinatorPhone('');
    setEvtCoordinatorEmail('');
    setEvtLinkedPackageId('');
    setUploadedImages([]);
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    if (!evtName || !evtBasePrice) {
      showToast('Please fill out Name and Base Price', 'warning');
      return;
    }

    const dbEventData = {
      name: evtName,
      category: evtCategory || 'Wedding',
      images: uploadedImages.map(img => img.url),
      capacity: Number(evtMaxCapacity) || 100,
      setupOptions: evtInclusions,
      avEquipment: evtInclusions,
      halfDayPrice: Number(evtBasePrice) * 0.6,
      fullDayPrice: Number(evtBasePrice),
      availability: evtStatus === 'Draft' ? 'on_request' : 'available',
      icon: evtCategory === 'Wedding' ? '💍' : evtCategory === 'Conference' ? '🎙️' : evtCategory === 'Birthday' ? '🎂' : '🏢',
      description: evtShortDesc || evtFullDesc,
    };

    try {
      if (editingEventId) {
        await eventsService.updateEvent(editingEventId, dbEventData);
        showToast('Venue updated successfully!', 'success');
      } else {
        await eventsService.createEvent(dbEventData);
        showToast('Event venue published successfully!', 'success');
      }
      await fetchEventsAndPackages();
      resetEventForm();
      setActiveTab('list');
    } catch (err) {
      console.error('Failed to save venue:', err);
      showToast('Error saving event venue', 'warning');
    }
  };

  // Stats calculation for packages
  const pkgStats = useMemo(() => {
    const total = packages.length;
    const active = packages.filter(p => p.status === 'Active').length;
    const totalLinked = packages.reduce((sum, p) => sum + (p.linkedEventsCount || 0), 0);
    const popularTier = packages.find(p => p.popular)?.name.split(' ')[0] || 'Gold';

    return { total, active, totalLinked, popularTier };
  }, [packages]);

  // Filtered packages list
  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesCat = pkgCatFilter === 'All Categories' || p.category === pkgCatFilter;
      const matchesStatus = pkgStatusFilter === 'All Statuses' || p.status === pkgStatusFilter;
      return matchesCat && matchesStatus;
    });
  }, [packages, pkgCatFilter, pkgStatusFilter]);

  const togglePackageAccordion = (id) => {
    setExpandedPackageId(prev => prev === id ? null : id);
  };

  const handleAddPkgInclusion = (e) => {
    e.preventDefault();
    if (pkgInclusionInput.trim() && !pkgInclusions.includes(pkgInclusionInput.trim())) {
      setPkgInclusions(prev => [...prev, pkgInclusionInput.trim()]);
      setPkgInclusionInput('');
    }
  };

  const handleRemovePkgInclusion = (item) => {
    setPkgInclusions(prev => prev.filter(t => t !== item));
  };

  const startEditPackage = (pkg) => {
    setPkgEditingId(pkg._id);
    setPkgName(pkg.name);
    setPkgTier(pkg.tier || 'standard');
    setPkgCategory(pkg.category);
    setPkgStatus(pkg.status || 'Active');
    setPkgPrice(pkg.price);
    setPkgMaxGuests(pkg.maxGuests || '');
    setPkgDescription(pkg.description || '');
    setPkgInclusions(pkg.inclusions || []);
    setPkgPopular(pkg.popular || false);
    setPkgShowWebsite(pkg.showWebsite !== undefined ? pkg.showWebsite : true);

    showToast(`Loaded "${pkg.name}" into side editor.`, 'info');
  };

  const handleDuplicatePackage = async (pkg) => {
    const dbPackageData = {
      name: `${pkg.name} (Copy)`,
      capacity: `Up to ${pkg.maxGuests} guests`,
      price: Number(pkg.price),
      features: pkg.inclusions,
      isFeatured: false,
      badge: ''
    };
    try {
      await eventsService.createPackage(dbPackageData);
      await fetchEventsAndPackages();
      showToast(`Duplicated package to "${dbPackageData.name}"`, 'success');
    } catch (err) {
      console.error('Failed to duplicate package:', err);
      showToast('Error duplicating package', 'warning');
    }
  };

  const deletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this event package?')) {
      const itemToDelete = packages.find(p => p.id === id);
      if (!itemToDelete) return;
      try {
        await eventsService.deletePackage(itemToDelete._id);
        await fetchEventsAndPackages();
        if (expandedPackageId === id) setExpandedPackageId(null);
        showToast(`Package "${itemToDelete?.name}" has been deleted.`, 'warning');
      } catch (err) {
        console.error('Failed to delete package:', err);
        showToast('Error deleting package', 'warning');
      }
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!pkgName || !pkgPrice) {
      showToast('Please fill out Name and Price', 'warning');
      return;
    }

    const dbPackageData = {
      name: pkgName,
      capacity: `Up to ${pkgMaxGuests} guests`,
      price: Number(pkgPrice),
      features: pkgInclusions,
      isFeatured: pkgPopular,
      badge: pkgTier === 'gold' ? 'Most Popular' : pkgTier === 'platinum' ? 'Premium' : ''
    };

    try {
      if (pkgEditingId) {
        await eventsService.updatePackage(pkgEditingId, dbPackageData);
        showToast('Event package updated successfully!', 'success');
      } else {
        await eventsService.createPackage(dbPackageData);
        showToast('New event package created!', 'success');
      }
      await fetchEventsAndPackages();
      resetPackageForm();
    } catch (err) {
      console.error('Failed to save package:', err);
      showToast('Error saving package', 'warning');
    }
  };

  const resetPackageForm = () => {
    setPkgEditingId(null);
    setPkgName('');
    setPkgTier('standard');
    setPkgCategory('');
    setPkgStatus('Active');
    setPkgPrice('');
    setPkgMaxGuests('');
    setPkgDescription('');
    setPkgInclusions(['Full Catering Service', 'Event Coordinator']);
    setPkgInclusionInput('');
    setPkgPopular(false);
    setPkgShowWebsite(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gold font-montserrat">
        <i className="fas fa-spinner fa-spin text-3xl mb-4 text-gold" />
        <span className="text-xs uppercase tracking-[2px] text-text-muted">Loading Events & Packages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg text-xs font-semibold shadow-lg border transition-all duration-300 transform translate-y-0 animate-fade-in ${toast.type === 'success' ? 'bg-[#122e1b] text-[#81c784] border-[#4caf50]' :
                toast.type === 'warning' ? 'bg-[#3b1c1c] text-[#ef9a9a] border-[#e57373]' :
                  'bg-[#1a1813] text-[#e8c97a] border-[#c9a84c]'
              }`}
          >
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' :
                toast.type === 'warning' ? 'fa-circle-exclamation' :
                  'fa-circle-info'
              }`}></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-gold-soft pb-6">
        <div>
          <h1 className="font-cinzel text-2xl text-white tracking-[1.5px] font-bold">MANAGE EVENTS &amp; PACKAGES</h1>
          <p className="text-xs text-text-muted tracking-[1px] font-medium mt-1">
            OVERSEE BANQUETS, MEETINGS, WEDDINGS, AND CONFIGURE RATES
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-dark-3 p-1 rounded-lg border border-border-gold-soft">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-300 ${activeTab === 'list'
                ? 'bg-gold text-dark-1 shadow-md'
                : 'text-text-muted hover:text-white'
              }`}
          >
            <i className="fa-solid fa-calendar-days mr-2"></i>Events List
          </button>
          <button
            onClick={() => {
              resetEventForm();
              setActiveTab('add');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-300 ${activeTab === 'add' && !editingEventId
                ? 'bg-gold text-dark-1 shadow-md'
                : activeTab === 'add'
                  ? 'bg-gold-dark text-white shadow-md'
                  : 'text-text-muted hover:text-white'
              }`}
          >
            <i className="fa-solid fa-plus-circle mr-2"></i>
            {editingEventId ? 'Edit Event' : 'Add Event'}
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-300 ${activeTab === 'packages'
                ? 'bg-gold text-dark-1 shadow-md'
                : 'text-text-muted hover:text-white'
              }`}
          >
            <i className="fa-solid fa-boxes-packing mr-2" />Packages
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-300 ${activeTab === 'enquiries'
                ? 'bg-gold text-dark-1 shadow-md'
                : 'text-text-muted hover:text-white'
              }`}
          >
            <i className="fa-solid fa-envelope-open-text mr-2" />Enquiries
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: EVENTS LIST
          ======================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-6">

          {/* Key Metrics Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Total Events</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-calendar-star"></i></span>
              </div>
              <h3 className="font-cinzel text-3xl text-white font-bold">{stats.total}</h3>
              <p className="text-[10px] text-[#81c784] mt-2 font-semibold">
                <i className="fa-solid fa-arrow-up mr-1"></i>+4 this month
              </p>
            </div>

            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Upcoming</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-calendar-check"></i></span>
              </div>
              <h3 className="font-cinzel text-3xl text-white font-bold">{stats.upcoming}</h3>
              <p className="text-[10px] text-[#81c784] mt-2 font-semibold">
                <i className="fa-solid fa-circle mr-1 text-[8px] animate-pulse"></i>3 this week
              </p>
            </div>

            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Enquiries</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-envelope-open-text"></i></span>
              </div>
              <h3 className="font-cinzel text-3xl text-white font-bold">{stats.totalEnquiries}</h3>
              <p className="text-[10px] text-[#81c784] mt-2 font-semibold">
                <i className="fa-solid fa-plus-circle mr-1"></i>+12 new requests
              </p>
            </div>

            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Revenue (ETB)</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-coins"></i></span>
              </div>
              <h3 className="font-cinzel text-2xl text-white font-bold">{(stats.totalRevenue / 1000000).toFixed(2)}M</h3>
              <p className="text-[10px] text-[#81c784] mt-2 font-semibold">
                <i className="fa-solid fa-arrow-up mr-1"></i>+18% growth rate
              </p>
            </div>
          </div>

          {/* Filtering Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-2 p-4 rounded-xl border border-border-gold-soft">
            <div className="flex-1 min-w-[240px] relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
              <input
                type="text"
                placeholder="Search events by name, venue, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-3 border border-border-gold-soft rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted/60 focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
              >
                <option>All Statuses</option>
                <option>Upcoming</option>
                <option>Ongoing</option>
                <option>Past</option>
                <option>Draft</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
              >
                <option>All Categories</option>
                <option>Wedding</option>
                <option>Conference</option>
                <option>Birthday</option>
                <option>Corporate</option>
                <option>Entertainment</option>
                <option>Charity</option>
              </select>

              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
              >
                <option>Sort: Newest</option>
                <option>Sort: Date ↑</option>
                <option>Sort: Date ↓</option>
                <option>Sort: Capacity</option>
              </select>

              {/* Grid / List view toggles */}
              <div className="flex bg-dark-3 p-1 rounded-lg border border-border-gold-soft">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-all ${viewMode === 'grid' ? 'bg-gold text-dark-1' : 'text-text-muted hover:text-white'
                    }`}
                  title="Grid View"
                >
                  <i className="fa-solid fa-grip"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-all ${viewMode === 'list' ? 'bg-gold text-dark-1' : 'text-text-muted hover:text-white'
                    }`}
                  title="List Table View"
                >
                  <i className="fa-solid fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(evt => (
                <div
                  key={evt.id}
                  className="bg-dark-2 border border-border-gold rounded-xl overflow-hidden shadow-lg group hover:border-gold transition-all duration-300"
                >
                  {/* Card Header Thumbnail Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-dark-4 to-dark-5 relative flex items-center justify-center text-5xl overflow-hidden">
                    {evt.images && evt.images.length > 0 ? (
                      <img
                        src={evt.images[0].startsWith('http') ? evt.images[0] : `http://localhost:5000${evt.images[0]}`}
                        alt={evt.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{evt.imagePlaceholder}</span>
                    )}

                    {/* Status Badge */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.5px] uppercase border ${evt.status === 'Upcoming' ? 'bg-[#122e1b] text-[#81c784] border-[#4caf50]/40' :
                        evt.status === 'Ongoing' ? 'bg-[#212112] text-gold border-gold/40' :
                          evt.status === 'Past' ? 'bg-dark-3 text-text-muted border-border-gold-soft' :
                            'bg-[#3b1c1c] text-[#ef9a9a] border-[#e57373]/40'
                      }`}>
                      {evt.status}
                    </span>

                    {/* Quick actions hover overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleOpenDetails(evt)}
                        className="w-8 h-8 bg-dark-1/80 backdrop-blur-sm border border-border-gold rounded-lg flex items-center justify-center text-white hover:text-gold transition-all duration-200"
                        title="Quick View"
                      >
                        <i className="fa-solid fa-eye text-[11px]"></i>
                      </button>
                      <button
                        onClick={() => startEditEvent(evt)}
                        className="w-8 h-8 bg-dark-1/80 backdrop-blur-sm border border-border-gold rounded-lg flex items-center justify-center text-white hover:text-gold transition-all duration-200"
                        title="Edit Details"
                      >
                        <i className="fa-solid fa-pen text-[11px]"></i>
                      </button>
                      <button
                        onClick={() => deleteEvent(evt.id)}
                        className="w-8 h-8 bg-dark-1/80 backdrop-blur-sm border border-border-gold rounded-lg flex items-center justify-center text-white hover:text-red-400 transition-all duration-200"
                        title="Delete Event"
                      >
                        <i className="fa-solid fa-trash text-[11px]"></i>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="font-cinzel text-[15px] font-semibold text-white tracking-[0.5px] truncate">{evt.name}</h4>
                      <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{evt.shortDescription}</p>
                    </div>

                    <div className="space-y-2 border-t border-border-gold-soft pt-4">
                      <div className="flex items-center gap-2.5 text-xs text-white-dim">
                        <i className="fa-solid fa-calendar text-gold w-4 text-center"></i>
                        <span>{evt.date} — {evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-white-dim">
                        <i className="fa-solid fa-location-dot text-gold w-4 text-center"></i>
                        <span>{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-white-dim">
                        <i className="fa-solid fa-tag text-gold w-4 text-center"></i>
                        <span>Category: {evt.category}</span>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="border-t border-border-gold-soft pt-4">
                      <div className="flex justify-between text-[10px] text-text-muted mb-1.5">
                        <span>Expected Covers</span>
                        <span className="font-mono text-white-dim">{evt.capacity} / {evt.maxCapacity}</span>
                      </div>
                      <div className="h-1.5 w-full bg-dark-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                          style={{ width: `${evt.maxCapacity > 0 ? (evt.capacity / evt.maxCapacity) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="col-span-full bg-dark-2 border border-border-gold-soft rounded-xl p-12 text-center text-text-muted">
                  <i className="fa-solid fa-circle-info text-2xl mb-3 text-gold"></i>
                  <p className="text-xs font-semibold">No events found matching current criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* TABLE LIST VIEW */}
          {viewMode === 'list' && (
            <div className="bg-dark-2 border border-border-gold rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-gold text-[10px] tracking-[1.5px] uppercase text-text-muted bg-dark-3/50">
                      <th className="py-4 px-5 font-bold">Event Name</th>
                      <th className="py-4 px-4 font-bold">Category</th>
                      <th className="py-4 px-4 font-bold">Date &amp; Time</th>
                      <th className="py-4 px-4 font-bold">Venue</th>
                      <th className="py-4 px-4 font-bold">Guests / Capacity</th>
                      <th className="py-4 px-4 font-bold">Rate (ETB)</th>
                      <th className="py-4 px-4 font-bold">Status</th>
                      <th className="py-4 px-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gold-soft/40 text-xs">
                    {filteredEvents.map(evt => (
                      <tr key={evt.id} className="hover:bg-white-faint transition-colors duration-200">
                        <td className="py-3.5 px-5 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{evt.imagePlaceholder}</span>
                            <span className="font-cinzel tracking-[0.5px]">{evt.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-white-dim">{evt.category}</td>
                        <td className="py-3.5 px-4 text-white-dim">{evt.date} @ {evt.time}</td>
                        <td className="py-3.5 px-4 text-white-dim">{evt.venue}</td>
                        <td className="py-3.5 px-4 text-white-dim font-mono">{evt.capacity}/{evt.maxCapacity}</td>
                        <td className="py-3.5 px-4 text-gold font-mono font-semibold">{(evt.price || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.5px] uppercase border ${evt.status === 'Upcoming' ? 'bg-[#122e1b] text-[#81c784] border-[#4caf50]/30' :
                              evt.status === 'Ongoing' ? 'bg-[#212112] text-gold border-gold/30' :
                                evt.status === 'Past' ? 'bg-dark-3 text-text-muted border-border-gold-soft/50' :
                                  'bg-[#3b1c1c] text-[#ef9a9a] border-[#e57373]/30'
                            }`}>
                            {evt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetails(evt)}
                              className="px-2.5 py-1.5 border border-border-gold-soft hover:border-gold hover:text-gold rounded text-text-muted text-[10px] font-bold transition-all duration-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() => startEditEvent(evt)}
                              className="px-2.5 py-1.5 border border-border-gold-soft hover:border-gold hover:text-gold rounded text-text-muted text-[10px] font-bold transition-all duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEvent(evt.id)}
                              className="px-2.5 py-1.5 border border-[#e57373]/30 hover:border-red-400 hover:text-red-400 rounded text-text-muted text-[10px] font-bold transition-all duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredEvents.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-12 px-5 text-center text-text-muted">
                          <i className="fa-solid fa-circle-info text-xl mb-3 text-gold"></i>
                          <p className="text-xs font-semibold">No events found matching current criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Simple Mock Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-gold-soft">
            <span className="text-xs text-text-muted font-medium">
              Showing 1–{filteredEvents.length} of {events.length} events
            </span>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-lg border border-border-gold bg-dark-2 text-text-muted hover:border-gold hover:text-gold flex items-center justify-center text-xs transition-all">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="w-8 h-8 rounded-lg border border-gold bg-gold text-dark-1 font-bold flex items-center justify-center text-xs transition-all">
                1
              </button>
              <button className="w-8 h-8 rounded-lg border border-border-gold bg-dark-2 text-text-muted hover:border-gold hover:text-gold flex items-center justify-center text-xs transition-all">
                2
              </button>
              <button className="w-8 h-8 rounded-lg border border-border-gold bg-dark-2 text-text-muted hover:border-gold hover:text-gold flex items-center justify-center text-xs transition-all">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ADD / EDIT EVENT FORM
          ======================================================== */}
      {activeTab === 'add' && (
        <form onSubmit={saveEvent} className="space-y-6">

          {/* Action buttons header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-2 p-4 rounded-xl border border-border-gold">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-pen-nib"></i></span>
              <div>
                <h4 className="font-cinzel text-sm text-white font-semibold tracking-[0.5px]">
                  {editingEventId ? `Edit Event Details (${editingEventId})` : 'Create Event Listing'}
                </h4>
                <p className="text-[10px] text-text-muted">Enter specifications and pricing details for the catalog.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  resetEventForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 border border-border-gold-soft hover:border-gold text-white-dim hover:text-white rounded-lg text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvtStatus('Draft');
                  showToast('Draft updated locally', 'info');
                }}
                className="px-4 py-2 border border-border-gold text-gold hover:bg-gold-glow rounded-lg text-xs font-semibold transition-all"
              >
                <i className="fa-solid fa-floppy-disk mr-1.5"></i>Save Draft
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-gold to-gold-dark text-dark-1 font-bold rounded-lg text-xs hover:opacity-90 shadow-md transition-all"
              >
                <i className="fa-solid fa-paper-plane mr-1.5"></i>{editingEventId ? 'Update Event' : 'Publish Event'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN: Main Form Elements (Span 2) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Info Card */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-circle-info mr-2"></i>Basic Information
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Event Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Wedding Ceremony"
                    value={evtName}
                    onChange={(e) => setEvtName(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white placeholder-text-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Category <span className="text-gold">*</span>
                    </label>
                    <select
                      required
                      value={evtCategory}
                      onChange={(e) => setEvtCategory(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                    >
                      <option value="">Select category</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Conference">Conference</option>
                      <option value="Corporate">Corporate / Gala</option>
                      <option value="Birthday">Birthday / Private</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Charity">Charity / Dinner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Venue / Hall <span className="text-gold">*</span>
                    </label>
                    <select
                      required
                      value={evtVenue}
                      onChange={(e) => setEvtVenue(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                    >
                      <option value="">Select venue</option>
                      <option value="Shenkola">Shenkola</option>
                      <option value="Ajora">Ajora</option>
                      <option value="Yahode">Yahode</option>
                      <option value="Tsedeke Grand Lounge">Tsedeke Grand Lounge</option>
                      <option value="Tsedeke Grand Dining Hall">Tsedeke Grand Dining Hall</option>
                      <option value="Garden Area">Garden Area</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Short Description <span className="text-gold">*</span>
                  </label>
                  <textarea
                    required
                    placeholder="Briefly describe the event (shown on listing card)..."
                    value={evtShortDesc}
                    onChange={(e) => setEvtShortDesc(e.target.value)}
                    rows="2"
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2 text-xs text-white placeholder-text-muted/40 focus:border-gold focus:outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Full Detailed Description
                  </label>
                  <textarea
                    placeholder="Provide full schedule details, conditions and detailed information..."
                    value={evtFullDesc}
                    onChange={(e) => setEvtFullDesc(e.target.value)}
                    rows="4"
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white placeholder-text-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Date & Time Settings */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-clock mr-2"></i>Date &amp; Time Schedules
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Start Date <span className="text-gold">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={evtStartDate}
                      onChange={(e) => setEvtStartDate(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={evtEndDate}
                      onChange={(e) => setEvtEndDate(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Start Time <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM"
                      value={evtStartTime}
                      onChange={(e) => setEvtStartTime(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      End Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 05:00 PM"
                      value={evtEndTime}
                      onChange={(e) => setEvtEndTime(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white-dim">
                    <input
                      type="checkbox"
                      checked={evtIsMultiDay}
                      onChange={(e) => setEvtIsMultiDay(e.target.checked)}
                      className="rounded accent-gold w-4.5 h-4.5"
                    />
                    <span>This event spans across multiple consecutive days</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white-dim mt-1.5">
                    <input
                      type="checkbox"
                      checked={evtIsRecurring}
                      onChange={(e) => setEvtIsRecurring(e.target.checked)}
                      className="rounded accent-gold w-4.5 h-4.5"
                    />
                    <span>This is a recurring event (weekly/monthly)</span>
                  </label>
                </div>
              </div>

              {/* Capacity & Pricing Details */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-users mr-2"></i>Capacity &amp; Budget Specifications
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Max Capacity limit <span className="text-gold">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 400"
                      value={evtMaxCapacity}
                      onChange={(e) => setEvtMaxCapacity(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Min Guests
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={evtMinGuests}
                      onChange={(e) => setEvtMinGuests(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Tables Setup
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={evtTables}
                      onChange={(e) => setEvtTables(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Base Price Rate (ETB) <span className="text-gold">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 85000"
                      value={evtBasePrice}
                      onChange={(e) => setEvtBasePrice(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Price Per Person (ETB)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      value={evtPricePerPerson}
                      onChange={(e) => setEvtPricePerPerson(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Pricing Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Includes setup, teardown, basic lighting and sound crew"
                    value={evtPriceNote}
                    onChange={(e) => setEvtPriceNote(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Inclusions & Amenities Selection */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Inclusions &amp; Amenities
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {ALL_AMENITY_TAGS.map(tag => {
                    const isSelected = evtInclusions.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleInclusion(tag)}
                        className={`px-4 py-2 rounded-full text-xs border font-medium transition-all duration-200 cursor-pointer ${isSelected
                            ? 'border-gold text-gold bg-gold-glow'
                            : 'border-border-gold-soft text-text-muted hover:border-gold hover:text-white'
                          }`}
                      >
                        {isSelected && <i className="fa-solid fa-check mr-1.5"></i>}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar configuration & Live Summary */}
            <div className="space-y-6">

              {/* Status and Visibility Settings */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-toggle-on mr-2"></i>Status &amp; Visibility
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Listing Status
                  </label>
                  <select
                    value={evtStatus}
                    onChange={(e) => setEvtStatus(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Past">Past</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border-gold-soft/50">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white-dim">
                    <input
                      type="checkbox"
                      checked={evtFeatured}
                      onChange={(e) => setEvtFeatured(e.target.checked)}
                      className="rounded accent-gold w-4 h-4"
                    />
                    <span>Featured on home page</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white-dim mt-1.5">
                    <input
                      type="checkbox"
                      checked={evtAllowEnquiry}
                      onChange={(e) => setEvtAllowEnquiry(e.target.checked)}
                      className="rounded accent-gold w-4 h-4"
                    />
                    <span>Allow online booking requests</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white-dim mt-1.5">
                    <input
                      type="checkbox"
                      checked={evtVisibleWebsite}
                      onChange={(e) => setEvtVisibleWebsite(e.target.checked)}
                      className="rounded accent-gold w-4 h-4"
                    />
                    <span>Visible on hotel website</span>
                  </label>
                </div>
              </div>

              {/* Event Image Uploads */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-image mr-2"></i>Event Catalog Images
                </h4>

                <div
                  onClick={() => document.getElementById('evt-file-picker').click()}
                  className="border-2 border-dashed border-border-gold-soft rounded-lg bg-dark-3 p-6 text-center cursor-pointer hover:border-gold hover:bg-gold-glow transition-all duration-300"
                >
                  <div className="text-gold text-2xl mb-2"><i className="fa-solid fa-cloud-arrow-up"></i></div>
                  <span className="text-xs text-white-dim font-semibold block">Click to upload images</span>
                  <span className="text-[10px] text-text-muted mt-1 block">Max 6 images, up to 5MB each.</span>
                  <input
                    type="file"
                    id="evt-file-picker"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-2 border-t border-border-gold-soft/50">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="aspect-square bg-dark-4 rounded-lg border border-border-gold-soft overflow-hidden relative group">
                        <img
                          src={img.url.startsWith('http') || img.url.startsWith('blob:') ? img.url : `http://localhost:5000${img.url}`}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-gold text-dark-1 text-[8px] font-bold px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-600 rounded text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Remove Image"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coordinator Contact Details */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-address-book mr-2"></i>Event Coordinator
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dawit Tesfaye"
                    value={evtCoordinatorName}
                    onChange={(e) => setEvtCoordinatorName(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white placeholder-text-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +251 911 234 567"
                    value={evtCoordinatorPhone}
                    onChange={(e) => setEvtCoordinatorPhone(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white placeholder-text-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. coordinator@tsedekegrandhotel.com"
                    value={evtCoordinatorEmail}
                    onChange={(e) => setEvtCoordinatorEmail(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white placeholder-text-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Link Pre-defined Package Option */}
              <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-5 space-y-4">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-box-open mr-2"></i>Link Package Tier
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Event Package Link
                  </label>
                  <select
                    value={evtLinkedPackageId}
                    onChange={(e) => setEvtLinkedPackageId(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option value="">None (Custom Pricing Only)</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (From {(p.price || 0).toLocaleString()} ETB)
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] text-text-muted leading-relaxed block mt-1">
                    Select a pre-designed banquet setup package from the Packages tab to default inclusions.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('packages')}
                  className="text-xs text-gold font-semibold hover:underline flex items-center gap-1.5"
                >
                  Manage Packages <i className="fa-solid fa-arrow-right-long"></i>
                </button>
              </div>

              {/* Pricing Receipt Summary Block */}
              <div className="bg-dark-2 border border-gold/40 rounded-xl p-5 space-y-3.5 shadow-lg">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px]">
                  <i className="fa-solid fa-receipt mr-2"></i>Live Summary
                </h4>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-border-gold-soft/50">
                  <span className="text-text-muted">Status</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${evtStatus === 'Draft' ? 'bg-[#3b1c1c] text-[#ef9a9a]' : 'bg-[#122e1b] text-[#81c784]'
                    }`}>
                    {evtStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-border-gold-soft/50">
                  <span className="text-text-muted">Category</span>
                  <span className="text-white font-semibold">{evtCategory || '—'}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-border-gold-soft/50">
                  <span className="text-text-muted">Venue</span>
                  <span className="text-white font-semibold">{evtVenue || '—'}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-border-gold-soft/50">
                  <span className="text-text-muted">Start Date</span>
                  <span className="text-white font-mono font-semibold">{evtStartDate || '—'}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-border-gold-soft/50">
                  <span className="text-text-muted">Capacity limit</span>
                  <span className="text-white font-mono font-semibold">{evtMaxCapacity || '0'} Guests</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5">
                  <span className="text-text-muted">Base Rate Price</span>
                  <span className="text-gold font-mono font-bold text-sm">
                    {evtBasePrice ? `${Number(evtBasePrice).toLocaleString()} ETB` : '— ETB'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action Footer bar */}
          <div className="bg-dark-2 border-t border-border-gold p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl mt-6">
            <div className="text-xs text-text-muted flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-gold"></i>
              <span>Unsaved changes will be discarded if you leave this tab.</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  resetEventForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 border border-border-gold-soft hover:border-gold text-white-dim hover:text-white rounded-lg text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-gold to-gold-dark text-dark-1 font-bold rounded-lg text-xs hover:opacity-90 transition-all"
              >
                Save &amp; Publish Listing
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================
          TAB 3: EVENT PACKAGES
          ======================================================== */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-fade-in">

          {/* Package metrics counter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Total Packages</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-box-open"></i></span>
              </div>
              <h3 className="font-cinzel text-3xl text-white font-bold">{pkgStats.total}</h3>
            </div>

            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Active Tiers</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-circle-check"></i></span>
              </div>
              <h3 className="font-cinzel text-3xl text-white font-bold">{pkgStats.active}</h3>
            </div>

            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Events Linked</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-link"></i></span>
              </div>
              <h3 className="font-cinzel text-3xl text-white font-bold">{pkgStats.totalLinked}</h3>
            </div>

            <div className="bg-dark-2 border border-border-gold rounded-xl p-5 hover:border-gold-light transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[1.5px] uppercase text-text-muted font-bold">Most Popular</span>
                <span className="p-2 rounded-lg bg-gold-glow text-gold"><i className="fa-solid fa-fire"></i></span>
              </div>
              <h3 className="font-cinzel text-2xl text-white font-bold">{pkgStats.popularTier}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT ACCORDIONS LIST (Span 2) */}
            <div className="lg:col-span-2 space-y-4">

              {/* Accordion toolbar */}
              <div className="flex items-center justify-between bg-dark-2 p-4 rounded-xl border border-border-gold-soft">
                <span className="font-cinzel text-[11px] font-semibold text-text-muted tracking-[0.5px]">ALL CONFIGURED TIERS</span>
                <div className="flex gap-2">
                  <select
                    value={pkgCatFilter}
                    onChange={(e) => setPkgCatFilter(e.target.value)}
                    className="bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option>All Categories</option>
                    <option>Wedding</option>
                    <option>Corporate</option>
                    <option>Conference</option>
                    <option>Birthday</option>
                  </select>

                  <select
                    value={pkgStatusFilter}
                    onChange={(e) => setPkgStatusFilter(e.target.value)}
                    className="bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Accordion items */}
              <div className="space-y-3">
                {filteredPackages.map(pkg => {
                  const isExpanded = expandedPackageId === pkg.id;

                  // Color classes based on tier
                  const tierColors = {
                    standard: 'from-[#0d2a4a]/40 to-[#0a1a2a]/20 border-blue-500/20 text-[#64b5f6]',
                    gold: 'from-[#2e2612]/40 to-[#1a140a]/20 border-gold/30 text-gold',
                    platinum: 'from-[#33333b]/40 to-[#1e1e24]/20 border-[#c0c0c8]/30 text-[#e0e0e0]',
                    vip: 'from-[#3a1a1a]/40 to-[#220d0d]/20 border-red-500/20 text-[#ef9a9a]'
                  };

                  return (
                    <div
                      key={pkg.id}
                      className={`bg-dark-2 border rounded-xl overflow-hidden shadow transition-all duration-300 ${pkg.popular ? 'border-gold/40' : 'border-border-gold-soft'
                        }`}
                    >
                      {/* Header row click area */}
                      <div
                        onClick={() => togglePackageAccordion(pkg.id)}
                        className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-white-faint/20 transition-all duration-200 bg-gradient-to-r ${tierColors[pkg.tier] || ''}`}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-dark-1/60 border border-border-gold-soft">
                          {pkg.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-cinzel text-sm font-bold text-white tracking-[0.5px] truncate">{pkg.name}</h4>
                          <span className="text-[10px] text-text-muted mt-1 block">
                            Category: {pkg.category} · Inclusions: {pkg.inclusions.length} items · Linked Events: {pkg.linkedEventsCount}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-right">
                          <div className="flex items-center gap-1.5">
                            {pkg.popular && (
                              <span className="bg-gold text-dark-1 text-[8px] font-bold px-2 py-0.5 rounded-full">
                                <i className="fa-solid fa-fire mr-1"></i>Popular
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${pkg.status === 'Active' ? 'bg-[#122e1b]/80 text-[#81c784] border-[#4caf50]/20' : 'bg-dark-3 text-text-muted border-border-gold-soft'
                              }`}>
                              {pkg.status}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] text-text-muted block font-medium">Rate From</span>
                            <span className="text-gold font-mono font-bold text-base">{(pkg.price || 0).toLocaleString()}</span>
                            <span className="text-[9px] text-text-muted font-bold"> ETB</span>
                          </div>
                        </div>

                        <i className={`fa-solid fa-chevron-down text-text-muted text-xs transition-transform duration-300 ml-2 ${isExpanded ? 'rotate-180 text-gold' : ''
                          }`}></i>
                      </div>

                      {/* Content panel */}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[600px] border-t border-border-gold-soft/50 p-5 bg-dark-2' : 'max-h-0 p-0'
                          }`}
                      >
                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block mb-1">Description</span>
                            <p className="text-xs text-white-dim leading-relaxed">{pkg.description || 'No notes available for this package.'}</p>
                          </div>

                          <div>
                            <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block mb-2">Package Inclusions</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {pkg.inclusions.map((inc, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-white-dim">
                                  <i className="fa-solid fa-circle-check text-gold text-[10px]"></i>
                                  <span>{inc}</span>
                                </div>
                              ))}
                              {pkg.exclusions?.map((exc, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-text-muted line-through opacity-50">
                                  <i className="fa-solid fa-circle-xmark text-text-muted text-[10px]"></i>
                                  <span>{exc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t border-border-gold-soft/50">
                            <button
                              onClick={() => startEditPackage(pkg)}
                              className="px-3.5 py-2 border border-border-gold-soft hover:border-gold text-text-muted hover:text-gold rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <i className="fa-solid fa-pen"></i>Edit Package
                            </button>
                            <button
                              onClick={() => handleDuplicatePackage(pkg)}
                              className="px-3.5 py-2 border border-border-gold-soft hover:border-gold text-text-muted hover:text-gold rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <i className="fa-solid fa-copy"></i>Duplicate
                            </button>
                            <button
                              onClick={() => deletePackage(pkg.id)}
                              className="px-3.5 py-2 border border-red-500/20 hover:border-red-400 text-text-muted hover:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <i className="fa-solid fa-trash"></i>Delete
                            </button>
                            <button
                              onClick={() => {
                                setEvtLinkedPackageId(pkg.id);
                                setEvtName(`${pkg.name} - Custom Date`);
                                setEvtCategory(pkg.category);
                                setEvtBasePrice(pkg.price);
                                setEvtInclusions(pkg.inclusions);
                                setActiveTab('add');
                                showToast(`Starting event setup with ${pkg.name}.`, 'info');
                              }}
                              className="px-4 py-2 bg-gold-glow border border-gold/40 text-gold hover:bg-gold hover:text-dark-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all"
                            >
                              <i className="fa-solid fa-link"></i>Use to Link Event
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPackages.length === 0 && (
                  <div className="bg-dark-2 border border-border-gold-soft rounded-xl p-12 text-center text-text-muted">
                    <i className="fa-solid fa-circle-info text-2xl mb-3 text-gold"></i>
                    <p className="text-xs font-semibold">No packages configure for this filter.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: Package form builder */}
            <div>
              <form onSubmit={handleSavePackage} className="bg-dark-2 border border-border-gold rounded-xl p-5 space-y-4 shadow-lg sticky top-24">
                <h4 className="font-cinzel text-xs font-semibold text-gold border-b border-border-gold-soft pb-3 uppercase tracking-[1px] flex justify-between items-center">
                  <span>
                    <i className="fa-solid fa-box-open mr-2"></i>
                    {pkgEditingId ? 'Edit Package Tier' : 'Add New Package'}
                  </span>
                  {pkgEditingId && (
                    <button
                      type="button"
                      onClick={resetPackageForm}
                      className="text-[9px] text-[#ef9a9a] uppercase border border-[#ef9a9a]/40 px-1.5 py-0.5 rounded"
                    >
                      Clear Edit
                    </button>
                  )}
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Package Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diamond Wedding Package"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Tier Level Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'standard', icon: '🎙️', name: 'Std' },
                      { key: 'gold', icon: '💍', name: 'Gold' },
                      { key: 'platinum', icon: '🏢', name: 'Plat' },
                      { key: 'vip', icon: '🎂', name: 'VIP' }
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setPkgTier(opt.key)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${pkgTier === opt.key
                            ? 'border-gold text-gold bg-gold-glow'
                            : 'border-border-gold-soft text-text-muted hover:border-gold/50'
                          }`}
                      >
                        <div className="text-lg">{opt.icon}</div>
                        <span className="text-[8px] uppercase font-bold mt-1 block">{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Category <span className="text-gold">*</span>
                    </label>
                    <select
                      required
                      value={pkgCategory}
                      onChange={(e) => setPkgCategory(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Conference">Conference</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Status
                    </label>
                    <select
                      value={pkgStatus}
                      onChange={(e) => setPkgStatus(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Base Price (ETB) <span className="text-gold">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 85000"
                      value={pkgPrice}
                      onChange={(e) => setPkgPrice(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                      Max Guests
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 400"
                      value={pkgMaxGuests}
                      onChange={(e) => setPkgMaxGuests(e.target.value)}
                      className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Description Notes
                  </label>
                  <textarea
                    placeholder="Brief package description notes..."
                    value={pkgDescription}
                    onChange={(e) => setPkgDescription(e.target.value)}
                    rows="2.5"
                    className="w-full bg-dark-3 border border-border-gold-soft rounded-lg px-4 py-2 text-xs text-white focus:border-gold focus:outline-none resize-none"
                  />
                </div>

                {/* Inclusion List Builder Form */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.5px] font-bold uppercase text-text-muted">
                    Package Inclusions
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add inclusion item..."
                      value={pkgInclusionInput}
                      onChange={(e) => setPkgInclusionInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddPkgInclusion(e); }}
                      className="flex-1 bg-dark-3 border border-border-gold-soft rounded-lg px-3 py-2 text-xs text-white focus:border-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPkgInclusion}
                      className="w-8 h-8 bg-gold text-dark-1 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer text-sm"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>

                  {pkgInclusions.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2 max-h-[140px] overflow-y-auto border border-border-gold-soft/50 rounded-lg p-2 bg-dark-3/50">
                      {pkgInclusions.map((inc, index) => (
                        <div key={index} className="flex items-center justify-between bg-dark-3 border border-border-gold-soft/40 px-2.5 py-1.5 rounded text-[11px] text-white-dim">
                          <span className="truncate">{inc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePkgInclusion(inc)}
                            className="text-text-muted hover:text-red-400 ml-2 transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border-gold-soft/50">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white-dim">
                    <input
                      type="checkbox"
                      checked={pkgPopular}
                      onChange={(e) => setPkgPopular(e.target.checked)}
                      className="rounded accent-gold w-4 h-4"
                    />
                    <span>Mark as Popular (Star)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white-dim mt-1.5">
                    <input
                      type="checkbox"
                      checked={pkgShowWebsite}
                      onChange={(e) => setPkgShowWebsite(e.target.checked)}
                      className="rounded accent-gold w-4 h-4"
                    />
                    <span>Show on hotel website</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetPackageForm}
                    className="flex-1 py-2.5 border border-border-gold-soft hover:border-gold text-white-dim hover:text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-2.5 bg-gradient-to-r from-gold to-gold-dark text-dark-1 font-bold rounded-lg text-xs hover:opacity-90 shadow-md transition-all"
                  >
                    <i className="fa-solid fa-floppy-disk mr-1.5"></i>Save Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP MODAL: VIEW DETAILS
          ======================================================== */}
      {showViewModal && selectedEventDetails && (
        <div className="fixed inset-0 bg-dark-1/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div
            className="bg-dark-2 border border-border-gold rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border-gold-soft/60 flex items-center justify-between bg-dark-3/50">
              <div className="flex items-center gap-3">
                {selectedEventDetails.images && selectedEventDetails.images.length > 0 ? (
                  <img
                    src={selectedEventDetails.images[0].startsWith('http') ? selectedEventDetails.images[0] : `http://localhost:5000${selectedEventDetails.images[0]}`}
                    alt={selectedEventDetails.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{selectedEventDetails.imagePlaceholder}</span>
                )}
                <div>
                  <span className="text-[10px] uppercase text-gold font-bold tracking-[1px]">{selectedEventDetails.category}</span>
                  <h3 className="font-cinzel text-base font-semibold text-white tracking-[0.5px] mt-0.5">{selectedEventDetails.name}</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEventDetails(null);
                  setShowViewModal(false);
                }}
                className="w-8 h-8 rounded-lg bg-dark-3 border border-border-gold-soft text-text-muted hover:text-gold flex items-center justify-center transition-all cursor-pointer"
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Content body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

              {/* Event description */}
              <div className="space-y-2">
                <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block">Short Summary</span>
                <p className="text-xs text-white-dim leading-relaxed">{selectedEventDetails.shortDescription}</p>
                {selectedEventDetails.fullDescription && (
                  <p className="text-xs text-text-muted leading-relaxed mt-2">{selectedEventDetails.fullDescription}</p>
                )}
              </div>

              {/* Schedule and venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-dark-3 p-4 rounded-lg border border-border-gold-soft/50">
                <div>
                  <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block mb-1">Schedule date &amp; time</span>
                  <div className="flex items-center gap-2 text-xs text-white-dim">
                    <i className="fa-solid fa-calendar text-gold"></i>
                    <span>{selectedEventDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white-dim mt-1.5">
                    <i className="fa-solid fa-clock text-gold"></i>
                    <span>{selectedEventDetails.time}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block mb-1">Venue / Hall location</span>
                  <div className="flex items-center gap-2 text-xs text-white-dim">
                    <i className="fa-solid fa-location-dot text-gold"></i>
                    <span>{selectedEventDetails.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white-dim mt-1.5">
                    <i className="fa-solid fa-users text-gold"></i>
                    <span>Capacity: {selectedEventDetails.maxCapacity} Guests</span>
                  </div>
                </div>
              </div>

              {/* pricing rates breakdown */}
              <div>
                <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block mb-2">Pricing Structure</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-dark-3 border border-border-gold-soft p-3 rounded-lg text-center">
                    <span className="text-[9px] text-text-muted block">Base Rate</span>
                    <span className="text-gold font-mono font-bold text-sm block mt-1">{(selectedEventDetails.price || 0).toLocaleString()} ETB</span>
                  </div>
                  <div className="bg-dark-3 border border-border-gold-soft p-3 rounded-lg text-center">
                    <span className="text-[9px] text-text-muted block">Per Person</span>
                    <span className="text-white font-mono font-bold text-sm block mt-1">
                      {selectedEventDetails.pricePerPerson > 0 ? `${(selectedEventDetails.pricePerPerson || 0).toLocaleString()} ETB` : 'Included'}
                    </span>
                  </div>
                  <div className="bg-dark-3 border border-border-gold-soft p-3 rounded-lg text-center">
                    <span className="text-[9px] text-text-muted block">Current Covers</span>
                    <span className="text-white font-mono font-bold text-sm block mt-1">{selectedEventDetails.capacity} Guests</span>
                  </div>
                </div>
                {selectedEventDetails.priceNote && (
                  <p className="text-[10px] text-text-muted italic mt-2 text-center">
                    Note: {selectedEventDetails.priceNote}
                  </p>
                )}
              </div>

              {/* Inclusions list */}
              {selectedEventDetails.inclusions && selectedEventDetails.inclusions.length > 0 && (
                <div>
                  <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block mb-2">Amenities Configured</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedEventDetails.inclusions.map((inc, i) => (
                      <span key={i} className="px-2.5 py-1 border border-border-gold text-gold bg-gold-glow/50 rounded-full text-[10px]">
                        <i className="fa-solid fa-check mr-1 text-[8px]"></i>{inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* coordinator block */}
              {selectedEventDetails.coordinator && (
                <div className="border-t border-border-gold-soft/50 pt-4">
                  <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-text-muted block mb-2">Assigned Coordinator</span>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-xs text-white-dim">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-user text-gold text-[11px]"></i>
                      <span className="font-semibold text-white">{selectedEventDetails.coordinator.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-phone text-gold text-[11px]"></i>
                      <span>{selectedEventDetails.coordinator.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-envelope text-gold text-[11px]"></i>
                      <span>{selectedEventDetails.coordinator.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-gold-soft bg-dark-3/30 flex justify-end gap-2">
              <button
                onClick={() => {
                  const item = selectedEventDetails;
                  setSelectedEventDetails(null);
                  setShowViewModal(false);
                  startEditEvent(item);
                }}
                className="px-4 py-2 border border-border-gold text-gold hover:bg-gold-glow rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <i className="fa-solid fa-pen"></i>Edit Event
              </button>
              <button
                onClick={() => {
                  setSelectedEventDetails(null);
                  setShowViewModal(false);
                }}
                className="px-4 py-2 bg-gold text-dark-1 font-bold rounded-lg text-xs hover:opacity-90 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: EVENT ENQUIRIES
          ======================================================== */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <i className="fa-solid fa-envelope-open-text text-gold text-lg" />
            <div>
              <h2 className="font-cinzel text-sm text-white font-semibold tracking-[0.5px]">Event Enquiries</h2>
              <p className="text-[11px] text-text-muted font-montserrat mt-0.5">All venue booking requests submitted from the website</p>
            </div>
          </div>
          <EventEnquiries />
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
