import { api } from './api.js'

function normalizeRoom(r) {
  const isServerRoom = 'price_etb' in r
  if (isServerRoom) {
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      type: r.bed_type?.includes('King') ? (r.name.includes('Boyaa') ? 'Premium Suite' : 'Suite') : 'Standard',
      capacity: r.max_guests || 2,
      pricePerNight: r.price_etb || 2800,
      status: 'available',
      amenities: [r.bed_type, `${r.view_type} View`, `${r.size_m2} m²`, 'Wi-Fi', 'AC', 'En-suite Bathroom'].filter(Boolean),
      description: r.short_desc || r.long_desc || '',
      floor: r.name.includes('Boyaa') ? 3 : r.name.includes('Bilate') ? 2 : 1,
      roomNumber: r.name.includes('Boyaa') ? '301–304' : r.name.includes('Bilate') ? '201–206' : '101–110',
      totalRooms: r.name.includes('Boyaa') ? 4 : r.name.includes('Bilate') ? 6 : 10,
      occupied: 0,
    }
  }

  return {
    id: r.id,
    name: r.name || 'Room',
    type: r.type || 'Standard',
    capacity: r.capacity || 2,
    pricePerNight: r.pricePerNight || 2800,
    status: r.status || 'available',
    amenities: r.amenities || [],
    description: r.description || '',
    floor: r.floor || 1,
    roomNumber: r.roomNumber || '101',
    totalRooms: r.totalRooms || 1,
    occupied: r.occupied || 0,
  }
}

export async function getRooms() {
  const data = await api.get('/rooms')
  return Array.isArray(data) ? data.map(normalizeRoom) : []
}

export async function updateRoom(id, data) {
  const payload = { ...data }
  if (data.pricePerNight) payload.price_etb = data.pricePerNight
  const res = await api.patch(`/rooms/${id}`, payload)
  return normalizeRoom(res.data || res)
}
