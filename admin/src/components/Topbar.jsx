import { useEffect, useRef, useState } from 'react'
import { IconSearch, IconBell, IconMenu, IconPlus } from './Icons'

export default function Topbar({ onMenuOpen, onNewReservation }) {
  const [scrolled, setScrolled] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')
    setDateStr(new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }))
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-[60] bg-bone flex items-center gap-5 px-6 lg:px-10 py-5
        transition-shadow duration-300 ${scrolled ? 'shadow-[0_8px_22px_rgba(27,23,20,0.08)]' : ''}`}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        className="lg:hidden w-9 h-9 flex items-center justify-center text-basalt rounded hover:bg-basalt/[0.06] transition-colors"
      >
        <span className="w-5 h-5"><IconMenu /></span>
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="font-body font-bold text-[0.72rem] tracking-[0.18em] uppercase text-crimson mb-0.5">
          {dateStr}
        </p>
        <h1 className="font-display text-[clamp(1.35rem,2.2vw,1.75rem)] font-medium leading-tight truncate">
          {greeting}, Selam.
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <label className="hidden md:flex items-center gap-2 w-56 bg-bone-soft border border-basalt/10 rounded-full px-4 py-[0.55rem] cursor-text">
          <span className="w-4 h-4 text-[#8a7c6c] flex-none"><IconSearch /></span>
          <input
            type="text"
            placeholder="Search guests, bookings…"
            aria-label="Search guests and bookings"
            className="flex-1 bg-transparent border-0 outline-0 font-body text-[0.85rem] text-basalt placeholder-[#a89a89]"
          />
        </label>

        {/* Notifications */}
        <button
          aria-label="View notifications"
          className="relative w-[2.1rem] h-[2.1rem] rounded-full flex items-center justify-center border border-basalt/15 text-basalt hover:border-brass hover:bg-basalt/[0.04] transition-all"
        >
          <span className="w-[1rem] h-[1rem]"><IconBell /></span>
          {/* Dot */}
          <span className="absolute top-[0.22rem] right-[0.22rem] w-[7px] h-[7px] rounded-full bg-crimson border-[1.5px] border-bone" />
        </button>

        {/* CTA */}
        <button
          onClick={onNewReservation}
          id="new-reservation-btn"
          className="flex items-center gap-2 font-body font-semibold text-[0.88rem] px-4 py-[0.7rem] rounded-[2px] bg-brass text-basalt hover:bg-brass-light hover:-translate-y-[2px] transition-all duration-200 whitespace-nowrap"
        >
          <span className="w-[0.9rem] h-[0.9rem] flex-none"><IconPlus /></span>
          New Reservation
        </button>
      </div>
    </header>
  )
}
