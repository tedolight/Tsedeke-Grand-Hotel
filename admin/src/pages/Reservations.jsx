import { useState } from 'react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

// ─── helpers ──────────────────────────────────────────────────────────────────
const ROOM_OPTS = ['Wachemo Room', 'Bilate Suite', 'Boyaa Suite']
const STATUS_OPTS = ['confirmed', 'pending', 'cancelled']
const FILTERS = ['All', 'Confirmed', 'Pending', 'Cancelled']

const statusStyles = {
  confirmed: 'bg-forest/[0.13] text-forest',
  pending:   'bg-brass/[0.17] text-[#8a6a2f]',
  cancelled: 'bg-crimson/[0.1] text-crimson',
}
const dotColors = { confirmed: 'bg-forest', pending: 'bg-brass', cancelled: 'bg-crimson' }

const ROOM_PRICES = { 'Wachemo Room': 2800, 'Bilate Suite': 4200, 'Boyaa Suite': 6500 }

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-[0.38rem] text-[0.71rem] font-bold px-[0.68rem] py-[0.28rem] rounded-full capitalize ${statusStyles[status]}`}>
      <span className={`w-[6px] h-[6px] rounded-full flex-none ${dotColors[status]}`} />
      {status}
    </span>
  )
}
function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}
function initials(name) {
  return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
function calcAmount(room, nights) {
  return (ROOM_PRICES[room] ?? 0) * (parseInt(nights) || 0)
}

// ─── Form (shared by Create & Edit) ───────────────────────────────────────────
const EMPTY = { guest: '', room: ROOM_OPTS[0], checkIn: '', checkOut: '', status: 'confirmed', paid: false }

function ReservationForm({ initial = EMPTY, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0
    const diff = (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000
    return Math.max(0, diff)
  })()
  const amount = calcAmount(form.room, nights)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.guest.trim() || !form.checkIn || !form.checkOut) return
    onSubmit({
      ...form,
      initials: initials(form.guest),
      nights,
      amount,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Guest Full Name *</label>
        <input required value={form.guest} onChange={e => set('guest', e.target.value)} className="field-input" placeholder="e.g. Amanuel Getachew" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Room *</label>
          <select value={form.room} onChange={e => set('room', e.target.value)} className="field-input">
            {ROOM_OPTS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="field-input">
            {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Check-in *</label>
          <input required type="date" value={form.checkIn} onChange={e => set('checkIn', e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Check-out *</label>
          <input required type="date" value={form.checkOut} min={form.checkIn} onChange={e => set('checkOut', e.target.value)} className="field-input" />
        </div>
      </div>
      <div className="flex items-center gap-3 py-3 px-4 bg-bone rounded-[2px] border border-basalt/10">
        <div className="flex-1">
          <p className="font-body text-[0.78rem] text-[#8a7c6c]">{nights} night{nights !== 1 ? 's' : ''} · ETB {(ROOM_PRICES[form.room] ?? 0).toLocaleString()}/night</p>
          <p className="font-display text-[1.2rem] text-crimson">ETB {(amount || 0).toLocaleString()}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.paid} onChange={e => set('paid', e.target.checked)} className="w-4 h-4 accent-[#3C4A34]" />
          <span className="font-body text-[0.83rem] font-semibold">Paid</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2 justify-end border-t border-basalt/10">
        <button type="button" onClick={onCancel} className="btn-outline-sm">Cancel</button>
        <button type="submit" className="btn-primary-sm">Save Reservation</button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Reservations() {
  const { reservations, addReservation, updateReservation, deleteReservation } = useStore()

  const [filter, setFilter]     = useState('All')
  const [search, setSearch]     = useState('')
  const [createOpen, setCreate] = useState(false)
  const [editItem, setEdit]     = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const filtered = reservations.filter(r => {
    const matchFilter = filter === 'All' || r.status === filter.toLowerCase()
    const q = search.toLowerCase()
    const matchSearch = !q || r.guest.toLowerCase().includes(q) || r.room.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const summary = {
    all:       reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending:   reservations.filter(r => r.status === 'pending').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7 pb-16">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-7">
        <div>
          <p className="eyebrow-label">Manage</p>
          <h1 className="page-title">Reservations</h1>
        </div>
        <button onClick={() => setCreate(true)} className="btn-primary">+ New Reservation</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total',     count: summary.all,       cls: 'bg-basalt text-bone-soft' },
          { label: 'Confirmed', count: summary.confirmed, cls: 'bg-forest/10 text-forest' },
          { label: 'Pending',   count: summary.pending,   cls: 'bg-brass/15 text-[#8a6a2f]' },
          { label: 'Cancelled', count: summary.cancelled, cls: 'bg-crimson/10 text-crimson' },
        ].map(c => (
          <div key={c.label} className={`rounded-[2px] px-5 py-4 ${c.cls}`}>
            <div className="font-display font-medium text-[2rem] leading-none mb-1">{c.count}</div>
            <div className="font-body font-bold text-[0.65rem] tracking-[0.09em] uppercase opacity-70">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table panel */}
      <div className="bg-bone-soft rounded-[2px] p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}>{f}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest or room…"
            className="field-input w-full md:w-64" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
            <thead>
              <tr>
                {['Guest','Room','Check-in','Check-out','Nights','Status','Amount','Paid','Actions'].map((h,i) => (
                  <th key={h} className={`th ${i >= 4 && i <= 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} className="py-10 text-center font-body text-[0.86rem] text-[#8a7c6c]">No reservations found.</td></tr>
                : filtered.map(r => (
                  <>
                    <tr key={r.id} className="group hover:bg-bone/60 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-basalt text-bone-soft flex items-center justify-center font-display text-[0.74rem] flex-none">{r.initials}</div>
                          <span className="font-body font-semibold text-[0.86rem] whitespace-nowrap">{r.guest}</span>
                        </div>
                      </td>
                      <td className="td text-[#4a4038] whitespace-nowrap">{r.room}</td>
                      <td className="td whitespace-nowrap">{fmt(r.checkIn)}</td>
                      <td className="td whitespace-nowrap">{fmt(r.checkOut)}</td>
                      <td className="td text-right">{r.nights}</td>
                      <td className="td text-right"><StatusPill status={r.status} /></td>
                      <td className="td text-right font-display text-[0.93rem] text-crimson whitespace-nowrap">ETB {(r.amount || 0).toLocaleString()}</td>
                      <td className="td text-right">
                        <span className={`font-body font-bold text-[0.66rem] px-2 py-[0.2rem] rounded-full ${r.paid ? 'bg-forest/10 text-forest' : 'bg-brass/15 text-[#8a6a2f]'}`}>
                          {r.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="td" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button onClick={() => setEdit(r)} className="action-btn-edit">Edit</button>
                          <button onClick={() => setDeleteId(r.id)} className="action-btn-delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                    {/* Expandable row */}
                    {expanded === r.id && (
                      <tr key={`${r.id}-exp`}>
                        <td colSpan={9} className="bg-bone px-6 py-4 border-b border-basalt/[0.07]">
                          <div className="flex flex-wrap gap-6">
                            {[['Room',r.room],['Check-in',fmt(r.checkIn)],['Check-out',fmt(r.checkOut)],['Nights',r.nights],['Status',r.status],['Amount',`ETB ${(r.amount || 0).toLocaleString()}`],['Payment',r.paid?'Paid':'Unpaid']].map(([k,v])=>(
                              <div key={k}>
                                <p className="font-body font-bold text-[0.62rem] uppercase tracking-[0.08em] text-[#8a7c6c] mb-1">{k}</p>
                                <p className="font-body font-semibold text-[0.9rem] capitalize">{v}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreate(false)} title="New Reservation">
        <ReservationForm onSubmit={data => { addReservation(data); setCreate(false) }} onCancel={() => setCreate(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEdit(null)} title="Edit Reservation">
        {editItem && (
          <ReservationForm
            initial={editItem}
            onSubmit={data => { updateReservation({ ...data, id: editItem.id }); setEdit(null) }}
            onCancel={() => setEdit(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteReservation(deleteId)}
        title="Delete Reservation"
        message="This reservation will be permanently removed. This action cannot be undone."
      />
    </div>
  )
}
