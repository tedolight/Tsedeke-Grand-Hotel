import { api } from './api.js'

function formatTime(dateStr) {
  if (!dateStr) return 'just now'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function normalizeMessage(m) {
  const name = m.cName || m.name || 'Guest'
  const initials = name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'G'
  const subject = m.cReason || m.subject || 'Inquiry'
  const body = m.cMessage || m.body || ''
  const tag = m.cReason || m.tag || 'General'

  return {
    id: m.id,
    name,
    cName: name,
    initials,
    subject,
    body,
    cMessage: body,
    cReason: tag,
    tag,
    email: m.cEmail || m.email || '',
    cEmail: m.cEmail || m.email || '',
    priority: m.priority || 'normal',
    unread: m.unread !== undefined ? m.unread : true,
    time: formatTime(m.created_at || m.createdAt),
    created_at: m.created_at,
  }
}

export async function getMessages() {
  const data = await api.get('/contact')
  return Array.isArray(data) ? data.map(normalizeMessage) : []
}

export async function createMessage(data) {
  const payload = {
    cName: data.name || data.cName,
    cEmail: data.email || data.cEmail || 'guest@example.com',
    cReason: data.tag || data.subject || data.cReason || 'General',
    cMessage: data.body || data.cMessage,
  }
  const res = await api.post('/contact', payload)
  return normalizeMessage(res.data || res)
}

export async function updateMessage(id, data) {
  const payload = { ...data }
  if (data.name) payload.cName = data.name
  if (data.email) payload.cEmail = data.email
  if (data.body) payload.cMessage = data.body
  if (data.subject || data.tag) payload.cReason = data.tag || data.subject
  const res = await api.patch(`/contact/${id}`, payload)
  return normalizeMessage(res.data || res)
}

export async function deleteMessage(id) {
  return api.delete(`/contact/${id}`)
}
