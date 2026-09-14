import React, { useState } from 'react';

const INITIAL_RESERVATIONS = [
  { id: '#RES-1021', name: 'Abeba Kebede', phone: '+251 911 321 654', guests: 4, table: 'Table 5 (Window)', date: '2026-06-04', time: '07:30 PM', status: 'Seated', notes: 'Anniversary setup' },
  { id: '#RES-1022', name: 'Dr. Yonas H.', phone: '+251 910 444 888', guests: 2, table: 'Table 2 (Corner)', date: '2026-06-04', time: '08:00 PM', status: 'Confirmed', notes: 'Quiet table preferred' },
  { id: '#RES-1023', name: 'Fatuma Mohammed', phone: '+251 922 999 111', guests: 8, table: 'Table 8 (Family Area)', date: '2026-06-04', time: '07:00 PM', status: 'Confirmed', notes: 'Birthday celebration' },
  { id: '#RES-1024', name: 'Solomon Tadesse', phone: '+251 915 222 333', guests: 3, table: 'Table 4 (Garden View)', date: '2026-06-05', time: '01:00 PM', status: 'Pending', notes: 'Business lunch' }
];

const TableReservations = () => {
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(2);
  const [table, setTable] = useState('Table 1');
  const [date, setDate] = useState('2026-06-04');
  const [time, setTime] = useState('07:00 PM');
  const [notes, setNotes] = useState('');

  const handleCreateReservation = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    const newRes = {
      id: `#RES-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      guests,
      table,
      date,
      time,
      status: 'Confirmed',
      notes
    };
    setReservations([newRes, ...reservations]);
    setName('');
    setPhone('');
    setNotes('');
    setShowAdd(false);
  };

  const handleUpdateStatus = (id, status) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filteredReservations = reservations.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.table.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-montserrat">
      <div className="flex justify-between items-center border-b border-border-gold-soft pb-5">
        <div>
          <h2 className="font-cinzel text-lg text-white font-semibold">Table Reservations</h2>
          <p className="text-[10px] text-text-muted tracking-[0.5px]">Manage dining reservations and table seatings</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className={`fas ${showAdd ? 'fa-times' : 'fa-plus'}`} /> {showAdd ? 'Close Form' : 'New Reservation'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreateReservation} className="bg-dark-3 border border-border-gold p-5 rounded-lg max-w-2xl mx-auto space-y-4 transition-all duration-300">
          <h4 className="font-cinzel text-sm text-gold font-semibold uppercase">New Table Booking</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field">
              <label className="field-label">Guest Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Almaz Tadesse"
                className="field-input rounded"
                required
              />
            </div>
            
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +251 911 000 000"
                className="field-input rounded"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Guest Count</label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="field-input rounded"
                min="1"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Assign Table</label>
              <select
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="field-select rounded bg-dark-3 border border-border-gold"
              >
                <option>Table 1 (2 guests)</option>
                <option>Table 2 (Corner - 2 guests)</option>
                <option>Table 3 (Window - 4 guests)</option>
                <option>Table 4 (Garden View - 4 guests)</option>
                <option>Table 5 (Window - 4 guests)</option>
                <option>Table 8 (Family - 8 guests)</option>
                <option>VIP Lounge Room</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">Reservation Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field-input rounded"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Reservation Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 07:30 PM"
                className="field-input rounded"
                required
              />
            </div>

            <div className="field col-span-2">
              <label className="field-label">Special Requests / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. high chair needed, wheelchair accessible table..."
                className="w-full bg-dark-4 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-16"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-gold-soft">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="btn btn-outline btn-sm rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold btn-sm rounded font-semibold"
            >
              Book Table
            </button>
          </div>
        </form>
      )}

      <div className="bg-dark-3 border border-border-gold-soft p-3 rounded-lg flex items-center">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, table or reservation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-4 border border-border-gold rounded p-2 pl-9 text-xs text-white outline-none focus:border-gold transition-colors"
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
        </div>
      </div>

      <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-gold-soft bg-dark-2/40">
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Reservation ID</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Guest Name</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Guests</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Table Assigned</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Date & Time</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Status</th>
                <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gold-soft/50">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-text-muted text-xs">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-dark-4/30 transition-colors">
                    <td className="p-4 text-xs font-cinzel text-gold font-medium">{r.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-white font-medium">{r.name}</span>
                        <span className="text-[10px] text-text-muted">{r.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-white font-medium">{r.guests} Guests</td>
                    <td className="p-4 text-xs text-white">{r.table}</td>
                    <td className="p-4 text-xs">
                      <div className="flex flex-col">
                        <span className="text-white">{r.date}</span>
                        <span className="text-text-muted">{r.time}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                        r.status === 'Seated' ? 'bg-gold-glow text-gold border border-gold/20' : 
                        r.status === 'Confirmed' ? 'bg-success/10 text-success border border-success/20' : 
                        r.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' : 
                        'bg-danger/10 text-danger border border-danger/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {r.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'Seated')}
                            className="bg-gold hover:bg-gold-light text-black text-[10px] py-1 px-2 rounded cursor-pointer transition-colors"
                          >
                            Seat Guest
                          </button>
                        )}
                        {r.status !== 'Cancelled' && r.status !== 'Seated' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'Cancelled')}
                            className="bg-transparent border border-danger/20 hover:bg-danger/10 hover:border-danger text-danger text-[10px] py-1 px-2 rounded cursor-pointer transition-colors"
                          >
                            Cancel
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
      </div>
    </div>
  );
};

export default TableReservations;
