import React, { useState, useEffect, useMemo } from 'react';
import restaurantService from '../../services/restaurant/restaurantService.js';
import galleryService from '../../services/gallery/galleryService.js';
import ImageUploader from '../../components/ui/ImageUploader.jsx';

const INITIAL_TABLE_SLOTS = [
  { id: 'T01', capacity: 2, status: 'Occupied', type: 'Window' },
  { id: 'T02', capacity: 2, status: 'Available', type: 'Window' },
  { id: 'T03', capacity: 4, status: 'Reserved', type: 'Window', badge: '!' },
  { id: 'T04', capacity: 4, status: 'Occupied', type: 'Window', badge: '✓' },
  { id: 'T05', capacity: 6, status: 'Available', type: 'Window' },
  { id: 'T06', capacity: 4, status: 'Reserved', type: 'Main Hall', badge: '!' },
  { id: 'T07', capacity: 6, status: 'Occupied', type: 'Main Hall', badge: '✓' },
  { id: 'T08', capacity: 2, status: 'Cleaning', type: 'Main Hall' },
  { id: 'T09', capacity: 4, status: 'Available', type: 'Main Hall' },
  { id: 'T10', capacity: 4, status: 'Occupied', type: 'Main Hall', badge: '✓' },
  { id: 'T11', capacity: 3, status: 'Available', type: 'Main Hall' },
  { id: 'T12', capacity: 4, status: 'Reserved', type: 'Private', badge: '!' },
  { id: 'T13', capacity: 6, status: 'Occupied', type: 'Private', badge: '✓' },
  { id: 'T14', capacity: 2, status: 'Cleaning', type: 'Private' },
  { id: 'T15', capacity: 4, status: 'Closed', type: 'Private' }
];

const ALL_DIETARY_TAGS = ['Vegan', 'Fasting', 'Spicy', 'Gluten-Free', 'Halal', 'Vegetarian', 'Nut-Free'];

const ManageMenu = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast Trigger Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 1: MENU ITEMS
  // ==========================================
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('All');
  const [menuSortType, setMenuSortType] = useState('Sort: Newest');
  const [menuStatusFilter, setMenuStatusFilter] = useState('Status: All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentSelectedMenuItem, setCurrentSelectedMenuItem] = useState(null);

  // Modal form states
  const [mName, setMName] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mPrice, setMPrice] = useState(0);
  const [mCategory, setMCategory] = useState('Breakfast');
  const [mStatus, setMStatus] = useState('Active');
  const [mBadge, setMBadge] = useState('');
  const [mDietary, setMDietary] = useState('None');
  const [mImage, setMImage] = useState('');
  const [mImageFile, setMImageFile] = useState(null);

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 2: ADD ITEM FORM
  // ==========================================
  const [fName, setFName] = useState('');
  const [fShortDesc, setFShortDesc] = useState('');
  const [fFullDesc, setFFullDesc] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fDiscountPrice, setFDiscountPrice] = useState('');
  const [fCategory, setFCategory] = useState('breakfast');
  const [fBadge, setFBadge] = useState('');
  const [fTags, setFTags] = useState(['Vegan']);
  const [fTagInput, setFTagInput] = useState('');
  const [fPrepTime, setFPrepTime] = useState('');
  const [fServingSize, setFServingSize] = useState('');
  const [fCalories, setFCalories] = useState('');
  const [fProtein, setFProtein] = useState('');
  const [fCarbs, setFCarbs] = useState('');
  const [fFat, setFFat] = useState('');
  const [fKeywords, setFKeywords] = useState('');
  const [fSortOrder, setFSortOrder] = useState('0');
  const [fImageFile, setFImageFile] = useState(null);

  // Form toggles
  const [fActive, setFActive] = useState(true);
  const [fFeatured, setFFeatured] = useState(false);
  const [fChefRec, setFChefRec] = useState(false);
  const [fFasting, setFFasting] = useState(false);

  // Meal availability
  const [fAvailBreakfast, setFAvailBreakfast] = useState(true);
  const [fAvailLunch, setFAvailLunch] = useState(false);
  const [fAvailDinner, setFAvailDinner] = useState(false);
  const [fAvailAllDay, setFAvailAllDay] = useState(false);

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 3: CATEGORIES
  // ==========================================
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null means "Add Mode"
  const [catNameInput, setCatNameInput] = useState('');
  const [catDescInput, setCatDescInput] = useState('');
  const [catSlugInput, setCatSlugInput] = useState('');
  const [catIconInput, setCatIconInput] = useState('🌅');
  const [catSortOrderInput, setCatSortOrderInput] = useState('1');
  const [catStatusInput, setCatStatusInput] = useState('Active');

  // ==========================================
  // STATE & FUNCTIONALITY FOR TAB 4: RESERVATIONS
  // ==========================================
  const [reservations, setReservations] = useState([]);
  const [tableSlots, setTableSlots] = useState(INITIAL_TABLE_SLOTS);
  const [resTabFilter, setResTabFilter] = useState('all');
  const [resSearchQuery, setResSearchQuery] = useState('');
  const [resDateFilter, setResDateFilter] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  const [resSessionFilter, setResSessionFilter] = useState('');
  const [resTableFilter, setResTableFilter] = useState('');
  const [resPartyFilter, setResPartyFilter] = useState('');

  // Modals reservation
  const [showResModal, setShowResModal] = useState(false);
  const [showViewResModal, setShowViewResModal] = useState(false);
  const [currentSelectedRes, setCurrentSelectedRes] = useState(null);

  // Reservation inputs
  const [rGuest, setRGuest] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPartySize, setRPartySize] = useState(4);
  const [rDate, setRDate] = useState(new Date().toISOString().split('T')[0]);
  const [rTime, setRTime] = useState('19:00');
  const [rSession, setRSession] = useState('Dinner');
  const [rTablePref, setRTablePref] = useState('Auto-assign best available');
  const [rRequests, setRRequests] = useState('');
  const [rStatus, setRStatus] = useState('Confirmed');

  // Quick form inputs
  const [qName, setQName] = useState('');
  const [qPhone, setQPhone] = useState('');
  const [qParty, setQParty] = useState('');
  const [qDate, setQDate] = useState(new Date().toISOString().split('T')[0]);
  const [qTime, setQTime] = useState('');
  const [qSession, setQSession] = useState('Dinner');
  const [qTable, setQTable] = useState('');

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes, resRes] = await Promise.all([
        restaurantService.getMenuItems(),
        restaurantService.getMenuCategories(),
        restaurantService.getTableReservations()
      ]);

      const itemsData = itemsRes.data || itemsRes;
      const catsData = catsRes.data || catsRes;
      const resData = resRes.data || resRes;

      const mappedItems = (Array.isArray(itemsData) ? itemsData : []).map(item => {
        const rawId = String(item._id || item.id || '1');
        return {
          _id: rawId,
          id: `MN-${rawId.padStart(3, '0').slice(-3).toUpperCase()}`,
          name: item.name,
          description: item.description || '',
          fullDescription: item.description || '',
          price: Number(item.price || 0),
          discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
          category: item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Breakfast',
          status: (item.isAvailable !== false && item.available !== false) ? 'Active' : 'Hidden',
          featured: Boolean(item.featured || item.badge),
          orders: 0,
          badge: item.badge || '',
          tags: Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.split(',').map(t=>t.trim()) : ['Vegetarian']),
          prepTime: item.prepTime || `${item.prep_time_mins || 15} min`,
          servingSize: item.servingSize || item.serving_size || '1 person',
          nutrition: item.nutrition || { calories: 350, protein: 12, carbs: 45, fat: 8 },
          availability: { breakfast: true, lunch: true, dinner: true, allday: true },
          keywords: (item.name || '').toLowerCase(),
          sortOrder: item.sortOrder || item.sort_order || 1,
          image: item.image || item.image_url || '🍽️'
        };
      });

      const mappedCategories = (Array.isArray(catsData) ? catsData : []).map(c => {
        const rawId = String(c._id || c.id || '1');
        const catName = c.displayName || c.name || 'Category';
        return {
          _id: rawId,
          id: rawId,
          name: catName,
          slug: c.slug || catName.toLowerCase(),
          icon: c.icon || (catName.toLowerCase() === 'breakfast' ? '🌅' : catName.toLowerCase() === 'ethiopian' ? '🥘' : '🍽️'),
          status: 'Active',
          sortOrder: c.sortOrder || c.sort_order || 1,
          itemCount: 0,
          activeCount: 0,
          ordersCount: 0,
          description: c.description || catName
        };
      });

      const mappedReservations = (Array.isArray(resData) ? resData : []).map(r => {
        const rawId = String(r._id || r.id || '1');
        return {
          _id: rawId,
          id: `#RES-${rawId.padStart(4, '0').slice(-4).toUpperCase()}`,
          guest: r.customerName || r.guest_name || r.fullName || 'Guest',
          phone: r.phone || r.guest_phone || '',
          email: r.email || r.guest_email || '',
          time: r.time || r.reservation_time || '19:00',
          date: r.date || r.reservation_date || new Date().toISOString().split('T')[0],
          table: r.table || r.table_number || 'T01',
          partySize: Number(r.partySize || r.party_size || r.guests || 2),
          session: r.session || r.occasion || 'Dinner',
          status: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : 'Confirmed',
          notes: r.notes || r.specialRequests || ''
        };
      });

      setMenuItems(mappedItems);
      setCategories(mappedCategories);
      setReservations(mappedReservations);

      if (mappedItems.length > 0) {
        setCurrentSelectedMenuItem(mappedItems[0]);
      }
      if (mappedReservations.length > 0) {
        setCurrentSelectedRes(mappedReservations[0]);
      }
    } catch (err) {
      console.error('Failed to load restaurant details:', err);
      showToast('Error loading restaurant data', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const startEditMenuItem = (item) => {
    setCurrentSelectedMenuItem(item);
    setMName(item.name);
    setMDesc(item.description);
    setMPrice(item.price);
    setMCategory(item.category);
    setMStatus(item.status);
    setMBadge(item.badge || '');
    setMDietary(item.tags[0] || 'None');
    setMImage(item.image || '');
    setMImageFile(null);
    setShowEditModal(true);
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    if (!currentSelectedMenuItem) return;

    let imageUrl = mImage;

    if (mImageFile) {
      try {
        const formData = new FormData();
        formData.append('image', mImageFile);
        const uploadRes = await galleryService.uploadImage(formData);
        imageUrl = uploadRes.data.url;
      } catch (err) {
        console.error('Failed to upload image:', err);
        showToast('Failed to upload new image', 'warning');
      }
    }

    const dbItemData = {
      name: mName,
      description: mDesc,
      price: Number(mPrice),
      category: mCategory.toLowerCase(),
      badge: mBadge,
      isAvailable: mStatus === 'Active',
      tags: mDietary !== 'None' ? [mDietary] : [],
      image: imageUrl
    };

    try {
      await restaurantService.updateMenuItem(currentSelectedMenuItem._id, dbItemData);
      await fetchRestaurantData();
      setShowEditModal(false);
      showToast('Menu item updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update menu item:', err);
      showToast('Error updating menu item', 'warning');
    }
  };

  const handleQuickAddMenuItem = async (e) => {
    e.preventDefault();
    if (!mName) return;

    const newItemData = {
      name: mName,
      description: mDesc || 'Freshly prepared specialty dish.',
      price: Number(mPrice || 100),
      category: mCategory.toLowerCase(),
      badge: mBadge || '',
      isAvailable: mStatus === 'Active',
      tags: mDietary !== 'None' ? [mDietary] : [],
      image: mCategory.includes('Drink') ? '☕' : mCategory.includes('Ethiopian') ? '🥘' : '🍽️'
    };

    try {
      await restaurantService.createMenuItem(newItemData);
      await fetchRestaurantData();
      setShowAddModal(false);
      // Reset modal states
      setMName('');
      setMDesc('');
      setMPrice(0);
      setMBadge('');
      showToast('Menu item added successfully!', 'success');
    } catch (err) {
      console.error('Failed to create menu item:', err);
      showToast('Error adding menu item', 'warning');
    }
  };

  const deleteMenuItem = async (id) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      const itemToDelete = menuItems.find(item => item.id === id);
      if (!itemToDelete) return;
      try {
        await restaurantService.deleteMenuItem(itemToDelete._id);
        await fetchRestaurantData();
        showToast('Menu item removed', 'warning');
      } catch (err) {
        console.error('Failed to delete menu item:', err);
        showToast('Error deleting menu item', 'warning');
      }
    }
  };

  const toggleFeaturedStatus = async (id) => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    const nextState = !item.featured;
    try {
      await restaurantService.updateMenuItem(item._id, {
        badge: nextState ? 'Chef Recommended' : ''
      });
      await fetchRestaurantData();
      showToast(`${item.name} is now ${nextState ? 'featured' : 'unfeatured'}`, 'info');
    } catch (err) {
      console.error('Failed to update featured status:', err);
    }
  };

  // Filter and Sort Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(menuSearchQuery.toLowerCase());
      const matchesCategory = menuCatFilter === 'All' || item.category === menuCatFilter;
      const matchesStatus = menuStatusFilter === 'Status: All' || 
        (menuStatusFilter === 'Active' && item.status === 'Active') ||
        (menuStatusFilter === 'Hidden' && item.status === 'Hidden') ||
        (menuStatusFilter === 'Featured' && item.featured);
      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (menuSortType === 'Sort: Price ↑') return a.price - b.price;
      if (menuSortType === 'Sort: Price ↓') return b.price - a.price;
      if (menuSortType === 'Sort: Name A–Z') return a.name.localeCompare(b.name);
      if (menuSortType === 'Sort: Popular') return b.orders - a.orders;
      return b.sortOrder - a.sortOrder;
    });
  }, [menuItems, menuSearchQuery, menuCatFilter, menuSortType, menuStatusFilter]);


  const handleAddTag = (e) => {
    if (e.key === 'Enter' && fTagInput.trim()) {
      e.preventDefault();
      if (!fTags.includes(fTagInput.trim())) {
        setFTags(prev => [...prev, fTagInput.trim()]);
      }
      setFTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const resetAddForm = () => {
    setFName('');
    setFShortDesc('');
    setFFullDesc('');
    setFPrice('');
    setFDiscountPrice('');
    setFCategory('breakfast');
    setFBadge('');
    setFTags(['Vegan']);
    setFPrepTime('');
    setFServingSize('');
    setFCalories('');
    setFProtein('');
    setFCarbs('');
    setFFat('');
    setFKeywords('');
    setFSortOrder('0');
    setFActive(true);
    setFFeatured(false);
    setFChefRec(false);
    setFFasting(false);
    setFAvailBreakfast(true);
    setFAvailLunch(false);
    setFAvailDinner(false);
    setFAvailAllDay(false);
    setFImageFile(null);
  };

  const handlePublishItem = async (e) => {
    e.preventDefault();
    if (!fName || !fPrice || !fCategory) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    let imageUrl = fCategory.toLowerCase().includes('drinks') ? '☕' : fCategory.toLowerCase().includes('ethiopian') ? '🥘' : '🍽️';

    if (fImageFile) {
      try {
        const formData = new FormData();
        formData.append('image', fImageFile);
        const uploadRes = await galleryService.uploadImage(formData);
        imageUrl = uploadRes.data.url;
      } catch (err) {
        console.error('Failed to upload image:', err);
        showToast('Failed to upload menu item image, using default placeholder', 'warning');
      }
    }

    const newItemData = {
      name: fName,
      description: fShortDesc || fFullDesc || 'Fresh specialty dish',
      price: Number(fPrice) || 0,
      category: fCategory ? fCategory.toLowerCase() : 'main',
      badge: fBadge || (fChefRec ? 'Chef Recommended' : ''),
      isAvailable: fActive,
      tags: fTags,
      image: imageUrl
    };

    try {
      await restaurantService.createMenuItem(newItemData);
      await fetchRestaurantData();
      showToast(`${fName} published successfully!`, 'success');
      resetAddForm();
      setActiveTab('menu');
    } catch (err) {
      console.error('Failed to publish item:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Error publishing menu item';
      showToast(errMsg, 'warning');
    }
  };

  const selectIconOpt = (icon) => {
    setCatIconInput(icon);
  };

  const handleCatNameChange = (e) => {
    const val = e.target.value;
    setCatNameInput(val);
    setCatSlugInput(val.toLowerCase().replace(/\s+/g, '-'));
  };

  const selectCategoryForEdit = (cat) => {
    setSelectedCategory(cat);
    setCatNameInput(cat.name);
    setCatDescInput(cat.description || '');
    setCatSlugInput(cat.slug);
    setCatIconInput(cat.icon);
    setCatSortOrderInput(cat.sortOrder.toString());
    setCatStatusInput(cat.status);
  };

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    setCatNameInput('');
    setCatDescInput('');
    setCatSlugInput('');
    setCatIconInput('🌅');
    setCatSortOrderInput('1');
    setCatStatusInput('Active');
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catNameInput) return;

    const dbCategoryData = {
      name: catNameInput.toLowerCase(),
      displayName: catNameInput
    };

    try {
      if (selectedCategory) {
        // Edit category is not supported directly in categories.js endpoint, so we can ignore or recreate.
        // Let's create category:
        await restaurantService.createMenuCategory(dbCategoryData);
        showToast('Category created!', 'success');
      } else {
        await restaurantService.createMenuCategory(dbCategoryData);
        showToast('Category created!', 'success');
      }
      await fetchRestaurantData();
      resetCategoryForm();
    } catch (err) {
      console.error('Failed to save category:', err);
      showToast('Error saving category', 'warning');
    }
  };

  const deleteCategory = async (id, event) => {
    event.stopPropagation();
    if (confirm('Delete this category? Items inside will remain unchanged.')) {
      const catToDelete = categories.find(c => c.id === id);
      if (!catToDelete) return;
      try {
        await restaurantService.deleteMenuCategory(catToDelete._id);
        await fetchRestaurantData();
        showToast('Category deleted', 'warning');
        resetCategoryForm();
      } catch (err) {
        console.error('Failed to delete category:', err);
        showToast('Error deleting category', 'warning');
      }
    }
  };

  // Table slot click
  const handleTableSlotClick = (slot) => {
    if (slot.status === 'Closed') return;
    if (slot.status === 'Available') {
      showToast(`Table ${slot.id} selected — fill the reservation form to book`, 'info');
      setQTable(slot.id);
    } else {
      showToast(`Table ${slot.id} is currently ${slot.status.toLowerCase()}`, 'warning');
    }
  };

  // Row Action Handlers
  const handleConfirmReservation = async (id) => {
    const resItem = reservations.find(r => r.id === id || r._id === id);
    if (!resItem) return;
    try {
      await restaurantService.updateReservationStatus(resItem._id, 'confirmed');
      await fetchRestaurantData();
      showToast('Reservation confirmed ✓', 'success');
    } catch (err) {
      console.error('Failed to confirm reservation:', err);
    }
  };

  const handleSeatReservation = async (id, tableId) => {
    const resItem = reservations.find(r => r.id === id || r._id === id);
    if (!resItem) return;
    try {
      await restaurantService.updateReservationStatus(resItem._id, 'seated');
      await fetchRestaurantData();
      showToast('Guest seated at table ✓', 'success');
    } catch (err) {
      console.error('Failed to seat guest:', err);
    }
  };

  const handleCompleteReservation = async (id, tableId) => {
    const resItem = reservations.find(r => r.id === id || r._id === id);
    if (!resItem) return;
    try {
      await restaurantService.updateReservationStatus(resItem._id, 'completed');
      await fetchRestaurantData();
      showToast('Reservation completed', 'info');
    } catch (err) {
      console.error('Failed to complete reservation:', err);
    }
  };

  const handleCancelReservation = async (id) => {
    const resItem = reservations.find(r => r.id === id || r._id === id);
    if (!resItem) return;
    if (confirm('Cancel this reservation?')) {
      try {
        await restaurantService.updateReservationStatus(resItem._id, 'cancelled');
        await fetchRestaurantData();
        showToast('Reservation cancelled', 'warning');
      } catch (err) {
        console.error('Failed to cancel reservation:', err);
      }
    }
  };

  const handleRestoreReservation = async (id) => {
    const resItem = reservations.find(r => r.id === id || r._id === id);
    if (!resItem) return;
    try {
      await restaurantService.updateReservationStatus(resItem._id, 'confirmed');
      await fetchRestaurantData();
      showToast('Reservation restored ✓', 'success');
    } catch (err) {
      console.error('Failed to restore reservation:', err);
    }
  };

  // Full form save
  const handleSaveNewReservation = async (e) => {
    e.preventDefault();
    if (!rGuest || !rPhone) return;

    const assignedTable = rTablePref.includes('Window') ? 'T02' : rTablePref.includes('Private') ? 'T12' : 'T09';
    const dbReservationData = {
      fullName: rGuest,
      email: rEmail || `${rGuest.toLowerCase().replace(/ /g, '')}@tsedekegrandhotel.com`,
      phone: rPhone,
      date: rDate,
      time: rTime.includes(':') ? (Number(rTime.split(':')[0]) > 12 ? `${Number(rTime.split(':')[0]) - 12}:${rTime.split(':')[1]} PM` : `${rTime} AM`) : rTime,
      guests: Number(rPartySize),
      occasion: rSession,
      specialRequests: rRequests,
      table: assignedTable
    };

    try {
      await restaurantService.createTableReservation(dbReservationData);
      await fetchRestaurantData();
      setShowResModal(false);
      showToast('Reservation created successfully ✓', 'success');

      // Reset Form
      setRGuest('');
      setRPhone('');
      setREmail('');
      setRRequests('');
    } catch (err) {
      console.error('Failed to save reservation:', err);
      showToast('Error saving reservation', 'warning');
    }
  };

  // Quick form save
  const handleSaveQuickReservation = async (e) => {
    e.preventDefault();
    if (!qName || !qPhone) {
      showToast('Name and phone are required', 'warning');
      return;
    }

    const assignedTable = qTable || 'T09';
    const dbReservationData = {
      fullName: qName,
      phone: qPhone,
      email: `${qName.toLowerCase().replace(/ /g, '')}@tsedekegrandhotel.com`,
      date: qDate,
      time: qTime || '07:00 PM',
      guests: Number(qParty || 2),
      occasion: qSession,
      table: assignedTable
    };

    try {
      await restaurantService.createTableReservation(dbReservationData);
      await fetchRestaurantData();
      showToast('Reservation saved ✓', 'success');

      // Reset
      setQName('');
      setQPhone('');
      setQParty('');
      setQTime('');
      setQTable('');
    } catch (err) {
      console.error('Failed to save quick reservation:', err);
      showToast('Error saving reservation', 'warning');
    }
  };

  const handleBulkCancel = async () => {
    const checkedBoxes = document.querySelectorAll('.res-cb:checked');
    if (checkedBoxes.length === 0) {
      showToast('No reservations selected', 'warning');
      return;
    }
    if (confirm(`Cancel all ${checkedBoxes.length} selected reservations?`)) {
      try {
        for (const cb of checkedBoxes) {
          const id = cb.dataset.id;
          const resItem = reservations.find(r => r.id === id || r._id === id);
          if (resItem) {
            await restaurantService.updateReservationStatus(resItem._id, 'cancelled');
          }
        }
        await fetchRestaurantData();
        showToast(`${checkedBoxes.length} reservation(s) cancelled`, 'warning');
        checkedBoxes.forEach(cb => cb.checked = false);
      } catch (err) {
        console.error('Failed to cancel bulk reservations:', err);
      }
    }
  };

  const handleSelectAllReservations = () => {
    const boxes = document.querySelectorAll('.res-cb');
    const allChecked = Array.from(boxes).every(b => b.checked);
    boxes.forEach(b => b.checked = !allChecked);
  };

  // Filter Reservations List
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = res.guest.toLowerCase().includes(resSearchQuery.toLowerCase()) || 
                            res.phone.includes(resSearchQuery) || 
                            res.id.toLowerCase().includes(resSearchQuery.toLowerCase());
      const matchesTab = resTabFilter === 'all' || res.status.toLowerCase() === resTabFilter;
      const matchesDate = !resDateFilter || res.date === resDateFilter;
      const matchesSession = !resSessionFilter || res.session.toLowerCase().includes(resSessionFilter.toLowerCase().split(' ')[0]);
      
      const matchesTableRange = !resTableFilter || 
        (resTableFilter.includes('Window') && ['T01', 'T02', 'T03', 'T04', 'T05'].includes(res.table)) ||
        (resTableFilter.includes('Main') && ['T06', 'T07', 'T08', 'T09', 'T10', 'T11'].includes(res.table)) ||
        (resTableFilter.includes('Private') && ['T12', 'T13', 'T14', 'T15'].includes(res.table));
      
      const matchesParty = !resPartyFilter || 
        (resPartyFilter.includes('1–2') && res.partySize <= 2) ||
        (resPartyFilter.includes('3–4') && res.partySize >= 3 && res.partySize <= 4) ||
        (resPartyFilter.includes('5–8') && res.partySize >= 5 && res.partySize <= 8) ||
        (resPartyFilter.includes('9+') && res.partySize >= 9);

      return matchesSearch && matchesTab && matchesDate && matchesSession && matchesTableRange && matchesParty;
    });
  }, [reservations, resTabFilter, resSearchQuery, resDateFilter, resSessionFilter, resTableFilter, resPartyFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gold font-montserrat">
        <i className="fas fa-spinner fa-spin text-3xl mb-4 text-gold" />
        <span className="text-xs uppercase tracking-[2px] text-text-muted">Loading Restaurant Operations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-montserrat select-none relative pb-10">
      
      {/* ── CUSTOM TOAST NOTIFICATIONS ── */}
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

      {/* ── TOP SUB-NAV TABS ── */}
      <div className="flex bg-dark-2 border-b border-border-gold-soft px-7 gap-1">
        {[
          { key: 'menu', label: 'Menu Items', icon: 'fas fa-utensils' },
          { key: 'add', label: 'Add Item', icon: 'fas fa-plus-circle' },
          { key: 'categories', label: 'Categories', icon: 'fas fa-tags' },
          { key: 'reservations', label: 'Table Reservations', icon: 'fas fa-chair' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`py-3.5 px-4.5 text-[11px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === t.key ? 'text-gold border-gold font-semibold' : 'text-text-muted border-transparent hover:text-white'
            }`}
          >
            <i className={`${t.icon} text-xs`} /> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
           TAB 1: MANAGE MENU ITEMS
      ══════════════════════════════════════ */}
      {activeTab === 'menu' && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">
                Manage <span className="font-cormorant font-light text-2xl text-gold italic">Menu Items</span>
              </h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">Admin / Restaurant / <span className="text-gold">Menu Items</span></p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => showToast('Exporting menu list to CSV…', 'info')}
                className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-file-export" /> Export CSV
              </button>
              <button 
                onClick={() => setActiveTab('add')}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-plus" /> New Item
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { label: 'Total Items', value: menuItems.length, icon: 'fas fa-utensils', color: 'text-gold bg-gold-glow border-border-gold' },
              { label: 'Active Items', value: menuItems.filter(item => item.status === 'Active').length, icon: 'fas fa-check-circle', color: 'text-success bg-success/10 border-success/20' },
              { label: 'Hidden Items', value: menuItems.filter(item => item.status === 'Hidden').length, icon: 'fas fa-eye-slash', color: 'text-danger bg-danger/10 border-danger/20' },
              { label: 'Featured Items', value: menuItems.filter(item => item.featured).length, icon: 'fas fa-star', color: 'text-gold bg-gold-glow border-gold/15' }
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

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2.5 bg-dark-3 border border-border-gold-soft p-3 rounded-lg">
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {['All', 'Breakfast', 'Lunch', 'Dinner', 'Ethiopian', 'Drinks', 'Desserts'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMenuCatFilter(cat)}
                  className={`text-[9px] tracking-[1px] uppercase font-semibold p-1.5 px-3.5 rounded transition-colors cursor-pointer border ${
                    menuCatFilter === cat 
                      ? 'bg-gold border-gold text-black' 
                      : 'bg-dark-4 border-border-gold-soft text-text-muted hover:border-gold hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end items-center">
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="bg-dark-4 border border-border-gold rounded p-2 px-3 text-xs text-white outline-none focus:border-gold transition-colors w-full sm:w-44"
              />

              <select
                value={menuSortType}
                onChange={(e) => setMenuSortType(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option>Sort: Newest</option>
                <option>Sort: Price ↑</option>
                <option>Sort: Price ↓</option>
                <option>Sort: Name A–Z</option>
                <option>Sort: Popular</option>
              </select>

              <select
                value={menuStatusFilter}
                onChange={(e) => setMenuStatusFilter(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option>Status: All</option>
                <option>Active</option>
                <option>Hidden</option>
                <option>Featured</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-gold-soft bg-dark-2/40">
                    <th className="p-4"><input type="checkbox" className="accent-gold" /></th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Item</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Category</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Price</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Status</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Featured</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Orders</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[2px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gold-soft/50">
                  {filteredMenuItems.map(item => (
                    <tr key={item.id} className="hover:bg-dark-4 transition-colors">
                      <td className="p-4"><input type="checkbox" className="accent-gold" /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 bg-dark-4 border border-border-gold-soft rounded flex items-center justify-center text-xl shrink-0 overflow-hidden">
                            {(() => {
                              const img = item.image || '';
                              const src = (img.startsWith('http') || img.startsWith('data:'))
                                ? img
                                : img.startsWith('/uploads/') || img.startsWith('uploads/')
                                ? `http://localhost:5000${img.startsWith('/') ? img : '/' + img}`
                                : img.startsWith('/images/') || img.startsWith('images/')
                                ? `http://localhost:5173${img.startsWith('/') ? img : '/' + img}`
                                : img;
                              const isUrl = src.startsWith('http') || src.startsWith('/');
                              return isUrl ? (
                                <img src={src} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                img || '🍽️'
                              );
                            })()}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm mb-0.5">{item.name}</div>
                            <div className="text-[10px] text-text-muted truncate w-48 sm:w-64">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                          item.category === 'Breakfast' ? 'bg-info/10 text-info border border-info/20' :
                          item.category === 'Ethiopian' ? 'bg-warning/10 text-warning border border-warning/20' :
                          'bg-gold-glow text-gold border border-gold/20'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-cinzel text-gold font-semibold text-sm">
                          {item.price} <span className="font-montserrat text-[10px] text-text-muted font-normal">ETB</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                          item.status === 'Active' ? 'bg-success/15 text-success border border-success/20' : 'bg-danger/15 text-danger border border-danger/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleFeaturedStatus(item.id)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                            item.featured ? 'bg-gold' : 'bg-dark-5'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-black rounded-full shadow-md transition-transform ${
                            item.featured ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </td>
                      <td className="p-4 text-xs font-semibold font-mono text-gold">{item.orders}</td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => { setCurrentSelectedMenuItem(item); setShowViewModal(true); }}
                            className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                            title="View"
                          >
                            <i className="fas fa-eye" />
                          </button>
                          <button 
                            onClick={() => startEditMenuItem(item)}
                            className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                            title="Edit"
                          >
                            <i className="fas fa-edit" />
                          </button>
                          <button 
                            onClick={() => deleteMenuItem(item.id)}
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
              <span className="text-[11px] text-text-muted">Showing {filteredMenuItems.length} of {menuItems.length} items</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-left text-[9px]" /></button>
                <button className="w-8 h-8 bg-gold text-black border border-gold font-bold rounded flex items-center justify-center cursor-pointer text-xs">1</button>
                <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-right text-[9px]" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
           TAB 2: ADD NEW MENU ITEM
      ══════════════════════════════════════ */}
      {activeTab === 'add' && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">
                Add New <span className="font-cormorant font-light text-2xl text-gold italic">Menu Item</span>
              </h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">Admin / Restaurant / Menu Items / <span className="text-gold">Add New</span></p>
            </div>
            <button 
              onClick={() => setActiveTab('menu')}
              className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-arrow-left" /> Cancel
            </button>
          </div>

          <form onSubmit={handlePublishItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form blocks */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-info-circle" /> Basic Information
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Item Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Doro Wot Royale"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Short Description <span className="text-danger">*</span></label>
                      <span className="text-[9px] text-text-muted font-mono">{fShortDesc.length}/160</span>
                    </div>
                    <textarea 
                      required
                      maxLength={160}
                      placeholder="Brief description shown on the menu card..."
                      value={fShortDesc}
                      onChange={(e) => setFShortDesc(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-14 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Full Description</label>
                    <textarea 
                      placeholder="Detailed description for the item details page..."
                      value={fFullDesc}
                      onChange={(e) => setFFullDesc(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-20 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Price (ETB) <span className="text-danger">*</span></label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        placeholder="0"
                        value={fPrice}
                        onChange={(e) => setFPrice(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Discounted Price</label>
                      <input 
                        type="number" 
                        placeholder="Optional"
                        value={fDiscountPrice}
                        onChange={(e) => setFDiscountPrice(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                      />
                      <span className="text-[9px] text-text-muted">Leave blank if no discount</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-tags" /> Category & Classification
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Menu Category <span className="text-danger">*</span></label>
                      <select 
                        required
                        value={fCategory}
                        onChange={(e) => setFCategory(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                      >
                        <option value="" disabled>Select category</option>
                        <option>Breakfast</option>
                        <option>Lunch</option>
                        <option>Dinner</option>
                        <option>Ethiopian</option>
                        <option>Drinks</option>
                        <option>Desserts</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Badge Label</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Chef's Favourite"
                        value={fBadge}
                        onChange={(e) => setFBadge(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Dietary Tags</label>
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-dark-4 border border-border-gold rounded">
                      {fTags.map(tag => (
                        <span key={tag} className="bg-gold-glow border border-border-gold text-gold text-[10px] py-0.5 px-2.5 rounded flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="text-gold hover:text-white font-bold text-xs shrink-0">×</button>
                        </span>
                      ))}
                      <input 
                        type="text"
                        placeholder="Add tag & press Enter"
                        value={fTagInput}
                        onChange={(e) => setFTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="bg-transparent text-xs text-white outline-none border-none flex-1 min-w-[120px]"
                      />
                    </div>
                    <span className="text-[9px] text-text-muted">Press Enter to add: Vegan, Fasting, Spicy, Gluten-Free, Halal...</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Preparation Time</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 15–20 min"
                        value={fPrepTime}
                        onChange={(e) => setFPrepTime(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Serving Size</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 1 person / 300g"
                        value={fServingSize}
                        onChange={(e) => setFServingSize(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition Information */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-heartbeat" /> Nutrition Info <span className="text-[10px] text-text-muted font-normal lowercase">(optional)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Calories (kcal)', val: fCalories, set: setFCalories },
                    { label: 'Protein (g)', val: fProtein, set: setFProtein },
                    { label: 'Carbs (g)', val: fCarbs, set: setFCarbs },
                    { label: 'Fat (g)', val: fFat, set: setFFat }
                  ].map((nut, idx) => (
                    <div key={idx} className="bg-dark-4 border border-border-gold-soft rounded p-3 text-center">
                      <input 
                        type="number" 
                        placeholder="0"
                        value={nut.val}
                        onChange={(e) => nut.set(e.target.value)}
                        className="w-full bg-transparent text-center text-lg font-cinzel text-gold font-bold outline-none border-none"
                      />
                      <span className="text-[9px] text-text-muted tracking-[0.5px] uppercase block mt-1">{nut.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border-gold-soft/50">
                <button 
                  type="button" 
                  onClick={resetAddForm}
                  className="bg-danger/10 border border-danger/20 hover:bg-danger/20 text-danger text-[10px] tracking-[1.5px] uppercase font-semibold py-3 px-6 rounded cursor-pointer transition-colors"
                >
                  🗑️ Discard
                </button>
                <button 
                  type="button" 
                  onClick={() => showToast('Saved draft', 'info')}
                  className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-3 px-6 rounded cursor-pointer transition-colors"
                >
                  Save as Draft
                </button>
                <button 
                  type="submit" 
                  className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-3 px-8 rounded cursor-pointer transition-colors"
                >
                  Publish Item
                </button>
              </div>

            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6">
              
              {/* Item Images */}
              {/* Item Image */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-images" /> Item Image
                </div>
                <ImageUploader onUpload={(file) => setFImageFile(file)} maxSizeMB={3} />
                <span className="text-[9px] text-text-muted mt-2 block leading-relaxed">This image will be used on the public restaurant and bar menus</span>
              </div>

              {/* Visibility */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-eye" /> Visibility & Display
                </div>
                <div className="space-y-3.5">
                  {[
                    { label: 'Active on Menu', sub: 'Show this item to customers', state: fActive, set: setFActive },
                    { label: 'Featured Item', sub: 'Highlight on homepage & menu top', state: fFeatured, set: setFFeatured },
                    { label: "Chef's Recommendation", sub: 'Show chef hat badge on card', state: fChefRec, set: setFChefRec },
                    { label: 'Fasting Menu', sub: 'Include in Ethiopian fasting menu', state: fFasting, set: setFFasting }
                  ].map((tog, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border-gold-soft/50 last:border-0">
                      <div>
                        <div className="text-xs text-white font-medium mb-0.5">{tog.label}</div>
                        <div className="text-[10px] text-text-muted">{tog.sub}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => tog.set(!tog.state)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                          tog.state ? 'bg-gold' : 'bg-dark-5'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-black rounded-full shadow-md transition-transform ${
                          tog.state ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-clock" /> Meal Availability
                </div>
                <div className="space-y-3.5">
                  {[
                    { label: 'Breakfast', sub: '06:00 – 10:30', state: fAvailBreakfast, set: setFAvailBreakfast },
                    { label: 'Lunch', sub: '12:00 – 15:00', state: fAvailLunch, set: setFAvailLunch },
                    { label: 'Dinner', sub: '18:00 – 22:30', state: fAvailDinner, set: setFAvailDinner },
                    { label: 'All Day', sub: 'Available any time', state: fAvailAllDay, set: setFAvailAllDay }
                  ].map((tog, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border-gold-soft/50 last:border-0">
                      <div>
                        <div className="text-xs text-white font-medium mb-0.5">{tog.label}</div>
                        <div className="text-[10px] text-text-muted">{tog.sub}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => tog.set(!tog.state)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                          tog.state ? 'bg-gold' : 'bg-dark-5'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-black rounded-full shadow-md transition-transform ${
                          tog.state ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO settings */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-4.5 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-search" /> SEO & Search
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Search Keywords</label>
                    <input 
                      type="text" 
                      placeholder="e.g. chicken, traditional, spicy"
                      value={fKeywords}
                      onChange={(e) => setFKeywords(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                    />
                    <span className="text-[9px] text-text-muted">Comma-separated keywords for internal search</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Sort Order</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={fSortOrder}
                      onChange={(e) => setFSortOrder(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                    />
                    <span className="text-[9px] text-text-muted">Lower number = appears first in category</span>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════
           TAB 3: MANAGE CATEGORIES
      ══════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">
                Manage <span className="font-cormorant font-light text-2xl text-gold italic">Categories</span>
              </h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">Admin / Restaurant / <span className="text-gold">Categories</span></p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => showToast('Exporting categories…', 'info')}
                className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                ⬇️ Export
              </button>
              <button 
                onClick={resetCategoryForm}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                + New Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Categories Grid & Order */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Category Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div 
                    key={cat.id}
                    onClick={() => selectCategoryForEdit(cat)}
                    className={`bg-dark-3 border rounded-lg p-5 hover:border-gold transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                      selectedCategory?.id === cat.id ? 'border-gold shadow-lg' : 'border-border-gold-soft'
                    }`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-11 h-11 bg-gold-glow border border-border-gold rounded flex items-center justify-center text-xl shrink-0">
                        {cat.icon}
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => selectCategoryForEdit(cat)}
                          className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-xs"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={(e) => deleteCategory(cat.id, e)}
                          className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-danger hover:text-danger text-text-muted rounded flex items-center justify-center cursor-pointer text-xs"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <h3 className="font-cormorant text-xl text-white font-semibold mb-0.5">{cat.name}</h3>
                    <div className="text-[10px] text-text-muted tracking-[0.5px] font-mono mb-3">/menu/{cat.slug}</div>

                    <div className="grid grid-cols-3 gap-1 text-center py-2.5 bg-dark-4/50 rounded border border-border-gold-soft/40">
                      <div>
                        <div className="font-cinzel text-gold text-base font-semibold leading-none">{cat.itemCount}</div>
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.5px]">Items</span>
                      </div>
                      <div>
                        <div className="font-cinzel text-gold text-base font-semibold leading-none">{cat.activeCount}</div>
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.5px]">Active</span>
                      </div>
                      <div>
                        <div className="font-cinzel text-gold text-base font-semibold leading-none">{cat.ordersCount}</div>
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.5px]">Orders</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border-gold-soft/50 mt-3 text-[10px]">
                      <span className="text-text-muted">Sort order: {cat.sortOrder}</span>
                      <span className={`font-semibold ${cat.status === 'Active' ? 'text-success' : 'text-danger'}`}>
                        {cat.status.toUpperCase()}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Order Drag list */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
                <div className="p-4 px-5 border-b border-border-gold-soft bg-dark-2/40 flex items-center justify-between">
                  <span className="font-cinzel text-xs text-white font-semibold tracking-[0.5px]">Menu Display Order</span>
                  <button 
                    onClick={() => showToast('Category display order saved', 'success')}
                    className="bg-gold hover:bg-gold-light text-black text-[9px] tracking-[1.5px] uppercase font-bold py-1 px-3.5 rounded transition-colors"
                  >
                    Save Order
                  </button>
                </div>
                <ul className="divide-y divide-border-gold-soft/50">
                  {categories.sort((a,b)=>a.sortOrder-b.sortOrder).map((cat, idx) => (
                    <li key={cat.id} className="flex items-center gap-3.5 p-3 px-5 hover:bg-dark-4 transition-colors duration-150 cursor-grab">
                      <span className="text-text-muted text-sm font-semibold shrink-0">⠿</span>
                      <div className="w-8 h-8 rounded bg-gold-glow text-base flex items-center justify-center shrink-0">{cat.icon}</div>
                      <span className="text-xs text-white font-medium flex-1">{cat.name}</span>
                      <span className="text-[10px] text-text-muted">{cat.itemCount} items</span>
                      <span className="font-cinzel text-gold font-bold text-sm ml-2 w-5 text-center">{idx + 1}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Column: Form */}
            <div>
              <form onSubmit={handleSaveCategory} className="bg-dark-3 border border-border-gold-soft rounded-lg p-5 space-y-4">
                <div className="font-cinzel text-xs text-gold tracking-[1.5px] uppercase border-b border-border-gold-soft pb-2.5 mb-2 flex items-center gap-1.5 font-semibold">
                  <i className="fas fa-edit" /> {selectedCategory ? 'Edit Category' : 'Add New Category'}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Category Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Breakfast"
                    value={catNameInput}
                    onChange={handleCatNameChange}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Description</label>
                  <textarea 
                    placeholder="Short description of items in category..."
                    value={catDescInput}
                    onChange={(e) => setCatDescInput(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-16 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">URL Slug</label>
                  <input 
                    type="text" 
                    placeholder="e.g. breakfast"
                    value={catSlugInput}
                    onChange={(e) => setCatSlugInput(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                  <span className="text-[9px] text-text-muted block">URL path will be: /menu/{catSlugInput || 'slug'}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold font-medium">Category Icon</label>
                  <div className="grid grid-cols-6 gap-1.5 mt-1">
                    {['🌅', '☀️', '🌙', '🥘', '☕', '🍰', '🥗', '🍷', '🫖', '🍖', '🐟', '🌮'].map((ico) => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => selectIconOpt(ico)}
                        className={`aspect-square text-lg rounded border transition-colors flex items-center justify-center cursor-pointer ${
                          catIconInput === ico 
                            ? 'bg-gold-glow border-gold text-white' 
                            : 'bg-dark-4 border-border-gold-soft hover:border-gold'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Sort Order</label>
                    <input 
                      type="number" 
                      min="1"
                      value={catSortOrderInput}
                      onChange={(e) => setCatSortOrderInput(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Status</label>
                    <select 
                      value={catStatusInput}
                      onChange={(e) => setCatStatusInput(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                    >
                      <option>Active</option>
                      <option>Hidden</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button 
                    type="submit" 
                    className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-bold py-3 rounded cursor-pointer transition-colors w-full"
                  >
                    {selectedCategory ? 'Update Category' : 'Save Category'}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetCategoryForm}
                    className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[10px] tracking-[1px] uppercase font-semibold py-2 rounded cursor-pointer transition-colors w-full"
                  >
                    Reset Form
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
           TAB 4: TABLE RESERVATIONS
      ══════════════════════════════════════ */}
      {activeTab === 'reservations' && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">
                Table Reservations
              </h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">Manage dining reservations, floor plan & walk-ins for Tsedeke Grand Restaurant</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => showToast('Exporting reservations to CSV…', 'info')}
                className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-download" /> Export
              </button>
              <button 
                onClick={() => showToast('Preparing floor plan for print…', 'info')}
                className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-print" /> Print Plan
              </button>
              <button 
                onClick={() => setShowResModal(true)}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-plus" /> New Reservation
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {[
              { label: "Today's Reservations", value: '47', icon: 'fas fa-calendar-check', color: 'text-gold bg-gold-glow border-border-gold', trend: '↑ +6 vs yesterday', trendUp: true },
              { label: 'Tables Occupied', value: '22/30', icon: 'fas fa-chair', color: 'text-success bg-success/10 border-success/20', trend: '73% occupancy', trendUp: null },
              { label: 'Pending Confirm', value: '8', icon: 'fas fa-hourglass-half', color: 'text-warning bg-warning/10 border-warning/20', trend: '⚠ Action needed', trendUp: false },
              { label: 'Covers Today', value: '186', icon: 'fas fa-users', color: 'text-info bg-info/10 border-info/20', trend: '↑ +18% covers', trendUp: true },
              { label: 'No-Shows Today', value: '3', icon: 'fas fa-user-slash', color: 'text-danger bg-danger/10 border-danger/20', trend: '↓ -2 vs average', trendUp: true }
            ].map((stat, idx) => (
              <div key={idx} className="bg-dark-3 border border-border-gold-soft rounded-lg p-4 flex flex-col justify-between hover:border-border-gold transition-colors duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-cinzel text-2xl text-white font-bold mb-1 leading-none">{stat.value}</div>
                    <div className="text-[9px] text-text-muted tracking-[0.5px] uppercase font-semibold">{stat.label}</div>
                  </div>
                  <div className={`w-8 h-8 rounded border flex items-center justify-center text-xs ${stat.color}`}>
                    <i className={stat.icon} />
                  </div>
                </div>
                {stat.trend && (
                  <div className={`text-[9px] font-mono mt-3 font-semibold ${
                    stat.trendUp === true ? 'text-success' : stat.trendUp === false ? 'text-danger' : 'text-text-muted'
                  }`}>
                    {stat.trend}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sub-nav status controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex bg-dark-2 border border-border-gold-soft rounded-lg p-1">
              {[
                { key: 'all', label: 'All', count: reservations.length },
                { key: 'pending', label: 'Pending', count: reservations.filter(r=>r.status==='Pending').length },
                { key: 'confirmed', label: 'Confirmed', count: reservations.filter(r=>r.status==='Confirmed').length },
                { key: 'seated', label: 'Seated', count: reservations.filter(r=>r.status==='Seated').length },
                { key: 'completed', label: 'Completed', count: reservations.filter(r=>r.status==='Completed').length }
              ].map(subTab => (
                <button
                  key={subTab.key}
                  onClick={() => setResTabFilter(subTab.key)}
                  className={`flex items-center gap-1.5 p-1.5 px-4 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    resTabFilter === subTab.key 
                      ? 'bg-gold-glow border border-border-gold text-gold font-bold' 
                      : 'text-text-muted hover:text-white border border-transparent'
                  }`}
                >
                  {subTab.label}
                  <span className={`text-[9px] p-0.5 px-1.5 rounded-full ${
                    resTabFilter === subTab.key ? 'bg-gold/20 text-gold' : 'bg-dark-4 text-text-muted'
                  }`}>{subTab.count}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-1">
              <button onClick={() => showToast("Showing yesterday's bookings", 'info')} className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-[10px] font-semibold p-2 px-3 rounded cursor-pointer">Yesterday</button>
              <button onClick={() => showToast("Showing today's bookings", 'success')} className="bg-gold hover:bg-gold-light text-black text-[10px] font-bold p-2 px-4.5 rounded cursor-pointer">Today</button>
              <button onClick={() => showToast("Showing tomorrow's bookings", 'info')} className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-[10px] font-semibold p-2 px-3 rounded cursor-pointer">Tomorrow</button>
            </div>
          </div>

          {/* Filtering bar */}
          <div className="flex flex-wrap gap-2.5 items-center bg-dark-3 border border-border-gold-soft p-3 rounded-lg">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search guest name, phone, reference…"
                value={resSearchQuery}
                onChange={(e) => setResSearchQuery(e.target.value)}
                className="w-full bg-dark-4 border border-border-gold rounded p-2 pl-9 text-xs text-white outline-none focus:border-gold transition-colors"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            </div>

            <input 
              type="date" 
              value={resDateFilter}
              onChange={(e) => setResDateFilter(e.target.value)}
              className="bg-dark-4 border border-border-gold text-text-muted p-2 px-3 outline-none text-xs rounded"
            />

            <select
              value={resSessionFilter}
              onChange={(e) => setResSessionFilter(e.target.value)}
              className="bg-dark-4 border border-border-gold text-text-muted p-2 px-3 outline-none text-xs rounded cursor-pointer"
            >
              <option value="">All Sessions</option>
              <option>Breakfast (7–10 AM)</option>
              <option>Lunch (12–3 PM)</option>
              <option>Dinner (6–10 PM)</option>
            </select>

            <select
              value={resTableFilter}
              onChange={(e) => setResTableFilter(e.target.value)}
              className="bg-dark-4 border border-border-gold text-text-muted p-2 px-3 outline-none text-xs rounded cursor-pointer"
            >
              <option value="">All Tables</option>
              <option>T01 – T05 (Window)</option>
              <option>T06 – T15 (Main Hall)</option>
              <option>T16 – T22 (Private)</option>
            </select>

            <select
              value={resPartyFilter}
              onChange={(e) => setResPartyFilter(e.target.value)}
              className="bg-dark-4 border border-border-gold text-text-muted p-2 px-3 outline-none text-xs rounded cursor-pointer"
            >
              <option value="">Party Size</option>
              <option>1–2 Guests</option>
              <option>3–4 Guests</option>
              <option>5–8 Guests</option>
              <option>9+ Guests</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Reservations List */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 px-5 border-b border-border-gold-soft bg-dark-2/40 flex items-center justify-between">
                  <span className="font-cinzel text-xs text-white font-semibold tracking-[0.5px]">
                    Today's Reservations — <span className="font-montserrat text-text-muted text-[11px] font-normal">Wednesday, June 3</span>
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSelectAllReservations}
                      className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[9px] tracking-[1px] uppercase font-semibold py-1 px-3 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fas fa-check-double" /> Select All
                    </button>
                    <button 
                      onClick={handleBulkCancel}
                      className="bg-transparent border border-danger/30 hover:bg-danger/25 text-danger text-[9px] tracking-[1px] uppercase font-semibold py-1 px-3 rounded transition-colors cursor-pointer"
                    >
                      Bulk Cancel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-gold-soft bg-dark-2/20">
                        <th className="p-4"><input type="checkbox" className="accent-gold" /></th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px]">Reference</th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px]">Guest</th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px]">Time</th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px]">Table</th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px] text-center">Party</th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px]">Session</th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px]">Status</th>
                        <th className="p-4 text-[9px] text-text-muted uppercase tracking-[1.5px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-gold-soft/50">
                      {filteredReservations.map(res => (
                        <tr 
                          key={res.id}
                          onClick={() => { setCurrentSelectedRes(res); setShowViewResModal(true); }}
                          className="hover:bg-dark-4 transition-colors cursor-pointer"
                        >
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" data-id={res.id} className="res-cb accent-gold" />
                          </td>
                          <td className="p-4 font-cinzel text-gold font-bold text-[11px] whitespace-nowrap">{res.id}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white text-xs">{res.guest}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">
                              <i className="fas fa-phone text-[9px] text-gold mr-1" /> {res.phone}
                            </div>
                          </td>
                          <td className="p-4 text-xs text-white-dim whitespace-nowrap">{res.time}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-xs text-white">
                              <span className={`w-2 h-2 rounded-full ${
                                res.status === 'Confirmed' ? 'bg-success' :
                                res.status === 'Seated' ? 'bg-gold' :
                                res.status === 'Pending' ? 'bg-text-muted' :
                                res.status === 'Cancelled' ? 'bg-danger' : 'bg-text-muted/50'
                              }`} />
                              {res.table}
                            </div>
                          </td>
                          <td className="p-4 text-center font-cinzel text-gold text-xs font-semibold">{res.partySize}</td>
                          <td className="p-4 text-[10px] text-text-muted">{res.session}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                              res.status === 'Confirmed' ? 'bg-success/15 text-success border border-success/20' :
                              res.status === 'Seated' ? 'bg-gold-glow text-gold border border-gold/20' :
                              res.status === 'Pending' ? 'bg-warning/15 text-warning border border-warning/20' :
                              res.status === 'Completed' ? 'bg-dark-5 text-text-muted border border-border-gold-soft' :
                              'bg-danger/15 text-danger border border-danger/20'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              {res.status === 'Pending' && (
                                <button 
                                  onClick={() => handleConfirmReservation(res.id)}
                                  className="bg-transparent border border-border-gold-soft hover:border-success hover:text-success text-[10px] font-semibold p-1 px-2.5 rounded transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              {res.status === 'Confirmed' && (
                                <button 
                                  onClick={() => handleSeatReservation(res.id, res.table)}
                                  className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-[10px] font-semibold p-1 px-2.5 rounded transition-colors"
                                >
                                  Seat
                                </button>
                              )}
                              {res.status === 'Seated' && (
                                <button 
                                  onClick={() => handleCompleteReservation(res.id, res.table)}
                                  className="bg-transparent border border-border-gold-soft hover:border-success hover:text-success text-[10px] font-semibold p-1 px-2.5 rounded transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                              {res.status === 'Completed' && (
                                <button 
                                  onClick={() => showToast('Reassign: open full modal form to edit table', 'info')}
                                  className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-[10px] font-semibold p-1 px-2.5 rounded transition-colors"
                                >
                                  Reassign
                                </button>
                              )}
                              {res.status === 'Cancelled' && (
                                <button 
                                  onClick={() => handleRestoreReservation(res.id)}
                                  className="bg-transparent border border-border-gold-soft hover:border-success hover:text-success text-[10px] font-semibold p-1 px-2.5 rounded transition-colors"
                                >
                                  Restore
                                </button>
                              )}
                              <button 
                                onClick={() => { setCurrentSelectedRes(res); setShowViewResModal(true); }}
                                className="bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-[10px] font-semibold p-1 px-2.5 rounded transition-colors"
                              >
                                View
                              </button>
                              {res.status !== 'Cancelled' && res.status !== 'Completed' && (
                                <button 
                                  onClick={() => handleCancelReservation(res.id)}
                                  className="bg-transparent border border-danger/30 hover:border-danger hover:text-danger text-text-muted text-[10px] font-semibold p-1 px-2.5 rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-3.5 px-5 border-t border-border-gold-soft bg-dark-2/20">
                  <span className="text-[11px] text-text-muted">Showing {filteredReservations.length} of {reservations.length} reservations</span>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-left text-[9px]" /></button>
                    <button className="w-8 h-8 bg-gold text-black border border-gold font-bold rounded flex items-center justify-center cursor-pointer text-xs">1</button>
                    <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-right text-[9px]" /></button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Floor Plan & Quick Add */}
            <div className="space-y-6">
              
              {/* Floor plan card */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
                <div className="p-4 px-5 border-b border-border-gold-soft bg-dark-2/40 flex items-center justify-between">
                  <span className="font-cinzel text-xs text-white font-semibold tracking-[0.5px]">
                    <i className="fas fa-map-marked-alt text-gold mr-1" /> Floor Plan
                  </span>
                  <div className="flex gap-0.5 bg-dark-4 border border-border-gold-soft p-0.5 rounded">
                    {['Main', 'Private', 'Terrace'].map((fl) => (
                      <button 
                        key={fl}
                        onClick={() => showToast(`Switched floor plan to ${fl}`, 'info')}
                        className={`text-[9px] font-bold p-1 px-3 rounded transition-colors cursor-pointer ${
                          fl === 'Main' ? 'bg-gold-glow border border-border-gold text-gold' : 'text-text-muted hover:text-white'
                        }`}
                      >
                        {fl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2.5 p-4.5">
                  {tableSlots.map(slot => {
                    const c = slot.status === 'Available' ? 'bg-success/5 border-success/35 text-success hover:scale-105' :
                              slot.status === 'Reserved' ? 'bg-gold-glow border-gold/35 text-gold hover:scale-105' :
                              slot.status === 'Occupied' ? 'bg-gold/25 border-gold text-gold hover:scale-105' :
                              slot.status === 'Cleaning' ? 'bg-dark-5/40 border-text-muted/30 text-text-muted hover:scale-105' :
                              'bg-danger/5 border-danger/25 text-danger opacity-70 cursor-not-allowed';
                    return (
                      <div 
                        key={slot.id} 
                        onClick={() => handleTableSlotClick(slot)}
                        className={`aspect-square border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative ${c}`}
                      >
                        <div className="font-cinzel text-xs font-bold leading-none mb-1">{slot.id}</div>
                        <span className="text-[8px] opacity-75">{slot.capacity} pax</span>
                        {slot.badge && (
                          <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center border border-dark-2 ${
                            slot.badge === '!' ? 'bg-warning text-black' : 'bg-gold text-black'
                          }`}>
                            {slot.badge}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2.5 p-3 px-5 border-t border-border-gold-soft bg-dark-2/10">
                  {[
                    { label: 'Available', color: 'bg-success/30 border border-success/45' },
                    { label: 'Reserved', color: 'bg-gold-glow border border-gold/45' },
                    { label: 'Occupied', color: 'bg-gold/35 border border-gold' },
                    { label: 'Cleaning', color: 'bg-dark-5 border border-border-gold-soft' },
                    { label: 'Closed', color: 'bg-danger/20 border border-danger/30' }
                  ].map(leg => (
                    <div key={leg.label} className="flex items-center gap-1.5 text-[9px] text-text-muted">
                      <div className={`w-2.5 h-2.5 rounded ${leg.color}`} />
                      {leg.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Reservation */}
              <form onSubmit={handleSaveQuickReservation} className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
                <div className="p-4 px-5 border-b border-border-gold-soft bg-dark-2/40 flex items-center justify-between">
                  <span className="font-cinzel text-xs text-gold font-semibold tracking-[0.5px]">
                    <i className="fas fa-plus-circle" /> Quick Reservation
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowResModal(true)}
                    className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[9px] font-bold py-1 px-3 rounded transition-colors"
                  >
                    Full Form
                  </button>
                </div>
                <div className="p-4.5 space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-text-muted font-bold uppercase block tracking-[0.5px]">Guest Name <span className="text-gold">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="Full name"
                      value={qName}
                      onChange={(e) => setQName(e.target.value)}
                      className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase block tracking-[0.5px]">Phone <span className="text-gold">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="+251 9XX..."
                        value={qPhone}
                        onChange={(e) => setQPhone(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase block tracking-[0.5px]">Party Size <span className="text-gold">*</span></label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        placeholder="e.g. 4"
                        value={qParty}
                        onChange={(e) => setQParty(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase block tracking-[0.5px]">Date <span className="text-gold">*</span></label>
                      <input 
                        type="date" 
                        required
                        value={qDate}
                        onChange={(e) => setQDate(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold text-text-muted rounded p-2 text-xs outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase block tracking-[0.5px]">Time <span className="text-gold">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 7:00 PM"
                        value={qTime}
                        onChange={(e) => setQTime(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase block tracking-[0.5px]">Session</label>
                      <select
                        value={qSession}
                        onChange={(e) => setQSession(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none cursor-pointer"
                      >
                        <option>Breakfast</option>
                        <option>Lunch</option>
                        <option>Dinner</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase block tracking-[0.5px]">Table</label>
                      <select
                        value={qTable}
                        onChange={(e) => setQTable(e.target.value)}
                        className="w-full bg-dark-4 border border-border-gold rounded p-2 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="">Auto-assign</option>
                        <option value="T02">T02 (2 pax)</option>
                        <option value="T05">T05 (6 pax)</option>
                        <option value="T09">T09 (4 pax)</option>
                        <option value="T11">T11 (3 pax)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button 
                      type="button" 
                      onClick={() => { setQName(''); setQPhone(''); setQParty(''); setQTime(''); setQTable(''); }}
                      className="flex-1 bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[10px] tracking-[1px] uppercase font-bold py-2 rounded cursor-pointer transition-colors"
                    >
                      Clear
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1px] uppercase font-bold py-2 rounded cursor-pointer transition-colors"
                    >
                      Save Res
                    </button>
                  </div>

                </div>
              </form>

              {/* Timeline feed */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
                <div className="p-4 px-5 border-b border-border-gold-soft bg-dark-2/40 flex items-center justify-between">
                  <span className="font-cinzel text-xs text-white font-semibold tracking-[0.5px]">
                    <i className="fas fa-clock text-gold mr-1" /> Upcoming Today
                  </span>
                  <span className="text-[10px] text-text-muted">Next 3 hours</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { time: '12:30', name: 'Dawit Bekele', sub: '3 guests · Lunch · Pending confirmation', table: 'T11', isFree: false },
                    { time: '01:00', name: 'Tigist Worku', sub: '6 guests · Lunch · Confirmed', table: 'T07', isFree: false },
                    { time: '01:30', name: 'Solomon Negash', sub: '2 guests · Lunch · Confirmed', table: 'T03', isFree: false },
                    { time: '02:00', name: 'Walk-in available', sub: 'T05, T09, T11 open', table: 'Free', isFree: true }
                  ].map((timeline, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 p-3 rounded-lg bg-dark-4 border border-border-gold-soft hover:border-gold transition-colors duration-150 cursor-pointer">
                      <div className="font-cinzel text-gold text-xs font-bold w-12">{timeline.time}</div>
                      <div className="flex-1">
                        <div className="text-xs text-white font-semibold mb-0.5">{timeline.name}</div>
                        <div className="text-[10px] text-text-muted">{timeline.sub}</div>
                      </div>
                      <div className={`text-[10px] font-bold p-1 px-2.5 rounded shrink-0 ${
                        timeline.isFree ? 'bg-success/15 text-success' : 'bg-dark-5 text-text-muted'
                      }`}>
                        {timeline.table}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
           MODALS — TAB 1: VIEW ITEM
      ══════════════════════════════════════ */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-dark-2 border border-border-gold w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="p-5 px-6 border-b border-border-gold-soft bg-dark-3 flex items-center justify-between">
              <span className="font-cinzel text-sm text-gold font-bold tracking-[1px]">{currentSelectedMenuItem.id} — Details</span>
              <button onClick={() => setShowViewModal(false)} className="w-8 h-8 rounded border border-border-gold-soft bg-dark-4 hover:border-danger hover:text-danger flex items-center justify-center cursor-pointer transition-colors">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-text">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded bg-dark-4 border border-border-gold-soft flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                  {currentSelectedMenuItem.image && (currentSelectedMenuItem.image.startsWith('http') || currentSelectedMenuItem.image.startsWith('/') || currentSelectedMenuItem.image.startsWith('data:')) ? (
                    <img src={currentSelectedMenuItem.image} alt={currentSelectedMenuItem.name} className="w-full h-full object-cover" />
                  ) : (
                    currentSelectedMenuItem.image || '🍽️'
                  )}
                </div>
                <div>
                  <h3 className="font-cormorant text-2xl text-white font-bold mb-1 leading-none">{currentSelectedMenuItem.name}</h3>
                  <span className="text-[10px] tracking-[1.5px] uppercase text-gold font-bold">{currentSelectedMenuItem.category}</span>
                  <div className="text-white-dim text-xs mt-2 italic">"{currentSelectedMenuItem.description}"</div>
                </div>
              </div>

              <div className="border-t border-border-gold-soft/50 pt-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Base Rate</span><span className="text-white font-semibold">{currentSelectedMenuItem.price} ETB</span></div>
                {currentSelectedMenuItem.discountPrice && (
                  <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Discount Price</span><span className="text-success font-semibold">{currentSelectedMenuItem.discountPrice} ETB</span></div>
                )}
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Availability</span><span className="text-white">Breakfast, Lunch, Dinner</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Dietary Preferences</span><span className="text-gold font-semibold">{currentSelectedMenuItem.tags.join(', ') || 'Standard'}</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Preparation Time</span><span className="text-white">{currentSelectedMenuItem.prepTime}</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Popularity</span><span className="text-gold font-semibold font-mono">{currentSelectedMenuItem.orders} Orders</span></div>
              </div>

              <div className="bg-dark-3 border border-border-gold-soft rounded p-4.5 space-y-2.5">
                <div className="text-[10px] tracking-[1px] uppercase font-bold text-gold"><i className="fas fa-heartbeat" /> Nutritional Value</div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div><span className="text-white font-bold block">{currentSelectedMenuItem.nutrition?.calories || 0}</span><span className="text-[8px] text-text-muted">Calories</span></div>
                  <div><span className="text-white font-bold block">{currentSelectedMenuItem.nutrition?.protein || 0}g</span><span className="text-[8px] text-text-muted">Protein</span></div>
                  <div><span className="text-white font-bold block">{currentSelectedMenuItem.nutrition?.carbs || 0}g</span><span className="text-[8px] text-text-muted">Carbs</span></div>
                  <div><span className="text-white font-bold block">{currentSelectedMenuItem.nutrition?.fat || 0}g</span><span className="text-[8px] text-text-muted">Fat</span></div>
                </div>
              </div>
            </div>
            <div className="p-4 px-6 border-t border-border-gold-soft bg-dark-3 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1px] uppercase font-bold py-2 px-6 rounded cursor-pointer transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
           MODALS — TAB 1: EDIT ITEM
      ══════════════════════════════════════ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleUpdateMenuItem} className="bg-dark-2 border border-border-gold w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            <div className="p-5 px-6 border-b border-border-gold-soft bg-dark-3 flex items-center justify-between shrink-0">
              <span className="font-cinzel text-sm text-gold font-bold tracking-[1px]">Edit Menu Item</span>
              <button type="button" onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded border border-border-gold-soft bg-dark-4 hover:border-danger hover:text-danger flex items-center justify-center cursor-pointer transition-colors">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="p-6 space-y-4.5 text-xs text-white overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Description</label>
                <textarea 
                  required
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Price (ETB)</label>
                  <input 
                    type="number" 
                    required
                    value={mPrice}
                    onChange={(e) => setMPrice(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Category</label>
                  <select 
                    value={mCategory}
                    onChange={(e) => setMCategory(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Ethiopian</option>
                    <option>Drinks</option>
                    <option>Desserts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Status</label>
                  <select 
                    value={mStatus}
                    onChange={(e) => setMStatus(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option>Active</option>
                    <option>Hidden</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Badge Label</label>
                  <input 
                    type="text" 
                    value={mBadge}
                    onChange={(e) => setMBadge(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold font-medium">Item Image</label>
                {mImage && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">Current:</span>
                    {mImage.startsWith('http') || mImage.startsWith('/') ? (
                      <img src={mImage} alt="Current" className="w-12 h-12 object-cover rounded border border-border-gold-soft" />
                    ) : (
                      <div className="w-12 h-12 bg-dark-4 border border-border-gold-soft rounded flex items-center justify-center text-xl">{mImage}</div>
                    )}
                  </div>
                )}
                <ImageUploader onUpload={(file) => setMImageFile(file)} maxSizeMB={3} />
              </div>
            </div>
            <div className="p-4 px-6 border-t border-border-gold-soft bg-dark-3 flex justify-end gap-2.5 shrink-0">
              <button type="button" onClick={() => setShowEditModal(false)} className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[10px] tracking-[1px] uppercase font-semibold py-2 px-6 rounded cursor-pointer transition-colors">Cancel</button>
              <button type="submit" className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1px] uppercase font-bold py-2 px-6 rounded cursor-pointer transition-colors">Update Item</button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════
           MODALS — TAB 4: NEW RESERVATION
      ══════════════════════════════════════ */}
      {showResModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleSaveNewReservation} className="bg-dark-2 border border-border-gold w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="p-5 px-6 border-b border-border-gold-soft bg-dark-3 flex items-center justify-between">
              <span className="font-cinzel text-sm text-gold font-bold tracking-[1px]">New Reservation</span>
              <button type="button" onClick={() => setShowResModal(false)} className="w-8 h-8 rounded border border-border-gold-soft bg-dark-4 hover:border-danger hover:text-danger flex items-center justify-center cursor-pointer transition-colors">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="p-6 space-y-4.5 text-xs text-white">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Guest Name <span className="text-gold">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="Full name"
                    value={rGuest}
                    onChange={(e) => setRGuest(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Phone <span className="text-gold">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="+251 9XX XXX XXX"
                    value={rPhone}
                    onChange={(e) => setRPhone(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Email</label>
                  <input 
                    type="email" 
                    placeholder="guest@email.com"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Party Size <span className="text-gold">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={rPartySize}
                    onChange={(e) => setRPartySize(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Date <span className="text-gold">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={rDate}
                    onChange={(e) => setRDate(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-text-muted outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Time <span className="text-gold">*</span></label>
                  <input 
                    type="time" 
                    required
                    value={rTime}
                    onChange={(e) => setRTime(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-text-muted outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Session</label>
                  <select
                    value={rSession}
                    onChange={(e) => setRSession(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option>Breakfast (7–10 AM)</option>
                    <option>Lunch (12–3 PM)</option>
                    <option>Dinner (6–10 PM)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Table Preference</label>
                  <select
                    value={rTablePref}
                    onChange={(e) => setRTablePref(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option>Auto-assign best available</option>
                    <option>Window seat</option>
                    <option>Private room</option>
                    <option>Terrace</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Special Requests</label>
                <textarea 
                  placeholder="Dietary requirements, occasion, special setup…"
                  value={rRequests}
                  onChange={(e) => setRRequests(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold h-14 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block font-semibold">Status</label>
                <select
                  value={rStatus}
                  onChange={(e) => setRStatus(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option>Confirmed</option>
                  <option>Pending</option>
                </select>
              </div>

            </div>
            <div className="p-4 px-6 border-t border-border-gold-soft bg-dark-3 flex justify-end gap-2.5">
              <button type="button" onClick={() => setShowResModal(false)} className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-white text-[10px] tracking-[1px] uppercase font-semibold py-2 px-6 rounded cursor-pointer transition-colors">Cancel</button>
              <button type="submit" className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1px] uppercase font-bold py-2 px-6 rounded cursor-pointer transition-colors">Create Reservation</button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════
           MODALS — TAB 4: VIEW RESERVATION
      ══════════════════════════════════════ */}
      {showViewResModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-dark-2 border border-border-gold w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="p-5 px-6 border-b border-border-gold-soft bg-dark-3 flex items-center justify-between">
              <span className="font-cinzel text-sm text-gold font-bold tracking-[1px]">Reservation Details — {currentSelectedRes.id}</span>
              <button onClick={() => setShowViewResModal(false)} className="w-8 h-8 rounded border border-border-gold-soft bg-dark-4 hover:border-danger hover:text-danger flex items-center justify-center cursor-pointer transition-colors">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-text">
              <div className="flex justify-between items-center py-2.5 border-b border-border-gold-soft/50">
                <div>
                  <h3 className="font-cinzel text-base text-white font-bold leading-none mb-1">{currentSelectedRes.guest}</h3>
                  <span className="text-[10px] text-text-muted">DINER</span>
                </div>
                <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                  currentSelectedRes.status === 'Confirmed' ? 'bg-success/15 text-success border border-success/20' :
                  currentSelectedRes.status === 'Seated' ? 'bg-gold-glow text-gold border border-gold/20' :
                  currentSelectedRes.status === 'Pending' ? 'bg-warning/15 text-warning border border-warning/20' :
                  currentSelectedRes.status === 'Completed' ? 'bg-dark-5 text-text-muted border border-border-gold-soft' :
                  'bg-danger/15 text-danger border border-danger/20'
                }`}>
                  {currentSelectedRes.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Phone Number</span><span className="text-white font-semibold">{currentSelectedRes.phone}</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Email Address</span><span className="text-white">{currentSelectedRes.email || 'N/A'}</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Reserved Date</span><span className="text-white font-semibold">{currentSelectedRes.date}</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Dining Time</span><span className="text-white font-semibold">{currentSelectedRes.time}</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Assigned Table</span><span className="text-gold font-bold font-mono">{currentSelectedRes.table}</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Party Size</span><span className="text-gold font-bold">{currentSelectedRes.partySize} Guests</span></div>
                <div className="flex justify-between py-1 border-b border-border-gold-soft/40"><span className="text-text-muted">Session</span><span className="text-white">{currentSelectedRes.session}</span></div>
              </div>

              <div className="bg-dark-3 border border-border-gold-soft rounded p-4 text-[11px] italic leading-relaxed text-white-dim">
                "{currentSelectedRes.notes || 'No special requests or dietary requirements recorded.'}"
              </div>
            </div>
            <div className="p-4 px-6 border-t border-border-gold-soft bg-dark-3 flex justify-end gap-2">
              {currentSelectedRes.status === 'Pending' && (
                <button 
                  onClick={() => { handleConfirmReservation(currentSelectedRes.id); setShowViewResModal(false); }}
                  className="bg-success/20 border border-success/35 text-success text-[10px] tracking-[1px] uppercase font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                >
                  Confirm
                </button>
              )}
              {currentSelectedRes.status === 'Confirmed' && (
                <button 
                  onClick={() => { handleSeatReservation(currentSelectedRes.id, currentSelectedRes.table); setShowViewResModal(false); }}
                  className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1px] uppercase font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                >
                  Seat
                </button>
              )}
              {currentSelectedRes.status === 'Seated' && (
                <button 
                  onClick={() => { handleCompleteReservation(currentSelectedRes.id, currentSelectedRes.table); setShowViewResModal(false); }}
                  className="bg-success/20 border border-success/35 text-success text-[10px] tracking-[1px] uppercase font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                >
                  Complete
                </button>
              )}
              <button onClick={() => setShowViewResModal(false)} className="bg-gold-glow border border-border-gold text-gold text-[10px] tracking-[1px] uppercase font-bold py-2 px-5 rounded cursor-pointer transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageMenu;
