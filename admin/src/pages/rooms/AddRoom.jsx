import React, { useState } from 'react';

const ALL_AMENITIES = [
  'Free Wi-Fi',
  'Air Conditioning',
  'Smart TV',
  'Bathtub',
  'Jacuzzi',
  'Coffee Maker',
  'Mini Bar',
  'Fireplace',
  'Private Balcony',
  'Pool Access',
  'Safe Deposit Box',
  'Butler Service',
  'Wardrobe',
  'Spa Access',
  'Direct Phone'
];

const AddRoom = ({ onSave, onCancel }) => {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Single');
  const [floor, setFloor] = useState('1st Floor');
  const [size, setSize] = useState(28);
  const [bed, setBed] = useState('Double');
  const [guests, setGuests] = useState(2);
  const [bathrooms, setBathrooms] = useState('1 Bathroom');
  const [view, setView] = useState('Garden View');
  const [price, setPrice] = useState(800);
  const [weekendPrice, setWeekendPrice] = useState(1000);
  const [discount, setDiscount] = useState(0);
  const [extraFee, setExtraFee] = useState(150);
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState(['Free Wi-Fi', 'Air Conditioning', 'Smart TV']);
  const [status, setStatus] = useState('Available');

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId || !name || !price) return;
    
    let classStyle = 'rm-standard';
    let icon = 'fas fa-door-open';
    if (roomType.includes('Royal')) { classStyle = 'rm-royal'; icon = 'fas fa-crown'; }
    else if (roomType.includes('Executive')) { classStyle = 'rm-executive'; icon = 'fas fa-star'; }
    else if (roomType.includes('Junior')) { classStyle = 'rm-junior'; icon = 'fas fa-gem'; }
    else if (roomType.includes('Deluxe')) { classStyle = 'rm-deluxe'; icon = 'fas fa-spa'; }

    const newRoom = {
      id: roomId,
      name,
      type: roomType,
      floor,
      size,
      bed,
      guests,
      bathrooms,
      view,
      price,
      weekendPrice,
      discount,
      extraFee,
      description,
      amenities: selectedAmenities,
      status,
      classStyle,
      icon,
      occupancyRate: 0,
      bookingsCount: 0,
      revenue: 0,
      rating: 5.0
    };

    onSave?.(newRoom);
  };

  return (
    <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-6 max-w-3xl mx-auto font-montserrat">
      <div className="border-b border-border-gold-soft pb-4 mb-6">
        <h3 className="font-cinzel text-lg text-white font-semibold flex items-center gap-2">
          <i className="fas fa-bed text-gold" />
          Add New Hotel Room
        </h3>
        <p className="text-[11px] text-text-muted mt-1">Create a new room listing in the hotel inventory database.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="field">
            <label className="field-label">Room Number / ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="e.g. 104"
              className="field-input rounded"
              required
            />
          </div>

          <div className="field col-span-2">
            <label className="field-label">Room Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deluxe Room Double"
              className="field-input rounded"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option value="Deluxe Suite">Deluxe Suite</option>
              <option value="Deluxe Single Room">Deluxe Single Room</option>
              <option value="Deluxe Double Room">Deluxe Double Room</option>
              <option value="Deluxe Triple Room">Deluxe Triple Room</option>
              <option value="Special Price Room">Special Price Room</option>
              <option value="Hour Room">Hour Room</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Floor</label>
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>1st Floor</option>
              <option>2nd Floor</option>
              <option>3rd Floor</option>
              <option>Penthouse</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Room Size (sqm)</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="field-input rounded"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Bed Type</label>
            <select
              value={bed}
              onChange={(e) => setBed(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>Twin</option>
              <option>Double</option>
              <option>Queen</option>
              <option>King</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Max Guests</label>
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
            <label className="field-label">Bathrooms</label>
            <select
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>1 Bathroom</option>
              <option>1.5 Bathrooms</option>
              <option>2 Bathrooms</option>
              <option>2.5 Bathrooms</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Room View</label>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="field-select rounded bg-dark-3 border border-border-gold"
            >
              <option>Garden View</option>
              <option>City View</option>
              <option>Pool View</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Standard Price (ETB)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="field-input rounded"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Weekend Price (ETB)</label>
            <input
              type="number"
              value={weekendPrice}
              onChange={(e) => setWeekendPrice(Number(e.target.value))}
              className="field-input rounded"
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the room, its layout, view special highlights..."
            className="w-full bg-dark-3 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-20"
          />
        </div>

        <div className="field">
          <label className="field-label">Room Amenities</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-dark-4 p-4 border border-border-gold-soft rounded-lg">
            {ALL_AMENITIES.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity);
              return (
                <label key={amenity} className="flex items-center gap-2.5 text-xs text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAmenityChange(amenity)}
                    className="accent-gold"
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Initial Operational Status</label>
          <div className="flex gap-4 mt-1">
            {['Available', 'Maintenance', 'Cleaning'].map((s) => (
              <label key={s} className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="roomStatus"
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
            Add Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
