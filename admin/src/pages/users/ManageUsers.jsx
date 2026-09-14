import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usersService from '../../services/users/usersService.js';

const mapDbUser = (user) => {
  const nameParts = (user.name || 'Unknown User').trim().split(/\s+/);
  const first = nameParts[0] || 'Unknown';
  const last = nameParts.slice(1).join(' ') || 'User';

  const profile = user.profile || {};
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
    joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'
  };
};

const STORAGE_KEY = 'tsedeke_grand_admin_users';
const avatarColors = ['#2D4A6B', '#4A2D6B', '#2D6B4A', '#6B4A2D', '#6B2D4A', '#2D6B6B', '#4A6B2D', '#6B6B2D'];

const initialUsers = [];
const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await usersService.getUsers();
        const items = res.data || res || [];
        const mapped = items.map(mapDbUser);
        setUsers(mapped);
      } catch (err) {
        console.error(err);
        triggerToast('Failed to load users from server');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Filter and Sort states
  const [currentRoleTab, setCurrentRoleTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('Sort: Newest');
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modals and Toasts
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isToastShow, setIsToastShow] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    first: '',
    last: '',
    email: '',
    phone: '',
    role: 'manager',
    dept: 'Front Desk',
    password: ''
  });

  // Helper formatting functions
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

  const avaColor = (id) => {
    return avatarColors[id % avatarColors.length];
  };

  // Toast Trigger
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setIsToastShow(true);
    setTimeout(() => {
      setIsToastShow(false);
    }, 2800);
  };

  // Dynamic KPI stats based on users state
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

  // Filtered and Sorted Users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRoleTab = currentRoleTab === 'all' || u.role === currentRoleTab;
      const matchQ = !searchQuery || 
        `${u.first} ${u.last}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.dept.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = !statusFilter || u.status === statusFilter;
      return matchRoleTab && matchQ && matchStatus;
    });
  }, [users, currentRoleTab, searchQuery, statusFilter]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    if (sortOption === 'Sort: Name A–Z') {
      list.sort((a, b) => `${a.first} ${a.last}`.localeCompare(`${b.first} ${b.last}`));
    } else if (sortOption === 'Sort: Last Active') {
      // Custom heuristic for sorting by activity: "Just now" first, then min, then hr, days, weeks
      const score = (str) => {
        if (str.includes('now')) return 1;
        if (str.includes('min')) return 2;
        if (str.includes('hr')) return 3;
        if (str.includes('Today')) return 4;
        if (str.includes('Yesterday')) return 5;
        if (str.includes('day')) return 6;
        if (str.includes('week')) return 7;
        return 8;
      };
      list.sort((a, b) => score(a.lastActive) - score(b.lastActive));
    } else if (sortOption === 'Sort: Role') {
      list.sort((a, b) => a.role.localeCompare(b.role));
    } else {
      // Sort: Newest
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [filteredUsers, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentRoleTab, statusFilter, sortOption]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  // Selection handlers
  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleToggleSelectAll = () => {
    const allSelected = paginatedUsers.every(u => selectedIds.has(u.id));
    const next = new Set(selectedIds);
    if (allSelected) {
      // Remove all currently visible users from selection
      paginatedUsers.forEach(u => next.delete(u.id));
    } else {
      // Add all currently visible users to selection
      paginatedUsers.forEach(u => next.add(u.id));
    }
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk operations
  const handleBulkSuspend = () => {
    setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, status: 'suspended' } : u));
    triggerToast(`${selectedIds.size} accounts suspended successfully`);
    setSelectedIds(new Set());
  };

  const handleBulkChangeRole = async (role) => {
    try {
      for (const id of selectedIds) {
        const dbRole = role === 'superadmin' || role === 'admin' ? 'admin' : 'user';
        await usersService.updateUserRole(id, dbRole);
      }
      setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, role: role } : u));
      triggerToast(`Role updated to ${roleLabel(role)} for ${selectedIds.size} users`);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update roles');
    }
  };



  // Add user submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.first || !newUserForm.last || !newUserForm.email) return;

    try {
      const userData = {
        first: newUserForm.first,
        last: newUserForm.last,
        email: newUserForm.email,
        role: newUserForm.role,
        dept: newUserForm.dept,
        phone: newUserForm.phone || '',
        password: newUserForm.password || '123456'
      };

      const res = await usersService.createUser(userData);
      const dbUser = res.data.data || res.data || res;
      const addedUser = mapDbUser(dbUser);

      setUsers(prev => [...prev, addedUser]);
      setIsAddModalOpen(false);
      // Reset Form
      setNewUserForm({
        first: '',
        last: '',
        email: '',
        phone: '',
        role: 'manager',
        dept: 'Front Desk',
        password: ''
      });
      triggerToast('User created successfully');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to create user');
    }
  };

  return (
    <div className="space-y-6 font-montserrat">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-heading">Manage Users</div>
          <div className="page-sub">Control admin accounts, roles and access permissions</div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => triggerToast('Data exported successfully')} 
            className="btn btn-outline cursor-pointer"
          >
            <i className="fas fa-download"></i> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="btn btn-gold cursor-pointer"
          >
            <i className="fas fa-user-plus"></i> Add User
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-box"><i className="fas fa-users"></i></div>
          <div>
            <div className="stat-val">{totalCount}</div>
            <div className="stat-lbl">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box"><i className="fas fa-user-check"></i></div>
          <div>
            <div className="stat-val">{activeCount}</div>
            <div className="stat-lbl">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box"><i className="fas fa-user-clock"></i></div>
          <div>
            <div className="stat-val">{inactiveCount}</div>
            <div className="stat-lbl">Inactive</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box"><i className="fas fa-user-lock"></i></div>
          <div>
            <div className="stat-val">{suspendedCount}</div>
            <div className="stat-lbl">Suspended</div>
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="role-tabs">
        {[
          { tab: 'all', label: 'All Users', count: users.length },
          { tab: 'superadmin', label: 'Super Admin', count: users.filter(u => u.role === 'superadmin').length },
          { tab: 'admin', label: 'Admin', count: users.filter(u => u.role === 'admin').length },
          { tab: 'manager', label: 'Manager', count: users.filter(u => u.role === 'manager').length },
          { tab: 'staff', label: 'Staff', count: users.filter(u => u.role === 'staff').length },
          { tab: 'readonly', label: 'Read-only', count: users.filter(u => u.role === 'readonly').length }
        ].map((item) => (
          <div 
            key={item.tab}
            onClick={() => {
              setCurrentRoleTab(item.tab);
              handleClearSelection();
            }}
            className={`role-tab ${currentRoleTab === item.tab ? 'active' : ''}`}
          >
            {item.label} <span className="role-count">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search by name, email or department…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="filter-sel"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select 
          className="filter-sel"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="Sort: Newest">Sort: Newest</option>
          <option value="Sort: Name A–Z">Sort: Name A–Z</option>
          <option value="Sort: Last Active">Sort: Last Active</option>
          <option value="Sort: Role">Sort: Role</option>
        </select>
        <div className="toolbar-right">
          <span className="result-info">Showing {sortedUsers.length} users</span>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <div className={`bulk-bar ${selectedIds.size > 0 ? 'show' : ''}`}>
        <div className="bulk-info"><strong>{selectedIds.size}</strong> users selected</div>
        <div className="bulk-acts">
          <button onClick={handleClearSelection} className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '0.72rem' }}>
            <i className="fas fa-times"></i> Deselect
          </button>
          
          <select 
            onChange={(e) => {
              if (e.target.value) {
                handleBulkChangeRole(e.target.value);
                e.target.value = ''; // Reset select
              }
            }}
            className="filter-sel" 
            style={{ padding: '4px 10px', fontSize: '0.72rem', height: 'auto' }}
          >
            <option value="">Change Role...</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="readonly">Read-only</option>
          </select>
          
          <button onClick={handleBulkSuspend} className="btn btn-danger-sm">
            <i className="fas fa-ban"></i> Suspend
          </button>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th className="check-col">
                <div 
                  className={`cb ${paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id)) ? 'checked' : ''}`} 
                  onClick={handleToggleSelectAll}
                >
                  <i className="fas fa-check"></i>
                </div>
              </th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Department</th>
              <th>Last Active</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-text-muted text-xs">
                  No users found matching the filter criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr 
                  key={u.id}
                  onClick={() => navigate(`/users/${u.id}`)}
                  className={selectedIds.has(u.id) ? 'selected' : ''}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <div 
                      className={`cb ${selectedIds.has(u.id) ? 'checked' : ''}`}
                      onClick={() => handleToggleSelect(u.id)}
                    >
                      <i className="fas fa-check"></i>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-ava text-white" style={{ background: avaColor(u.id) }}>
                        {initials(u)}
                      </div>
                      <div>
                        <div className="user-name">{u.first} {u.last}</div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td>
                    <span className="status-dot">
                      <span className={`dot ${u.status}`}></span>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td>{u.dept}</td>
                  <td><span className="last-active">{u.lastActive}</span></td>
                  <td><span className="last-active">{u.joined}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-acts">
                      <div 
                        className="act-btn" 
                        onClick={() => navigate(`/users/${u.id}`)}
                        title="View"
                      >
                        <i className="fas fa-eye"></i>
                      </div>
                      <div 
                        className="act-btn" 
                        onClick={() => navigate(`/users/${u.id}?edit=true`)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="pagination">
          <div className="page-info">
            Page {currentPage} of {totalPages} · {sortedUsers.length} total users shown
          </div>
          <div className="page-btns">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <div className={`modal-overlay ${isAddModalOpen ? 'open' : ''}`} onClick={() => setIsAddModalOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div className="modal-title">Add New User</div>
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleAddUserSubmit}>
            <div className="modal-body">
              <div className="field-row">
                <div className="field">
                  <label className="field-label">First Name</label>
                  <input 
                    className="field-input" 
                    required 
                    placeholder="Abebe"
                    value={newUserForm.first}
                    onChange={(e) => setNewUserForm({ ...newUserForm, first: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Last Name</label>
                  <input 
                    className="field-input" 
                    required 
                    placeholder="Mekonnen"
                    value={newUserForm.last}
                    onChange={(e) => setNewUserForm({ ...newUserForm, last: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Email Address</label>
                <input 
                  className="field-input" 
                  type="email" 
                  required 
                  placeholder="user@tsedekegrandhotel.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">Phone Number</label>
                <input 
                  className="field-input" 
                  placeholder="+251 9XX XXX XXXX"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Role</label>
                  <select 
                    className="field-select"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
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
                    value={newUserForm.dept}
                    onChange={(e) => setNewUserForm({ ...newUserForm, dept: e.target.value })}
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
              <div className="field">
                <label className="field-label">Temporary Password</label>
                <input 
                  className="field-input" 
                  type="password" 
                  placeholder="••••••••••"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-gold"><i className="fas fa-user-plus"></i> Create User</button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Alert */}
      <div className={`toast ${isToastShow ? 'show' : ''}`}>
        <div className="toast-line"></div>
        <span className="toast-icon"><i className="fas fa-check-circle"></i></span>
        <span>{toastMsg}</span>
      </div>

    </div>
  );
};

export default ManageUsers;
