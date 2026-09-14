import { weeklyOccupancy } from '../data/mockData'

const CHART_W = 700
const CHART_H = 210
const BAR_W = 42
const BAR_GAP = (CHART_W - BAR_W * weeklyOccupancy.length) / (weeklyOccupancy.length + 1)
const BASELINE = 168
const MAX_H = 130

export default function OccupancyChart() {
  return (
    <div className="bg-bone-soft rounded-[2px] p-7">
      <div className="flex justify-between items-end gap-4 flex-wrap mb-6">
        <div>
          <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">This Week</p>
          <h2 className="font-display text-[1.28rem]">Occupancy</h2>
        </div>
        <div className="flex gap-4 font-body text-[0.76rem] text-[#5a4f44]">
          <span className="flex items-center gap-[0.38rem]">
            <span className="w-2 h-2 rounded-full bg-brass flex-none" />
            Weekday
          </span>
          <span className="flex items-center gap-[0.38rem]">
            <span className="w-2 h-2 rounded-full bg-crimson flex-none" />
            Today
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        role="img"
        aria-label="Weekly occupancy bar chart"
        className="w-full"
      >
        {/* Baseline */}
        <line x1="10" y1={BASELINE} x2={CHART_W - 10} y2={BASELINE} stroke="rgba(27,23,20,0.15)" strokeWidth="1" />

        {weeklyOccupancy.map((d, i) => {
          const barH = (d.pct / 100) * MAX_H
          const x = BAR_GAP + i * (BAR_W + BAR_GAP)
          const y = BASELINE - barH
          const cx = x + BAR_W / 2
          const fill = d.today ? '#8E2438' : '#B08D4F'
          const textFill = d.today ? '#8E2438' : '#5a4f44'
          const dayFill = d.today ? '#1B1714' : '#8a7c6c'

          return (
            <g key={d.day}>
              <rect x={x} y={y} width={BAR_W} height={barH} rx="3" fill={fill} opacity="0.9" />
              <text
                x={cx}
                y={y - 7}
                textAnchor="middle"
                fontSize="13"
                fontWeight={d.today ? '600' : '500'}
                fill={textFill}
                fontFamily="Fraunces, Georgia, serif"
              >
                {d.pct}%
              </text>
              <text
                x={cx}
                y={BASELINE + 20}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                letterSpacing="0.05em"
                fill={dayFill}
                fontFamily="Karla, system-ui, sans-serif"
              >
                {d.day.toUpperCase()}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
