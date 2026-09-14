import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import usersService from '../../services/users/usersService.js';

const mapDbUserDetail = (data) => {
  const user = data.user || data;
  const profile = data.profile || {};
  const nameParts = (user.name || 'Unknown User').trim().split(/\s+/);
  const first = nameParts[0] || 'Unknown';
  const last = nameParts.slice(1).join(' ') || 'User';

  return {
    id: user._id || user.id,
    first,
    last,
    email: user.email,
    phone: profile.phone || user.phone || '+251 900 000 000',
    role: profile.detailedRole || (user.role === 'admin' ? 'admin' : 'staff'),
    status: profile.status || 'active',
    dept: profile.dept || (user.role === 'admin' ? 'Management' : 'Front Desk'),
    lastActive: 'Just now',
    joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
    location: profile.location || 'Addis Ababa, Ethiopia',
    notes: profile.notes || 'No notes logged.'
  };
};

const STORAGE_KEY = 'tsedeke_grand_admin_users';
const avatarColors = ['#2D4A6B', '#4A2D6B', '#2D6B4A', '#6B4A2D', '#6B2D4A', '#2D6B6B', '#4A6B2D', '#6B6B2D'];

// Initial backup users list (removed)
const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState('suspend'); // suspend, reset, delete
  const [toastMsg, setToastMsg] = useState('');
  const [isToastShow, setIsToastShow] = useState(false);

  // Edit User Form state
  const [editForm, setEditForm] = useState({
    first: '',
    last: '',
    email: '',
    phone: '',
    role: '',
    dept: '',
    status: '',
    location: 'Addis Ababa, Ethiopia',
    notes: 'Handles morning shift front desk. Excellent with VIP check-ins. Completed advanced booking system training Nov 2024.'
  });

  useEffect(() => {
    const loadUserDetail = async () => {
      setLoading(true);
      try {
        const res = await usersService.getUserById(id);
        const mapped = mapDbUserDetail(res.data || res);
        setUser(mapped);
      } catch (err) {
        console.error(err);
        triggerToast('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    loadUserDetail();
  }, [id]);

  // Populate Edit form when user changes or modal opens
  useEffect(() => {
    if (user) {
      setEditForm({
        first: user.first,
        last: user.last,
        email: user.email,
        phone: user.phone || '+251 911 234 567',
        role: user.role,
        dept: user.dept,
        status: user.status,
        location: user.location || 'Addis Ababa, Ethiopia',
        notes: user.notes || ''
      });
    }
  }, [user, isEditOpen]);

  // Check URL query parameters (e.g., ?edit=true) to open edit modal on load
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditOpen(true);
    }
  }, [searchParams]);

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setIsToastShow(true);
    setTimeout(() => {
      setIsToastShow(false);
    }, 2800);
  };

  // Activity Log State
  const [activities, setActivities] = useState([
    { id: 1, type: 'login', iconClass: 'fas fa-sign-in-alt', text: 'Logged in from Chrome / macOS · IP 197.156.xx.xx', time: 'Today, 09:42 AM' },
    { id: 2, type: 'edit', iconClass: 'fas fa-edit', text: 'Updated booking #BK-2024-0891 — changed check-in date', time: 'Today, 09:15 AM' },
    { id: 3, type: 'view', iconClass: 'fas fa-eye', text: 'Viewed revenue report for November 2024', time: 'Yesterday, 04:30 PM' },
    { id: 4, type: 'edit', iconClass: 'fas fa-bed', text: 'Created new booking #BK-2024-0890 for guest Sara K. — Suite 204', time: 'Yesterday, 02:11 PM' },
    { id: 5, type: 'export', iconClass: 'fas fa-file-export', text: 'Exported guest list as CSV — 142 records', time: 'Yesterday, 11:48 AM' },
    { id: 6, type: 'delete', iconClass: 'fas fa-trash', text: 'Cancelled reservation #BK-2024-0877 — guest request', time: 'Dec 18, 2024 · 03:22 PM' },
    { id: 7, type: 'edit', iconClass: 'fas fa-utensils', text: 'Added new menu item "Tibs Firfir" to Restaurant section', time: 'Dec 17, 2024 · 10:05 AM' },
    { id: 8, type: 'login', iconClass: 'fas fa-sign-in-alt', text: 'Logged in from Safari / iPhone · IP 197.156.xx.xx', time: 'Dec 16, 2024 · 08:59 AM' }
  ]);
  const [isExtraLoaded, setIsExtraLoaded] = useState(false);

  const handleLoadMoreActivities = () => {
    if (isExtraLoaded) return;
    setIsExtraLoaded(true);
    const extra = [
      { id: 9, type: 'view', iconClass: 'fas fa-eye', text: 'Viewed guest profile — Sara Kebede', time: 'Dec 15, 2024 · 02:44 PM' },
      { id: 10, type: 'edit', iconClass: 'fas fa-image', text: 'Uploaded 4 images to Gallery / Lobby', time: 'Dec 14, 2024 · 11:20 AM' },
      { id: 11, type: 'login', iconClass: 'fas fa-sign-in-alt', text: 'Logged in from Chrome / macOS · IP 197.156.xx.xx', time: 'Dec 14, 2024 · 09:01 AM' },
      { id: 12, type: 'edit', iconClass: 'fas fa-star', text: 'Created event "Ethiopian New Year Gala" for Jan 11, 2025', time: 'Dec 12, 2024 · 03:15 PM' }
    ];
    setActivities(prev => [...prev, ...extra]);
  };

  // Sessions state
  const [sessions, setSessions] = useState([
    { id: 'session-1', icon: 'fas fa-laptop', device: 'Chrome — macOS', meta: '197.156.xx.xx · Addis Ababa · Active now', current: true },
    { id: 'session-2', icon: 'fas fa-mobile-alt', device: 'Safari — iPhone 15', meta: '197.156.xx.xx · Addis Ababa · 3 hr ago', current: false },
    { id: 'session-3', icon: 'fas fa-tablet-alt', device: 'Chrome — iPad', meta: '197.156.xx.xx · Addis Ababa · 2 days ago', current: false }
  ]);

  const handleRevokeSession = (sessId, device) => {
    setSessions(prev => prev.filter(s => s.id !== sessId));
    triggerToast(`Session revoked for ${device}`);
  };

  const handleRevokeAllSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
    triggerToast('All other sessions revoked');
  };

  // Notes state
  const handleSaveNotes = () => {
    triggerToast('Note saved successfully');
  };

  // Confirm Modal Config
  const confirmConfig = {
    suspend: {
      icon: 'fa-ban',
      title: 'Suspend Account?',
      text: `This will immediately revoke access for ${user?.first} ${user?.last}. They will not be able to log in until reactivated.`,
      btn: 'Yes, Suspend',
      toast: 'Account suspended successfully'
    },
    reset: {
      icon: 'fa-key',
      title: 'Reset Password?',
      text: `A one-time password reset link will be sent to ${user?.email}. The current password remains active until the link is used.`,
      btn: 'Send Reset Link',
      toast: 'Reset link sent to email'
    }
  };

  const handleOpenConfirm = (action) => {
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const handleDoConfirm = async () => {
    setIsConfirmOpen(false);
    if (confirmAction === 'suspend') {
      setUser(prev => ({ ...prev, status: 'suspended' }));
      triggerToast('Account suspended');
    } else if (confirmAction === 'reset') {
      triggerToast(`Reset link sent to ${user?.email}`);
    }
  };

  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await usersService.updateUser(id, editForm);
      setUser(prev => ({
        ...prev,
        first: editForm.first,
        last: editForm.last,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        dept: editForm.dept,
        status: editForm.status,
        location: editForm.location,
        notes: editForm.notes
      }));
      setIsEditOpen(false);
      triggerToast('User updated successfully');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update user');
    }
  };

  // Helpers
  const roleLabel = (r) => {
    return {
      superadmin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      staff: 'Staff',
      readonly: 'Read-only'
    }[r] || r;
  };

  const initials = (u) => {
    return (u.first[0] + u.last[0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-text-muted" style={{ height: '300px' }}>
        <i className="fas fa-spinner fa-spin text-2xl mr-3 text-gold animate-spin"></i>
        <span>Loading user profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center text-text-muted">
        <p>User not found.</p>
        <Link to="/users" className="btn btn-gold mt-4 display inline-block">Back to Users</Link>
      </div>
    );
  }

  const getAvatarColor = (userId) => {
    if (!userId) return avatarColors[0];
    let num = 0;
    if (typeof userId === 'number') {
      num = userId;
    } else {
      const str = String(userId);
      for (let i = 0; i < str.length; i++) {
        num += str.charCodeAt(i);
      }
    }
    return avatarColors[num % avatarColors.length];
  };

  const avaColVal = getAvatarColor(user.id);

  return (
    <div className="space-y-6 font-montserrat">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <Link to="/users" className="back-btn"><i className="fas fa-arrow-left"></i> Back to Users</Link>
          <div className="page-heading">User Detail</div>
          <div className="page-sub">Full profile, permissions and activity for this admin account</div>
        </div>
        <div className="header-actions">
          {user.status === 'active' ? (
            <button className="btn btn-outline cursor-pointer" onClick={() => handleOpenConfirm('suspend')}>
              <i className="fas fa-ban"></i> Suspend
            </button>
          ) : (
            <button 
              className="btn btn-outline cursor-pointer" 
              onClick={() => {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
                triggerToast('Account activated');
              }}
            >
              <i className="fas fa-check-circle"></i> Activate
            </button>
          )}
          <button className="btn btn-outline cursor-pointer" onClick={() => handleOpenConfirm('reset')}>
            <i className="fas fa-key"></i> Reset Password
          </button>
          <button className="btn btn-gold cursor-pointer" onClick={() => setIsEditOpen(true)}>
            <i className="fas fa-edit"></i> Edit User
          </button>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="hero-card">
        <div className="hero-inner">
          <div className="hero-avatar-wrap">
            <div className="hero-avatar text-white" style={{ background: avaColVal }}>{initials(user)}</div>
            <div className={`hero-avatar-status ${user.status}`}></div>
          </div>
          <div className="hero-info">
            <div className="hero-name">{user.first} {user.last}</div>
            <div className="hero-email">{user.email} · {user.phone || '+251 911 234 567'}</div>
            <div className="hero-meta">
              <span className={`role-badge ${user.role}`}>
                <i className="fas fa-shield-alt mr-1"></i> {roleLabel(user.role)}
              </span>
              <span className={`status-pill ${user.status}`}>
                <span className="dot"></span> {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
              <span className="dept-pill rounded">
                <i className="fas fa-door-open" style={{ fontSize: '0.68rem', color: 'var(--gold)' }}></i> {user.dept}
              </span>
              <span className="dept-pill rounded">
                <i className="fas fa-map-marker-alt" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}></i> {user.location || 'Addis Ababa, Ethiopia'}
              </span>
            </div>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-val">247</span>
            <span className="hero-stat-lbl">Actions Logged</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">38</span>
            <span className="hero-stat-lbl">Bookings Handled</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">12</span>
            <span className="hero-stat-lbl">Reports Generated</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">99.1%</span>
            <span className="hero-stat-lbl">Uptime</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">186</span>
            <span className="hero-stat-lbl">Days Active</span>
          </div>
        </div>
      </div>

      {/* Main Detail Grid Layout */}
      <div className="detail-grid">
        
        {/* Left Column */}
        <div className="left-col">
          
          {/* Personal Info Card */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-user"></i> Personal Information</div>
              <a className="section-action" onClick={() => setIsEditOpen(true)}><i className="fas fa-edit"></i> Edit</a>
            </div>
            <div className="section-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">First Name</span>
                  <span className="info-val">{user.first}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Name</span>
                  <span className="info-val">{user.last}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-val"><a href={`mailto:${user.email}`}>{user.email}</a></span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-val">{user.phone || '+251 911 234 567'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-val">{user.dept}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-val">
                    <span className={`role-badge ${user.role}`}>{roleLabel(user.role)}</span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date Joined</span>
                  <span className="info-val mono">{user.joined}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Active</span>
                  <span className="info-val mono">{user.lastActive}</span>
                </div>
                <div className="info-item full">
                  <span className="info-label">User ID</span>
                  <span className="info-val mono" style={{ color: 'var(--text-muted)' }}>#USR-2024-000{user.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Access Permissions Card */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-lock"></i> Access Permissions</div>
              <a className="section-action" onClick={() => setIsEditOpen(true)}><i className="fas fa-sliders-h"></i> Manage</a>
            </div>
            <div className="section-body">
              <div className="perm-grid">
                {[
                  { name: 'Bookings', sub: 'View, create and manage room bookings', perm: user.role === 'readonly' ? 'view' : 'full' },
                  { name: 'Room Management', sub: 'Add, edit and configure rooms', perm: ['superadmin', 'admin'].includes(user.role) ? 'full' : (user.role === 'manager' ? 'view' : 'none') },
                  { name: 'Restaurant', sub: 'Manage menus, reservations and orders', perm: ['superadmin', 'admin', 'manager'].includes(user.role) ? 'full' : 'none' },
                  { name: 'Events', sub: 'Create and manage hotel events', perm: ['superadmin', 'admin', 'manager'].includes(user.role) ? 'full' : 'none' },
                  { name: 'User Management', sub: 'Add, edit or delete admin accounts', perm: user.role === 'superadmin' ? 'full' : 'none' },
                  { name: 'Financial Reports', sub: 'Access revenue and billing data', perm: ['superadmin', 'admin'].includes(user.role) ? 'full' : (user.role === 'manager' ? 'view' : 'none') },
                  { name: 'Gallery & Content', sub: 'Upload and manage media files', perm: user.role !== 'readonly' ? 'full' : 'none' },
                  { name: 'Settings', sub: 'Hotel configuration and preferences', perm: ['superadmin', 'admin'].includes(user.role) ? 'full' : 'none' }
                ].map((item, idx) => (
                  <div key={idx} className="perm-row">
                    <div>
                      <div className="perm-name">{item.name}</div>
                      <div className="perm-sub">{item.sub}</div>
                    </div>
                    <div className="perm-toggle">
                      {item.perm === 'full' && <span className="perm-chip on">Full</span>}
                      {item.perm === 'view' && <span className="perm-chip view-only">View</span>}
                      {item.perm === 'none' && <span className="perm-chip off">None</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Log Card */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-history"></i> Activity Log</div>
              <a className="section-action" onClick={() => triggerToast('Log exported successfully')}><i className="fas fa-download"></i> Export Log</a>
            </div>
            <div className="section-body">
              <div className="activity-list">
                {activities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className={`activity-icon ${act.type}`}><i className={act.iconClass}></i></div>
                    <div className="activity-body">
                      <div className="activity-text" dangerouslySetInnerHTML={{ __html: act.text }}></div>
                      <div className="activity-time">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="load-more" 
                onClick={handleLoadMoreActivities}
                disabled={isExtraLoaded}
                style={isExtraLoaded ? { opacity: 0.4, cursor: 'default' } : {}}
              >
                <i className="fas fa-chevron-down"></i> &nbsp;{isExtraLoaded ? 'No more activity' : 'Load more activity'}
              </button>
            </div>
          </div>

        </div> {/* /left-col */}

        {/* Right Column */}
        <div className="right-col">
          
          {/* Quick Stats Card */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-chart-bar"></i> This Month</div>
            </div>
            <div className="qs-grid">
              <div className="qs-item">
                <span className="qs-icon"><i className="fas fa-calendar-check"></i></span>
                <span className="qs-val">{user.role === 'readonly' ? '0' : '14'}</span>
                <div className="qs-lbl">Bookings</div>
              </div>
              <div className="qs-item">
                <span className="qs-icon"><i className="fas fa-file-alt"></i></span>
                <span className="qs-val">{['superadmin', 'admin'].includes(user.role) ? '3' : '0'}</span>
                <div className="qs-lbl">Reports</div>
              </div>
              <div className="qs-item">
                <span className="qs-icon"><i className="fas fa-sign-in-alt"></i></span>
                <span className="qs-val">28</span>
                <div className="qs-lbl">Logins</div>
              </div>
              <div className="qs-item">
                <span className="qs-icon"><i className="fas fa-edit"></i></span>
                <span className="qs-val">{user.role === 'readonly' ? '2' : '61'}</span>
                <div className="qs-lbl">Edits</div>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-shield-alt"></i> Account Security</div>
            </div>
            <div className="section-body">
              <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="info-item" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <span className="info-label">Two-Factor Auth</span>
                  <span className="info-val" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ color: 'var(--success)', fontSize: '0.78rem' }}><i className="fas fa-check-circle"></i></span>
                    <span style={{ fontSize: '0.82rem' }}>Enabled (Authenticator App)</span>
                  </span>
                </div>
                <div className="info-item" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <span className="info-label">Last Password Change</span>
                  <span className="info-val mono">Nov 02, 2024</span>
                </div>
                <div className="info-item" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <span className="info-label">Failed Login Attempts</span>
                  <span className="info-val" style={{ color: 'var(--success)' }}>0 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(last 30 days)</span></span>
                </div>
                <div className="info-item">
                  <span className="info-label">Password Strength</span>
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                      <div className="h-[3px] flex-1 bg-[var(--success)]"></div>
                      <div className="h-[3px] flex-1 bg-[var(--success)]"></div>
                      <div className="h-[3px] flex-1 bg-[var(--success)]"></div>
                      <div className="h-[3px] flex-1 bg-[var(--success)]"></div>
                      <div className="h-[3px] flex-1 bg-[var(--border)]"></div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>Strong</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-desktop"></i> Active Sessions</div>
              {sessions.length > 1 && (
                <a className="section-action" onClick={handleRevokeAllSessions}><i className="fas fa-times-circle"></i> Revoke All</a>
              )}
            </div>
            <div className="section-body">
              {sessions.map((sess) => (
                <div key={sess.id} className="session-item">
                  <div className="session-icon"><i className={sess.icon}></i></div>
                  <div className="session-info">
                    <div className="session-device">{sess.device}</div>
                    <div className="session-meta">{sess.meta}</div>
                  </div>
                  {sess.current ? (
                    <span className="session-badge current">Current</span>
                  ) : (
                    <button className="revoke-btn" onClick={() => handleRevokeSession(sess.id, sess.device)}>Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes Card */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-sticky-note"></i> Internal Notes</div>
              <a className="section-action" onClick={handleSaveNotes}><i className="fas fa-save"></i> Save</a>
            </div>
            <div className="section-body">
              <textarea 
                className="field-input" 
                rows="4" 
                style={{ resize: 'vertical', fontSize: '0.82rem', lineHeight: '1.6' }} 
                placeholder="Add private notes about this user (only visible to Super Admins)…"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="section-card danger-zone">
            <div className="section-head">
              <div className="section-title"><i className="fas fa-exclamation-triangle"></i> Danger Zone</div>
            </div>
            <div className="section-body">
              <div className="dz-item">
                <div className="dz-text">
                  <div className="dz-name">Suspend Account</div>
                  <div className="dz-desc">Immediately block access. User cannot log in.</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleOpenConfirm('suspend')}><i className="fas fa-ban"></i> Suspend</button>
              </div>
              <div className="dz-item">
                <div className="dz-text">
                  <div className="dz-name">Reset Password</div>
                  <div className="dz-desc">Send a one-time reset link to their email.</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleOpenConfirm('reset')}><i className="fas fa-key"></i> Reset</button>
              </div>
              <div className="dz-item opacity-50">
                <div className="dz-text">
                  <div className="dz-name">Delete Account</div>
                  <div className="dz-desc">Permanently remove. This cannot be undone (Disabled).</div>
                </div>
                <button disabled title="Account deletion is disabled" className="btn btn-danger btn-sm opacity-50 cursor-not-allowed"><i className="fas fa-trash"></i> Delete</button>
              </div>
            </div>
          </div>

        </div> {/* /right-col */}

      </div> {/* /detail-grid */}

      {/* Edit User Modal */}
      <div className={`modal-overlay ${isEditOpen ? 'open' : ''}`} onClick={() => setIsEditOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div className="modal-title">Edit User — {user.first} {user.last}</div>
            <button className="modal-close" onClick={() => setIsEditOpen(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSaveEditSubmit}>
            <div className="modal-body">
              <div className="field-row">
                <div className="field">
                  <label className="field-label">First Name</label>
                  <input 
                    className="field-input" 
                    required
                    value={editForm.first}
                    onChange={(e) => setEditForm({ ...editForm, first: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Last Name</label>
                  <input 
                    className="field-input" 
                    required
                    value={editForm.last}
                    onChange={(e) => setEditForm({ ...editForm, last: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Email Address</label>
                <input 
                  className="field-input" 
                  type="email" 
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">Phone Number</label>
                <input 
                  className="field-input" 
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Role</label>
                  <select 
                    className="field-select"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="readonly">Read-only</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Department</label>
                  <select 
                    className="field-select"
                    value={editForm.dept}
                    onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                  >
                    <option value="Front Desk">Front Desk</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Events">Events</option>
                    <option value="Finance">Finance</option>
                    <option value="Management">Management</option>
                    <option value="Operations Manager">Operations Manager</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Account Status</label>
                  <select 
                    className="field-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Location</label>
                  <input 
                    className="field-input" 
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">New Password <span style={{ color: 'var(--text-muted)', fontSize: '0.48rem', letterSpacing: '0.05em' }}>(leave blank to keep current)</span></label>
                <input className="field-input" type="password" placeholder="••••••••••" />
                <div className="field-note">Minimum 8 characters. Must include uppercase, number and special character.</div>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-gold"><i className="fas fa-save"></i> Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Action Dialog Modal */}
      <div className={`modal-overlay ${isConfirmOpen ? 'open' : ''}`} onClick={() => setIsConfirmOpen(false)}>
        <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="confirm-icon-wrap">
            <div className="confirm-icon"><i className={`fas ${confirmConfig[confirmAction]?.icon}`}></i></div>
            <div className="confirm-title">{confirmConfig[confirmAction]?.title}</div>
          </div>
          <div className="confirm-text">
            {confirmConfig[confirmAction]?.text}
          </div>
          <div className="modal-foot" style={{ justifyContent: 'center', gap: '14px', marginTop: '8px' }}>
            <button className="btn btn-outline" onClick={() => setIsConfirmOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDoConfirm}>
              <i className={`fas ${confirmConfig[confirmAction]?.icon}`}></i> <span>{confirmConfig[confirmAction]?.btn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert Popups */}
      <div className={`toast ${isToastShow ? 'show' : ''}`}>
        <div className="toast-line"></div>
        <span className="toast-icon"><i className="fas fa-check-circle"></i></span>
        <span>{toastMsg}</span>
      </div>

    </div>
  );
};

export default UserDetail;
