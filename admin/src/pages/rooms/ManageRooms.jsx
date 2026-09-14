import React, { useState, useEffect, useMemo } from 'react';
import roomsService from '../../services/rooms/roomsService.js';
import bookingsService from '../../services/bookings/bookingsService.js';
import useUiStore from '../../store/ui/uiStore.js';
import ImageUploader from '../../components/ui/ImageUploader.jsx';
import { getImageUrl } from '../../utils/imageHelpers.js';

const ALL_AMENITIES = [
  { label: 'Free Wi-Fi', icon: 'fas fa-wifi' },
  { label: 'Air Conditioning', icon: 'fas fa-snowflake' },
  { label: 'Smart TV', icon: 'fas fa-tv' },
  { label: 'Bathtub', icon: 'fas fa-bath' },
  { label: 'Jacuzzi', icon: 'fas fa-hot-tub' },
  { label: 'Coffee Maker', icon: 'fas fa-coffee' },
  { label: 'Mini Bar', icon: 'fas fa-glass-martini' },
  { label: 'Fireplace', icon: 'fas fa-fire' },
  { label: 'Private Balcony', icon: 'fas fa-door-open' },
  { label: 'Pool Access', icon: 'fas fa-swimmer' },
  { label: 'Safe Deposit Box', icon: 'fas fa-lock' },
  { label: 'Butler Service', icon: 'fas fa-concierge-bell' },
  { label: 'Wardrobe', icon: 'fas fa-tshirt' },
  { label: 'Spa Access', icon: 'fas fa-spa' },
  { label: 'Direct Phone', icon: 'fas fa-phone' }
];

const mapUiTypeToDb = (uiType) => {
  // Map dropdown display values → DB enum values (all lowercase)
  const map = {
    'deluxe suite':       'deluxe suite',
    'deluxe single room': 'deluxe single room',
    'deluxe double room': 'deluxe double room',
    'deluxe triple room': 'deluxe triple room',
    'special price room': 'special price room',
    'hour room':          'hour room',
    'single':             'single',
    'standard':           'standard',
    'deluxe':             'deluxe',
    'suite':              'suite',
    'family double bed':  'family double bed',
    'vip':                'vip',
    // Legacy mappings for old names
    'royal suite':        'deluxe suite',
    'executive suite':    'deluxe suite',
    'junior suite':       'deluxe suite',
    'deluxe room':        'deluxe double room',
  };
  return map[uiType.toLowerCase().trim()] || uiType.toLowerCase().trim();
};

const ManageRooms = () => {
  const { addToast } = useUiStore();
  const [activeTab, setActiveTab] = useState('manage');
  const [viewMode, setViewMode] = useState('grid');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Walk-In Booking Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInRoom, setWalkInRoom] = useState(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInCheckIn, setWalkInCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [walkInCheckOut, setWalkInCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [walkInGuests, setWalkInGuests] = useState(1);
  const [walkInPaymentStatus, setWalkInPaymentStatus] = useState('paid');
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState('Cash');
  const [walkInNotes, setWalkInNotes] = useState('');
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [floorFilter, setFloorFilter] = useState('All Floors');

  // Form State for Add Room
  const [addNum, setAddNum] = useState('');
  const [addFloor, setAddFloor] = useState('3rd Floor');
  const [addType, setAddType] = useState('Junior Suite');
  const [addName, setAddName] = useState('');
  const [addSize, setAddSize] = useState(48);
  const [addBed, setAddBed] = useState('Queen');
  const [addGuests, setAddGuests] = useState(3);
  const [addBathrooms, setAddBathrooms] = useState('1.5 Bathrooms');
  const [addView, setAddView] = useState('Garden View');
  const [addPrice, setAddPrice] = useState(1900);
  const [addWeekendPrice, setAddWeekendPrice] = useState(2200);
  const [addDiscount, setAddDiscount] = useState(0);
  const [addExtraFee, setAddExtraFee] = useState(300);
  const [addDescription, setAddDescription] = useState('');
  const [addAmenities, setAddAmenities] = useState(['Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Bathtub', 'Coffee Maker', 'Mini Bar', 'Private Balcony', 'Safe Deposit Box', 'Wardrobe', 'Direct Phone']);
  const [addStatus, setAddStatus] = useState('Available');
  const [addImages, setAddImages] = useState([]);
  const [addFeatured, setAddFeatured] = useState(false);

  // Form State for Edit Room
  const [editNum, setEditNum] = useState('');
  const [editFloor, setEditFloor] = useState('');
  const [editType, setEditType] = useState('');
  const [editName, setEditName] = useState('');
  const [editSize, setEditSize] = useState(0);
  const [editBed, setEditBed] = useState('');
  const [editGuests, setEditGuests] = useState(0);
  const [editBathrooms, setEditBathrooms] = useState('');
  const [editView, setEditView] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editWeekendPrice, setEditWeekendPrice] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editExtraFee, setEditExtraFee] = useState(0);
  const [editDescription, setEditDescription] = useState('');
  const [editAmenities, setEditAmenities] = useState([]);
  const [editStatus, setEditStatus] = useState('');
  const [editImages, setEditImages] = useState([]);
  const [editFeatured, setEditFeatured] = useState(false);
  const [addImageUrlInput, setAddImageUrlInput] = useState('');
  const [editImageUrlInput, setEditImageUrlInput] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomsService.getRooms();
      const roomsData = res.data || res;
      const mapped = (Array.isArray(roomsData) ? roomsData : []).map(r => {
        const roomPrice = Number(r.price ?? r.price_etb ?? r.pricePerNight ?? 2800);
        const roomId = r.roomNumber || (r.id ? String(r.id) : '101');
        return {
          _id: r._id || r.id,
          id: roomId,
          name: r.name || 'Room',
          type: r.type === 'vip' ? 'VIP' : r.type === 'family double bed' ? 'Family Double Bed' : r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : (r.bed_type?.includes('King') ? 'Suite' : 'Standard'),
          floor: r.floor || '1st Floor',
          size: parseInt(r.size || r.size_m2) || 35,
          bed: r.bed ? r.bed.replace(' Bed', '') : (r.bed_type || 'King'),
          guests: r.guests || r.capacity || r.max_guests || 2,
          bathrooms: r.bathrooms || '1 Bathroom',
          view: r.view || (r.view_type ? `${r.view_type} View` : 'City View'),
          price: roomPrice,
          weekendPrice: Number(r.weekendPrice || Math.round(roomPrice * 1.15)),
          discount: r.discount || 0,
          extraFee: r.extraFee || 0,
          status: r.status || (r.isAvailable !== false ? 'Available' : 'Maintenance'),
          classStyle: r.type === 'vip' ? 'rm-royal' : r.type === 'suite' ? (r.name?.includes('Executive') ? 'rm-executive' : 'rm-junior') : r.type === 'deluxe' ? 'rm-deluxe' : 'rm-standard',
          icon: r.type === 'vip' ? 'fas fa-crown' : r.type === 'suite' ? (r.name?.includes('Executive') ? 'fas fa-star' : 'fas fa-gem') : r.type === 'deluxe' ? 'fas fa-spa' : 'fas fa-door-open',
          amenities: r.amenities || [r.bed_type, 'Wi-Fi', 'AC'].filter(Boolean),
          description: r.description || r.short_desc || r.long_desc || '',
          images: r.images || [],
          occupancyRate: r.occupancyRate || 0,
          bookingsCount: r.bookingsCount || 0,
          revenue: r.revenue || 0,
          rating: r.rating || 5.0,
          isFeatured: r.isFeatured || false,
          currentBooking: r.currentBooking || null
        };
      });
      mapped.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
      setRooms(mapped);
      setSelectedRoom(prev => {
        if (!prev) return mapped[0] || null;
        const currentId = String(prev._id || prev.id || '');
        const found = mapped.find(r => String(r._id || r.id) === currentId);
        return found || mapped[0] || null;
      });
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle Check-Out guest from occupied room
  const handleCheckOutOccupiedRoom = async (room) => {
    if (!room) return;
    try {
      if (room.currentBooking?._id) {
        await bookingsService.updateStatus(room.currentBooking._id, 'checked-out');
      }
      await roomsService.updateRoom(room._id, { status: 'Cleaning', isAvailable: false });
      if (addToast) addToast(`Guest checked out from Room ${room.id}. Room set to Cleaning.`, 'success');
      await fetchRooms();
      if (selectedRoom && selectedRoom.id === room.id) {
        setSelectedRoom(prev => prev ? { ...prev, status: 'Cleaning', currentBooking: null } : null);
      }
    } catch (err) {
      console.error('Failed to check out guest:', err);
      if (addToast) addToast('Failed to check out guest.', 'error');
    }
  };

  // Handle opening Edit Panel
  const handleStartEdit = (room) => {
    if (!room) return;
    setSelectedRoom(room);
    setEditNum(room.id);
    setEditFloor(room.floor);
    setEditType(room.type);
    setEditName(room.name);
    setEditSize(room.size);
    setEditBed(room.bed);
    setEditGuests(room.guests);
    setEditBathrooms(room.bathrooms);
    setEditView(room.view);
    setEditPrice(room.price);
    setEditWeekendPrice(room.weekendPrice);
    setEditDiscount(room.discount);
    setEditExtraFee(room.extraFee);
    setEditDescription(room.description || '');
    setEditAmenities(room.amenities || []);
    setEditStatus(room.status);
    setEditImages(room.images || []);
    setEditFeatured(room.isFeatured || false);
    setActiveTab('edit');
  };

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'Available').length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const cleaning = rooms.filter(r => r.status === 'Cleaning').length;
    const maintenance = rooms.filter(r => r.status === 'Maintenance').length;
    return { total, available, occupied, cleaning, maintenance };
  }, [rooms]);

  // Handle Add Room Submit
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    if (!addNum || !addName) return;

    const dbRoomData = {
      roomNumber: addNum,
      name: addName,
      type: mapUiTypeToDb(addType),
      description: addDescription || `${addName} - elegant room`,
      price: Number(addPrice),
      weekendPrice: Number(addWeekendPrice),
      discount: Number(addDiscount),
      extraFee: Number(addExtraFee),
      capacity: Number(addGuests),
      size: `${addSize} sqm`,
      bed: `${addBed} Bed`,
      bathrooms: addBathrooms,
      view: addView,
      floor: addFloor,
      amenities: addAmenities,
      status: addStatus,
      isAvailable: addStatus === 'Available',
      images: (addImages || [])
        .map(img => (typeof img === 'object' && img ? (img.url || img.path || '') : img))
        .filter(img => typeof img === 'string' && img.trim().length > 0 && img !== '[object Object]'),
      isFeatured: addFeatured
    };

    try {
      await roomsService.createRoom(dbRoomData);
      if (addToast) addToast('Room created successfully!', 'success');
      await fetchRooms();
      setActiveTab('manage');

      // Reset Form
      setAddNum('');
      setAddName('');
      setAddDescription('');
      setAddImages([]);
    } catch (err) {
      console.error('Failed to add room:', err);
      if (addToast) addToast(err.response?.data?.message || 'Failed to add room', 'error');
    }
  };

  // Handle Edit Room Submit
  const handleEditRoomSubmit = async (e) => {
    e.preventDefault();
    if (!editNum || !editName || !selectedRoom) return;

    const targetRoomId = selectedRoom._id;
    if (!targetRoomId) {
      if (addToast) addToast('No room selected to update.', 'error');
      return;
    }

    const cleanSize = typeof editSize === 'number' || !String(editSize).includes('sqm')
      ? `${parseInt(editSize, 10) || 35} sqm`
      : String(editSize).trim();

    const cleanBed = String(editBed).trim().endsWith('Bed')
      ? String(editBed).trim()
      : `${String(editBed).trim()} Bed`;

    const cleanedImages = (editImages || [])
      .map(img => (typeof img === 'object' && img ? (img.url || img.path || img.src || '') : img))
      .filter(img => typeof img === 'string' && img.trim().length > 0 && img !== '[object Object]');

    const dbRoomData = {
      roomNumber: String(editNum).trim(),
      name: String(editName).trim(),
      type: mapUiTypeToDb(editType),
      description: editDescription || `${editName} - elegant room`,
      price: Number(editPrice),
      weekendPrice: Number(editWeekendPrice),
      discount: Number(editDiscount),
      extraFee: Number(editExtraFee),
      capacity: Number(editGuests),
      size: cleanSize,
      bed: cleanBed,
      bathrooms: editBathrooms,
      view: editView,
      floor: editFloor,
      amenities: editAmenities,
      status: editStatus,
      isAvailable: editStatus === 'Available',
      images: cleanedImages,
      isFeatured: editFeatured
    };

    try {
      await roomsService.updateRoom(targetRoomId, dbRoomData);
      setRooms(prev => prev.map(r => (r._id === targetRoomId ? { ...r, ...dbRoomData, id: dbRoomData.roomNumber } : r)));
      if (addToast) addToast('Room updated successfully!', 'success');
      await fetchRooms();
      setActiveTab('manage');
    } catch (err) {
      console.error('Failed to update room:', err);
      if (addToast) addToast(err.response?.data?.message || 'Failed to update room', 'error');
    }
  };

  // Delete Room
  const handleDeleteRoom = async (id) => {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    try {
      await roomsService.deleteRoom(room._id);
      await fetchRooms();
      setActiveTab('manage');
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  // Open Walk-In Modal
  const handleOpenWalkInModal = (room) => {
    if (!room) return;
    setWalkInRoom(room);
    setWalkInName('');
    setWalkInPhone('');
    setWalkInEmail('');
    setWalkInCheckIn(new Date().toISOString().split('T')[0]);
    setWalkInCheckOut(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setWalkInGuests(room.guests || 2);
    setWalkInPaymentStatus('paid');
    setWalkInPaymentMethod('Cash');
    setWalkInNotes('');
    setShowWalkInModal(true);
  };

  // Submit Walk-In Physical Booking
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInRoom || !walkInName || !walkInPhone) {
      if (addToast) addToast('Please enter guest name and phone number.', 'error');
      return;
    }

    setSubmittingWalkIn(true);
    try {
      const payload = {
        room: walkInRoom._id,
        checkIn: walkInCheckIn,
        checkOut: walkInCheckOut,
        guests: Number(walkInGuests),
        fullName: walkInName,
        email: walkInEmail && walkInEmail.trim() !== '' ? walkInEmail : undefined,
        phone: walkInPhone,
        specialRequests: `[Walk-In Physical Booking - Paid via ${walkInPaymentMethod}] ${walkInNotes}`.trim(),
        bookingSource: 'Walk-In',
        status: 'checked-in',
        paymentStatus: walkInPaymentStatus
      };

      await bookingsService.createBooking(payload);
      if (addToast) addToast(`Walk-In booking registered for Room ${walkInRoom.id}! Room is now Occupied.`, 'success');
      setShowWalkInModal(false);
      await fetchRooms();
    } catch (err) {
      console.error('Failed to create walk-in booking:', err);
      if (addToast) addToast(err.response?.data?.message || 'Failed to create walk-in booking.', 'error');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  // Quick Status Change (Available, Occupied, Cleaning, Maintenance, Reserved)
  const handleQuickStatusChange = async (room, newStatus) => {
    if (!room) return;
    if (newStatus === 'Occupied') {
      handleOpenWalkInModal(room);
      return;
    }

    try {
      await roomsService.updateRoom(room._id, { status: newStatus });
      if (addToast) addToast(`Room ${room.id} status updated to ${newStatus}.`, 'success');
      await fetchRooms();
    } catch (err) {
      console.error('Failed to update room status:', err);
      if (addToast) addToast('Failed to update room status.', 'error');
    }
  };

  // Toggle amenities
  const toggleAmenity = (list, setList, val) => {
    if (list.includes(val)) {
      setList(prev => prev.filter(a => a !== val));
    } else {
      setList(prev => [...prev, val]);
    }
  };


  const extractImageUrl = (res) => {
    if (!res) return '';
    if (typeof res === 'string') return res;
    if (res.data) {
      if (typeof res.data === 'string') return res.data;
      if (res.data.url) return res.data.url;
      if (res.data.path) return res.data.path;
    }
    if (res.url) return res.url;
    if (res.path) return res.path;
    return '';
  };

  const handleUploadAdd = async (file) => {
    try {
      const res = await roomsService.uploadImage(file);
      const url = extractImageUrl(res);
      if (url) {
        setAddImages(prev => [url, ...prev.filter(u => u !== url)]);
        if (addToast) addToast('Room image uploaded successfully as primary!', 'success');
      } else {
        if (addToast) addToast('Image uploaded but could not parse response URL', 'warning');
      }
    } catch (err) {
      console.error('Upload failed', err);
      if (addToast) addToast(err.response?.data?.message || 'Failed to upload room image', 'error');
    }
  };

  const handleAddImageUrlAdd = () => {
    const url = (addImageUrlInput || '').trim();
    if (!url) return;
    setAddImages(prev => [url, ...prev.filter(u => u !== url)]);
    setAddImageUrlInput('');
    if (addToast) addToast('Image URL added as primary!', 'success');
  };

  const handleUploadEdit = async (file) => {
    const currentRoomId = selectedRoom?._id;
    if (!currentRoomId) {
      if (addToast) addToast('Please select a room to edit first.', 'error');
      return;
    }
    try {
      const res = await roomsService.uploadImage(file);
      const url = extractImageUrl(res);
      if (url) {
        const nextImages = [url, ...editImages.filter(u => u !== url)];
        setEditImages(nextImages);

        // Immediate update to local list & selectedRoom
        setRooms(prev => prev.map(r => (r._id === currentRoomId ? { ...r, images: nextImages } : r)));
        setSelectedRoom(prev => prev ? { ...prev, images: nextImages } : prev);

        // Auto-save image change directly to room in DB
        try {
          await roomsService.updateRoom(currentRoomId, { images: nextImages });
          if (addToast) addToast('Room image uploaded and saved as primary!', 'success');
          fetchRooms();
        } catch (autoErr) {
          console.error('Auto-save image failed:', autoErr);
          if (addToast) addToast('Image uploaded! Click SAVE CHANGES to save all fields.', 'info');
        }
      } else {
        if (addToast) addToast('Image uploaded but could not parse response URL', 'warning');
      }
    } catch (err) {
      console.error('Upload failed', err);
      if (addToast) addToast(err.response?.data?.message || 'Failed to upload room image', 'error');
    }
  };

  const handleAddImageUrlEdit = async () => {
    const url = (editImageUrlInput || '').trim();
    if (!url) return;
    const currentRoomId = selectedRoom?._id;
    if (!currentRoomId) {
      if (addToast) addToast('Please select a room to edit first.', 'error');
      return;
    }
    const nextImages = [url, ...editImages.filter(u => u !== url)];
    setEditImages(nextImages);
    setEditImageUrlInput('');

    setRooms(prev => prev.map(r => (r._id === currentRoomId ? { ...r, images: nextImages } : r)));
    setSelectedRoom(prev => prev ? { ...prev, images: nextImages } : prev);

    try {
      await roomsService.updateRoom(currentRoomId, { images: nextImages });
      if (addToast) addToast('Image URL added and saved as primary!', 'success');
      fetchRooms();
    } catch (err) {
      console.error('Failed to save image URL:', err);
      if (addToast) addToast('Image added! Click SAVE CHANGES to commit.', 'info');
    }
  };

  const removeAddImage = (idx) => setAddImages(prev => prev.filter((_, i) => i !== idx));

  const removeEditImage = async (idx) => {
    const currentRoomId = selectedRoom?._id;
    const updated = editImages.filter((_, i) => i !== idx);
    setEditImages(updated);
    if (currentRoomId) {
      setRooms(prev => prev.map(r => (r._id === currentRoomId ? { ...r, images: updated } : r)));
      setSelectedRoom(prev => prev ? { ...prev, images: updated } : prev);
      try {
        await roomsService.updateRoom(currentRoomId, { images: updated });
        if (addToast) addToast('Image removed from room.', 'info');
        fetchRooms();
      } catch (err) {
        console.error('Failed to update room after image removal:', err);
      }
    }
  };

  const setPrimaryAddImage = (idx) => {
    setAddImages(prev => {
      if (idx === 0 || idx >= prev.length) return prev;
      const copy = [...prev];
      const [chosen] = copy.splice(idx, 1);
      return [chosen, ...copy];
    });
  };

  const setPrimaryEditImage = async (idx) => {
    if (idx === 0 || idx >= editImages.length) return;
    const currentRoomId = selectedRoom?._id;
    const copy = [...editImages];
    const [chosen] = copy.splice(idx, 1);
    const reordered = [chosen, ...copy];
    setEditImages(reordered);
    if (currentRoomId) {
      setRooms(prev => prev.map(r => (r._id === currentRoomId ? { ...r, images: reordered } : r)));
      setSelectedRoom(prev => prev ? { ...prev, images: reordered } : prev);
      try {
        await roomsService.updateRoom(currentRoomId, { images: reordered });
        if (addToast) addToast('Primary image updated and saved!', 'success');
        fetchRooms();
      } catch (err) {
        console.error('Failed to update primary image:', err);
      }
    }
  };

  // Filtered Rooms

  const filteredRooms = useMemo(() => {
    const list = rooms.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'All Types' || r.type === typeFilter;
      const matchesStatus = statusFilter === 'All Status' || r.status === statusFilter;
      const matchesFloor = floorFilter === 'All Floors' || r.floor === floorFilter;

      return matchesSearch && matchesType && matchesStatus && matchesFloor;
    });

    return list.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
  }, [rooms, searchQuery, typeFilter, statusFilter, floorFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gold font-montserrat">
        <i className="fas fa-spinner fa-spin text-3xl mb-4 text-gold" />
        <span className="text-xs uppercase tracking-[2px] text-text-muted">Loading Room Inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-montserrat">
      {/* ── TOP SUB-NAV TABS ── */}
      <div className="flex bg-dark-2 border-b border-border-gold-soft px-3 sm:px-7 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('manage')}
          className={`py-3.5 px-4.5 text-[11px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-all flex items-center gap-2 ${activeTab === 'manage' ? 'color-gold border-gold text-gold font-semibold' : 'text-text-muted border-transparent hover:text-white'
            }`}
        >
          <i className="fas fa-th-large text-xs" /> Manage Rooms
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`py-3.5 px-4.5 text-[11px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-all flex items-center gap-2 ${activeTab === 'add' ? 'color-gold border-gold text-gold font-semibold' : 'text-text-muted border-transparent hover:text-white'
            }`}
        >
          <i className="fas fa-plus-circle text-xs" /> Add New Room
        </button>
        <button
          onClick={() => handleStartEdit(selectedRoom)}
          className={`py-3.5 px-4.5 text-[11px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-all flex items-center gap-2 ${activeTab === 'edit' ? 'color-gold border-gold text-gold font-semibold' : 'text-text-muted border-transparent hover:text-white'
            }`}
        >
          <i className="fas fa-edit text-xs" /> Edit Room
        </button>
      </div>

      {/* ── PANEL 1: MANAGE ROOMS ── */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">Room Inventory</h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">{rooms.length} rooms across 5 categories</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer">
                <i className="fas fa-file-export" /> Export
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-plus" /> Add Room
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {[
              { label: 'Total Rooms', value: stats.total, icon: 'fas fa-bed', color: 'text-gold bg-gold-glow border-border-gold' },
              { label: 'Available', value: stats.available, icon: 'fas fa-check-circle', color: 'text-success bg-success/10 border-success/20' },
              { label: 'Occupied', value: stats.occupied, icon: 'fas fa-user-check', color: 'text-info bg-info/10 border-info/20' },
              { label: 'Cleaning', value: stats.cleaning, icon: 'fas fa-broom', color: 'text-gold bg-gold-glow border-gold/10' },
              { label: 'Maintenance', value: stats.maintenance, icon: 'fas fa-tools', color: 'text-danger bg-danger/10 border-danger/20' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-dark-3 border border-border-gold-soft rounded-lg p-4 flex items-center gap-3.5 hover:border-border-gold transition-colors duration-200">
                <div className={`w-[38px] h-[38px] rounded-lg border flex items-center justify-center text-sm ${stat.color}`}>
                  <i className={stat.icon} />
                </div>
                <div>
                  <div className="font-cinzel text-xl text-white font-semibold leading-none mb-1">{stat.value}</div>
                  <div className="text-[9px] text-text-muted tracking-[0.5px] uppercase font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2.5 bg-dark-3 border border-border-gold-soft p-3 rounded-lg">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search room number, type, floor…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-4 border border-border-gold rounded p-2 pl-9 text-xs text-white outline-none focus:border-gold transition-colors"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end items-center">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Deluxe Suite">Deluxe Suite</option>
                <option value="Deluxe Single Room">Deluxe Single Room</option>
                <option value="Deluxe Double Room">Deluxe Double Room</option>
                <option value="Deluxe Triple Room">Deluxe Triple Room</option>
                <option value="Special Price Room">Special Price Room</option>
                <option value="Hour Room">Hour Room</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option>All Status</option>
                <option>Available</option>
                <option>Occupied</option>
                <option>Cleaning</option>
                <option>Maintenance</option>
                <option>Reserved</option>
              </select>

              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option>All Floors</option>
                <option>1st Floor</option>
                <option>2nd Floor</option>
                <option>3rd Floor</option>
              </select>

              <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden ml-2 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-[10px] tracking-[1px] font-semibold flex items-center gap-1 cursor-pointer ${viewMode === 'grid' ? 'bg-gold text-black' : 'text-text-muted hover:text-white'
                    }`}
                >
                  <i className="fas fa-th-large" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-[10px] tracking-[1px] font-semibold flex items-center gap-1 cursor-pointer ${viewMode === 'list' ? 'bg-gold text-black' : 'text-text-muted hover:text-white'
                    }`}
                >
                  <i className="fas fa-list" /> List
                </button>
              </div>
            </div>
          </div>

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredRooms.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleStartEdit(r)}
                  className="bg-dark-3 border border-border-gold-soft hover:border-border-gold rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer group"
                >
                  <div className={`h-[160px] relative flex items-center justify-center overflow-hidden ${r.classStyle}`}>
                    {r.images && r.images.length > 0 ? (
                      <img src={getImageUrl(r.images[0])} alt={r.name} className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <i className={`${r.icon} text-[52px] opacity-20 absolute`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-3 right-3">
                      <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${r.status === 'Available' ? 'bg-success/15 text-success' :
                          r.status === 'Occupied' ? 'bg-info/15 text-info' :
                            r.status === 'Reserved' ? 'bg-warning/15 text-warning' :
                              r.status === 'Cleaning' ? 'bg-gold-glow text-gold' :
                                'bg-danger/15 text-danger'
                        }`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="font-cinzel text-xl text-white font-bold">{r.id}</div>
                      {r.isFeatured && <i className="fas fa-star text-gold text-sm" title="Featured Room" />}
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] text-white/70 tracking-[1px] uppercase">{r.floor} · {r.type.split(' ')[0]}</div>
                  </div>

                  <div className="p-4">
                    <div className="text-[10px] tracking-[2px] uppercase text-gold mb-1">{r.type}</div>
                    <h3 className="font-cinzel text-sm text-white font-semibold mb-3">{r.name}</h3>

                    <div className="flex gap-3.5 mb-4.5 text-xs text-text-muted">
                      <div className="flex items-center gap-1"><i className="fas fa-expand-arrows-alt text-[10px] text-gold" /> {r.size} m²</div>
                      <div className="flex items-center gap-1"><i className="fas fa-bed text-[10px] text-gold" /> {r.bed}</div>
                      <div className="flex items-center gap-1"><i className="fas fa-users text-[10px] text-gold" /> {r.guests} Guests</div>
                    </div>

                    {/* Check-In / Check-Out badge if Occupied */}
                    {r.status === 'Occupied' && r.currentBooking && (
                      <div className="mb-3 p-2 rounded bg-info/10 border border-info/30 text-[10px] font-mono flex items-center justify-between text-text-muted">
                        <span>In: <strong className="text-white">{new Date(r.currentBooking.checkIn).toLocaleDateString()}</strong></span>
                        <span>Out: <strong className="text-white">{new Date(r.currentBooking.checkOut).toLocaleDateString()}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border-gold-soft/50">
                      <div className="font-cinzel text-sm text-gold font-semibold">
                        {(r.price || 0).toLocaleString()} ETB <span className="font-montserrat text-[10px] text-text-muted font-normal">/night</span>
                      </div>
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenWalkInModal(r)}
                          className="h-7 px-2 bg-gold/15 border border-gold/40 hover:bg-gold hover:text-black text-gold rounded flex items-center gap-1 cursor-pointer text-[10px] font-semibold transition-colors"
                          title="Register Physical Walk-In Guest"
                        >
                          <i className="fas fa-walking" />
                          <span>Walk-In</span>
                        </button>
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                          title="View"
                        >
                          <i className="fas fa-eye" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.id)}
                          className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-danger hover:text-danger text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-gold-soft bg-dark-2/40">
                      <th className="p-4"><input type="checkbox" className="accent-gold" /></th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Room</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Type</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Floor</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Bed</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Size</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Capacity</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Price / Night</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Occupancy</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Status</th>
                      <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gold-soft/50">
                    {filteredRooms.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => handleStartEdit(r)}
                        className="hover:bg-dark-4 transition-colors cursor-pointer"
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="accent-gold" /></td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-12 h-9 rounded flex items-center justify-center font-bold shrink-0 overflow-hidden relative ${r.classStyle}`}>
                              {r.images && r.images.length > 0 ? (
                                <img src={getImageUrl(r.images[0])} alt={r.name} className="w-full h-full object-cover absolute inset-0" />
                              ) : (
                                r.id[0] === '1' ? '🏨' : r.id[0] === '2' ? '⭐' : '👑'
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <div className="font-cinzel text-gold font-semibold text-xs">{r.id}</div>
                                {r.isFeatured && <i className="fas fa-star text-gold text-[10px]" title="Featured Room" />}
                              </div>
                              <div className="text-[10px] text-text-muted truncate w-24">{r.name}</div>
                              {r.status === 'Occupied' && r.currentBooking && (
                                <div className="text-[9px] text-info font-mono">
                                  In: {new Date(r.currentBooking.checkIn).toLocaleDateString()} · Out: {new Date(r.currentBooking.checkOut).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-white-dim">{r.type}</td>
                        <td className="p-4 text-xs text-white-dim">{r.floor}</td>
                        <td className="p-4 text-xs text-white-dim">{r.bed}</td>
                        <td className="p-4 text-xs text-white-dim">{r.size} m²</td>
                        <td className="p-4 text-xs text-white-dim">{r.guests} Guests</td>
                        <td className="p-4 text-xs text-gold font-semibold">{(r.price || 0).toLocaleString()} ETB</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="h-1.5 bg-dark-5 rounded-full overflow-hidden w-20">
                              <div className="h-full bg-gradient-to-r from-gold-dark to-gold" style={{ width: `${r.occupancyRate}%` }} />
                            </div>
                            <span className="text-[9px] text-text-muted block">{r.occupancyRate}%</span>
                          </div>
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={r.status}
                            onChange={(e) => handleQuickStatusChange(r, e.target.value)}
                            className={`text-[10px] font-bold p-1 px-2 rounded-md outline-none cursor-pointer border ${
                              r.status === 'Available' ? 'bg-success/15 text-success border-success/30' :
                              r.status === 'Occupied' ? 'bg-info/15 text-info border-info/30' :
                              r.status === 'Reserved' ? 'bg-warning/15 text-warning border-warning/30' :
                              r.status === 'Cleaning' ? 'bg-gold-glow text-gold border-gold/30' :
                              'bg-danger/15 text-danger border-danger/30'
                            }`}
                          >
                            <option value="Available" className="bg-dark-3 text-white">Available</option>
                            <option value="Occupied" className="bg-dark-3 text-white">Occupied (Walk-In)</option>
                            <option value="Cleaning" className="bg-dark-3 text-white">Cleaning</option>
                            <option value="Maintenance" className="bg-dark-3 text-white">Maintenance</option>
                            <option value="Reserved" className="bg-dark-3 text-white">Reserved</option>
                          </select>
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenWalkInModal(r)}
                              className="h-7 px-2 bg-gold/15 border border-gold/40 hover:bg-gold hover:text-black text-gold rounded flex items-center gap-1 cursor-pointer text-[10px] font-semibold transition-colors"
                              title="Register Physical Walk-In Guest"
                            >
                              <i className="fas fa-walking" />
                              <span>Walk-In</span>
                            </button>
                            <button
                              onClick={() => handleStartEdit(r)}
                              className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                              title="View"
                            >
                              <i className="fas fa-eye" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(r)}
                              className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                              title="Edit"
                            >
                              <i className="fas fa-edit" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(r.id)}
                              className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-danger hover:text-danger text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                              title="Delete"
                            >
                              <i className="fas fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-3.5 px-5 border-t border-border-gold-soft bg-dark-2/20">
                <span className="text-[11px] text-text-muted">Showing {filteredRooms.length} of {rooms.length} rooms</span>
                <div className="flex gap-1">
                  <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-left text-[9px]" /></button>
                  <button className="w-8 h-8 bg-gold text-black border border-gold font-bold rounded flex items-center justify-center cursor-pointer text-xs">1</button>
                  <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-right text-[9px]" /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PANEL 2: ADD NEW ROOM ── */}
      {activeTab === 'add' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">Add New Room</h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">Create a new listing in the hotel inventory</p>
            </div>
            <button
              onClick={() => setActiveTab('manage')}
              className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-arrow-left" /> Cancel
            </button>
          </div>

          <form onSubmit={handleAddRoomSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Form Blocks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-info-circle" /> Basic Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Room Number <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 302"
                      value={addNum}
                      onChange={(e) => setAddNum(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Floor</label>
                    <select
                      value={addFloor}
                      onChange={(e) => setAddFloor(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>1st Floor</option>
                      <option>2nd Floor</option>
                      <option>3rd Floor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Room Type <span className="text-danger">*</span></label>
                    <select
                      value={addType}
                      onChange={(e) => setAddType(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Deluxe Suite">Deluxe Suite</option>
                      <option value="Deluxe Single Room">Deluxe Single Room</option>
                      <option value="Deluxe Double Room">Deluxe Double Room</option>
                      <option value="Deluxe Triple Room">Deluxe Triple Room</option>
                      <option value="Special Price Room">Special Price Room</option>
                      <option value="Hour Room">Hour Room</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Room Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Garden Junior Suite"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-4">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Description</label>
                  <textarea
                    placeholder="Describe the room's unique features, view, atmosphere…"
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-20 resize-none"
                  />
                </div>
              </div>

              {/* Room Specs */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-ruler-combined" /> Room Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Size (m²)</label>
                    <input
                      type="number"
                      placeholder="48"
                      value={addSize}
                      onChange={(e) => setAddSize(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Bed Type</label>
                    <select
                      value={addBed}
                      onChange={(e) => setAddBed(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>Single</option>
                      <option>Twin</option>
                      <option>Double</option>
                      <option>Queen</option>
                      <option>King</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Max Guests</label>
                    <input
                      type="number"
                      placeholder="3"
                      min="1"
                      max="10"
                      value={addGuests}
                      onChange={(e) => setAddGuests(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Bathrooms</label>
                    <select
                      value={addBathrooms}
                      onChange={(e) => setAddBathrooms(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>1 Bathroom</option>
                      <option>1.5 Bathrooms</option>
                      <option>2 Bathrooms</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">View Type</label>
                    <select
                      value={addView}
                      onChange={(e) => setAddView(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>City View</option>
                      <option>Garden View</option>
                      <option>Pool View</option>
                      <option>Mountain View</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-coins" /> Pricing
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Base Rate / Night <span className="text-danger">*</span></label>
                    <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden">
                      <span className="p-2.5 px-3.5 bg-dark-5 text-text-muted border-r border-border-gold text-xs">ETB</span>
                      <input
                        type="number"
                        required
                        placeholder="1900"
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        className="flex-1 bg-transparent p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Weekend Rate / Night</label>
                    <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden">
                      <span className="p-2.5 px-3.5 bg-dark-5 text-text-muted border-r border-border-gold text-xs">ETB</span>
                      <input
                        type="number"
                        placeholder="2200"
                        value={addWeekendPrice}
                        onChange={(e) => setAddWeekendPrice(e.target.value)}
                        className="flex-1 bg-transparent p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={addDiscount}
                      onChange={(e) => setAddDiscount(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                    <span className="text-[9px] text-text-muted">Leave 0 for no discount</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Extra Guest Fee</label>
                    <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden">
                      <span className="p-2.5 px-3.5 bg-dark-5 text-text-muted border-r border-border-gold text-xs">ETB</span>
                      <input
                        type="number"
                        placeholder="300"
                        value={addExtraFee}
                        onChange={(e) => setAddExtraFee(e.target.value)}
                        className="flex-1 bg-transparent p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-concierge-bell" /> Amenities
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ALL_AMENITIES.map((am) => {
                    const isChecked = addAmenities.includes(am.label);
                    return (
                      <label
                        key={am.label}
                        onClick={() => toggleAmenity(addAmenities, setAddAmenities, am.label)}
                        className={`flex items-center gap-2 p-2 px-3 border rounded-md cursor-pointer text-xs transition-colors ${isChecked ? 'bg-gold-glow border-border-gold text-gold font-semibold' : 'bg-dark-4 border-border-gold-soft text-text-muted hover:border-border-gold hover:text-white'
                          }`}
                      >
                        <i className={`${am.icon} w-4 text-center`} />
                        <span>{am.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Room Images */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-images" /> Room Images
                </div>
                <ImageUploader onUpload={handleUploadAdd} multiple={false} showPreviews={false} />
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (https://...)"
                    value={addImageUrlInput}
                    onChange={(e) => setAddImageUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrlAdd(); } }}
                    className="flex-1 bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrlAdd}
                    className="bg-gold hover:bg-gold-light text-black text-xs font-semibold px-3 py-2 rounded cursor-pointer transition-colors"
                  >
                    Add URL
                  </button>
                </div>
                {addImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3.5">
                    {addImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setPrimaryAddImage(i)}
                        className={`aspect-[4/3] bg-dark-5 border rounded-md flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all ${
                          i === 0 ? 'border-gold ring-1 ring-gold/40' : 'border-border-gold-soft hover:border-gold'
                        }`}
                        title={i === 0 ? 'Primary Image' : 'Click to set as primary'}
                      >
                        <img src={getImageUrl(img)} alt="room" className="w-full h-full object-cover" />
                        {i === 0 && <div className="absolute inset-x-0 bottom-0 bg-gold text-black text-[8px] font-bold tracking-[1px] text-center py-0.5">PRIMARY</div>}
                        <div
                          onClick={(e) => { e.stopPropagation(); removeAddImage(i); }}
                          className="absolute top-1 right-1 w-5 h-5 bg-danger/80 hover:bg-danger rounded-full flex items-center justify-center text-[9px] text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-text-muted mt-2 block">Click an image to set as primary. First image shown in listings.</span>
              </div>
            </div>

            {/* Right Side: Preview & Status */}
            <div className="space-y-6">
              {/* Live Preview */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
                <div className={`h-[140px] relative flex items-center justify-center overflow-hidden ${addType.includes('Royal') ? 'rm-royal' :
                    addType.includes('Executive') ? 'rm-executive' :
                      addType.includes('Junior') ? 'rm-junior' :
                        addType.includes('Deluxe') ? 'rm-deluxe' : 'rm-standard'
                  }`}>
                  {addImages.length > 0 ? (
                    <img src={getImageUrl(addImages[0])} alt="preview" className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <>
                      <i className={`fas ${addType.includes('Royal') ? 'fa-crown' :
                          addType.includes('Executive') ? 'fa-star' :
                            addType.includes('Junior') ? 'fa-gem' :
                              addType.includes('Deluxe') ? 'fa-spa' : 'fa-door-open'
                        } text-[48px] opacity-10 absolute`} />
                      <span className="text-3xl opacity-35">🛏️</span>
                    </>
                  )}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="text-[9px] font-bold p-1 px-2.5 rounded-full bg-success/15 text-success border border-success/20 backdrop-blur-sm">
                      {addStatus}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-[9px] tracking-[2px] uppercase text-gold">{addType}</div>
                  <h4 className="font-cinzel text-sm text-white font-semibold">{addName || 'Room Name'}</h4>
                  <div className="flex gap-3 text-[11px] text-text-muted">
                    <div className="flex items-center gap-1"><i className="fas fa-expand-arrows-alt text-[9px] text-gold" /> {addSize} m²</div>
                    <div className="flex items-center gap-1"><i className="fas fa-bed text-[9px] text-gold" /> {addBed}</div>
                    <div className="flex items-center gap-1"><i className="fas fa-users text-[9px] text-gold" /> {addGuests} Guests</div>
                  </div>
                  <div className="font-cinzel text-base text-gold font-semibold pt-1 border-t border-border-gold-soft/50">
                    {Number(addPrice || 0).toLocaleString()} ETB <span className="font-montserrat text-[10px] text-text-muted font-normal">/night</span>
                  </div>
                </div>
              </div>

              {/* Status toggles */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-circle" /> Room Status
                </div>
                <div className="flex gap-2">
                  {['Available', 'Maintenance', 'Cleaning'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAddStatus(st)}
                      className={`flex-1 p-2 border rounded-md text-xs font-semibold cursor-pointer transition-colors ${addStatus === st
                          ? (st === 'Available' ? 'bg-success/10 border-success text-success' : st === 'Maintenance' ? 'bg-danger/10 border-danger text-danger' : 'bg-gold-glow border-gold text-gold')
                          : 'bg-dark-4 border-border-gold-soft text-text-muted hover:border-gold'
                        }`}
                    >
                      {st === 'Available' ? '✓ Free' : st === 'Maintenance' ? '🔧 Maint.' : '🧹 Clean'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Room Toggle */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-star" /> Homepage Placement
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addFeatured}
                    onChange={(e) => setAddFeatured(e.target.checked)}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                  <div className="text-xs text-white">
                    <span className="font-semibold block mb-0.5">Feature on Homepage</span>
                    <span className="text-[10px] text-text-muted font-normal">Show this room in the "Featured Rooms & Suites" section.</span>
                  </div>
                </label>
              </div>

              {/* Actions sticky panel */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-4 space-y-2.5">
                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-[1.5px] py-3 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <i className="fas fa-plus-circle" /> CREATE ROOM
                </button>
                <button type="button" className="w-full bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-xs font-semibold py-2 px-3 rounded cursor-pointer transition-colors">
                  <i className="fas fa-eye text-[10px]" /> Preview on Website
                </button>
                <button type="button" className="w-full bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-xs font-semibold py-2 px-3 rounded cursor-pointer transition-colors">
                  <i className="fas fa-save text-[10px]" /> Save as Draft
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── PANEL 3: EDIT ROOM ── */}
      {activeTab === 'edit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('manage')}
                className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-1.5 px-3.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <i className="fas fa-arrow-left" /> Back
              </button>
              <div>
                <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">
                  Edit Room <span className="text-gold">— {selectedRoom.id}</span>
                </h1>
                <p className="text-[11px] text-text-muted tracking-[0.5px]">
                  {selectedRoom.type} · {selectedRoom.floor} · Currently {selectedRoom.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <span className={`text-[11px] font-bold p-1.5 px-3.5 rounded-full ${selectedRoom.status === 'Available' ? 'bg-success/15 text-success border border-success/20' :
                  selectedRoom.status === 'Occupied' ? 'bg-info/15 text-info border border-info/20' :
                    selectedRoom.status === 'Reserved' ? 'bg-warning/15 text-warning border border-warning/20' :
                      selectedRoom.status === 'Cleaning' ? 'bg-gold-glow text-gold border border-gold/20' :
                        'bg-danger/15 text-danger border border-danger/20'
                }`}>
                {selectedRoom.status}
              </span>
              <button
                onClick={() => handleDeleteRoom(selectedRoom.id)}
                className="bg-danger/15 border border-danger/30 hover:bg-danger/25 text-danger text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <i className="fas fa-trash" /> Delete Room
              </button>
            </div>
          </div>

          <form onSubmit={handleEditRoomSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Form Blocks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Occupied Guest Stay Card */}
              {(selectedRoom.status === 'Occupied' || selectedRoom.currentBooking) && (
                <div className="bg-dark-3 border border-info/50 rounded-lg p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-info via-gold to-info" />
                  <div className="font-cinzel text-xs text-info tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2">
                      <i className="fas fa-user-check text-info" /> Active Guest & Occupancy Information
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-info/20 text-info border border-info/40 font-mono">
                      CURRENTLY OCCUPIED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-dark-4 border border-border-gold-soft rounded-lg p-3">
                      <span className="text-[9px] uppercase tracking-[1px] text-text-muted block mb-1">Guest Name</span>
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        <i className="fas fa-user text-gold text-[10px]" />
                        {selectedRoom.currentBooking?.fullName || 'Walk-In Guest'}
                      </div>
                    </div>

                    <div className="bg-dark-4 border border-border-gold-soft rounded-lg p-3">
                      <span className="text-[9px] uppercase tracking-[1px] text-text-muted block mb-1">Phone Number</span>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <i className="fas fa-phone text-gold text-[10px]" />
                        {selectedRoom.currentBooking?.phone ? (
                          <a href={`tel:${selectedRoom.currentBooking.phone}`} className="hover:text-gold transition-colors font-mono">
                            {selectedRoom.currentBooking.phone}
                          </a>
                        ) : (
                          <span className="text-text-muted">N/A</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-dark-4 border border-border-gold-soft rounded-lg p-3">
                      <span className="text-[9px] uppercase tracking-[1px] text-text-muted block mb-1">Check-In Date</span>
                      <div className="text-xs font-semibold text-success font-mono flex items-center gap-1.5">
                        <i className="fas fa-sign-in-alt text-success text-[10px]" />
                        {selectedRoom.currentBooking?.checkIn
                          ? new Date(selectedRoom.currentBooking.checkIn).toLocaleDateString()
                          : 'Today'}
                      </div>
                    </div>

                    <div className="bg-dark-4 border border-border-gold-soft rounded-lg p-3">
                      <span className="text-[9px] uppercase tracking-[1px] text-text-muted block mb-1">Check-Out Date</span>
                      <div className="text-xs font-semibold text-warning font-mono flex items-center gap-1.5">
                        <i className="fas fa-sign-out-alt text-warning text-[10px]" />
                        {selectedRoom.currentBooking?.checkOut
                          ? new Date(selectedRoom.currentBooking.checkOut).toLocaleDateString()
                          : 'Tomorrow'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-gold-soft/50 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-text-muted text-[11px]">
                      <span>Source: <strong className="text-white">{selectedRoom.currentBooking?.bookingSource || 'Direct / Walk-In'}</strong></span>
                      <span>Payment: <strong className={selectedRoom.currentBooking?.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>{selectedRoom.currentBooking?.paymentStatus?.toUpperCase() || 'PAID'}</strong></span>
                      <span>Total: <strong className="text-gold font-mono">{selectedRoom.currentBooking?.totalPrice ? `${Number(selectedRoom.currentBooking.totalPrice).toLocaleString()} ETB` : `${Number(selectedRoom?.price || 0).toLocaleString()} ETB`}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheckOutOccupiedRoom(selectedRoom)}
                      className="px-3.5 py-2 bg-danger/15 border border-danger/40 hover:bg-danger text-white rounded text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow"
                    >
                      <i className="fas fa-sign-out-alt" /> Check-Out Guest & Clean Room
                    </button>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-info-circle" /> Basic Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Room Number</label>
                    <input
                      type="text"
                      value={editNum}
                      onChange={(e) => setEditNum(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Floor</label>
                    <select
                      value={editFloor}
                      onChange={(e) => setEditFloor(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>1st Floor</option>
                      <option>2nd Floor</option>
                      <option>3rd Floor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Room Type</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Deluxe Suite">Deluxe Suite</option>
                      <option value="Deluxe Single Room">Deluxe Single Room</option>
                      <option value="Deluxe Double Room">Deluxe Double Room</option>
                      <option value="Deluxe Triple Room">Deluxe Triple Room</option>
                      <option value="Special Price Room">Special Price Room</option>
                      <option value="Hour Room">Hour Room</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Room Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-4">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-24 resize-none"
                  />
                </div>
              </div>

              {/* Room Specs */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-ruler-combined" /> Room Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Size (m²)</label>
                    <input
                      type="number"
                      value={editSize}
                      onChange={(e) => setEditSize(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Bed Type</label>
                    <select
                      value={editBed}
                      onChange={(e) => setEditBed(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>Single</option>
                      <option>Twin</option>
                      <option>Double</option>
                      <option>Queen</option>
                      <option>King</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Max Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editGuests}
                      onChange={(e) => setEditGuests(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Bathrooms</label>
                    <select
                      value={editBathrooms}
                      onChange={(e) => setEditBathrooms(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>1 Bathroom</option>
                      <option>1.5 Bathrooms</option>
                      <option>2 Bathrooms</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">View Type</label>
                    <select
                      value={editView}
                      onChange={(e) => setEditView(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>City View</option>
                      <option>Garden View</option>
                      <option>Pool View</option>
                      <option>Mountain View</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-coins" /> Pricing
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Base Rate / Night</label>
                    <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden">
                      <span className="p-2.5 px-3.5 bg-dark-5 text-text-muted border-r border-border-gold text-xs">ETB</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="flex-1 bg-transparent p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Weekend Rate / Night</label>
                    <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden">
                      <span className="p-2.5 px-3.5 bg-dark-5 text-text-muted border-r border-border-gold text-xs">ETB</span>
                      <input
                        type="number"
                        value={editWeekendPrice}
                        onChange={(e) => setEditWeekendPrice(e.target.value)}
                        className="flex-1 bg-transparent p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Discount (%)</label>
                    <input
                      type="number"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Extra Guest Fee</label>
                    <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden">
                      <span className="p-2.5 px-3.5 bg-dark-5 text-text-muted border-r border-border-gold text-xs">ETB</span>
                      <input
                        type="number"
                        value={editExtraFee}
                        onChange={(e) => setEditExtraFee(e.target.value)}
                        className="flex-1 bg-transparent p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-concierge-bell" /> Amenities
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ALL_AMENITIES.map((am) => {
                    const isChecked = editAmenities.includes(am.label);
                    return (
                      <label
                        key={am.label}
                        onClick={() => toggleAmenity(editAmenities, setEditAmenities, am.label)}
                        className={`flex items-center gap-2 p-2 px-3 border rounded-md cursor-pointer text-xs transition-colors ${isChecked ? 'bg-gold-glow border-border-gold text-gold font-semibold' : 'bg-dark-4 border-border-gold-soft text-text-muted hover:border-border-gold hover:text-white'
                          }`}
                      >
                        <i className={`${am.icon} w-4 text-center`} />
                        <span>{am.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Room Images */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-images" /> Room Images
                </div>
                <ImageUploader onUpload={handleUploadEdit} multiple={false} showPreviews={false} />
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (https://...)"
                    value={editImageUrlInput}
                    onChange={(e) => setEditImageUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrlEdit(); } }}
                    className="flex-1 bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrlEdit}
                    className="bg-gold hover:bg-gold-light text-black text-xs font-semibold px-3 py-2 rounded cursor-pointer transition-colors"
                  >
                    Add URL
                  </button>
                </div>
                {editImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3.5">
                    {editImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setPrimaryEditImage(i)}
                        className={`aspect-[4/3] bg-dark-5 border rounded-md flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all ${
                          i === 0 ? 'border-gold ring-1 ring-gold/40' : 'border-border-gold-soft hover:border-gold'
                        }`}
                        title={i === 0 ? 'Primary Image' : 'Click to set as primary'}
                      >
                        <img src={getImageUrl(img)} alt="room" className="w-full h-full object-cover" />
                        {i === 0 && <div className="absolute inset-x-0 bottom-0 bg-gold text-black text-[8px] font-bold tracking-[1px] text-center py-0.5">PRIMARY</div>}
                        <div
                          onClick={(e) => { e.stopPropagation(); removeEditImage(i); }}
                          className="absolute top-1 right-1 w-5 h-5 bg-danger/80 hover:bg-danger rounded-full flex items-center justify-center text-[9px] text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-text-muted mt-2 block">Click an image to set as primary. First image shown in listings.</span>
              </div>

              {/* Danger Zone */}
              <div className="bg-dark-3 border border-danger/20 rounded-lg p-5">
                <div className="font-cinzel text-xs text-danger tracking-[1.5px] uppercase border-b border-danger/10 pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-exclamation-triangle" /> Danger Zone
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border-gold-soft">
                  <div>
                    <div className="text-xs text-white font-medium mb-0.5">Deactivate Room</div>
                    <div className="text-[10px] text-text-muted">Hide this room from public booking requests without deleting database history.</div>
                  </div>
                  <button type="button" className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1px] uppercase font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors">
                    <i className="fas fa-eye-slash" /> Deactivate
                  </button>
                </div>
                <div className="flex justify-between items-center pt-3.5">
                  <div>
                    <div className="text-xs text-danger font-medium mb-0.5">Delete Room Permanently</div>
                    <div className="text-[10px] text-text-muted">This action is irreversible. All booking logs will remain stored.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(selectedRoom.id)}
                    className="bg-danger/15 border border-danger/30 hover:bg-danger/25 text-danger text-[10px] tracking-[1px] uppercase font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors"
                  >
                    <i className="fas fa-trash" /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Preview, Status & Stats */}
            <div className="space-y-6">
              {/* Live Preview */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
                <div className={`h-[140px] relative flex items-center justify-center overflow-hidden ${editType.includes('Royal') ? 'rm-royal' :
                    editType.includes('Executive') ? 'rm-executive' :
                      editType.includes('Junior') ? 'rm-junior' :
                        editType.includes('Deluxe') ? 'rm-deluxe' : 'rm-standard'
                  }`}>
                  {editImages.length > 0 ? (
                    <img src={getImageUrl(editImages[0])} alt="preview" className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <>
                      <i className={`fas ${editType.includes('Royal') ? 'fa-crown' :
                          editType.includes('Executive') ? 'fa-star' :
                            editType.includes('Junior') ? 'fa-gem' :
                              editType.includes('Deluxe') ? 'fa-spa' : 'fa-door-open'
                        } text-[48px] opacity-10 absolute`} />
                      <span className="text-3xl opacity-35">👑</span>
                    </>
                  )}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="text-[9px] font-bold p-1 px-2.5 rounded-full bg-success/15 text-success border border-success/20 backdrop-blur-sm">
                      {editStatus}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-[9px] tracking-[2px] uppercase text-gold">{editType}</div>
                  <h4 className="font-cinzel text-sm text-white font-semibold">{editName || 'Room Name'}</h4>
                  <div className="flex gap-3 text-[11px] text-text-muted">
                    <div className="flex items-center gap-1"><i className="fas fa-expand-arrows-alt text-[9px] text-gold" /> {editSize} m²</div>
                    <div className="flex items-center gap-1"><i className="fas fa-bed text-[9px] text-gold" /> {editBed}</div>
                    <div className="flex items-center gap-1"><i className="fas fa-users text-[9px] text-gold" /> {editGuests} Guests</div>
                  </div>
                  <div className="font-cinzel text-base text-gold font-semibold pt-1 border-t border-border-gold-soft/50">
                    {Number(editPrice || 0).toLocaleString()} ETB <span className="font-montserrat text-[10px] text-text-muted font-normal">/night</span>
                  </div>
                </div>
              </div>

              {/* Status toggles */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-circle" /> Room Status
                </div>
                <div className="flex gap-2">
                  {['Available', 'Occupied', 'Maintenance'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`flex-1 p-2 border rounded-md text-[10px] font-bold cursor-pointer transition-colors ${editStatus === st
                          ? (st === 'Available' ? 'bg-success/15 border-success text-success' : st === 'Occupied' ? 'bg-info/15 border-info text-info' : 'bg-danger/15 border-danger text-danger')
                          : 'bg-dark-4 border-border-gold-soft text-text-muted hover:border-gold'
                        }`}
                    >
                      {st === 'Available' ? '✓ Free' : st === 'Occupied' ? '🔵 Occupied' : '🔧 Maint.'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Room Toggle */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-star" /> Homepage Placement
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                  <div className="text-xs text-white">
                    <span className="font-semibold block mb-0.5">Feature on Homepage</span>
                    <span className="text-[10px] text-text-muted font-normal">Show this room in the "Featured Rooms & Suites" section.</span>
                  </div>
                </label>
              </div>

              {/* Room Stats */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-chart-bar" /> Room Stats & Occupancy
                </div>
                <div className="space-y-3.5">
                  {(selectedRoom.status === 'Occupied' || selectedRoom.currentBooking) && (
                    <>
                      <div className="flex justify-between text-xs border-b border-border-gold-soft/50 pb-2">
                        <span className="text-info font-medium">Active Guest</span>
                        <span className="text-white font-semibold truncate max-w-[130px]">{selectedRoom.currentBooking?.fullName || 'Walk-In Guest'}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-border-gold-soft/50 pb-2">
                        <span className="text-text-muted">Check-In Date</span>
                        <span className="text-success font-mono font-semibold">{selectedRoom.currentBooking?.checkIn ? new Date(selectedRoom.currentBooking.checkIn).toLocaleDateString() : 'Today'}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-border-gold-soft/50 pb-2">
                        <span className="text-text-muted">Check-Out Date</span>
                        <span className="text-warning font-mono font-semibold">{selectedRoom.currentBooking?.checkOut ? new Date(selectedRoom.currentBooking.checkOut).toLocaleDateString() : 'Tomorrow'}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Bookings this month</span><span className="text-gold font-semibold font-mono">{selectedRoom.bookingsCount || 18}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Occupancy rate</span><span className="text-gold font-semibold font-mono">{selectedRoom.occupancyRate || 92}%</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Revenue this month</span><span className="text-success font-semibold font-mono">{(selectedRoom.revenue || 68400).toLocaleString()} ETB</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Avg guest rating</span><span className="text-gold font-semibold font-mono">{selectedRoom.rating || 4.9} ★</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Last cleaned</span><span className="text-text-muted">Today 08:30</span></div>
                </div>
              </div>

              {/* Actions sticky panel */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-4 space-y-2.5">
                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-[1.5px] py-3 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <i className="fas fa-save" /> SAVE CHANGES
                </button>
                <button type="button" className="w-full bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-xs font-semibold py-2 px-3 rounded cursor-pointer transition-colors">
                  <i className="fas fa-eye text-[10px]" /> Preview on Website
                </button>
                <button type="button" className="w-full bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-xs font-semibold py-2 px-3 rounded cursor-pointer transition-colors">
                  <i className="fas fa-history text-[10px]" /> View Change History
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      {/* ── WALK-IN PHYSICAL BOOKING MODAL ── */}
      {showWalkInModal && walkInRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-2 border border-border-gold rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative text-white">
            <button
              onClick={() => setShowWalkInModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white text-lg cursor-pointer"
            >
              <i className="fas fa-times" />
            </button>

            <div className="border-b border-border-gold-soft pb-3">
              <span className="text-[10px] tracking-[2px] uppercase text-gold font-bold">WALK-IN PHYSICAL BOOKING</span>
              <h2 className="font-cinzel text-xl text-white font-semibold">Room #{walkInRoom.id} — {walkInRoom.name}</h2>
              <p className="text-xs text-text-muted">Register a physical walk-in guest to set room status to Occupied and lock dates.</p>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Kebede"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +251 91 123 4567"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="guest@example.com (or auto-generated)"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    max={walkInRoom.guests || 6}
                    value={walkInGuests}
                    onChange={(e) => setWalkInGuests(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={walkInCheckIn}
                    onChange={(e) => setWalkInCheckIn(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={walkInCheckOut}
                    onChange={(e) => setWalkInCheckOut(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Payment Method</label>
                  <select
                    value={walkInPaymentMethod}
                    onChange={(e) => setWalkInPaymentMethod(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="POS Card">POS Card</option>
                    <option value="Mobile Transfer">Mobile Transfer / Telebirr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Payment Status</label>
                  <select
                    value={walkInPaymentStatus}
                    onChange={(e) => setWalkInPaymentStatus(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[1px] text-text-muted mb-1 font-semibold">Notes / Special Requests</label>
                <textarea
                  rows="2"
                  placeholder="Optional walk-in guest notes..."
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                />
              </div>

              <div className="pt-3 border-t border-border-gold-soft flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2.5 bg-dark-4 border border-border-gold text-text-muted text-xs font-semibold rounded hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkIn}
                  className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-[1px] rounded cursor-pointer transition-colors flex items-center gap-2 shadow-md"
                >
                  {submittingWalkIn ? (
                    <>
                      <i className="fas fa-spinner fa-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-check" /> Confirm Walk-In Check-In
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
