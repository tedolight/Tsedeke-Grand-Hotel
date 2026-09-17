import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboard/dashboardService.js';
import messagesService from '../../services/messages/messagesService.js';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NotificationPanel = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('admin_read_notifs') || '[]')); }
    catch { return new Set(); }
  });
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, messagesRes] = await Promise.allSettled([
        dashboardService.getStats(),
        messagesService.getMessages(),
      ]);

      const items = [];

      // Pending bookings
      if (statsRes.status === 'fulfilled') {
        const stats = statsRes.value?.data || statsRes.value;
        const recentBookings = stats?.recentBookings || [];
        const pendingCount = stats?.pendingBookings || 0;
        const pendingList = recentBookings.filter(b => b.status === 'Pending').slice(0, 5);

        if (pendingList.length > 0) {
          pendingList.forEach((b, i) => {
            items.push({
              id: `booking-${b.id || i}`,
              type: 'booking',
              icon: 'fas fa-calendar-check',
              iconColor: 'text-gold',
              iconBg: 'border-gold/20 bg-gold/10',
              title: 'Pending Booking',
              body: `${b.name || 'Guest'} — ${b.room || 'Room'}`,
              time: timeAgo(b.createdAt || b.created_at),
              action: '/bookings',
            });
          });
        } else if (pendingCount > 0) {
          items.push({
            id: `booking-pending-agg`,
            type: 'booking',
            icon: 'fas fa-calendar-check',
            iconColor: 'text-gold',
            iconBg: 'border-gold/20 bg-gold/10',
            title: `${pendingCount} Pending Booking${pendingCount > 1 ? 's' : ''}`,
            body: 'Awaiting review and confirmation',
            time: 'now',
            action: '/bookings',
          });
        }
      }

      // Unread messages
      if (messagesRes.status === 'fulfilled') {
        const msgs = (messagesRes.value || []).filter(m => m.unread).slice(0, 5);
        msgs.forEach(m => {
          items.push({
            id: `msg-${m.id}`,
            type: 'message',
            icon: 'fas fa-envelope',
            iconColor: 'text-[#56CCF2]',
            iconBg: 'border-[#56CCF2]/20 bg-[#56CCF2]/10',
            title: `Message: ${m.subject || 'Inquiry'}`,
            body: `${m.name || 'Guest'} — ${(m.body || '').slice(0, 55)}${(m.body || '').length > 55 ? '…' : ''}`,
            time: m.time || 'just now',
            action: '/messages',
          });
        });
      }

      // Unread first
      items.sort((a, b) => Number(readIds.has(a.id)) - Number(readIds.has(b.id)));
      setNotifications(items);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  // Initial fetch + auto-refresh every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markRead = (id) => {
    setReadIds(prev => {
      const updated = new Set([...prev, id]);
      localStorage.setItem('admin_read_notifs', JSON.stringify([...updated]));
      return updated;
    });
  };

  const markAllRead = (e) => {
    e.stopPropagation();
    setReadIds(prev => {
      const updated = new Set([...prev, ...notifications.map(n => n.id)]);
      localStorage.setItem('admin_read_notifs', JSON.stringify([...updated]));
      return updated;
    });
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setOpen(false);
    navigate(notif.action);
  };

  const handleRefresh = (e) => {
    e.stopPropagation();
    fetchNotifications();
  };

  return (
    <div className="relative" ref={panelRef}>

      {/* ── Bell Button ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className={`btn-3d-bell w-[42px] h-[42px] rounded-md flex items-center justify-center cursor-pointer relative ${
          open ? 'is-open' : ''
        }`}
      >
        {/* Bell icon — 3D gold extrusion */}
        <i
          className="fas fa-bell text-[18px] text-gold"
          style={{
            filter: 'drop-shadow(1px 1px 0 #a07c28) drop-shadow(2px 2px 0 #5c4312) drop-shadow(3px 3px 0 #181103)',
            fontWeight: 900,
          }}
        />

        {/* Count badge — shown whenever unreadCount > 0 */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-gold
              text-black text-[10px] font-extrabold rounded-full
              border-2 border-dark-2
              flex items-center justify-center px-[3px] leading-none"
            style={{ boxShadow: '1px 1px 0 #8a6a1e, 2px 2px 0 #1a1400' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ──────────────────────────────────────── */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[370px] bg-dark-2 border border-border-gold
            rounded-md overflow-hidden z-[999]"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.15)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-gold-soft bg-dark-3">
            <div className="flex items-center gap-2.5">
              <i className="fas fa-bell text-gold text-[11px]" />
              <span className="font-cinzel text-[11px] tracking-[2px] text-[color:var(--text)] font-semibold uppercase">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-gold text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                title="Refresh"
                className="text-text-muted hover:text-gold text-[11px] transition-colors cursor-pointer"
              >
                <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-text-muted hover:text-gold font-semibold tracking-wide
                    transition-colors cursor-pointer whitespace-nowrap"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <i className="fas fa-circle-notch fa-spin text-gold text-xl" />
                <span className="text-[11px] text-text-muted font-semibold">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-14 h-14 rounded-full bg-dark-4 border border-border-gold-soft
                  flex items-center justify-center">
                  <i className="fas fa-bell-slash text-text-muted text-xl" />
                </div>
                <p className="text-[13px] text-[color:var(--text)] font-semibold">All caught up!</p>
                <p className="text-[11px] text-text-muted">No pending notifications right now</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notif, idx) => {
                  const isRead = readIds.has(notif.id);
                  return (
                    <li
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer
                        border-b border-border-gold-soft/30 last:border-0
                        transition-all duration-150 group
                        ${isRead
                          ? 'opacity-55 hover:opacity-75 hover:bg-dark-4/50'
                          : 'bg-gold/[0.025] hover:bg-gold/[0.055]'
                        }`}
                    >
                      {/* Icon */}
                      <div className={`w-[36px] h-[36px] rounded-full border flex items-center
                        justify-center shrink-0 mt-0.5 ${notif.iconBg}`}>
                        <i className={`${notif.icon} text-[12px] ${notif.iconColor}`} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[12px] font-semibold leading-snug truncate
                            group-hover:text-[color:var(--text)] transition-colors
                            ${isRead ? 'text-text-muted' : 'text-[color:var(--text)]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-text-muted shrink-0 mt-0.5 font-semibold">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-snug line-clamp-2">
                          {notif.body}
                        </p>
                        <span className={`inline-block mt-1.5 text-[9px] font-extrabold uppercase
                          tracking-[1px] px-1.5 py-0.5 rounded-sm
                          ${notif.type === 'booking'
                            ? 'text-gold bg-gold/10'
                            : 'text-[#56CCF2] bg-[#56CCF2]/10'
                          }`}>
                          {notif.type}
                        </span>
                      </div>

                      {/* Unread dot */}
                      {!isRead && (
                        <span className="w-2 h-2 bg-gold rounded-full shrink-0 mt-2" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer quick links */}
          <div className="border-t border-border-gold-soft bg-dark-3 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => { setOpen(false); navigate('/bookings'); }}
              className="text-[10px] text-text-muted hover:text-gold font-semibold tracking-wide
                transition-colors cursor-pointer"
            >
              All Bookings
            </button>
            <div className="w-px h-3 bg-border-gold-soft" />
            <button
              onClick={() => { setOpen(false); navigate('/messages'); }}
              className="text-[10px] text-text-muted hover:text-gold font-semibold tracking-wide
                transition-colors cursor-pointer"
            >
              All Messages
            </button>
            <div className="w-px h-3 bg-border-gold-soft" />
            <button
              onClick={() => { setOpen(false); navigate('/'); }}
              className="text-[10px] text-text-muted hover:text-gold font-semibold tracking-wide
                transition-colors cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
