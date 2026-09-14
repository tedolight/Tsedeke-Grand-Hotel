import { useEffect, useRef, useState } from 'react'
import { NavIcon, IconTrendUp, IconTrendDown } from './Icons'

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return value
}

const gradients = {
  forest:  'radial-gradient(ellipse 75% 65% at 88% -10%, rgba(60,74,52,0.45), transparent 65%)',
  brass:   'radial-gradient(ellipse 75% 65% at 88% -10%, rgba(176,141,79,0.4), transparent 65%)',
  crimson: 'radial-gradient(ellipse 75% 65% at 88% -10%, rgba(142,36,56,0.38), transparent 65%)',
}

export default function StatCard({ label, value, prefix = '', suffix = '', delta, deltaUp, icon, color }) {
  const animated = useCountUp(value)
  const displayVal = `${prefix}${animated.toLocaleString('en-US')}${suffix}`

  return (
    <div
      className="relative overflow-hidden rounded-[2px] bg-basalt text-bone-soft px-6 pt-6 pb-5 flex flex-col"
      style={{ '--grad': gradients[color] || gradients.brass }}
    >
      {/* gradient blob */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--grad)' }} />

      <div className="relative z-10 flex justify-between items-start mb-6">
        {/* Icon ring */}
        <div className="w-[2.3rem] h-[2.3rem] rounded-full border border-brass flex items-center justify-center flex-none">
          <span className="w-[1.05rem] h-[1.05rem] text-brass-light">
            <NavIcon name={icon} />
          </span>
        </div>

        {/* Delta badge */}
        <span className={`inline-flex items-center gap-[0.22rem] text-[0.69rem] font-bold px-[0.5rem] py-[0.26rem] rounded-full ${
          deltaUp
            ? 'text-[#a8c495] bg-forest/40'
            : 'text-brass-light bg-brass/20'
        }`}>
          <span className="w-[0.75rem] h-[0.75rem] flex-none">
            {deltaUp ? <IconTrendUp /> : <IconTrendDown />}
          </span>
          {delta}
        </span>
      </div>

      <div className="relative z-10">
        <div className="font-display font-medium text-[clamp(1.9rem,2.5vw,2.4rem)] mb-1 leading-none">
          {displayVal}
        </div>
        <div className="font-body font-bold text-[0.69rem] tracking-[0.09em] uppercase text-bone/60">
          {label}
        </div>
      </div>
    </div>
  )
}
