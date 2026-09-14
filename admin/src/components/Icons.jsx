// Icon library — all icons as inline SVG components
const iconProps = (className = '') => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.6',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: `block ${className}`,
  width: '100%',
  height: '100%',
})

export function IconGrid({ className }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
export function IconCalendar({ className }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="4" width="18" height="16" rx="1"/>
      <path d="M3 10h18M8 4v3M16 4v3"/>
    </svg>
  )
}
export function IconHome({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 21V9l8-6 8 6v12"/>
      <path d="M9 21v-6h6v6"/>
    </svg>
  )
}
export function IconUsers({ className }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="9" cy="8" r="3.2"/>
      <path d="M2.8 20c0-3.8 3-6 6.2-6s6.2 2.2 6.2 6"/>
      <circle cx="17.3" cy="9" r="2.4"/>
      <path d="M15.8 14.3c2.7.6 4 2.6 4 5.7"/>
    </svg>
  )
}
export function IconMail({ className }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="5" width="18" height="14" rx="1"/>
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>
    </svg>
  )
}
export function IconImage({ className }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="4" width="18" height="16" rx="1"/>
      <circle cx="8.5" cy="10" r="1.5"/>
      <path d="M21 16.5l-5.5-5-4 3.8-2.7-2.3-5.3 4.5"/>
    </svg>
  )
}
export function IconBarChart({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 4v16h16"/>
      <path d="M8 15l3.5-4 3 2.5L19 8"/>
    </svg>
  )
}
export function IconSettings({ className }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="3.2"/>
      <path d="M12 4.3v-1M12 20.7v-1M19.7 12h1M3.3 12h1M17.3 6.7l.7-.7M6 18l.7-.7M17.3 17.3l.7.7M6 6l.7.7"/>
    </svg>
  )
}
export function IconClock({ className }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
    </svg>
  )
}
export function IconChart({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 12h4l2-8 4 16 2-8h6"/>
    </svg>
  )
}
export function IconTrendUp({ className }) {
  return (
    <svg {...iconProps(className)} strokeWidth="2">
      <path d="M3 13l5-5 4 4 7-8"/>
      <path d="M14 4h5v5"/>
    </svg>
  )
}
export function IconTrendDown({ className }) {
  return (
    <svg {...iconProps(className)} strokeWidth="2">
      <path d="M3 7l5 5 4-4 7 8"/>
      <path d="M14 20h5v-5"/>
    </svg>
  )
}
export function IconSearch({ className }) {
  return (
    <svg {...iconProps(className)} strokeWidth="1.8">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.4-4.4"/>
    </svg>
  )
}
export function IconBell({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 8.5a6 6 0 0 1 12 0c0 4.5 1.8 5.8 1.8 5.8H4.2S6 13 6 8.5Z"/>
      <path d="M10 19a2 2 0 0 0 4 0"/>
    </svg>
  )
}
export function IconLogout({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9"/>
      <path d="M15.5 16.5L20 12l-4.5-4.5"/>
      <path d="M20 12H9"/>
    </svg>
  )
}
export function IconMenu({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  )
}
export function IconX({ className }) {
  return (
    <svg {...iconProps(className)} strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}
export function IconPlus({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}
export function IconInfo({ className }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 8v5M12 16h.01"/>
    </svg>
  )
}

const iconMap = {
  grid: IconGrid,
  calendar: IconCalendar,
  home: IconHome,
  users: IconUsers,
  mail: IconMail,
  image: IconImage,
  'bar-chart': IconBarChart,
  settings: IconSettings,
  clock: IconClock,
  chart: IconChart,
}

export function NavIcon({ name, className }) {
  const Comp = iconMap[name]
  return Comp ? <Comp className={className} /> : null
}
