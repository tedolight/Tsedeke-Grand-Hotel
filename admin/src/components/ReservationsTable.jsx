import { useState } from 'react'
import { reservations } from '../data/mockData'

const FILTERS = ['All', 'Confirmed', 'Pending', 'Cancelled']

const statusStyles = {
  confirmed: 'bg-forest/[0.13] text-forest',
  pending:   'bg-brass/[0.17] text-[#8a6a2f]',
  cancelled: 'bg-crimson/[0.1]  text-crimson',
}
const dotColors = {
  confirmed: 'bg-forest',
  pending:   'bg-brass',
  cancelled: 'bg-crimson',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-[0.38rem] text-[0.71rem] font-bold px-[0.68rem] py-[0.28rem] rounded-full capitalize ${statusStyles[status]}`}>
      <span className={`w-[6px] h-[6px] rounded-full flex-none ${dotColors[status]}`} />
      {status}
    </span>
  )
}

export default function ReservationsTable() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? reservations
    : reservations.filter(r => r.status === filter.toLowerCase())

  return (
    <div className="bg-bone-soft rounded-[2px] p-7">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
        <div>
          <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">Bookings</p>
          <h2 className="font-display text-[1.28rem]">Recent Reservations</h2>
        </div>
        <a href="#" className="font-body font-semibold text-[0.8rem] text-basalt border-b border-brass pb-[0.15rem] hover:text-crimson hover:border-crimson transition-colors flex-none">
          View all
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-[0.5rem] flex-wrap mb-5" role="group" aria-label="Filter reservations">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-body font-semibold text-[0.77rem] px-4 py-[0.48rem] rounded-full border transition-all duration-200
              ${filter === f
                ? 'bg-basalt text-bone-soft border-basalt'
                : 'border-basalt/18 text-[#5a4f44] hover:border-brass hover:text-basalt'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[520px]">
          <thead>
            <tr>
              {['Guest', 'Room', 'Dates', 'Status', 'Amount'].map((h, i) => (
                <th
                  key={h}
                  className={`font-body font-bold text-[0.65rem] tracking-[0.08em] uppercase text-[#8a7c6c] pb-3 border-b border-basalt/14 text-left ${i === 4 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center font-body text-[0.86rem] text-[#8a7c6c]">
                  No reservations found.
                </td>
              </tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="group">
                <td className="py-[0.9rem] border-b border-basalt/[0.08] group-last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-basalt text-bone-soft flex items-center justify-center font-display text-[0.75rem] flex-none">
                      {r.initials}
                    </div>
                    <span className="font-body font-semibold text-[0.86rem] whitespace-nowrap">{r.guest}</span>
                  </div>
                </td>
                <td className="py-[0.9rem] border-b border-basalt/[0.08] group-last:border-b-0 font-body text-[0.87rem] text-[#4a4038]">
                  {r.room}
                </td>
                <td className="py-[0.9rem] border-b border-basalt/[0.08] group-last:border-b-0 font-body text-[0.87rem] text-[#4a4038] whitespace-nowrap">
                  {r.dates}
                </td>
                <td className="py-[0.9rem] border-b border-basalt/[0.08] group-last:border-b-0">
                  <StatusPill status={r.status} />
                </td>
                <td className="py-[0.9rem] border-b border-basalt/[0.08] group-last:border-b-0 font-display text-[0.94rem] text-crimson text-right">
                  {r.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
