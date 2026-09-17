import { useEffect, useState } from 'react'

// Global toast event bus — components fire window.dispatchEvent(new CustomEvent('admin-toast', { detail: { message, type } }))
export function showAdminToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('admin-toast', { detail: { message, type } }));
}

const icons = {
  success: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>
    </svg>
  ),
}

const styles = {
  success: 'bg-[#1e3a24] text-[#a8d4a8] border-[#2d5c34]',
  error:   'bg-[#3a1820] text-[#e8a0a0] border-[#5c2028]',
  info:    'bg-[#2a2418] text-[#d4b878] border-[#4a3c20]',
}

export default function Toast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let timer
    const handler = (e) => {
      clearTimeout(timer)
      setToast({ id: Date.now(), ...e.detail })
      timer = setTimeout(() => setToast(null), 3200)
    }
    window.addEventListener('admin-toast', handler)
    return () => { window.removeEventListener('admin-toast', handler); clearTimeout(timer) }
  }, [])

  if (!toast) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[500]"
      style={{ animation: 'toastIn .3s ease' }}
    >
      <div className={`flex items-center gap-3 px-5 py-[0.85rem] rounded-[2px] border shadow-xl font-body text-[0.88rem] font-semibold max-w-sm ${styles[toast.type] ?? styles.success}`}>
        <span className="flex-none">{icons[toast.type] ?? icons.success}</span>
        <span className="flex-1">{toast.message}</span>
        <button
          onClick={() => setToast(null)}
          className="flex-none opacity-60 hover:opacity-100 transition-opacity text-[1.2rem] leading-none ml-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
