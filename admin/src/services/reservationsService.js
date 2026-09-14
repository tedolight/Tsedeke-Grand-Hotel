import { api } from './api.js'

const ROOM_PRICES = { 'Wachemo Room': 2800, 'Bilate Suite': 4200, 'Boyaa Suite': 6500 }

function normalizeReservation(b) {
  const checkIn = b.checkin || b.checkIn || ''
  const checkOut = b.checkout || b.checkOut || ''
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : (b.nights || 1)
  const guest = b.fullName || b.guest || 'Guest'
  const initials = guest.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'G'
  const room = b.roomType || b.room || 'Wachemo Room'
  const amount = b.amount || ((ROOM_PRICES[room] ?? 2800) * nights)

  return {
    id: b.id,
    guest,
    initials,
    room,
    roomType: room,
    checkIn,
    checkOut,
    checkin: checkIn,
    checkout: checkOut,
    nights,
    status: b.status || 'pending',
    amount,
    paid: b.paid ?? false,
    phone: b.phone || '',
    email: b.email || '',
    requests: b.requests || '',
    guests: b.guests || '1',
    fullName: guest,
  }
}

export async function getReservations() {
  const data = await api.get('/bookings')
  return Array.isArray(data) ? data.map(normalizeReservation) : []
}

export async function createReservation(data) {
  const payload = {
    checkin: data.checkIn || data.checkin,
    checkout: data.checkOut || data.checkout,
    roomType: data.room || data.roomType || 'Wachemo Room',
    guests: String(data.guests || 1),
    fullName: data.guest || data.fullName,
    phone: data.phone || '+251 000 000 000',
    email: data.email || 'guest@example.com',
    requests: data.requests || '',
    status: data.status || 'confirmed',
  }
  const res = await api.post('/bookings', payload)
  return normalizeReservation(res.data || res)
}

export async function updateReservation(id, data) {
  const payload = { ...data }
  if (data.checkIn) payload.checkin = data.checkIn
  if (data.checkOut) payload.checkout = data.checkOut
  if (data.room) payload.roomType = data.room
  if (data.guest) payload.fullName = data.guest
  const res = await api.patch(`/bookings/${id}`, payload)
  return normalizeReservation(res.data || res)
}

export async function deleteReservation(id) {
  return api.delete(`/bookings/${id}`)
}
