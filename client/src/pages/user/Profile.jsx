import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import useBookingStore from '../../store/booking/bookingStore.js';
import useUiStore from '../../store/ui/themeStore.js';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';
import useSettingsStore from '../../store/settings/settingsStore.js';

const STATUS_COLORS = {
  confirmed: 'text-green-400 bg-green-900/20 border-green-500/25',
  pending: 'text-amber-400 bg-amber-900/20 border-amber-500/25',
  cancelled: 'text-red-400 bg-red-900/20 border-red-500/25',
  completed: 'text-blue-400 bg-blue-900/20 border-blue-500/25',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Profile = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { myBookings, fetchMyBookings, cancelBooking, loading } = useBookingStore();
  const { setCursorHovered, addToast } = useUiStore();
  const { hotelSettings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('bookings');
  const [cancellingId, setCancellingId] = useState(null);

  const hover = {
    onMouseEnter: () => setCursorHovered(true),
    onMouseLeave: () => setCursorHovered(false),
  };

  useEffect(() => {
    document.title = 'My Profile — Tsedeke Grand Hotel';
    if (!isAuthenticated && !localStorage.getItem('token')) {
      navigate('/');
      return;
    }
    fetchMyBookings();
  }, [isAuthenticated, navigate, fetchMyBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    const ok = await cancelBooking(id);
    setCancellingId(null);
    if (ok) {
      addToast('Booking cancelled successfully.', 'success');
    } else {
      addToast('Failed to cancel booking. Please contact the front desk.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('You have been signed out.', 'info');
    navigate('/');
  };

  if (!user && !localStorage.getItem('token')) {
    return null;
  }

  return (
    <div className="profile-page select-none min-h-screen">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[220px] flex items-end pb-12 px-6 md:px-15 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-dark-4/90 to-black opacity-95 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_5%_50%,rgba(201,168,76,0.07)_0%,transparent_70%)] z-0" />
        <div className="absolute inset-0 opacity-[0.015] z-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_60px,#C9A84C_60px,#C9A84C_61px)]" />

        <div className="page-hero relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 max-w-7xl mx-auto">
          <div>
            <span className="text-[10px] tracking-[6px] uppercase text-gold mb-3 block">{t('✦ Guest Account')}</span>
            <h1 className="text-4xl md:text-5xl font-cormorant font-light text-white leading-none">
              {t('Welcome,')} <em className="italic text-gold">{user?.name?.split(' ')[0] || 'Guest'}</em>
            </h1>
          </div>
          <div className="text-[10px] tracking-[2px] uppercase text-white-dim flex items-center gap-2">
            <Link to="/" {...hover} className="text-gold hover:text-gold-light transition-colors no-underline">{t('Home')}</Link>
            <span>›</span>
            <span>{t('My Profile')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-15 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          {/* LEFT SIDEBAR */}
          <div className="space-y-4">
            {/* User Card */}
            <div className="bg-dark-2 border border-border-gold/20 p-6 rounded-sm text-center">
              <div className="w-20 h-20 bg-gold text-black rounded-full flex items-center justify-center font-cinzel text-2xl font-bold mx-auto mb-4 shadow-lg">
                {user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
              </div>
              <h3 className="font-cormorant text-xl text-white font-medium">{user?.name || '—'}</h3>
              <p className="text-[11px] text-text-dim mt-1 font-montserrat">{user?.email || '—'}</p>
              {user?.phone && (
                <p className="text-[11px] text-text-dim mt-0.5 font-montserrat">{user.phone}</p>
              )}
              <div className="mt-4 pt-4 border-t border-border-gold/15">
                <span className="text-[9px] tracking-[2px] uppercase text-gold font-semibold px-3 py-1 bg-gold/10 rounded-sm border border-gold/20">
                  {user?.role === 'admin' ? 'Administrator' : 'Guest Member'}
                </span>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-dark-2 border border-border-gold/20 rounded-sm overflow-hidden">
              {[
                { id: 'bookings', icon: 'fa-calendar-check', label: 'My Bookings' },
                { id: 'info', icon: 'fa-user', label: 'Account Info' },
                ...(user?.role === 'admin' ? [{ id: 'dining', icon: 'fa-clock', label: 'Dining Hours' }] : [])
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  {...hover}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-[11px] tracking-[1.5px] uppercase font-montserrat font-semibold text-left border-b border-border-gold/10 last:border-0 transition-colors ${
                    activeTab === item.id
                      ? 'text-gold bg-gold/5 border-l-2 border-l-gold'
                      : 'text-white-dim hover:text-gold hover:bg-dark-3'
                  }`}
                >
                  <i className={`fas ${item.icon} text-sm w-4`} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-dark-2 border border-border-gold/20 p-5 rounded-sm">
              <h4 className="text-[9px] tracking-[2px] uppercase text-gold font-semibold mb-4">{t('Quick Links')}</h4>
              <div className="space-y-3">
                <Link to="/booking" {...hover} className="flex items-center gap-2 text-[12px] text-white-dim hover:text-gold transition-colors no-underline font-montserrat">
                  <i className="fas fa-plus text-gold text-xs w-4" />
                  {t('New Booking')}
                </Link>
                <Link to="/rooms" {...hover} className="flex items-center gap-2 text-[12px] text-white-dim hover:text-gold transition-colors no-underline font-montserrat">
                  <i className="fas fa-bed text-gold text-xs w-4" />
                  {t('Browse Rooms')}
                </Link>
                <Link to="/contact" {...hover} className="flex items-center gap-2 text-[12px] text-white-dim hover:text-gold transition-colors no-underline font-montserrat">
                  <i className="fas fa-phone text-gold text-xs w-4" />
                  {t('Contact Concierge')}
                </Link>
              </div>
            </div>

            <button
              onClick={handleLogout}
              {...hover}
              className="w-full border border-red-500/20 text-red-400 hover:bg-red-900/10 hover:border-red-400/40 py-3 text-[10px] tracking-[2px] uppercase font-semibold font-montserrat transition-colors rounded-sm"
            >
              <i className="fas fa-sign-out-alt mr-2" />
              {t('Sign Out')}
            </button>
          </div>

          {/* MAIN CONTENT */}
          <div>
            {/* MY BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-cormorant text-3xl text-white font-light">{t('My Reservations')}</h2>
                    <p className="text-[11px] text-text-dim font-montserrat mt-1">
                      {myBookings.length > 0 ? `${myBookings.length} booking${myBookings.length !== 1 ? 's' : ''} found` : 'No bookings yet'}
                    </p>
                  </div>
                  <Link
                    to="/booking"
                    {...hover}
                    className="btn-primary text-[10px] tracking-[2px] no-underline px-6 py-3"
                  >
                    <span>{t('+ New Booking')}</span>
                  </Link>
                </div>

                {loading && (
                  <div className="text-center py-16">
                    <div className="w-10 h-10 border border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[12px] text-text-dim font-montserrat">{t('Loading your bookings...')}</p>
                  </div>
                )}

                {!loading && myBookings.length === 0 && (
                  <div className="bg-dark-2 border border-border-gold/15 rounded-sm p-16 text-center">
                    <div className="text-5xl mb-5">🛏️</div>
                    <h3 className="font-cormorant text-2xl text-white mb-2">{t('No bookings yet')}</h3>
                    <p className="text-[13px] text-text-dim font-montserrat mb-6">
                      {t('You haven\'t made any reservations with us yet. Let\'s change that!')}
                    </p>
                    <Link to="/booking" {...hover} className="btn-primary no-underline">
                      <span>{t('Book Your First Stay')}</span>
                    </Link>
                  </div>
                )}

                <div className="space-y-4">
                  {myBookings.map((booking) => {
                    const statusKey = (booking.status || 'pending').toLowerCase();
                    const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;
                    const roomName = booking.room?.name || booking.roomName || 'Hotel Room';
                    const roomImg = booking.room?.images?.[0] || null;
                    const nights = booking.checkIn && booking.checkOut
                      ? Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)))
                      : 1;
                    const canCancel = statusKey === 'confirmed' || statusKey === 'pending';

                    return (
                      <div
                        key={booking._id}
                        className="bg-dark-2 border border-border-gold/15 rounded-sm overflow-hidden hover:border-border-gold/30 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-0">
                          {/* Room Image */}
                          <div className="h-40 md:h-full min-h-[120px] bg-dark-3 overflow-hidden">
                            {roomImg ? (
                              <img
                                src={roomImg}
                                alt={roomName}
                                className="w-full h-full object-cover filter brightness-75"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
                            )}
                          </div>

                          {/* Booking Info */}
                          <div className="p-5 font-montserrat">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`text-[9px] tracking-[1.5px] uppercase font-semibold px-2.5 py-1 rounded-sm border ${statusStyle}`}>
                                {booking.status || 'Pending'}
                              </span>
                              <span className="text-[9px] tracking-[1px] text-text-dim">
                                Ref: ADL-{booking._id?.slice(-6)?.toUpperCase() || 'XXXXXX'}
                              </span>
                            </div>
                            <h3 className="font-cormorant text-xl text-white font-medium mb-3">{roomName}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                              <div>
                                <div className="text-[8px] tracking-[2px] uppercase text-text-dim">{t('Check In')}</div>
                                <div className="text-[12px] text-white font-medium mt-0.5">{formatDate(booking.checkIn)}</div>
                              </div>
                              <div>
                                <div className="text-[8px] tracking-[2px] uppercase text-text-dim">{t('Check Out')}</div>
                                <div className="text-[12px] text-white font-medium mt-0.5">{formatDate(booking.checkOut)}</div>
                              </div>
                              <div>
                                <div className="text-[8px] tracking-[2px] uppercase text-text-dim">{t('Duration')}</div>
                                <div className="text-[12px] text-white font-medium mt-0.5">{nights} Night{nights !== 1 ? 's' : ''}</div>
                              </div>
                              {booking.guests && (
                                <div>
                                  <div className="text-[8px] tracking-[2px] uppercase text-text-dim">{t('Guests')}</div>
                                  <div className="text-[12px] text-white font-medium mt-0.5">{booking.guests} person{booking.guests !== 1 ? 's' : ''}</div>
                                </div>
                              )}
                              {booking.totalPrice && (
                                <div>
                                  <div className="text-[8px] tracking-[2px] uppercase text-text-dim">{t('Total Paid')}</div>
                                  <div className="text-[12px] text-gold font-semibold mt-0.5">{Number(booking.totalPrice).toLocaleString()} ETB</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-5 flex flex-row md:flex-col justify-end md:justify-center items-end gap-3 border-t md:border-t-0 md:border-l border-border-gold/10">
                            {canCancel && (
                              <button
                                onClick={() => handleCancel(booking._id)}
                                disabled={cancellingId === booking._id}
                                {...hover}
                                className="text-[9px] tracking-[1.5px] uppercase border border-red-500/25 text-red-400 hover:bg-red-900/15 hover:border-red-400/50 px-4 py-2 transition-colors rounded-sm font-semibold font-montserrat disabled:opacity-40"
                              >
                                {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            )}
                            <button
                              onClick={() => window.print()}
                              {...hover}
                              className="text-[9px] tracking-[1.5px] uppercase border border-border-gold/20 text-white-dim hover:border-gold hover:text-gold px-4 py-2 transition-colors rounded-sm font-semibold font-montserrat"
                            >
                              {t('Receipt')}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACCOUNT INFO TAB */}
            {activeTab === 'info' && (
              <div>
                <h2 className="font-cormorant text-3xl text-white font-light mb-6">{t('Account Information')}</h2>
                <div className="bg-dark-2 border border-border-gold/20 rounded-sm overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
                  <div className="p-8 space-y-6 font-montserrat">
                    {[
                      { label: 'Full Name', value: user?.name },
                      { label: 'Email Address', value: user?.email },
                      { label: 'Phone Number', value: user?.phone || 'Not provided' },
                      { label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
                      { label: 'Account Role', value: user?.role === 'admin' ? 'Administrator' : 'Guest Member' },
                    ].map((field) => (
                      <div key={field.label} className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-border-gold/10 last:border-0">
                        <span className="text-[9px] tracking-[2px] uppercase text-text-dim pt-0.5">{field.label}</span>
                        <span className="text-[13px] text-white">{field.value || '—'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 pt-0">
                    <div className="bg-gold/5 border border-gold/15 rounded-sm p-5 font-montserrat">
                      <p className="text-[11px] text-text-dim leading-relaxed">
                        <strong className="text-gold">{t('Need to update your information?')}</strong> Please contact our front desk directly at{' '}
                        <a href={`tel:${hotelSettings.mainPhone || '+251909517777'}`} className="text-gold hover:text-gold-light">{hotelSettings.mainPhone || '+251 90 951 7777'}</a> or email{' '}
                        <a href={`mailto:${hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}`} className="text-gold hover:text-gold-light">{hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DINING SETTINGS TAB (ADMIN ONLY) */}
            {activeTab === 'dining' && user?.role === 'admin' && (
              <DiningSettingsPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DiningSettingsPanel = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([
    { icon: '🌅', name: 'Breakfast', time: '06:00 – 10:30', desc: 'Daily · All guests welcome. Buffet & à la carte options.' },
    { icon: '☀️', name: 'Lunch', time: '12:00 – 15:00', desc: 'Daily · Open to public. Executive set menu available.' },
    { icon: '🌙', name: 'Dinner', time: '18:00 – 22:30', desc: 'Daily · Reservation advised. À la carte & tasting menus.' },
    { icon: '☕', name: 'Coffee Bar', time: '07:00 – 23:00', desc: 'Daily · Walk-in welcome. Traditional ceremony daily.' }
  ]);
  const [saving, setSaving] = useState(false);
  const { addToast, setCursorHovered } = useUiStore();

  const hover = {
    onMouseEnter: () => setCursorHovered(true),
    onMouseLeave: () => setCursorHovered(false),
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/admin/settings/dining_hours');
        const val = unwrapData(res);
        if (val && Array.isArray(val) && val.length > 0) {
          setItems(val);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings/dining_hours', items);
      addToast('Dining hours updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      addToast('Failed to save dining hours settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const emojiList = ['🌅', '☀️', '🌙', '☕', '🍳', '🥪', '🍷', '🍰', '🍽️', '🥣'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl text-white font-light">{t('Dining Hours Settings')}</h2>
        <p className="text-[11px] text-text-dim font-montserrat mt-1">
          {t('Customize the restaurant service timings, descriptions, and icons shown on the public restaurant page.')}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-dark-2 border border-border-gold/20 rounded-sm p-6 relative">
            <h3 className="font-cormorant text-xl text-gold font-medium mb-4">Service #{index + 1}: {item.name || 'Untitled'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-montserrat text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] tracking-[1.5px] uppercase text-text-dim mb-1 font-semibold">{t('Service Name')}</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold/20 focus:border-gold px-4 py-2.5 text-white font-montserrat text-sm rounded-sm outline-none transition-colors"
                    placeholder={t('e.g. Breakfast')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[1.5px] uppercase text-text-dim mb-1 font-semibold">{t('Service Hours')}</label>
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleChange(index, 'time', e.target.value)}
                    className="w-full bg-dark-3 border border-border-gold/20 focus:border-gold px-4 py-2.5 text-white font-montserrat text-sm rounded-sm outline-none transition-colors"
                    placeholder={t('e.g. 06:00 – 10:30')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[1.5px] uppercase text-text-dim mb-1 font-semibold">{t('Service Icon')}</label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => handleChange(index, 'icon', e.target.value)}
                      className="w-16 text-center bg-dark-3 border border-border-gold/20 focus:border-gold px-2 py-2.5 text-white font-montserrat text-sm rounded-sm outline-none transition-colors"
                    />
                    <div className="flex flex-wrap gap-1">
                      {emojiList.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleChange(index, 'icon', emoji)}
                          className={`w-8 h-8 rounded-sm bg-dark-3 border border-border-gold/10 hover:border-gold transition-colors flex items-center justify-center text-sm ${item.icon === emoji ? 'border-gold bg-gold/10' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[1.5px] uppercase text-text-dim mb-1 font-semibold">{t('Service Description')}</label>
                <textarea
                  value={item.desc}
                  onChange={(e) => handleChange(index, 'desc', e.target.value)}
                  className="w-full h-[170px] bg-dark-3 border border-border-gold/20 focus:border-gold px-4 py-2.5 text-white font-montserrat text-sm rounded-sm outline-none transition-colors resize-none"
                  placeholder={t('e.g. Daily · All guests welcome...')}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          {...hover}
          className="btn-primary px-8 py-4 text-xs font-semibold tracking-[2px] uppercase flex items-center gap-2"
        >
          <span>{saving ? 'Saving Timings...' : 'Save Dining Hours'}</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
