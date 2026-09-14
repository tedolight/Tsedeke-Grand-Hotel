import React, { useState, useEffect } from 'react';
import eventsService from '../../services/events/eventsService.js';

const EventEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getEnquiries();
      // Normalize backend data into a flat display shape
      const mapped = (data?.data || data || []).map((e) => ({
        _id: e._id,
        id: `#ENQ-${e._id.slice(-4).toUpperCase()}`,
        name: e.fullName || e.name || 'Unknown',
        email: e.email || '',
        phone: e.phone || '',
        type: e.eventType || e.type || 'General',
        guests: e.guestCount || e.guests || 0,
        date: e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        venue: e.preferredVenue || e.venue || '-',
        details: e.message || e.details || '',
        dateSubmitted: e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        status: e.status || 'New',
      }));
      setEnquiries(mapped);
    } catch (err) {
      console.error('Failed to fetch event enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    // Optimistic UI update
    setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
    try {
      await eventsService.updateEnquiryStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchEnquiries(); // revert on error
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                          e.email.toLowerCase().includes(search.toLowerCase()) ||
                          e.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || e.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-montserrat">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-dark-3 border border-border-gold-soft p-3 rounded-lg">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by guest, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-4 border border-border-gold rounded p-2 pl-9 text-xs text-white outline-none focus:border-gold transition-colors"
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
          >
            <option>All</option>
            <option>Wedding</option>
            <option>Conference</option>
            <option>Banquet</option>
            <option>Meeting</option>
            <option>General</option>
          </select>
          <button
            onClick={fetchEnquiries}
            className="bg-transparent border border-border-gold hover:border-gold text-text-muted hover:text-white text-[10px] py-2 px-3 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fas fa-sync-alt" /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-gold-soft bg-dark-2/40">
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Enquiry ID</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Guest / Contact</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Type</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px] text-center">Guests</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Venue</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Event Date</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Submitted</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Status</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gold-soft/50">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center text-text-muted text-xs">
                    <i className="fas fa-spinner fa-spin text-gold mr-2" />Loading enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-text-muted text-xs">
                    {enquiries.length === 0 ? 'No event enquiries received yet.' : 'No enquiries match your search.'}
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((e) => (
                  <tr key={e._id} className="hover:bg-dark-4/30 transition-colors">
                    <td className="p-4 text-xs font-cinzel text-gold font-medium">{e.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-white font-medium">{e.name}</span>
                        <span className="text-[10px] text-text-muted">{e.email} {e.phone && `• ${e.phone}`}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-white">{e.type}</td>
                    <td className="p-4 text-xs text-gold font-medium text-center">{e.guests || '-'}</td>
                    <td className="p-4 text-xs text-white-dim">{e.venue}</td>
                    <td className="p-4 text-xs text-white">{e.date}</td>
                    <td className="p-4 text-xs text-text-muted">{e.dateSubmitted}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                        e.status === 'new' || e.status === 'New'
                          ? 'bg-danger/10 text-danger border border-danger/20'
                          : e.status === 'contacted' || e.status === 'In Contact'
                          ? 'bg-warning/10 text-warning border border-warning/20'
                          : 'bg-gold-glow text-gold border border-gold/20'
                      }`}>
                        {e.status === 'new' ? 'New' : e.status === 'contacted' ? 'In Contact' : e.status === 'closed' ? 'Closed' : e.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {e.status !== 'closed' && e.status !== 'Closed' && (
                          <button
                            onClick={() => handleUpdateStatus(e._id, 'contacted')}
                            className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] py-1 px-2 rounded cursor-pointer transition-colors"
                          >
                            Mark Contacted
                          </button>
                        )}
                        {e.status !== 'closed' && e.status !== 'Closed' && (
                          <button
                            onClick={() => handleUpdateStatus(e._id, 'closed')}
                            className="bg-gold hover:bg-gold-light text-black text-[10px] py-1 px-2 rounded cursor-pointer transition-colors"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border-gold-soft bg-dark-2/30 text-[11px] text-text-muted">
          Showing {filteredEnquiries.length} of {enquiries.length} enquiries
        </div>
      </div>
    </div>
  );
};

export default EventEnquiries;
