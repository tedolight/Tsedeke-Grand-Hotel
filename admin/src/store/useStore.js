import { create } from 'zustand'
import {
  reservations as initReservations,
  rooms        as initRooms,
  guests       as initGuests,
  messages     as initMessages,
  galleryImages as initGallery,
} from '../data/mockData'
import * as reservationsApi from '../services/reservationsService'
import * as roomsApi from '../services/roomsService'
import * as messagesApi from '../services/messagesService'
import * as galleryApi from '../services/galleryService'

// ─── helpers ──────────────────────────────────────────────────────────────────
const nextId = (arr) => (arr.length === 0 ? 1 : Math.max(...arr.map(x => (typeof x.id === 'number' ? x.id : 0))) + 1)
const today  = () => new Date().toISOString().slice(0, 10)

// ─── toast slice ──────────────────────────────────────────────────────────────
let toastTimer = null

// ─── main store ───────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── toast ────────────────────────────────────────────────────────────────────
  toast: null,
  showToast: (message, type = 'success') => {
    clearTimeout(toastTimer)
    set({ toast: { id: Date.now(), message, type } })
    toastTimer = setTimeout(() => set({ toast: null }), 3200)
  },
  hideToast: () => { clearTimeout(toastTimer); set({ toast: null }) },

  // ── loading states ───────────────────────────────────────────────────────────
  isLoading: false,
  isLiveConnected: false,

  fetchInitialData: async () => {
    set({ isLoading: true })
    try {
      const [resList, roomList, msgList, galList] = await Promise.allSettled([
        reservationsApi.getReservations(),
        roomsApi.getRooms(),
        messagesApi.getMessages(),
        galleryApi.getGallery(),
      ])

      const updates = {}
      if (resList.status === 'fulfilled' && resList.value.length > 0) {
        updates.reservations = resList.value
        updates.isLiveConnected = true
      }
      if (roomList.status === 'fulfilled' && roomList.value.length > 0) {
        updates.rooms = roomList.value
      }
      if (msgList.status === 'fulfilled' && msgList.value.length > 0) {
        updates.messages = msgList.value
      }
      if (galList.status === 'fulfilled' && galList.value.length > 0) {
        updates.gallery = galList.value
      }

      if (Object.keys(updates).length > 0) {
        set(updates)
      }
    } catch {
      // Keep static fallback
    } finally {
      set({ isLoading: false })
    }
  },

  // ── reservations ─────────────────────────────────────────────────────────────
  reservations: initReservations,

  addReservation: async (data) => {
    const tempId = nextId(get().reservations)
    const optimisticItem = { ...data, id: tempId }
    set(s => ({ reservations: [optimisticItem, ...s.reservations] }))
    get().showToast('Reservation created successfully.')

    try {
      const saved = await reservationsApi.createReservation(data)
      if (saved) {
        set(s => ({
          reservations: s.reservations.map(r => r.id === tempId ? saved : r),
        }))
      }
    } catch {
      // Kept in optimistic local state
    }
  },

  updateReservation: async (data) => {
    set(s => ({ reservations: s.reservations.map(r => r.id === data.id ? { ...r, ...data } : r) }))
    get().showToast('Reservation updated.')

    try {
      await reservationsApi.updateReservation(data.id, data)
    } catch {
      // Kept locally
    }
  },

  deleteReservation: async (id) => {
    set(s => ({ reservations: s.reservations.filter(r => r.id !== id) }))
    get().showToast('Reservation deleted.', 'error')

    try {
      await reservationsApi.deleteReservation(id)
    } catch {
      // Kept locally
    }
  },

  // ── rooms ────────────────────────────────────────────────────────────────────
  rooms: initRooms,

  addRoom: (data) => {
    const item = { ...data, id: nextId(get().rooms), occupied: 0 }
    set(s => ({ rooms: [...s.rooms, item] }))
    get().showToast('Room type added.')
  },

  updateRoom: async (data) => {
    set(s => ({ rooms: s.rooms.map(r => r.id === data.id ? { ...r, ...data } : r) }))
    get().showToast('Room updated.')

    try {
      await roomsApi.updateRoom(data.id, data)
    } catch {
      // Kept locally
    }
  },

  deleteRoom: (id) => {
    set(s => ({ rooms: s.rooms.filter(r => r.id !== id) }))
    get().showToast('Room deleted.', 'error')
  },

  // ── guests ───────────────────────────────────────────────────────────────────
  guests: initGuests,

  addGuest: (data) => {
    const item = { ...data, id: nextId(get().guests), stays: 0, totalSpent: 0, lastStay: today() }
    set(s => ({ guests: [...s.guests, item] }))
    get().showToast('Guest profile created.')
  },
  updateGuest: (data) => {
    set(s => ({ guests: s.guests.map(g => g.id === data.id ? { ...g, ...data } : g) }))
    get().showToast('Guest profile updated.')
  },
  deleteGuest: (id) => {
    set(s => ({ guests: s.guests.filter(g => g.id !== id) }))
    get().showToast('Guest deleted.', 'error')
  },

  // ── messages ─────────────────────────────────────────────────────────────────
  messages: initMessages,

  addMessage: (data) => {
    const item = { ...data, id: nextId(get().messages), unread: true, time: 'just now', priority: data.priority ?? 'normal' }
    set(s => ({ messages: [item, ...s.messages] }))
    get().showToast('Message sent.')
  },

  updateMessage: (data) => {
    set(s => ({ messages: s.messages.map(m => m.id === data.id ? { ...m, ...data } : m) }))
    get().showToast('Message updated.')
  },

  markRead: (id) => {
    set(s => ({ messages: s.messages.map(m => m.id === id ? { ...m, unread: false } : m) }))
  },

  deleteMessage: async (id) => {
    set(s => ({ messages: s.messages.filter(m => m.id !== id) }))
    get().showToast('Message deleted.', 'error')

    try {
      await messagesApi.deleteMessage(id)
    } catch {
      // Kept locally
    }
  },

  // ── gallery ──────────────────────────────────────────────────────────────────
  gallery: initGallery,

  addGalleryItem: (data) => {
    const item = { ...data, id: nextId(get().gallery), uploaded: today(), featured: false }
    set(s => ({ gallery: [...s.gallery, item] }))
    get().showToast('Image added to gallery.')
  },

  updateGalleryItem: (data) => {
    set(s => ({ gallery: s.gallery.map(g => g.id === data.id ? { ...g, ...data } : g) }))
    get().showToast('Image updated.')
  },

  deleteGalleryItem: (id) => {
    set(s => ({ gallery: s.gallery.filter(g => g.id !== id) }))
    get().showToast('Image deleted.', 'error')
  },

  toggleFeatured: (id) => {
    set(s => ({ gallery: s.gallery.map(g => g.id === id ? { ...g, featured: !g.featured } : g) }))
    get().showToast('Featured status updated.')
  },
}))

