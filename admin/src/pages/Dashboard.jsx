import { IconInfo } from '../components/Icons'
import StatCard from '../components/StatCard'
import ReservationsTable from '../components/ReservationsTable'
import RoomAvailability from '../components/RoomAvailability'
import InquiryInbox from '../components/InquiryInbox'
import OccupancyChart from '../components/OccupancyChart'
import { stats } from '../data/mockData'

export default function Dashboard() {
  return (
    <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-10 py-7 pb-16">

      {/* Prototype notice */}
      <div className="flex gap-3 items-start mb-7 px-4 py-[0.85rem] border border-basalt/12 rounded-[2px] bg-bone-soft text-[0.83rem] text-[#5a4f44]">
        <span className="w-[1.05rem] h-[1.05rem] flex-none mt-[0.1rem] text-brass"><IconInfo /></span>
        <span>Prototype — all figures, reservations and messages are sample data, not live.</span>
      </div>

      {/* KPI Stat Cards */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
        aria-label="Key performance indicators"
      >
        {stats.map(s => (
          <StatCard key={s.id} {...s} />
        ))}
      </section>

      {/* Main grid: reservations + side column */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 mb-6">
        <ReservationsTable />
        <div className="flex flex-col gap-6">
          <RoomAvailability />
          <InquiryInbox />
        </div>
      </section>

      {/* Occupancy chart */}
      <section>
        <OccupancyChart />
      </section>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-basalt/10 flex justify-between flex-wrap gap-2 font-body text-[0.77rem] text-[#8a7c6c]">
        <span>© 2026 Tsedeke Grand Hotel — Staff Portal</span>
        <span>Prototype design · not connected to a live system</span>
      </div>
    </div>
  )
}
