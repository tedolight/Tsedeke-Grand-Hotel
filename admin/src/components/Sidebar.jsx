import { useState, useEffect } from 'react'
import { navItems } from '../data/mockData'
import { NavIcon, IconLogout, IconX } from './Icons'

export default function Sidebar({ activeId, onNavigate, isOpen, onClose }) {
  // Close sidebar on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-basalt/50 z-[150] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 z-[200] bg-basalt text-bone-soft flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="px-6 pt-7 pb-5">
          <button onClick={() => onNavigate('dashboard')} className="block text-left">
            <span className="font-display text-[1.3rem] font-medium tracking-[0.02em] text-bone-soft block">
              Tsedeke Grand
            </span>
          </button>
          <span className="font-body font-bold text-[0.64rem] tracking-[0.16em] uppercase text-brass-light">
            Staff Portal
          </span>
        </div>

        <div className="stripe" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          {navItems.map(({ group, links }) => (
            <div key={group} className="mb-1">
              <p className="px-3 mb-1 mt-4 first:mt-0 text-[0.62rem] font-bold tracking-[0.14em] uppercase text-bone/30">
                {group}
              </p>
              {links.map(({ id, label, icon, badge }) => {
                const isActive = activeId === id
                return (
                  <button
                    key={id}
                    onClick={() => { onNavigate(id); onClose() }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      w-full flex items-center gap-[0.85rem] px-3 py-[0.65rem] mb-[0.12rem] text-left rounded-[2px]
                      font-body font-medium text-[0.87rem] transition-all duration-200
                      border-l-2
                      ${isActive
                        ? 'bg-brass/10 border-brass text-brass-light'
                        : 'border-transparent text-bone/65 hover:bg-bone/[0.06] hover:text-bone-soft'
                      }
                    `}
                  >
                    <span className="w-[1.05rem] h-[1.05rem] flex-none opacity-85">
                      <NavIcon name={icon} />
                    </span>
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span className="bg-crimson text-bone-soft text-[0.65rem] font-bold leading-none px-[0.4rem] py-[0.28rem] rounded-full">
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="flex items-center gap-[0.7rem] px-5 py-4 border-t border-bone/10">
          <div className="w-9 h-9 rounded-full bg-brass text-basalt flex items-center justify-center font-display font-medium text-[0.85rem] flex-none">
            SW
          </div>
          <div className="flex-1 min-w-0 leading-snug">
            <strong className="block text-[0.84rem] text-bone-soft truncate">Selam Worku</strong>
            <span className="text-[0.71rem] text-bone/50">Front Desk Manager</span>
          </div>
          <button
            aria-label="Log out"
            className="w-[2.1rem] h-[2.1rem] rounded-full flex items-center justify-center border border-bone/20 text-bone-soft hover:border-brass hover:bg-bone/[0.06] transition-all flex-none"
          >
            <span className="w-4 h-4"><IconLogout /></span>
          </button>
        </div>
      </aside>
    </>
  )
}
