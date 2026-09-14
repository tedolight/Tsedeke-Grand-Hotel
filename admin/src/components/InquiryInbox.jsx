import { inquiries } from '../data/mockData'

export default function InquiryInbox() {
  return (
    <div className="bg-bone-soft rounded-[2px] p-7">
      <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
        <div>
          <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">Inbox</p>
          <h2 className="font-display text-[1.28rem]">Recent Inquiries</h2>
        </div>
        <a href="#" className="font-body font-semibold text-[0.8rem] text-basalt border-b border-brass pb-[0.15rem] hover:text-crimson hover:border-crimson transition-colors flex-none">
          View all
        </a>
      </div>

      <div>
        {inquiries.map((inq, i) => (
          <div
            key={inq.id}
            className={`flex gap-[0.85rem] py-4 ${i > 0 ? 'border-t border-basalt/10' : ''}`}
          >
            {/* Avatar ring */}
            <div className="w-[2.1rem] h-[2.1rem] rounded-full border border-brass flex items-center justify-center font-display text-[0.77rem] text-crimson flex-none">
              {inq.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-3 items-baseline">
                <strong className="font-body font-semibold text-[0.88rem] truncate">{inq.name}</strong>
                <time className="font-body text-[0.7rem] text-[#8a7c6c] flex-none">{inq.time}</time>
              </div>
              <span className="block font-body font-bold text-[0.63rem] tracking-[0.05em] uppercase text-brass mt-[0.12rem] mb-1">
                {inq.tag}
              </span>
              <p className="font-body text-[0.83rem] text-[#5a4f44] leading-[1.55]">
                {inq.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
