import { useState } from 'react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const CATS = ['All','Exterior','Rooms','Dining','Amenities']
const CAT_OPTS = ['exterior','rooms','dining','amenities']

const catColors = {
  exterior: 'bg-forest/10 text-forest', rooms: 'bg-brass/15 text-[#8a6a2f]',
  dining: 'bg-crimson/10 text-crimson', amenities: 'bg-basalt/8 text-basalt',
}
const gradients = [
  'from-basalt to-basalt/70','from-forest to-forest/60','from-[#4a3828] to-[#2a2018]',
  'from-crimson/80 to-basalt','from-brass/60 to-basalt','from-[#3a4830] to-basalt',
  'from-[#6a4a28] to-[#2a1808]','from-crimson/60 to-[#4a2828]','from-forest/70 to-basalt',
  'from-basalt/80 to-[#3a3020]','from-brass/50 to-basalt','from-[#4a3020] to-basalt',
]
const iconMap = { exterior:'🏛️', rooms:'🛏️', dining:'🍽️', amenities:'✨' }

const EMPTY_IMG = { title:'', category: CAT_OPTS[0], size:'', tags:'' }

function GalleryForm({ initial = EMPTY_IMG, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    ...EMPTY_IMG,
    ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Image Title *</label>
        <input required value={form.title} onChange={e => set('title', e.target.value)} className="field-input" placeholder="e.g. Lake View at Sunset" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className="field-input">
            {CAT_OPTS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">File Size (display only)</label>
          <input value={form.size} onChange={e => set('size', e.target.value)} className="field-input" placeholder="e.g. 3.2 MB" />
        </div>
      </div>
      <div>
        <label className="field-label">Tags (comma-separated)</label>
        <input value={form.tags} onChange={e => set('tags', e.target.value)} className="field-input" placeholder="e.g. lake, nature, exterior" />
      </div>
      <div>
        <label className="field-label">Upload File</label>
        <div className="border-2 border-dashed border-basalt/20 rounded-[2px] px-4 py-6 text-center hover:border-brass transition-colors cursor-pointer">
          <p className="font-body text-[0.84rem] text-[#8a7c6c]">📁 Click to select or drag & drop</p>
          <p className="font-body text-[0.73rem] text-[#8a7c6c]/60 mt-1">PNG, JPG, WEBP up to 10 MB</p>
          <input type="file" accept="image/*" className="sr-only" />
        </div>
      </div>
      <div className="flex gap-3 pt-2 justify-end border-t border-basalt/10">
        <button type="button" onClick={onCancel} className="btn-outline-sm">Cancel</button>
        <button type="submit" className="btn-primary-sm">Save Image</button>
      </div>
    </form>
  )
}

export default function Gallery() {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, toggleFeatured } = useStore()
  const [filter, setFilter]     = useState('All')
  const [view, setView]         = useState('grid')
  const [createOpen, setCreate] = useState(false)
  const [editItem, setEdit]     = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  const filtered = gallery.filter(img =>
    filter === 'All' || img.category === filter.toLowerCase()
  )

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7 pb-16">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-7">
        <div>
          <p className="eyebrow-label">Manage</p>
          <h1 className="page-title">Gallery</h1>
          <p className="font-body text-[0.84rem] text-[#8a7c6c] mt-1">{gallery.length} images · {gallery.filter(g=>g.featured).length} featured</p>
        </div>
        <button onClick={() => setCreate(true)} className="btn-primary">+ Upload Image</button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4 flex-wrap mb-5">
        <div className="flex gap-2 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`filter-tab ${filter === c ? 'filter-tab-active' : ''}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {['grid','list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`w-9 h-9 rounded-[2px] flex items-center justify-center border transition-all
                ${view === v ? 'bg-basalt text-bone-soft border-basalt' : 'border-basalt/18 text-[#5a4f44] hover:border-brass'}`}
              aria-label={`${v} view`}
            >
              {v === 'grid'
                ? <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>
                : <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><rect x="2" y="3" width="16" height="3" rx="1"/><rect x="2" y="8.5" width="16" height="3" rx="1"/><rect x="2" y="14" width="16" height="3" rx="1"/></svg>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((img, i) => (
            <div key={img.id} className="group relative rounded-[2px] overflow-hidden aspect-[4/3]">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-[2.5rem] cursor-pointer`}
                onClick={() => setLightbox(img)}>
                {iconMap[img.category]}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-basalt/90 via-basalt/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              {/* Info on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <p className="font-body font-semibold text-[0.81rem] text-bone-soft leading-tight">{img.title}</p>
                <p className="font-body text-[0.72rem] text-bone/70 mt-0.5">{img.size}</p>
              </div>
              {/* Featured badge */}
              {img.featured && (
                <span className="absolute top-2 right-2 font-body font-bold text-[0.59rem] uppercase bg-brass text-basalt px-2 py-[0.2rem] rounded-full">Featured</span>
              )}
              {/* Category chip */}
              <span className={`absolute top-2 left-2 font-body font-bold text-[0.59rem] uppercase px-2 py-[0.2rem] rounded-full ${catColors[img.category]}`}>{img.category}</span>
              {/* Action buttons on hover */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => toggleFeatured(img.id)} title={img.featured ? 'Unfeature' : 'Feature'}
                  className="w-7 h-7 rounded bg-bone/90 text-[0.9rem] flex items-center justify-center hover:bg-brass transition-colors">
                  {img.featured ? '★' : '☆'}
                </button>
                <button onClick={() => setEdit(img)} className="w-7 h-7 rounded bg-bone/90 text-[0.8rem] flex items-center justify-center hover:bg-bone transition-colors font-bold text-basalt">✎</button>
                <button onClick={() => setDeleteId(img.id)} className="w-7 h-7 rounded bg-crimson/90 text-bone-soft text-[0.9rem] flex items-center justify-center hover:bg-crimson transition-colors">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-bone-soft rounded-[2px]">
          {filtered.length === 0
            ? <p className="py-10 text-center font-body text-[0.86rem] text-[#8a7c6c]">No images found.</p>
            : filtered.map((img, i) => (
              <div key={img.id} className={`flex items-center gap-4 px-5 py-4 ${i < filtered.length - 1 ? 'border-b border-basalt/[0.07]' : ''}`}>
                <div className={`w-14 h-10 rounded flex-none flex items-center justify-center bg-gradient-to-br ${gradients[i % gradients.length]} text-[1.3rem] cursor-pointer`}
                  onClick={() => setLightbox(img)}>
                  {iconMap[img.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-[0.2rem] flex-wrap">
                    <strong className="font-body font-semibold text-[0.9rem] truncate">{img.title}</strong>
                    {img.featured && <span className="font-body font-bold text-[0.59rem] uppercase bg-brass/20 text-[#8a6a2f] px-2 py-[0.15rem] rounded-full">Featured</span>}
                  </div>
                  <div className="flex gap-3 text-[0.74rem] text-[#8a7c6c]">
                    <span>{img.size}</span>
                    <span>Uploaded {img.uploaded}</span>
                    {img.tags?.length > 0 && <span>{img.tags.join(', ')}</span>}
                  </div>
                </div>
                <span className={`font-body font-bold text-[0.66rem] tracking-[0.07em] uppercase px-2 py-[0.22rem] rounded-full flex-none ${catColors[img.category]}`}>{img.category}</span>
                <div className="flex gap-2 flex-none">
                  <button onClick={() => toggleFeatured(img.id)} title={img.featured ? 'Unfeature' : 'Feature'}
                    className="action-btn-view">{img.featured ? 'Unfeature' : 'Feature'}</button>
                  <button onClick={() => setEdit(img)} className="action-btn-edit">Edit</button>
                  <button onClick={() => setDeleteId(img.id)} className="action-btn-delete">Delete</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[300] bg-basalt/92 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className={`w-full aspect-[4/3] rounded-[2px] bg-gradient-to-br ${gradients[gallery.findIndex(g=>g.id===lightbox.id) % gradients.length]} flex items-center justify-center text-[5rem] mb-5`}>
              {iconMap[lightbox.category]}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-display text-[1.3rem] text-bone-soft mb-1">{lightbox.title}</h2>
                <div className="flex gap-3 text-[0.78rem] text-bone/50">
                  <span>{lightbox.size}</span><span>·</span><span>{lightbox.uploaded}</span>
                </div>
              </div>
              <button onClick={() => setLightbox(null)} className="text-bone/50 hover:text-bone-soft text-[1.8rem] leading-none">&times;</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreate(false)} title="Upload Image">
        <GalleryForm onSubmit={d => { addGalleryItem(d); setCreate(false) }} onCancel={() => setCreate(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEdit(null)} title="Edit Image">
        {editItem && <GalleryForm initial={editItem} onSubmit={d => { updateGalleryItem({ ...d, id: editItem.id }); setEdit(null) }} onCancel={() => setEdit(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteGalleryItem(deleteId)} title="Delete Image" message="This image will be permanently removed from the gallery." />
    </div>
  )
}
