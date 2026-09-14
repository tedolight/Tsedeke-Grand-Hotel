import { monthlyRevenue, reservations, rooms, guests } from '../data/mockData'

const CHART_W = 560
const CHART_H = 160
const BAR_W = 50
const BAR_GAP = (CHART_W - BAR_W * monthlyRevenue.length) / (monthlyRevenue.length + 1)
const BASELINE = 140
const MAX_H = 110
const maxRev = Math.max(...monthlyRevenue.map(d => d.revenue))

const kpis = [
  { label: 'Total Revenue (YTD)',   value: 'ETB 2,603,200', delta: '+18%', up: true  },
  { label: 'Avg. Nightly Rate',     value: 'ETB 4,433',     delta: '+5%',  up: true  },
  { label: 'Total Reservations',    value: '148',           delta: '+22%', up: true  },
  { label: 'Avg. Length of Stay',   value: '2.4 nights',   delta: '+0.3', up: true  },
  { label: 'Cancellation Rate',     value: '8%',            delta: '−2%',  up: true  },
  { label: 'Guest Satisfaction',    value: '4.7 / 5.0',    delta: '+0.2', up: true  },
]

const topGuests = guests
  .sort((a,b) => b.totalSpent - a.totalSpent)
  .slice(0, 5)

export default function Reports() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7 pb-16">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-7">
        <div>
          <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">System</p>
          <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)]">Reports</h1>
          <p className="font-body text-[0.84rem] text-[#8a7c6c] mt-1">Year-to-date performance · August 2026</p>
        </div>
        <button className="font-body font-semibold text-[0.88rem] px-5 py-[0.75rem] rounded-[2px] border border-basalt/20 text-basalt hover:border-brass transition-all">
          ↓ Export PDF
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-7">
        {kpis.map(k => (
          <div key={k.label} className="bg-bone-soft rounded-[2px] px-5 py-5">
            <p className="font-body font-bold text-[0.64rem] tracking-[0.09em] uppercase text-[#8a7c6c] mb-2">{k.label}</p>
            <p className="font-display text-[1.6rem] leading-none mb-2">{k.value}</p>
            <span className={`inline-flex items-center gap-1 font-body font-bold text-[0.68rem] px-2 py-[0.2rem] rounded-full
              ${k.up ? 'bg-forest/10 text-forest' : 'bg-crimson/10 text-crimson'}`}>
              {k.up ? '↑' : '↓'} {k.delta} vs last year
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6 mb-6">
        {/* Revenue chart */}
        <div className="bg-bone-soft rounded-[2px] p-7">
          <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">Revenue</p>
          <h2 className="font-display text-[1.28rem] mb-5">Monthly Revenue (2026)</h2>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" role="img" aria-label="Monthly revenue bar chart">
            <line x1="0" y1={BASELINE} x2={CHART_W} y2={BASELINE} stroke="rgba(27,23,20,0.12)" strokeWidth="1" />
            {monthlyRevenue.map((d, i) => {
              const barH = (d.revenue / maxRev) * MAX_H
              const x = BAR_GAP + i * (BAR_W + BAR_GAP)
              const y = BASELINE - barH
              const cx = x + BAR_W / 2
              const isLast = i === monthlyRevenue.length - 1
              return (
                <g key={d.month}>
                  <rect x={x} y={y} width={BAR_W} height={barH} rx="3" fill={isLast ? '#8E2438' : '#B08D4F'} opacity="0.85" />
                  <text x={cx} y={y - 7} textAnchor="middle" fontSize="11" fontWeight={isLast ? '600' : '400'} fill={isLast ? '#8E2438' : '#5a4f44'} fontFamily="Fraunces,serif">
                    {(d.revenue/1000).toFixed(0)}k
                  </text>
                  <text x={cx} y={BASELINE + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#8a7c6c" fontFamily="Karla,sans-serif">
                    {d.month.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Reservation breakdown */}
        <div className="bg-bone-soft rounded-[2px] p-7">
          <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">Bookings</p>
          <h2 className="font-display text-[1.28rem] mb-5">Reservation Breakdown</h2>
          {[
            { label: 'Wachemo Room', count: 68, color: '#3C4A34' },
            { label: 'Bilate Suite',  count: 42, color: '#8E2438' },
            { label: 'Boyaa Suite',   count: 38, color: '#B08D4F' },
          ].map(r => (
            <div key={r.label} className="mb-5">
              <div className="flex justify-between text-[0.83rem] mb-2">
                <span className="font-body font-semibold">{r.label}</span>
                <span className="font-body text-[#8a7c6c]">{r.count} bookings</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(r.count/148*100).toFixed(0)}%`, background: r.color }} />
              </div>
            </div>
          ))}
          <div className="mt-5 pt-4 border-t border-basalt/10">
            <p className="font-body font-bold text-[0.65rem] tracking-[0.08em] uppercase text-[#8a7c6c] mb-1">Total Bookings (YTD)</p>
            <p className="font-display text-[1.7rem]">148</p>
          </div>
        </div>
      </div>

      {/* Top guests */}
      <div className="bg-bone-soft rounded-[2px] p-7">
        <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">Loyalty</p>
        <h2 className="font-display text-[1.28rem] mb-5">Top Guests by Spend</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[480px]">
            <thead>
              <tr>
                {['Rank', 'Guest', 'Nationality', 'Stays', 'Total Spent'].map((h, i) => (
                  <th key={h} className={`font-body font-bold text-[0.64rem] tracking-[0.08em] uppercase text-[#8a7c6c] pb-3 border-b border-basalt/14 text-left ${i===4?'text-right':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topGuests.map((g, i) => (
                <tr key={g.id} className="group">
                  <td className="py-[0.9rem] border-b border-basalt/[0.07] group-last:border-b-0">
                    <span className={`font-display font-medium text-[1.1rem] ${i===0?'text-brass':i===1?'text-[#8a7c6c]':i===2?'text-[#a07848]':'text-basalt/30'}`}>
                      {['①','②','③','④','⑤'][i]}
                    </span>
                  </td>
                  <td className="py-[0.9rem] border-b border-basalt/[0.07] group-last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-basalt text-bone-soft flex items-center justify-center font-display text-[0.74rem] flex-none">{g.initials}</div>
                      <span className="font-body font-semibold text-[0.87rem]">{g.name}</span>
                    </div>
                  </td>
                  <td className="py-[0.9rem] border-b border-basalt/[0.07] font-body text-[0.86rem] text-[#5a4f44]">{g.nationality}</td>
                  <td className="py-[0.9rem] border-b border-basalt/[0.07] font-body text-[0.86rem]">{g.stays}</td>
                  <td className="py-[0.9rem] border-b border-basalt/[0.07] font-display text-[0.94rem] text-crimson text-right">ETB {(g.totalSpent || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
