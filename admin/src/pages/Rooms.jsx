import { useState } from 'react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const TYPE_OPTS    = ['Standard', 'Suite', 'Premium Suite']
const STATUS_OPTS  = ['available', 'occupied', 'maintenance']
const ALL_AMENITIES = ['King Bed','Queen Bed','Lake View','Wi-Fi','AC','En-suite Bathroom','Living Area','Kitchenette','Terrace','Jacuzzi','Private Terrace','Butler Service','Panoramic View','2 King Beds']

const typeColors = {
  'Standard':       'bg-forest/10 text-forest',
  'Suite':          'bg-brass/15 text-[#8a6a2f]',
  'Premium Suite':  'bg-crimson/10 text-crimson',
}
const statusColors = {
  available:   'bg-forest/10 text-forest',
  occupied:    'bg-brass/15 text-[#8a6a2f]',
  maintenance: 'bg-crimson/10 text-crimson',
}
const gradientBg = ['from-basalt to-basalt/70','from-forest to-forest/60','from-[#4a3828] to-[#2a2018]']

const EMPTY_ROOM = { name:'', type: TYPE_OPTS[0], capacity: 2, pricePerNight: 2800, totalRooms: 1, floor: 1, roomNumber:'', status: 'available', amenities: [], description: '' }

function RoomForm({ initial = EMPTY_ROOM, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_ROOM, ...initial, amenities: [...(initial.amenities ?? [])] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Room Name *</label>
        <input required value={form.name} onChange={e => set('name', e.target.value)} className="field-input" placeholder="e.g. Wachemo Room" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className="field-input">
            {TYPE_OPTS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="field-input">
            {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="field-label">Capacity (guests)</label>
          <input type="number" min={1} max={10} value={form.capacity} onChange={e => set('capacity', +e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Total Rooms</label>
          <input type="number" min={1} value={form.totalRooms} onChange={e => set('totalRooms', +e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Floor</label>
          <input type="number" min={1} value={form.floor} onChange={e => set('floor', +e.target.value)} className="field-input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Price per Night (ETB)</label>
          <input type="number" min={0} value={form.pricePerNight} onChange={e => set('pricePerNight', +e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Room Numbers</label>
          <input value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)} className="field-input" placeholder="e.g. 101–110" />
        </div>
      </div>
      <div>
        <label className="field-label">Description</label>
        <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className="field-input resize-none" />
      </div>
      <div>
        <label className="field-label">Amenities</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ALL_AMENITIES.map(a => (
            <button key={a} type="button" onClick={() => toggleAmenity(a)}
              className={`font-body text-[0.77rem] font-semibold px-3 py-[0.35rem] rounded-full border transition-all
                ${form.amenities.includes(a) ? 'bg-basalt text-bone-soft border-basalt' : 'border-basalt/20 text-[#5a4f44] hover:border-brass'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2 justify-end border-t border-basalt/10">
        <button type="button" onClick={onCancel} className="btn-outline-sm">Cancel</button>
        <button type="submit" className="btn-primary-sm">Save Room</button>
      </div>
    </form>
  )
}

export default function Rooms() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useStore()
  const [createOpen, setCreate] = useState(false)
  const [editItem, setEdit]     = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selected, setSelected] = useState(null)

  const totalOccupied = rooms.reduce((s, r) => s + (r.occupied ?? 0), 0)
  const totalRooms    = rooms.reduce((s, r) => s + (r.totalRooms ?? 0), 0)

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7 pb-16">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-7">
        <div>
          <p className="eyebrow-label">Manage</p>
          <h1 className="page-title">Rooms</h1>
        </div>
        <button onClick={() => setCreate(true)} className="btn-primary">+ Add Room Type</button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label:'Total Rooms',  val: totalRooms,                   cls:'bg-basalt text-bone-soft' },
          { label:'Occupied',     val: totalOccupied,                cls:'bg-forest/10 text-forest' },
          { label:'Available',    val: totalRooms - totalOccupied,   cls:'bg-brass/12 text-[#8a6a2f]' },
        ].map(c => (
          <div key={c.label} className={`rounded-[2px] px-5 py-4 ${c.cls}`}>
            <div className="font-display font-medium text-[2rem] leading-none mb-1">{c.val}</div>
            <div className="font-body font-bold text-[0.65rem] tracking-[0.09em] uppercase opacity-70">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Room cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {rooms.map((room, i) => {
          const pct = room.totalRooms > 0 ? Math.round((room.occupied / room.totalRooms) * 100) : 0
          const isActive = selected?.id === room.id
          return (
            <div
              key={room.id}
              className={`bg-bone-soft rounded-[2px] border-2 transition-all ${isActive ? 'border-brass shadow-md' : 'border-transparent'}`}
            >
              {/* Gradient thumb */}
              <div className={`h-24 rounded-t-[2px] bg-gradient-to-br ${gradientBg[i % gradientBg.length]} flex items-center justify-center text-[2.5rem]`}>
                🛏️
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-body font-bold text-[0.67rem] tracking-[0.1em] uppercase px-2 py-[0.2rem] rounded-full ${typeColors[room.type]}`}>{room.type}</span>
                  <span className={`font-body font-bold text-[0.66rem] tracking-[0.08em] uppercase px-2 py-[0.2rem] rounded-full ${statusColors[room.status]}`}>{room.status}</span>
                </div>
                <h2 className="font-display text-[1.15rem] mb-1">{room.name}</h2>
                <p className="font-body text-[0.81rem] text-[#5a4f44] mb-3 line-clamp-2">{room.description}</p>

                {/* Occupancy */}
                <div className="mb-3">
                  <div className="flex justify-between text-[0.75rem] font-body mb-1">
                    <span className="text-[#8a7c6c]">Occupancy</span>
                    <span className="font-semibold">{room.occupied ?? 0} / {room.totalRooms}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-brass" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-basalt/[0.08] mb-4">
                  <span className="font-display text-[0.95rem] text-crimson">
                    ETB {(room.pricePerNight || room.price || room.price_etb || 0).toLocaleString()}<span className="font-body text-[0.7rem] text-[#8a7c6c]">/night</span>
                  </span>
                  <span className="font-body text-[0.74rem] text-[#8a7c6c]">Up to {room.capacity} guests</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => setSelected(isActive ? null : room)} className="flex-1 action-btn-view">
                    {isActive ? 'Hide' : 'Details'}
                  </button>
                  <button onClick={() => setEdit(room)} className="action-btn-edit">Edit</button>
                  <button onClick={() => setDeleteId(room.id)} className="action-btn-delete">Delete</button>
                </div>
              </div>

              {/* Expanded detail */}
              {isActive && (
                <div className="border-t border-basalt/10 px-5 pb-5 pt-4">
                  <p className="font-body font-bold text-[0.64rem] tracking-[0.08em] uppercase text-[#8a7c6c] mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.map(a => (
                      <span key={a} className="font-body text-[0.76rem] bg-basalt/[0.07] text-basalt px-2 py-[0.2rem] rounded-full">{a}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['Floor', `Floor ${room.floor}`],['Numbers', room.roomNumber],['Total Units', room.totalRooms]].map(([k,v]) => (
                      <div key={k}>
                        <p className="font-body font-bold text-[0.62rem] uppercase tracking-[0.07em] text-[#8a7c6c] mb-1">{k}</p>
                        <p className="font-body font-semibold text-[0.85rem]">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreate(false)} title="Add Room Type" size="lg">
        <RoomForm onSubmit={d => { addRoom(d); setCreate(false) }} onCancel={() => setCreate(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEdit(null)} title="Edit Room" size="lg">
        {editItem && <RoomForm initial={editItem} onSubmit={d => { updateRoom({ ...d, id: editItem.id }); setEdit(null) }} onCancel={() => setEdit(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteRoom(deleteId)} title="Delete Room Type" message="This room type and all its data will be permanently removed." />
    </div>
  )
}
