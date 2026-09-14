import { roomAvailability } from '../data/mockData'

export default function RoomAvailability() {
  return (
    <div className="bg-bone-soft rounded-[2px] p-7">
      <div className="mb-4">
        <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">Rooms</p>
        <h2 className="font-display text-[1.28rem]">Availability Today</h2>
      </div>
      <p className="font-body text-[0.82rem] text-[#8a7c6c] -mt-2 mb-5">
        15 of 20 rooms occupied
      </p>

      <div className="space-y-5">
        {roomAvailability.map(room => {
          const pct = Math.round((room.occupied / room.total) * 100)
          return (
            <div key={room.id}>
              <div className="flex justify-between items-baseline gap-3 mb-2">
                <strong className="font-display font-medium text-[0.87rem]">{room.name}</strong>
                <span className="font-body text-[0.75rem] text-[#8a7c6c] whitespace-nowrap">
                  {room.occupied} / {room.total} occupied
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: room.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
