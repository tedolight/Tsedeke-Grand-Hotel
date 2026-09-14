import React, { useState } from 'react';

const AddEvent = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [guestCount, setGuestCount] = useState(100);
  const [eventDate, setEventDate] = useState('2026-06-20');
  const [packageSelected, setPackageSelected] = useState('Golden Premium');
  const [coordinator, setCoordinator] = useState('Liya Desta');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Confirmed');
  const [price, setPrice] = useState(45000);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    const newEvent = {
      id: `#EV-${Math.floor(10000 + Math.random() * 90000)}`,
      title,
      type: eventType,
      guests: guestCount,
      date: eventDate,
      package: packageSelected,
      coordinator,
      notes,
      status,
      price
    };
    onSave?.(newEvent);
  };

  return (
    <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-6 max-w-2xl mx-auto font-montserrat">
      <div className="border-b border-border-gold-soft pb-4 mb-6">
        <h3 className="font-cinzel text-lg text-white font-semibold flex items-center gap-2">
          <i className="fas fa-calendar-plus text-gold" />
          Log New Event Booking
        </h3>
        <p className="text-[11px] text-text-muted mt-1">Record a contracted venue booking for weddings, banquets, or conferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field col-span-2">
            <label className="field-label">Event Name / Host</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solomon & Tigist Wedding Gala"
              className="field-input rounded"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>Wedding</option>
              <option>Conference</option>
              <option>Banquet</option>
              <option>Meeting</option>
              <option>Cocktail Party</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="field-input rounded"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Expected Guests</label>
            <input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="field-input rounded"
              min="10"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Venue Package</label>
            <select
              value={packageSelected}
              onChange={(e) => setPackageSelected(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>Golden Premium (Full Hall + Catering)</option>
              <option>Silver Standard (Hall + Basic AV)</option>
              <option>Bronze Mini (Half Hall Setup)</option>
              <option>Custom Rental Only</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Contract Value (ETB)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="field-input rounded"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Assigned Coordinator</label>
            <select
              value={coordinator}
              onChange={(e) => setCoordinator(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>Liya Desta</option>
              <option>Kaleb Girma</option>
              <option>Yonas Mohammed</option>
            </select>
          </div>

          <div className="field col-span-2">
            <label className="field-label">Booking Status</label>
            <div className="flex gap-4 mt-1">
              {['Pending', 'Confirmed', 'Completed'].map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-gold"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field col-span-2">
            <label className="field-label">Special requirements / Setup details</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide AV requirements, stage setup options, dietary requirements, decoration preferences..."
              className="w-full bg-dark-3 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-24"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border-gold-soft">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline btn-sm rounded"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-gold btn-sm rounded font-semibold"
          >
            Save Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;
