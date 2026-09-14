import { useState } from 'react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const TAG_OPTS = ['Rate inquiry','Event booking','General','Booking confirmation','Special request','Activity','Complaint','Feedback']
const PRIORITY_OPTS = ['normal','high','low']

const priorityStyles = { high:'bg-crimson/10 text-crimson', normal:'bg-brass/12 text-[#8a6a2f]', low:'bg-forest/10 text-forest' }
const tagColors = {
  'Rate inquiry':'text-crimson','Event booking':'text-[#8a6a2f]','General':'text-[#5a4f44]',
  'Booking confirmation':'text-forest','Special request':'text-brass','Activity':'text-forest',
  'Complaint':'text-crimson','Feedback':'text-[#8a7c6c]',
}

const EMPTY_MSG = { name:'', initials:'', subject:'', tag: TAG_OPTS[0], priority: 'normal', body:'' }

function initials(name) { return name.trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() }

function MessageForm({ initial = EMPTY_MSG, onSubmit, onCancel, isCompose = true }) {
  const [form, setForm] = useState({ ...EMPTY_MSG, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.body.trim()) return
    onSubmit({ ...form, initials: initials(form.name || 'Staff') })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isCompose && (
        <div>
          <label className="field-label">Guest Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} className="field-input" />
        </div>
      )}
      <div>
        <label className="field-label">Subject *</label>
        <input required value={form.subject} onChange={e => set('subject', e.target.value)} className="field-input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Tag</label>
          <select value={form.tag} onChange={e => set('tag', e.target.value)} className="field-input">
            {TAG_OPTS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} className="field-input">
            {PRIORITY_OPTS.map(p => <option key={p} className="capitalize">{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="field-label">Message *</label>
        <textarea required rows={5} value={form.body} onChange={e => set('body', e.target.value)} className="field-input resize-none" />
      </div>
      <div className="flex gap-3 pt-2 justify-end border-t border-basalt/10">
        <button type="button" onClick={onCancel} className="btn-outline-sm">Cancel</button>
        <button type="submit" className="btn-primary-sm">{isCompose ? 'Send Message' : 'Save Changes'}</button>
      </div>
    </form>
  )
}

export default function Messages() {
  const { messages, addMessage, updateMessage, markRead, deleteMessage } = useStore()
  const [selected, setSelected]   = useState(null)
  const [composeOpen, setCompose] = useState(false)
  const [editItem, setEdit]       = useState(null)
  const [deleteId, setDeleteId]   = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replied, setReplied]     = useState({})
  const [search, setSearch]       = useState('')
  const [filterUnread, setFilterUnread] = useState(false)

  const filtered = messages.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q)
    return matchSearch && (!filterUnread || m.unread)
  })

  const unreadCount = messages.filter(m => m.unread).length

  const handleSelect = (m) => {
    setSelected(m)
    if (m.unread) markRead(m.id)
  }

  const handleReply = () => {
    if (!replyText.trim() || !selected) return
    setReplied(prev => ({ ...prev, [selected.id]: true }))
    setReplyText('')
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7 pb-16">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-7">
        <div>
          <p className="eyebrow-label">Manage</p>
          <h1 className="page-title">
            Messages
            {unreadCount > 0 && (
              <span className="ml-3 align-middle font-body font-bold text-[0.69rem] bg-crimson text-bone-soft px-2 py-[0.24rem] rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
        </div>
        <button onClick={() => setCompose(true)} className="btn-primary">+ Compose</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-5">
        {/* ── Inbox list ────────────────────────────────────────── */}
        <div className="bg-bone-soft rounded-[2px] overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-basalt/10 flex gap-3 items-center flex-wrap flex-none">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…"
              className="flex-1 field-input min-w-[120px]" />
            <button onClick={() => setFilterUnread(f => !f)}
              className={`filter-tab whitespace-nowrap ${filterUnread ? 'filter-tab-active' : ''}`}>
              Unread only
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0
              ? <p className="py-10 text-center font-body text-[0.85rem] text-[#8a7c6c]">No messages found.</p>
              : filtered.map(m => (
                <button key={m.id} onClick={() => handleSelect(m)}
                  className={`w-full text-left flex gap-3 p-4 border-b border-basalt/[0.07] transition-colors hover:bg-bone
                    ${selected?.id === m.id ? 'bg-bone border-l-[3px] border-l-brass pl-[calc(1rem-3px)]' : m.unread ? 'bg-bone-soft' : 'bg-bone-soft/60'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-[0.8rem] flex-none
                    ${m.unread ? 'bg-basalt text-bone-soft' : 'bg-basalt/20 text-basalt'}`}>
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <strong className={`font-body text-[0.87rem] truncate ${m.unread ? 'font-bold' : 'font-semibold'}`}>{m.name}</strong>
                      <time className="font-body text-[0.69rem] text-[#8a7c6c] flex-none">{m.time}</time>
                    </div>
                    <p className={`font-body text-[0.8rem] truncate mt-[0.1rem] ${m.unread ? 'text-basalt font-semibold' : 'text-[#5a4f44]'}`}>{m.subject}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`font-body font-bold text-[0.61rem] uppercase tracking-[0.05em] ${tagColors[m.tag] ?? 'text-[#8a7c6c]'}`}>{m.tag}</span>
                      {m.priority === 'high' && <span className="font-body font-bold text-[0.6rem] bg-crimson/10 text-crimson px-[0.35rem] py-[0.1rem] rounded-full">Urgent</span>}
                      {replied[m.id] && <span className="font-body font-bold text-[0.6rem] bg-forest/10 text-forest px-[0.35rem] py-[0.1rem] rounded-full">Replied</span>}
                    </div>
                  </div>
                  {m.unread && <span className="w-2 h-2 rounded-full bg-crimson flex-none mt-2" />}
                </button>
              ))
            }
          </div>
        </div>

        {/* ── Message Detail ────────────────────────────────────── */}
        {selected ? (
          <div className="bg-bone-soft rounded-[2px] p-7 flex flex-col min-h-[520px]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-basalt text-bone-soft flex items-center justify-center font-display text-[0.9rem]">{selected.initials}</div>
                <div>
                  <strong className="font-body font-semibold text-[0.95rem] block">{selected.name}</strong>
                  <span className={`font-body font-bold text-[0.63rem] tracking-[0.06em] uppercase ${tagColors[selected.tag] ?? 'text-[#8a7c6c]'}`}>{selected.tag}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-body font-bold text-[0.64rem] tracking-[0.06em] uppercase px-2 py-[0.22rem] rounded-full ${priorityStyles[selected.priority]}`}>
                  {selected.priority === 'high' ? 'Urgent' : selected.priority}
                </span>
                <button onClick={() => setEdit(selected)} className="action-btn-edit ml-1">Edit</button>
                <button onClick={() => setDeleteId(selected.id)} className="action-btn-delete">Delete</button>
                <button onClick={() => setSelected(null)} className="ml-1 text-[#8a7c6c] hover:text-crimson text-[1.4rem] leading-none transition-colors">&times;</button>
              </div>
            </div>

            <h2 className="font-display text-[1.12rem] mb-4 pb-4 border-b border-basalt/10">{selected.subject}</h2>
            <p className="font-body text-[0.91rem] text-[#3a3028] leading-relaxed flex-1 mb-5">{selected.body}</p>

            {/* Reply */}
            <div className="border-t border-basalt/10 pt-4">
              <p className="font-body font-bold text-[0.66rem] tracking-[0.1em] uppercase text-[#8a7c6c] mb-2">
                {replied[selected.id] ? '✓ Replied — send another?' : 'Reply'}
              </p>
              <textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${selected.name}…`}
                className="field-input w-full resize-none mb-3" />
              <div className="flex gap-3">
                <button onClick={handleReply} className="btn-primary-sm">Send Reply</button>
                <button onClick={() => setReplyText('')} className="btn-outline-sm">Clear</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-bone-soft rounded-[2px] flex items-center justify-center py-24">
            <div className="text-center">
              <p className="font-display text-[1.4rem] text-basalt/30 mb-2">Select a message</p>
              <p className="font-body text-[0.83rem] text-[#8a7c6c]">Click a message to read and reply.</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <Modal open={composeOpen} onClose={() => setCompose(false)} title="Compose Message" size="md">
        <MessageForm isCompose onSubmit={d => { addMessage(d); setCompose(false) }} onCancel={() => setCompose(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEdit(null)} title="Edit Message" size="md">
        {editItem && (
          <MessageForm initial={editItem} isCompose={false}
            onSubmit={d => { updateMessage({ ...d, id: editItem.id }); setEdit(null); setSelected(prev => prev?.id === editItem.id ? { ...prev, ...d } : prev) }}
            onCancel={() => setEdit(null)} />
        )}
      </Modal>

      {/* Delete */}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMessage(deleteId); if (selected?.id === deleteId) setSelected(null); setDeleteId(null) }}
        title="Delete Message" message="This message will be permanently deleted." />
    </div>
  )
}
