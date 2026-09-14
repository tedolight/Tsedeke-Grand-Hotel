export default function ComingSoon({ title }) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20 flex flex-col items-center text-center">
      <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-3">Coming Soon</p>
      <h1 className="font-display text-[clamp(2rem,4vw,3rem)] mb-4">{title}</h1>
      <p className="font-body text-[0.95rem] text-[#5a4f44] max-w-sm">
        This section is under development. Check back soon.
      </p>
    </div>
  )
}
