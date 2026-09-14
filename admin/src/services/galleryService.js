import { api } from './api.js'

function normalizeGalleryItem(g) {
  return {
    id: g.id,
    title: g.label || g.title || 'Hotel View',
    label: g.label || g.title || 'Hotel View',
    category: (g.category || 'amenities').toLowerCase(),
    tags: [g.category || 'amenities'],
    size: '2.5 MB',
    uploaded: g.created_at ? new Date(g.created_at).toISOString().slice(0, 10) : '2026-06-15',
    featured: Boolean(g.featured),
    gradient_color: g.gradient_color || 'rgba(142,36,56,.4)',
    position: g.position || '50% 50%',
  }
}

export async function getGallery() {
  const data = await api.get('/gallery')
  return Array.isArray(data) ? data.map(normalizeGalleryItem) : []
}
