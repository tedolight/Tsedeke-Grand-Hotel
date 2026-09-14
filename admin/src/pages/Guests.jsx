import { useState } from 'react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_OPTS = ['in-house','upcoming','checked-out','pending']
const FILTERS     = ['All','In-House','Upcoming','Checked Out','Pending']
const statusStyles = {
  'in-house':    'bg-forest/10 text-forest',
  'upcoming':    'bg-brass/15 text-[#8a6a2f]',
  'checked-out': 'bg-basalt/8 text-[#5a4f44]',
  'pending':     'bg-crimson/10 text-crimson',
}
const statusLabels = { 'in-house':'In-House','upcoming':'Upcoming','checked-out':'Checked Out','pending':'Pending' }

function initials(name) { return name.trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() }

const EMPTY_GUEST = { name:'', email:'', phone:'', nationality:'Ethiopian', status:'upcoming' }

function GuestForm({ initial = EMPTY_GUEST, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_GUEST, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    onSubmit({ ...form, initials: initials(form.name) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Full Name *</label>
        <input required value={form.name} onChange={e => set('name', e.target.value)} className="field-input" placeholder="e.g. Amanuel Getachew" />
      </div>
      <div>
        <label className="field-label">Email *</label>
        <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="field-input" />
      </div>
      <div>
        <label className="field-label">Phone</label>
        <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="field-input" placeholder="+251 9XX XXX XXX" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Nationality</label>
          <input value={form.nationality} onChange={e => set('nationality', e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="field-input">
            {STATUS_OPTS.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2 justify-end border-t border-basalt/10">
        <button type="button" onClick={onCancel} className="btn-outline-sm">Cancel</button>
        <button type="submit" className="btn-primary-sm">Save Guest</button>
      </div>
    </form>
  )
}

export default function Guests() {
  const { guests, addGuest, updateGuest, deleteGuest } = useStore()
  const [filter, setFilter]     = useState('All')
  const [search, setSearch]     = useState('')
  const [createOpen, setCreate] = useState(false)
  const [editItem, setEdit]     = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selected, setSelected] = useState(null)

  const filtered = guests.filter(g => {
    const matchFilter = filter === 'All'
      || (filter === 'In-House'    && g.status === 'in-house')
      || (filter === 'Upcoming'    && g.status === 'upcoming')
      || (filter === 'Checked Out' && g.status === 'checked-out')
      || (filter === 'Pending'     && g.status === 'pending')
    const q = search.toLowerCase()
    const matchSearch = !q || g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || g.nationality.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7 pb-16">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-7">
        <div>
          <p className="eyebrow-label">Manage</p>
          <h1 className="page-title">Guests</h1>
        </div>
        <button onClick={() => setCreate(true)} className="btn-primary">+ Add Guest</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label:'Total',       count: guests.length,                               cls:'bg-basalt text-bone-soft' },
          { label:'In-House',    count: guests.filter(g=>g.status==='in-house').length,  cls:'bg-forest/10 text-forest' },
          { label:'Upcoming',    count: guests.filter(g=>g.status==='upcoming').length,  cls:'bg-brass/15 text-[#8a6a2f]' },
          { label:'Checked Out', count: guests.filter(g=>g.status==='checked-out').length, cls:'bg-basalt/[0.07] text-basalt' },
        ].map(c => (
          <div key={c.label} className={`rounded-[2px] px-5 py-4 ${c.cls}`}>
            <div className="font-display font-medium text-[2rem] leading-none mb-1">{c.count}</div>
            <div className="font-body font-bold text-[0.65rem] tracking-[0.09em] uppercase opacity-70">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}>{f}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, nationality…"
          className="field-input w-full md:w-72" />
      </div>

      {/* Guest cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0
          ? <p className="col-span-full py-10 text-center font-body text-[0.86rem] text-[#8a7c6c]">No guests found.</p>
          : filtered.map(g => {
            const isActive = selected?.id === g.id
            return (
              <div key={g.id} className={`bg-bone-soft rounded-[2px] border-2 transition-all ${isActive ? 'border-brass' : 'border-transparent'}`}>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-basalt text-bone-soft flex items-center justify-center font-display text-[0.86rem] flex-none">
                      {g.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <strong className="font-body font-semibold text-[0.9rem] truncate block">{g.name}</strong>
                        <span className={`font-body font-bold text-[0.63rem] tracking-[0.06em] uppercase px-2 py-[0.2rem] rounded-full whitespace-nowrap ${statusStyles[g.status]}`}>
                          {statusLabels[g.status]}
                        </span>
                      </div>
                      <a href={`mailto:${g.email}`} className="font-body text-[0.75rem] text-[#8a7c6c] hover:text-crimson truncate block transition-colors">{g.email}</a>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-basalt/[0.08] mb-4">
                    {[['Nationality',g.nationality],['Stays',g.stays],['Total Spent',`ETB ${(g.totalSpent/1000).toFixed(0)}k`]].map(([k,v])=>(
                      <div key={k}>
                        <p className="font-body font-bold text-[0.62rem] uppercase tracking-[0.08em] text-[#8a7c6c] mb-[0.2rem]">{k}</p>
                        <p className="font-body text-[0.82rem]">{v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setSelected(isActive ? null : g)} className="flex-1 action-btn-view">
                      {isActive ? 'Hide' : 'Details'}
                    </button>
                    <button onClick={() => setEdit(g)} className="action-btn-edit">Edit</button>
                    <button onClick={() => setDeleteId(g.id)} className="action-btn-delete">Delete</button>
                  </div>
                </div>

                {isActive && (
                  <div className="border-t border-basalt/10 px-5 pb-5 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[['Phone',g.phone],['Last Stay',g.lastStay],['Nationality',g.nationality],['Total Stays',g.stays],['Total Spent',`ETB ${(g.totalSpent || 0).toLocaleString()}`],['Status',statusLabels[g.status]]].map(([k,v])=>(
                        <div key={k}>
                          <p className="font-body font-bold text-[0.62rem] uppercase tracking-[0.08em] text-[#8a7c6c] mb-1">{k}</p>
                          <p className="font-body font-semibold text-[0.88rem]">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        }
      </div>

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreate(false)} title="Add Guest">
        <GuestForm onSubmit={d => { addGuest(d); setCreate(false) }} onCancel={() => setCreate(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEdit(null)} title="Edit Guest">
        {editItem && <GuestForm initial={editItem} onSubmit={d => { updateGuest({ ...d, id: editItem.id }); setEdit(null) }} onCancel={() => setEdit(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteGuest(deleteId)} title="Delete Guest" message="This guest profile will be permanently removed." />
    </div>
  )
}
