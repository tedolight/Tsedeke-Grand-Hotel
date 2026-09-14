import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useRoomStore from '../../store/rooms/roomStore.js';
import useBookingStore from '../../store/booking/bookingStore.js';
import useAuthStore from '../../store/auth/authStore.js';
import useUiStore from '../../store/ui/themeStore.js';
import { isMockId } from '../../utils/apiHelpers.js';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';
import { getFirstImage } from '../../utils/helpers/imageHelpers.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const MOCK_ROOMS = [];



// Dynamic date helpers
const getFutureDateStr = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rooms, fetchRooms, fetchAvailableRooms } = useRoomStore();
  const { createBooking, processPayment, verifyChapaPayment, checkAvailability, loading: bookingLoading, error: bookingError } = useBookingStore();
  const { user, isAuthenticated, loadUser } = useAuthStore();
  const { setCursorHovered, addToast } = useUiStore();
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();

  // Wizard Step State: 1 (Select), 2 (Details), 3 (Confirm & Pay), 4 (Success)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Stay & Room details State
  const [checkIn, setCheckIn] = useState(getFutureDateStr(1));
  const [checkOut, setCheckOut] = useState(getFutureDateStr(3));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Step 2: Guest Details State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('Ethiopian');
  const [passportNo, setPassportNo] = useState('');
  const [notes, setNotes] = useState('');

  // Step 3: Payment — always via Chapa (handles Telebirr, CBE Birr, Cards, etc.)
  const paymentMethod = 'chapa';

  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [confirmedPayment, setConfirmedPayment] = useState(null);
  const [verifyingChapa, setVerifyingChapa] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isRoomAvailableForDates, setIsRoomAvailableForDates] = useState(true);
  const [chapaUrl, setChapaUrl] = useState('');

  // Handle Chapa payment redirect verification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chapaVerify = params.get('chapa_verify');
    const qBookingId = params.get('bookingId');
    const txRef = 
      params.get('tx_ref') || 
      params.get('trx_ref') || 
      params.get('reference') || 
      params.get('transaction_id') || 
      localStorage.getItem('pendingChapaTxRef') ||
      qBookingId ||
      localStorage.getItem('pendingChapaBookingId');

    const shouldVerify = chapaVerify === 'true' || params.get('tx_ref') || params.get('trx_ref') || params.get('reference') || params.get('status') === 'success';

    if (shouldVerify) {
      const verifyStatus = async () => {
        setVerifyingChapa(true);
        try {
          if (!txRef) {
            throw new Error('No transaction reference found');
          }

          const result = await verifyChapaPayment(txRef);
          const payment = result?.payment || result?.data?.payment;
          const booking = result?.booking || result?.data?.booking;

          const isPaid = payment?.status === 'completed' || booking?.paymentStatus === 'paid';

          if (!isPaid) {
            throw new Error(result?.message || 'Payment was not completed or failed.');
          }

          setConfirmedBooking(booking);
          if (payment) setConfirmedPayment(payment);
          localStorage.removeItem('pendingChapaBooking');
          localStorage.removeItem('pendingChapaTxRef');
          localStorage.removeItem('pendingChapaBookingId');

          setCurrentStep(4);
          setShowSuccessModal(true);
          addToast(t('Payment verified successfully! Your room is booked.'), 'success');
        } catch (err) {
          console.error('Payment verification failed:', err);
          addToast(err?.response?.data?.message || err.message || t('Payment was not completed. Your room was not booked.'), 'error');
          setCurrentStep(3);
        } finally {
          setVerifyingChapa(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
      verifyStatus();
    }
  }, [location.search, verifyChapaPayment, addToast, t]);

  // Fetch all rooms and available rooms whenever dates change or on mount
  useEffect(() => {
    fetchRooms();
    if (checkIn && checkOut) {
      fetchAvailableRooms(checkIn, checkOut);
    }
  }, [checkIn, checkOut, fetchAvailableRooms, fetchRooms]);

  // Load user profile on mount if token exists
  useEffect(() => {
    if (localStorage.getItem('token') && !user) {
      loadUser();
    }
  }, [user, loadUser]);

  // Read query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qCheckIn = params.get('checkIn');
    const qCheckOut = params.get('checkOut');
    const qRoomId = params.get('roomId');
    const qGuests = params.get('guests');
    const qType = params.get('type');

    if (qCheckIn) setCheckIn(qCheckIn);
    if (qCheckOut) setCheckOut(qCheckOut);
    if (qRoomId) setSelectedRoomId(qRoomId);
    if (qType) setSelectedType(qType);
    if (qGuests) {
      const num = parseInt(qGuests, 10);
      if (!isNaN(num)) {
        setAdults(Math.max(1, num));
      }
    }
  }, [location.search]);

  // Autofill user details if authenticated
  useEffect(() => {
    if (user) {
      const names = user.name ? user.name.split(' ') : ['', ''];
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Combine real rooms
  const allRooms = useMemo(() => {
    return rooms || [];
  }, [rooms]);

  // Smart resolution for selectedRoom matching by _id, id, name, or roomNumber
  const selectedRoom = useMemo(() => {
    if (!allRooms || allRooms.length === 0) return null;

    if (selectedRoomId) {
      const strTarget = String(selectedRoomId).trim();
      const lowerTarget = strTarget.toLowerCase();

      // 1. Direct ID or Room Number match
      let match = allRooms.find(r => String(r._id) === strTarget || String(r.id) === strTarget || String(r.roomNumber) === strTarget);
      if (match) return match;

      // 2. Exact or partial Name match
      match = allRooms.find(r => r.name && r.name.toLowerCase() === lowerTarget);
      if (match) return match;

      match = allRooms.find(r => r.name && (r.name.toLowerCase().includes(lowerTarget) || lowerTarget.includes(r.name.toLowerCase())));
      if (match) return match;
    }

    return null; // Return null if user has not explicitly selected a room
  }, [allRooms, selectedRoomId]);

  // Dynamically check date availability whenever dates or room changes
  useEffect(() => {
    let isSubscribed = true;
    const checkRoomAvailability = async () => {
      const targetRoomId = selectedRoom?._id || selectedRoomId;
      if (targetRoomId && checkIn && checkOut) {
        const avail = await checkAvailability(targetRoomId, checkIn, checkOut);
        if (isSubscribed) {
          setIsRoomAvailableForDates(avail);
        }
      } else if (isSubscribed) {
        setIsRoomAvailableForDates(true);
      }
    };
    checkRoomAvailability();
    return () => { isSubscribed = false; };
  }, [selectedRoom, selectedRoomId, checkIn, checkOut, checkAvailability]);

  // Calculate nights count
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;
    if (isNaN(diff)) return 1;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [checkIn, checkOut]);

  // Total Guests
  const totalGuests = adults + children;

  // Pricing calculations
  const subtotal = useMemo(() => {
    if (!selectedRoom) return 0;
    return selectedRoom.price * nights;
  }, [selectedRoom, nights]);

  const extraFees = 0;

  const serviceCharge = 0;

  const totalPrice = useMemo(() => {
    return subtotal + extraFees + serviceCharge;
  }, [subtotal, extraFees, serviceCharge]);

  // Confirmed booking display helpers (to handle Chapa redirect state loss)
  const displayedPrice = useMemo(() => {
    if (confirmedBooking?.totalPrice) return confirmedBooking.totalPrice;
    if (confirmedBooking?.room?.price) {
      const start = new Date(confirmedBooking.checkIn);
      const end = new Date(confirmedBooking.checkOut);
      const diff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      return confirmedBooking.room.price * diff;
    }
    if (selectedRoom?.price) return selectedRoom.price * nights;
    return totalPrice > 0 ? totalPrice : 0;
  }, [confirmedBooking, selectedRoom, nights, totalPrice]);

  const displayedNights = useMemo(() => {
    if (confirmedBooking?.checkIn && confirmedBooking?.checkOut) {
      const start = new Date(confirmedBooking.checkIn);
      const end = new Date(confirmedBooking.checkOut);
      const diff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      return diff;
    }
    return nights;
  }, [confirmedBooking, nights]);

  const displayedRoomName = useMemo(() => {
    if (confirmedBooking?.room?.name) return confirmedBooking.room.name;
    if (selectedRoom?.name) return selectedRoom.name;
    const targetId = confirmedBooking?.room?._id || confirmedBooking?.room || selectedRoomId;
    if (targetId) {
      const match = allRooms.find(r => String(r._id) === String(targetId) || String(r.id) === String(targetId) || String(r.roomNumber) === String(targetId));
      if (match?.name) return match.name;
    }
    return 'Selected Room';
  }, [confirmedBooking, selectedRoom, selectedRoomId, allRooms]);

  const isChildrenAllowed = selectedRoom ? selectedRoom.type === 'family double bed' : true;

  useEffect(() => {
    if (!isChildrenAllowed && children > 0) {
      setChildren(0);
    }
  }, [isChildrenAllowed, children]);

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    const cin = new Date(val);
    const cout = new Date(checkOut);
    if (cin >= cout) {
      const nextDay = new Date(cin);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (e) => {
    const val = e.target.value;
    const cin = new Date(checkIn);
    const cout = new Date(val);
    if (cout <= cin) {
      addToast(t('Check-out date must be after check-in date'), 'error');
      return;
    }
    setCheckOut(val);
  };

  const adjustGuests = (type, delta) => {
    if (type === 'adults') {
      setAdults(prev => Math.max(1, prev + delta));
    } else {
      setChildren(prev => Math.max(0, prev + delta));
    }
  };

  const toggleRequest = (reqId) => {
    setSelectedRequests(prev =>
      prev.includes(reqId) ? prev.filter(id => id !== reqId) : [...prev, reqId]
    );
  };

  // Step transitions
  const goToDetails = async () => {
    if (!selectedRoomId) {
      addToast(t('Please select a room to proceed'), 'error');
      return;
    }
    const targetRoomId = selectedRoom?._id || selectedRoomId;
    const isAvail = await checkAvailability(targetRoomId, checkIn, checkOut);
    if (!isAvail) {
      addToast(t('This room is already booked for the selected dates. Please select another room or different dates.'), 'error');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPayment = () => {
    if (!firstName || !lastName || !email || !phone || !passportNo) {
      addToast(t('Please fill out all required fields marked with *'), 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast(t('Please enter a valid email address'), 'error');
      return;
    }
    const fanDigits = passportNo.replace(/\D/g, '');
    if (fanDigits.length !== 16) {
      addToast(t('National ID (FAN Number) must be exactly 16 digits'), 'error');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackToSelection = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackToDetails = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookAndPay = async (e, chosenMethod = 'chapa') => {
    if (e) e.preventDefault();

    const specialReqStr = notes || '';

    const targetRoomId = selectedRoom?._id || selectedRoomId;
    const available = await checkAvailability(targetRoomId, checkIn, checkOut);
    if (!available) {
      addToast(t('This room is not available for the selected dates. Please choose different dates.'), 'error');
      return;
    }

    const bookingData = {
      room: targetRoomId,
      checkIn,
      checkOut,
      guests: totalGuests,
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      nationalId: passportNo,
      passportNo: passportNo,
      specialRequests: specialReqStr,
    };

    const created = await createBooking(bookingData);
    if (!created) {
      addToast(bookingError || t('Failed to create reservation'), 'error');
      return;
    }

    setConfirmedBooking(created);

    // Process Chapa payment and redirect to Chapa checkout
    const paymentData = {
      bookingId: created._id,
      paymentMethod: 'chapa',
      amount: totalPrice,
    };

    try {
      const paymentResult = await processPayment(paymentData);
      if (paymentResult && paymentResult.checkoutUrl) {
        localStorage.setItem('pendingChapaBooking', JSON.stringify(created));
        const txId = paymentResult.payment?.transactionId || paymentResult.transactionId || '';
        if (txId) localStorage.setItem('pendingChapaTxRef', txId);
        if (created._id) localStorage.setItem('pendingChapaBookingId', created._id);
        // Redirect to Chapa checkout page to complete payment
        window.location.href = paymentResult.checkoutUrl;
        return;
      } else {
        throw new Error(paymentResult?.message || t('Payment gateway failed to provide checkout URL'));
      }
    } catch (err) {
      console.error('Payment init error:', err);
      addToast(err?.response?.data?.message || err.message || t('Payment initialization failed. Please try again.'), 'error');
      return; // Do NOT proceed to confirmation without redirecting and paying!
    }
  };

  // Format Date for display (timezone safe)
  const formatDate = (dateStr, options = {}) => {
    if (!dateStr) return '';
    let str = typeof dateStr === 'string' ? dateStr : '';
    if (str.includes('T')) {
      str = str.split('T')[0];
    }
    if (typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
      const [year, month, day] = str.trim().split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', ...options });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', ...options });
  };

  if (verifyingChapa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-4 font-montserrat select-none">
        <div className="w-16 h-16 border-4 border-t-gold border-border-gold/20 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-cormorant text-cream tracking-[2px]">{t('Verifying payment with Chapa...')}</h2>
        <p className="text-[10px] tracking-[1px] uppercase text-text-dim mt-2">{t('Please do not close this window')}</p>
      </div>
    );
  }

  return (
    <div className="booking-page select-none min-h-screen pb-16 font-montserrat">
      {/* ─── PAGE HERO ─── */}
      <div className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden pt-[68px] mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/custom/Booking.jpg?v=2')`
          }}
        />
        <div className="page-hero-content relative z-10 text-center px-4 sm:px-6">
          <AnimatedText tag="span" animation="fade-down" delay={100} className="text-[10px] tracking-[6px] uppercase text-gold mb-5 block font-montserrat" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px #000000' }}>✦ {t('Direct Reservation')}</AnimatedText>
          <AnimatedText tag="h1" animation="fade-up" delay={300} className="text-3xl md:text-5xl font-cormorant font-light leading-tight" style={{ color: '#FFFFFF', textShadow: '0 4px 25px rgba(0,0,0,0.95), 0 0 35px #000000' }}>{t('Book Your')} <span className="italic text-gold-light">{t('Stay')}</span></AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={500} className="mt-6 text-[11px] tracking-[2px] uppercase font-montserrat font-medium text-white" style={{ textShadow: '0 2px 14px rgba(0,0,0,0.9), 0 0 20px #000000' }}>
            <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="text-gold no-underline">{t('Home')}</Link> &nbsp;/&nbsp; {t('Booking Wizard')}
          </AnimatedText>
        </div>
      </div>

      {/* STEPS INDICATOR */}
      <AnimatedSection animation="fade-up" delay={200} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-15 mb-10">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-dark-2/40 border border-border-gold/15 p-4 sm:p-6 backdrop-blur-md rounded-sm">
          {[
            { step: 1, label: 'Room & Dates' },
            { step: 2, label: 'Guest Details' },
            { step: 3, label: 'Confirm & Pay' },
            { step: 4, label: 'Success' }
          ].map((item, index, arr) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-500 border ${
                  currentStep === item.step
                    ? 'bg-dark-3 border-gold text-gold shadow-[0_0_12px_rgba(201,168,76,0.25)]'
                    : currentStep > item.step
                    ? 'bg-gold border-gold text-black'
                    : 'bg-dark-3 border-border-gold/25 text-white-dim'
                }`}>
                  {currentStep > item.step ? '✓' : `0${item.step}`}
                </div>
                <span className={`text-[10px] tracking-[2.5px] uppercase transition-colors duration-300 ${
                  currentStep === item.step ? 'text-white' : currentStep > item.step ? 'text-gold' : 'text-text-dim'
                }`}>
                  {t(item.label)}
                </span>
              </div>
              {index < arr.length - 1 && (
                <div className={`hidden sm:block flex-1 h-[1px] mx-4 transition-colors duration-500 ${
                  currentStep > item.step ? 'bg-gold' : 'bg-border-gold/25'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </AnimatedSection>

      {currentStep < 4 ? (
        <div className="max-w-7xl mx-auto px-6 md:px-15 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          {/* LEFT: FORM WRAPPER */}
          <div className="bg-dark-2 border border-border-gold/15 shadow-2xl overflow-hidden rounded-sm">
            
            {/* STEP 1: SELECT ROOM & DATES */}
            {currentStep === 1 && (
              <div>
                {/* DATES & GUESTS */}
                <div className="p-8 md:p-10 border-b border-border-gold/15">
                  <AnimatedSection animation="fade-down" className="flex flex-col items-center text-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-gold/5 border border-border-gold/30 flex items-center justify-center text-gold text-2xl rounded-sm">📅</div>
                    <div>
                      <h2 className="font-cormorant text-3xl text-cream">{t('Stay & Guest Selection')}</h2>
                      <p className="text-[10px] tracking-[1.5px] uppercase text-text-dim mt-2">{t('Select your dates and occupancy')}</p>
                    </div>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-up" delay={100} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Check-in Date')} <span className="text-gold">*</span></label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={checkIn}
                        onChange={handleCheckInChange}
                        className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Check-out Date')} <span className="text-gold">*</span></label>
                      <input
                        type="date"
                        min={checkIn ? new Date(new Date(checkIn).setDate(new Date(checkIn).getDate() + 1)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        value={checkOut}
                        onChange={handleCheckOutChange}
                        className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm"
                      />
                    </div>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-up" delay={200} className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Number of Guests')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Adults counter */}
                      <div className="bg-dark-3 border border-border-gold/25 p-4 flex items-center justify-between rounded-sm">
                        <div className="flex flex-col">
                          <span className="text-[11px] tracking-[1.5px] uppercase text-white font-semibold">{t('Adults')}</span>
                          <span className="text-[9px] text-text-dim mt-0.5">{t('Age 13+')}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => adjustGuests('adults', -1)}
                            className="w-8 h-8 border border-border-gold/30 hover:border-gold hover:bg-gold hover:text-black flex items-center justify-center text-gold text-lg transition-all duration-300 rounded-sm"
                          >
                            −
                          </button>
                          <span className="text-white text-sm font-semibold min-w-[20px] text-center">{adults}</span>
                          <button
                            type="button"
                            onClick={() => adjustGuests('adults', 1)}
                            className="w-8 h-8 border border-border-gold/30 hover:border-gold hover:bg-gold hover:text-black flex items-center justify-center text-gold text-lg transition-all duration-300 rounded-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {/* Children counter */}
                      <div className={`bg-dark-3 border border-border-gold/25 p-4 flex items-center justify-between rounded-sm transition-opacity duration-300 ${!isChildrenAllowed ? 'opacity-50' : ''}`}>
                        <div className="flex flex-col">
                          <span className="text-[11px] tracking-[1.5px] uppercase text-white font-semibold">{t('Children')}</span>
                          <span className="text-[9px] text-text-dim mt-0.5">
                            {!isChildrenAllowed ? t('Family rooms only') : t('Age 0–12')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            disabled={!isChildrenAllowed || children <= 0}
                            onClick={() => adjustGuests('children', -1)}
                            className="w-8 h-8 border border-border-gold/30 hover:border-gold hover:bg-gold hover:text-black flex items-center justify-center text-gold text-lg transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold disabled:hover:border-border-gold/30"
                          >
                            −
                          </button>
                          <span className="text-white text-sm font-semibold min-w-[20px] text-center">{children}</span>
                          <button
                            type="button"
                            disabled={!isChildrenAllowed}
                            onClick={() => adjustGuests('children', 1)}
                            className="w-8 h-8 border border-border-gold/30 hover:border-gold hover:bg-gold hover:text-black flex items-center justify-center text-gold text-lg transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold disabled:hover:border-border-gold/30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                </div>

                {/* ROOM SELECTION LIST */}
                <div className="p-8 md:p-10 border-b border-border-gold/15">
                  <AnimatedSection animation="fade-down" className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gold/5 border border-border-gold/30 flex items-center justify-center text-gold text-lg rounded-sm">🛏️</div>
                      <div>
                        <h2 className="font-cormorant text-2xl text-cream">{t('Selected Room for Reservation')}</h2>
                        <p className="text-[10px] tracking-[1.5px] uppercase text-text-dim mt-1">{t('Tsedeke Grand Hotel Accommodations')}</p>
                      </div>
                    </div>
                  </AnimatedSection>

                  {/* SPOTLIGHT SINGLE SELECTED ROOM CARD */}
                  {selectedRoom && (() => {
                    const isSelectedRoomOccupied = !isRoomAvailableForDates || selectedRoom.status === 'Maintenance';
                    return (
                      <AnimatedSection animation="fade-up" className={`mb-6 p-6 bg-gradient-to-r rounded-sm ${
                        isSelectedRoomOccupied
                          ? 'from-red-950/40 via-dark-3/80 to-red-950/40 border-2 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
                          : 'from-dark-4/60 via-dark-3/80 to-dark-4/60 border-2 border-gold shadow-[0_0_25px_rgba(201,168,76,0.2)]'
                      }`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-5 w-full md:w-auto">
                            <div className="h-24 w-28 bg-dark-3 rounded overflow-hidden shrink-0 border border-gold/30 relative">
                              <img src={getFirstImage(selectedRoom.images, 'room')} alt={selectedRoom.name} className={`w-full h-full object-cover ${isSelectedRoomOccupied ? 'filter grayscale contrast-125 brightness-75' : ''}`} />
                              {isSelectedRoomOccupied && (
                                <span className="absolute inset-0 bg-red-950/60 flex items-center justify-center text-red-300 font-cinzel text-[10px] font-bold tracking-widest uppercase text-center p-1">
                                  BOOKED
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {isSelectedRoomOccupied ? (
                                  <span className="text-[9px] font-cinzel text-white bg-red-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    ROOM BOOKED
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-cinzel text-black bg-gold font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    Selected Room #{selectedRoom.roomNumber}
                                  </span>
                                )}
                                <span className="text-[9.5px] text-gold uppercase tracking-wider font-semibold">{t(selectedRoom.type)}</span>
                              </div>
                              <h3 className="font-cormorant text-2xl text-white font-bold mt-1">{t(selectedRoom.name)}</h3>
                              
                              {isSelectedRoomOccupied ? (
                                <div className="mt-2 p-2 px-3 bg-red-950/60 border border-red-500/40 rounded flex items-center gap-2">
                                  <span className="text-red-400 text-xs">🚫</span>
                                  <span className="text-red-200 text-[10.5px] font-montserrat font-semibold">{t('This room is already booked for your selected dates.')}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-[9px] text-white-dim bg-dark-2 px-2 py-1 border border-border-gold/15 rounded">{selectedRoom.bed || 'Twin Bed'}</span>
                                  <span className="text-[9px] text-white-dim bg-dark-2 px-2 py-1 border border-border-gold/15 rounded">{selectedRoom.view || 'City View'}</span>
                                  <span className="text-[9px] text-white-dim bg-dark-2 px-2 py-1 border border-border-gold/15 rounded">{selectedRoom.size || '35 sqm'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-border-gold/15 pt-4 md:pt-0">
                            <div className="text-left md:text-right">
                              <div className="font-cormorant text-2xl text-gold font-bold">{selectedRoom.price?.toLocaleString()} <small className="text-[10px] text-white-dim uppercase font-montserrat">ETB / Night</small></div>
                              <div className="text-[8.5px] tracking-[1.5px] uppercase text-text-dim mt-0.5">{formatDate(checkIn)} — {formatDate(checkOut)} ({nights} {nights === 1 ? t('Night') : t('Nights')})</div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                              {isSelectedRoomOccupied ? (
                                <button
                                  type="button"
                                  onClick={() => navigate('/rooms')}
                                  className="text-[10px] tracking-[1.5px] uppercase font-bold bg-red-600 hover:bg-red-700 text-white px-5 py-3 transition-all rounded-sm cursor-pointer font-cinzel shadow-lg"
                                >
                                  {t('Choose Another Room')} →
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => navigate('/rooms')}
                                  className="text-[9px] tracking-[1.5px] uppercase font-semibold border border-gold/40 text-gold hover:bg-gold hover:text-black px-5 py-3 transition-all rounded-sm cursor-pointer font-cinzel"
                                >
                                  {t('Change Room')}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </AnimatedSection>
                    );
                  })()}


                </div>

                {/* BOTTOM ACTION */}
                <AnimatedSection animation="scale" className="p-8 md:p-10 flex justify-end">
                  {!selectedRoom ? (
                    <button
                      type="button"
                      onClick={() => navigate('/rooms')}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      className="w-full sm:w-auto bg-dark-3 border border-border-gold/30 hover:border-gold text-gold font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold px-10 py-4.5 transition-colors duration-300 rounded-sm shadow-lg cursor-pointer"
                    >
                      {t('Browse Rooms')} →
                    </button>
                  ) : !isRoomAvailableForDates || selectedRoom.status === 'Maintenance' ? (
                    <button
                      type="button"
                      onClick={() => navigate('/rooms')}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      className="w-full sm:w-auto bg-red-900/80 hover:bg-red-800 text-white font-cinzel text-[11px] tracking-[2px] uppercase font-bold px-10 py-4.5 transition-colors duration-300 rounded-sm shadow-lg border border-red-500/50 cursor-pointer"
                    >
                      🚫 {t('Room Booked — Browse Rooms')} →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goToDetails}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold px-10 py-4.5 transition-colors duration-300 rounded-sm shadow-lg"
                    >
                      {t('Proceed to Details')} →
                    </button>
                  )}
                </AnimatedSection>
              </div>
            )}

            {/* STEP 2: GUEST DETAILS */}
            {currentStep === 2 && (
              <div>
                {/* SELECTED ROOM SUMMARY BANNER IN STEP 2 */}
                {selectedRoom && (
                  <AnimatedSection animation="fade-down" className="mx-8 md:mx-10 mt-8 p-5 bg-gradient-to-r from-dark-4/60 via-dark-3/80 to-dark-4/60 border border-gold/40 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-20 bg-dark-3 rounded overflow-hidden shrink-0 border border-gold/20">
                        <img src={getFirstImage(selectedRoom.images, 'room')} alt={selectedRoom.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-cinzel text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded font-bold uppercase">
                            {t('Selected Room')} #{selectedRoom.roomNumber}
                          </span>
                          <span className="text-[9px] text-white-dim uppercase font-montserrat tracking-wider">{t(selectedRoom.type)}</span>
                        </div>
                        <h3 className="font-cormorant text-xl text-white font-bold mt-1">{t(selectedRoom.name)}</h3>
                        <p className="text-[11px] text-text-dim font-montserrat mt-0.5">
                          {formatDate(checkIn)} — {formatDate(checkOut)} ({nights} {nights === 1 ? t('Night') : t('Nights')})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-cormorant text-xl text-gold font-bold">{selectedRoom.price?.toLocaleString()} ETB</div>
                        <div className="text-[8px] tracking-[1px] uppercase text-text-dim">{t('Per Night')}</div>
                      </div>
                      <button
                        type="button"
                        onClick={goBackToSelection}
                        className="text-[9px] tracking-[1.5px] uppercase font-semibold border border-border-gold/30 text-white-dim hover:text-gold hover:border-gold px-3 py-2 transition-all duration-300 rounded-sm cursor-pointer"
                      >
                        {t('Change Room')}
                      </button>
                    </div>
                  </AnimatedSection>
                )}

                {/* GUEST INFO */}
                <div className="p-8 md:p-10 border-b border-border-gold/15">
                  <AnimatedSection animation="fade-down" className="flex flex-col items-center text-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-gold/5 border border-border-gold/30 flex items-center justify-center text-gold text-2xl rounded-sm">👤</div>
                    <div>
                      <h2 className="font-cormorant text-3xl text-cream">{t('Primary Guest Details')}</h2>
                      <p className="text-[10px] tracking-[1.5px] uppercase text-text-dim mt-2">{t('Please enter details as they appear on your ID')}</p>
                    </div>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-up" delay={100} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('First Name')} <span className="text-gold">*</span></label>
                      <input
                        type="text"
                        placeholder={t('Abebe')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Last Name')} <span className="text-gold">*</span></label>
                      <input
                        type="text"
                        placeholder={t('Girma')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Email Address')} <span className="text-gold">*</span></label>
                      <input
                        type="email"
                        placeholder={t('abebe@example.com')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Phone Number')} <span className="text-gold">*</span></label>
                      <input
                        type="tel"
                        placeholder={t('+251 9XX XXX XXXX')}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Nationality')}</label>
                      <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="bg-dark-3 border border-border-gold/25 text-white-dim font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm appearance-none"
                      >
                        <option value="Ethiopian">{t('Ethiopian')}</option>
                        <option value="Other">{t('Other')}</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] tracking-[2px] uppercase text-text-dim">
                          {t('National ID (FAN Number)')} <span className="text-gold">*</span>
                        </label>
                        <span className={`text-[10px] font-mono tracking-wider transition-colors ${passportNo.length === 16 ? 'text-gold font-semibold' : 'text-text-dim'}`}>
                          {passportNo.length}/16 {t('digits')}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={16}
                          placeholder={t('16-digit FAN number (e.g. 1234567890123456)')}
                          value={passportNo}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setPassportNo(onlyDigits);
                          }}
                          className={`bg-dark-3 border ${passportNo.length === 16 ? 'border-gold/60' : 'border-border-gold/25'} text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 rounded-sm font-mono tracking-wider pr-10`}
                        />
                        {passportNo.length === 16 && (
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold text-sm font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-text-dim font-montserrat">
                        {t('Mandatory 16-digit Fayda Access Number (FAN) for national identity verification.')}
                      </span>
                    </div>
                  </AnimatedSection>
                </div>

                {/* ADDITIONAL NOTES */}
                <div className="p-8 md:p-10 border-b border-border-gold/15">
                  <AnimatedSection animation="fade-up" delay={100} className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[2px] uppercase text-text-dim">{t('Additional Notes (Optional)')}</label>
                    <textarea
                      placeholder={t('Any specific requests or notes for our front desk...')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-4 outline-none focus:border-gold w-full transition-colors duration-300 resize-none h-28 rounded-sm"
                    />
                  </AnimatedSection>
                </div>

                {/* BOTTOM ACTIONS */}
                <AnimatedSection animation="scale" className="p-8 md:p-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={goBackToSelection}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="w-full sm:w-auto bg-transparent border border-border-gold/30 hover:border-gold text-gold font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold px-8 py-4.5 transition-colors duration-300 rounded-sm"
                  >
                    ← {t('Back to Selection')}
                  </button>
                  <button
                    type="button"
                    onClick={goToPayment}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold px-10 py-4.5 transition-colors duration-300 rounded-sm shadow-lg"
                  >
                    {t('Proceed to Payment')} →
                  </button>
                </AnimatedSection>
              </div>
            )}

            {/* STEP 3: PAYMENT & CONFIRMATION */}
            {currentStep === 3 && (
              <form onSubmit={handleBookAndPay}>
                {/* PAYMENT — CHAPA ONLY */}
                <div className="p-8 md:p-10 border-b border-border-gold/15">
                  <AnimatedSection animation="fade-down" className="flex flex-col items-center text-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gold/5 border border-border-gold/30 flex items-center justify-center rounded-sm">
                      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                        <rect x="1" y="5" width="20" height="14" rx="2" stroke="#C9A84C" strokeWidth="1.4"/>
                        <path d="M1 9h20" stroke="#C9A84C" strokeWidth="1.4"/>
                        <path d="M5 14h3M14 14h3" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-cormorant text-3xl text-cream">{t('Secure Checkout')}</h2>
                      <p className="text-[10px] tracking-[1.5px] uppercase text-text-dim mt-2">{t('Powered by Chapa — Ethiopia\'s leading payment gateway')}</p>
                    </div>
                  </AnimatedSection>

                  {/* Chapa info card */}
                  <AnimatedSection animation="fade-up" delay={100}>
                    <div className="border border-gold/20 bg-gold/5 rounded-sm p-6 flex flex-col sm:flex-row items-center gap-6">
                      {/* Chapa logo placeholder */}
                      <div className="flex-shrink-0 w-16 h-16 bg-dark-3 border border-border-gold/20 rounded-sm flex items-center justify-center">
                        <span className="font-cinzel text-gold text-[10px] tracking-[2px] font-bold">CHAPA</span>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-montserrat text-[12px] text-white/90 leading-relaxed mb-3">
                          {t('After confirming your reservation, you will be securely redirected to Chapa\'s checkout page where you can pay using:')}
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          {['Telebirr', 'CBE Birr', 'Awash Birr', 'BoaPay', 'Debit / Credit Card'].map((m) => (
                            <span key={m} className="text-[9px] font-montserrat tracking-[1.5px] uppercase text-gold border border-gold/30 px-2.5 py-1 rounded-sm bg-gold/5">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Security badges */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                      {[
                        { icon: '🔒', label: '256-bit SSL Encrypted' },
                        { icon: '✓', label: 'PCI DSS Compliant' },
                        { icon: '🛡', label: 'Verified by Chapa' },
                      ].map((b) => (
                        <div key={b.label} className="flex items-center gap-1.5">
                          <span className="text-gold text-[11px]">{b.icon}</span>
                          <span className="text-[9px] font-montserrat tracking-[1.2px] uppercase text-text-dim">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  </AnimatedSection>
                </div>

                {/* TERMS & SUBMIT */}
                <AnimatedSection animation="fade-up" className="p-8 md:p-10 bg-dark-2/50">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-cinzel text-[11px] tracking-[3px] uppercase font-semibold py-5 transition-colors duration-300 rounded-sm shadow-xl cursor-pointer"
                    >
                      {bookingLoading ? t('Processing Stay Reservation...') : t('Pay & Confirm Reservation →')}
                    </button>
                    <span className="text-[9px] text-text-dim tracking-[1.5px] leading-relaxed uppercase max-w-lg">
                      {t('By proceeding, you authorize Tsedeke Grand Hotel to hold your reservation in our database and agree to our')} <a href="#" className="text-gold underline hover:text-gold-light">{t('Terms of Stay')}</a> {t('and')} <a href="#" className="text-gold underline hover:text-gold-light">{t('Cancellation Policies')}</a>.
                    </span>
                  </div>
                </AnimatedSection>
              </form>
            )}
          </div>

          {/* RIGHT: SIDEBAR SUMMARY */}
          <div className="space-y-6 sticky top-28">
            {/* BOOKING SUMMARY CARD */}
            <AnimatedSection animation="fade-left" delay={100} className="bg-dark-2 border border-border-gold/15 rounded-sm overflow-hidden shadow-xl">
              <div className="bg-gold/5 p-5 border-b border-border-gold/15 flex items-center gap-3">
                <span className="text-gold text-sm">📋</span>
                <h3 className="font-cormorant text-lg text-cream font-medium">{t('Reservation Summary')}</h3>
              </div>

              <div className="p-6 space-y-4 border-b border-border-gold/15">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] tracking-[1.5px] uppercase text-text-dim">{t('Room Selected')}</span>
                  <span className="text-[11px] font-medium text-gold font-cinzel text-right max-w-[200px]">
                    {selectedRoom ? t(selectedRoom.name) : t('No Room Selected')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] tracking-[1.5px] uppercase text-text-dim">{t('Check-in')}</span>
                  <span className="text-[11px] font-medium text-white text-right">{formatDate(checkIn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] tracking-[1.5px] uppercase text-text-dim">{t('Check-out')}</span>
                  <span className="text-[11px] font-medium text-white text-right">{formatDate(checkOut)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] tracking-[1.5px] uppercase text-text-dim">{t('Duration')}</span>
                  <span className="text-[11px] font-medium text-white text-right">{nights} {nights === 1 ? t('Night') : t('Nights')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] tracking-[1.5px] uppercase text-text-dim">{t('Guests')}</span>
                  <span className="text-[11px] font-medium text-white text-right">{adults} {t('Adults')} {children > 0 && `, ${children} ${t('Children')}`}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-6 bg-dark-3/30 space-y-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-dim">
                    {selectedRoom ? selectedRoom.price.toLocaleString() : 0} ETB × {nights} {nights === 1 ? t('night') : t('nights')}
                  </span>
                  <span className="text-white">{subtotal.toLocaleString()} ETB</span>
                </div>
                {extraFees > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-dim">{t('Special Add-ons')}</span>
                    <span className="text-white">+{extraFees.toLocaleString()} ETB</span>
                  </div>
                )}

                <div className="h-[1px] bg-border-gold/15 my-2" />
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[11px] tracking-[1.5px] uppercase text-white font-semibold">{t('Total Price')}</span>
                  <span className="font-cormorant text-2xl text-gold font-bold">{totalPrice.toLocaleString()} ETB</span>
                </div>
              </div>
            </AnimatedSection>

            {/* POLICY CARD */}
            <AnimatedSection animation="fade-left" delay={200} className="bg-dark-2 border border-border-gold/15 p-6 rounded-sm shadow-md">
              <h4 className="text-[10px] tracking-[2px] uppercase text-gold font-semibold mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-gold" /> {t('Cancellation Policy')}
              </h4>
              <p className="text-[10px] text-text-dim leading-relaxed whitespace-pre-line">
                {t(hotelSettings.cancellationDetails || "Guests may cancel free of charge up to 48 hours before arrival. Cancellations within 48 hours will incur a charge equivalent to one night's stay. No-shows will be charged in full.")}
              </p>
            </AnimatedSection>

            {/* NEED HELP */}
            <AnimatedSection animation="fade-left" delay={300} className="bg-gradient-to-br from-gold/5 to-gold/0 border border-border-gold/15 p-6 text-center rounded-sm">
              <h4 className="font-cormorant text-cream font-medium text-lg mb-2">{t('Need Assistance?')}</h4>
              <p className="text-[10px] text-text-dim leading-relaxed mb-4">{t('Our dedicated reservations desk is available 24/7 to assist with your booking.')}</p>
              <a href={`tel:${hotelSettings.reservationsPhone || hotelSettings.mainPhone || '+251909517777'}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="font-cormorant text-lg text-gold font-semibold hover:text-gold-light transition-colors block mb-1">
                {hotelSettings.reservationsPhone || hotelSettings.mainPhone || '+251 90 951 7777'}
              </a>
              <span className="text-[9px] text-text-dim tracking-[1px] block">{hotelSettings.reservationsEmail || hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}</span>
            </AnimatedSection>
          </div>
        </div>
      ) : (
        /* STEP 4: SUCCESS PAGE */
        <AnimatedSection animation="scale" className="max-w-4xl mx-auto px-6 text-center py-10 relative overflow-hidden">
          {/* Pulse background rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full h-full flex justify-center items-center z-0">
            <div className="absolute w-[280px] h-[280px] rounded-full border border-gold/10 animate-ping opacity-60" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full border border-gold/5 animate-ping opacity-40" style={{ animationDuration: '6s' }} />
          </div>

          <div className="relative z-10">
            {/* Animated checkmark */}
            <AnimatedSection animation="scale" delay={100} className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-radial-gradient(circle,rgba(201,168,76,0.15),transparent_70%) animate-pulse" />
              <div className="w-20 h-20 rounded-full border border-gold flex items-center justify-center text-4xl text-gold shadow-[0_0_20px_rgba(201,168,76,0.2)] bg-dark-2">
                ✓
              </div>
            </AnimatedSection>

            <span className="text-[10px] tracking-[6px] uppercase text-gold font-semibold mb-4 block">✦ {t('Direct Reservation Confirmed ✦')}</span>
            <h1 className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight mb-4">{t('Your Stay is')}<br /><em className="italic text-gold-light">{t('Reserved')}</em></h1>
            <p className="text-[13px] text-white-dim leading-relaxed max-w-xl mx-auto mb-8 font-montserrat">
              {t('Welcome to Tsedeke Grand Hotel,')} <strong className="text-white font-medium">{firstName}</strong>! {t('Your booking is successfully confirmed. A detailed stay schedule and check-in requirements have been sent to')} <strong className="text-gold font-medium">{email}</strong>.
            </p>

            {/* REFERENCE CARD */}
            <AnimatedSection animation="fade-up" delay={200} className="inline-block bg-dark-3 border border-gold/30 px-10 py-5 mb-10 rounded-sm">
              <div className="text-[9px] tracking-[3px] uppercase text-text-dim mb-1">{t('Booking Reference')}</div>
              <div className="font-cinzel text-xl md:text-2xl text-gold tracking-[4px] font-bold">
                {confirmedBooking ? `ADL-${new Date(confirmedBooking.checkIn).getFullYear()}-${confirmedBooking._id.slice(-6).toUpperCase()}` : 'ADL-2026-X7749'}
              </div>
            </AnimatedSection>

            {/* STAY DETAILS BOX */}
            <AnimatedSection animation="fade-up" delay={300} className="max-w-2xl mx-auto bg-dark-2 border border-border-gold/15 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-gold/15 mb-12 rounded-sm shadow-xl">
              <div className="p-6">
                <span className="text-[8px] tracking-[2px] uppercase text-gold block mb-2">{t('Check In')}</span>
                <span className="font-cormorant text-xl text-cream block">{formatDate(checkIn)}</span>
                <span className="text-[9px] text-text-dim mt-1 block">{t('From 14:00')}</span>
              </div>
              <div className="p-6 flex flex-col justify-center items-center">
                <span className="font-cormorant text-4xl text-gold font-bold leading-none">{nights}</span>
                <span className="text-[8px] tracking-[2px] uppercase text-white-dim mt-1.5 font-semibold">{t('Nights Stay')}</span>
              </div>
              <div className="p-6">
                <span className="text-[8px] tracking-[2px] uppercase text-gold block mb-2">{t('Check Out')}</span>
                <span className="font-cormorant text-xl text-cream block">{formatDate(checkOut)}</span>
                <span className="text-[9px] text-text-dim mt-1 block">{t('Before 12:00')}</span>
              </div>
            </AnimatedSection>

            {/* ACTION BUTTONS */}
            <AnimatedSection animation="fade-up" delay={450} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => setShowSuccessModal(true)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold px-8 py-4.5 transition-colors duration-300 rounded-sm shadow-lg cursor-pointer"
              >
                ✦ {t('Show Pop-up Notification')}
              </button>
              <Link
                to="/"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-full sm:w-auto bg-transparent border border-gold hover:bg-gold/10 text-gold font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold px-8 py-4.5 transition-colors duration-300 rounded-sm"
              >
                {t('Return to Home')}
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-full sm:w-auto bg-transparent border border-border-gold/30 hover:border-gold text-white-dim hover:text-white font-cinzel text-[11px] tracking-[2.5px] uppercase font-semibold px-8 py-4.5 transition-colors duration-300 rounded-sm cursor-pointer"
              >
                {t('Print Receipt')}
              </button>
            </AnimatedSection>

            {/* WHAT'S NEXT SECTION */}
            <div className="mt-20 border-t border-border-gold/15 pt-16">
              <span className="text-[9px] tracking-[4px] uppercase text-gold block mb-3 font-semibold">✦ {t('Pre-arrival Guide')}</span>
              <h3 className="font-cormorant text-white text-3xl mb-12 leading-none">{t('What Happens')} <em className="italic text-gold">{t('Next')}</em></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-border-gold/10 p-0.5 rounded-sm overflow-hidden">
                {[
                  { step: '01', icon: '📧', title: 'Check Inbox', text: 'We have dispatched your verification receipt, route directions, and local guide directly.' },
                  { step: '02', icon: '🧳', title: 'Prepare & Pack', text: 'Hossana holds a pleasant weather (10–20°C). Bring light jackets or sweaters for evening walks.' },
                  { step: '03', icon: '🚗', title: 'Travel Concierge', text: 'Situated 230km from Addis Ababa. Direct private airport transfers can be pre-arranged on call.' },
                  { step: '04', icon: '🛎️', title: 'Arrival & Welcome', text: 'Check-in opens at 2PM. Walk up to front desk with your reference code and ID to claim your key.' }
                ].map((item, idx) => (
                  <AnimatedCard key={item.step} index={idx} animation="scale" className="bg-dark-2 p-6.5 text-center relative border border-transparent hover:border-gold/15 transition-colors duration-300">
                    <span className="absolute top-4 right-4 font-cinzel text-xl text-border-gold/30 font-bold">{item.step}</span>
                    <span className="text-3xl mb-4.5 block">{item.icon}</span>
                    <h5 className="font-cinzel text-[10px] tracking-[2px] uppercase text-gold font-semibold mb-3">{t(item.title)}</h5>
                    <p className="text-[10px] text-text-dim leading-relaxed font-light">{t(item.text)}</p>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ─── SUCCESS POPUP MODAL ─── */}
      {showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            onClick={() => setShowSuccessModal(false)}
          />

          {/* Modal Card */}
          <div
            className="relative bg-dark-2 border border-gold/40 rounded-lg max-w-lg w-full p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(201,168,76,0.25)] z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X Button */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-white-dim hover:text-gold w-8 h-8 rounded-full border border-border-gold/20 flex items-center justify-center text-sm transition-colors cursor-pointer"
              aria-label="Close modal"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              ✕
            </button>

            {/* Top Success Icon */}
            <div className="w-20 h-20 mx-auto mb-5 rounded-full border-2 border-gold bg-gold/10 flex items-center justify-center relative shadow-[0_0_25px_rgba(201,168,76,0.3)]">
              <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-3xl text-black font-bold animate-bounce">
                ✓
              </div>
            </div>

            {/* Subtitle / Title */}
            <span className="text-[9px] tracking-[4px] uppercase text-gold font-semibold block mb-1 font-montserrat">
              ✦ {t('Reservation Confirmed')} ✦
            </span>
            <h2 className="font-cormorant text-2xl sm:text-3xl text-white font-medium mb-3">
              {t('You Have Booked Successfully!')}
            </h2>

            {/* Requested exact pop-up notification message */}
            <div className="bg-gold/10 border border-gold/40 rounded-md p-4 mb-6 text-center shadow-lg">
              <p className="font-montserrat text-xs sm:text-sm text-gold-light font-semibold leading-relaxed">
                "{t('You have booked room')} <span className="text-white font-bold">{displayedRoomName}</span> {t('from')} <span className="text-white font-bold">{confirmedBooking?.checkIn ? formatDate(confirmedBooking.checkIn) : formatDate(checkIn)}</span> {t('to')} <span className="text-white font-bold">{confirmedBooking?.checkOut ? formatDate(confirmedBooking.checkOut) : formatDate(checkOut)}</span> {t('successfully. Thank you for choosing Tsedeke Grand Hotel!')}"
              </p>
            </div>

            {/* Booking Reference Box */}
            <div className="bg-dark-3 border border-border-gold/25 rounded-md p-4 mb-6">
              <div className="text-[9px] tracking-[2px] uppercase text-text-dim mb-1 font-montserrat">
                {t('Booking Reference Code')}
              </div>
              <div className="font-cinzel text-xl text-gold font-bold tracking-[3px]">
                {confirmedBooking ? `ADL-${new Date(confirmedBooking.checkIn).getFullYear()}-${confirmedBooking._id.slice(-6).toUpperCase()}` : 'ADL-2026-X7749'}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border-gold/15 text-left text-[11px] font-montserrat">
                <div>
                  <span className="text-text-dim block text-[9px] uppercase tracking-wider">{t('Room')}</span>
                  <span className="text-white font-medium truncate block">{displayedRoomName}</span>
                </div>
                <div>
                  <span className="text-text-dim block text-[9px] uppercase tracking-wider">{t('Dates')}</span>
                  <span className="text-white font-medium block">{confirmedBooking?.checkIn ? formatDate(confirmedBooking.checkIn) : formatDate(checkIn)} - {confirmedBooking?.checkOut ? formatDate(confirmedBooking.checkOut) : formatDate(checkOut)}</span>
                </div>
                <div>
                  <span className="text-text-dim block text-[9px] uppercase tracking-wider">{t('Duration')}</span>
                  <span className="text-white font-medium block">{displayedNights} {displayedNights === 1 ? t('Night') : t('Nights')}</span>
                </div>
                <div>
                  <span className="text-text-dim block text-[9px] uppercase tracking-wider">{t('Total Amount')}</span>
                  <span className="text-gold font-semibold block">{displayedPrice.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-gold hover:bg-gold-light text-black font-cinzel text-[10px] tracking-[2px] uppercase font-bold py-3.5 px-4 rounded transition-colors shadow-md cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t('View Full Summary')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/profile');
                }}
                className="flex-1 bg-transparent hover:bg-gold/10 border border-gold text-gold font-cinzel text-[10px] tracking-[2px] uppercase font-semibold py-3.5 px-4 rounded transition-colors cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t('My Bookings')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Booking;

