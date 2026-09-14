import { useState } from 'react'

const SECTIONS = [
  { id: 'hotel',    label: 'Hotel Information' },
  { id: 'account',  label: 'Account & Security' },
  { id: 'notify',   label: 'Notifications' },
  { id: 'rates',    label: 'Rates & Pricing' },
  { id: 'system',   label: 'System' },
]

function Section({ title, children }) {
  return (
    <div className="bg-bone-soft rounded-[2px] p-7 mb-5">
      <h2 className="font-display text-[1.18rem] mb-5 pb-4 border-b border-basalt/10">{title}</h2>
      {children}
    </div>
  )
}
function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block font-body font-bold text-[0.78rem] mb-1 text-basalt">{label}</label>
      {hint && <p className="font-body text-[0.74rem] text-[#8a7c6c] mb-1">{hint}</p>}
      {children}
    </div>
  )
}
function TextInput({ defaultValue, ...props }) {
  return (
    <input
      defaultValue={defaultValue}
      className="w-full font-body text-[0.87rem] bg-bone border border-basalt/14 rounded-[2px] px-4 py-[0.62rem] outline-none focus:border-brass transition-colors"
      {...props}
    />
  )
}
function Toggle({ label, defaultChecked, hint }) {
  const [on, setOn] = useState(defaultChecked ?? false)
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-basalt/[0.07] last:border-b-0">
      <div>
        <p className="font-body font-semibold text-[0.87rem]">{label}</p>
        {hint && <p className="font-body text-[0.75rem] text-[#8a7c6c] mt-[0.2rem]">{hint}</p>}
      </div>
      <button
        onClick={() => setOn(v => !v)}
        role="switch"
        aria-checked={on}
        className={`relative w-11 h-6 rounded-full transition-colors flex-none mt-[2px]
          ${on ? 'bg-brass' : 'bg-basalt/20'}`}
      >
        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('hotel')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7 pb-16">
      {/* Header */}
      <div className="mb-7">
        <p className="font-body font-bold text-[0.71rem] tracking-[0.18em] uppercase text-crimson mb-[0.35rem]">System</p>
        <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)]">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Settings nav */}
        <nav className="bg-bone-soft rounded-[2px] p-3 h-fit sticky top-24">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-3 py-[0.65rem] mb-[0.1rem] rounded-[2px] font-body font-semibold text-[0.86rem] transition-all
                border-l-2 ${activeSection === s.id
                  ? 'bg-basalt/[0.06] border-brass text-basalt'
                  : 'border-transparent text-[#5a4f44] hover:bg-basalt/[0.03] hover:text-basalt'}`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Settings content */}
        <div>
          {activeSection === 'hotel' && (
            <Section title="Hotel Information">
              <Field label="Hotel Name"><TextInput defaultValue="Tsedeke Grand Hotel" /></Field>
              <Field label="Tagline"><TextInput defaultValue="Where Ethiopian hospitality meets timeless luxury." /></Field>
              <Field label="Address"><TextInput defaultValue="Hossana City, Hadiya Zone, Ethiopia" /></Field>
              <Field label="Phone"><TextInput defaultValue="+251 90 951 7777" type="tel" /></Field>
              <Field label="Email"><TextInput defaultValue="reservations@tsedekegrandhotel.com" type="email" /></Field>
              <Field label="Website"><TextInput defaultValue="https://tsedekegrandhotel.com" type="url" /></Field>
              <Field label="Check-in Time">
                <input defaultValue="14:00" type="time" className="font-body text-[0.87rem] bg-bone border border-basalt/14 rounded-[2px] px-4 py-[0.62rem] outline-none focus:border-brass" />
              </Field>
              <Field label="Check-out Time">
                <input defaultValue="11:00" type="time" className="font-body text-[0.87rem] bg-bone border border-basalt/14 rounded-[2px] px-4 py-[0.62rem] outline-none focus:border-brass" />
              </Field>
              <Field label="About / Description">
                <textarea
                  defaultValue="Tsedeke Grand Hotel & Suites is a premier luxury property offering exceptional comfort and elegance in the heart of Hossana City, Ethiopia. With world-class amenities and personalized service, we redefine the luxury hospitality experience."
                  rows={4}
                  className="w-full font-body text-[0.87rem] bg-bone border border-basalt/14 rounded-[2px] px-4 py-[0.62rem] outline-none focus:border-brass resize-none"
                />
              </Field>
            </Section>
          )}

          {activeSection === 'account' && (
            <Section title="Account & Security">
              <Field label="Full Name"><TextInput defaultValue="Selam Worku" /></Field>
              <Field label="Role"><TextInput defaultValue="Front Desk Manager" readOnly className="bg-bone/50 cursor-not-allowed opacity-70 w-full font-body text-[0.87rem] border border-basalt/14 rounded-[2px] px-4 py-[0.62rem]" /></Field>
              <Field label="Email Address"><TextInput defaultValue="selam.worku@tsedekegrandhotel.com" type="email" /></Field>
              <Field label="Current Password" hint="Leave blank to keep existing password."><TextInput type="password" placeholder="••••••••" /></Field>
              <Field label="New Password"><TextInput type="password" placeholder="••••••••" /></Field>
              <Field label="Confirm New Password"><TextInput type="password" placeholder="••••••••" /></Field>

              <div className="mt-5 p-4 bg-crimson/[0.07] rounded-[2px] border border-crimson/15">
                <p className="font-body font-bold text-[0.8rem] text-crimson mb-1">Two-Factor Authentication</p>
                <p className="font-body text-[0.8rem] text-[#5a4f44] mb-3">Enhance your account security with 2FA via authenticator app.</p>
                <button className="font-body font-semibold text-[0.82rem] px-4 py-[0.55rem] rounded-[2px] bg-crimson text-bone-soft hover:-translate-y-[1px] transition-all">Enable 2FA</button>
              </div>
            </Section>
          )}

          {activeSection === 'notify' && (
            <Section title="Notifications">
              <Toggle label="New Reservation"        defaultChecked={true}  hint="Alert when a new booking is created." />
              <Toggle label="Reservation Cancelled"  defaultChecked={true}  hint="Alert when a guest cancels." />
              <Toggle label="New Message"            defaultChecked={true}  hint="Alert on new guest inquiry." />
              <Toggle label="Check-in Reminder"      defaultChecked={true}  hint="Daily reminder of upcoming check-ins." />
              <Toggle label="Check-out Reminder"     defaultChecked={false} hint="Daily reminder of upcoming check-outs." />
              <Toggle label="Low Availability Alert" defaultChecked={true}  hint="Alert when occupancy exceeds 90%." />
              <Toggle label="Weekly Revenue Report"  defaultChecked={false} hint="Weekly email summary of revenue." />
              <Toggle label="System Updates"         defaultChecked={false} hint="Notify on software updates." />
            </Section>
          )}

          {activeSection === 'rates' && (
            <Section title="Rates & Pricing">
              <p className="font-body text-[0.84rem] text-[#8a7c6c] mb-5 -mt-2">Set base nightly rates per room type. Actual pricing can be overridden per reservation.</p>
              {[
                { room: 'Wachemo Room (Standard)',  rate: 2800 },
                { room: 'Bilate Suite',             rate: 4200 },
                { room: 'Boyaa Suite (Premium)',    rate: 6500 },
              ].map(r => (
                <Field key={r.room} label={r.room}>
                  <div className="flex items-center gap-3">
                    <span className="font-body font-semibold text-[0.85rem] text-[#8a7c6c] flex-none">ETB</span>
                    <input
                      type="number"
                      defaultValue={r.rate}
                      className="flex-1 font-body text-[0.87rem] bg-bone border border-basalt/14 rounded-[2px] px-4 py-[0.62rem] outline-none focus:border-brass"
                    />
                    <span className="font-body text-[0.82rem] text-[#8a7c6c] flex-none">/ night</span>
                  </div>
                </Field>
              ))}
              <Field label="Weekend Surcharge (%)">
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={15} className="w-28 font-body text-[0.87rem] bg-bone border border-basalt/14 rounded-[2px] px-4 py-[0.62rem] outline-none focus:border-brass" />
                  <span className="font-body text-[0.82rem] text-[#8a7c6c]">% added on Fri/Sat nights</span>
                </div>
              </Field>
              <Field label="Default Tax Rate (%)">
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={15} className="w-28 font-body text-[0.87rem] bg-bone border border-basalt/14 rounded-[2px] px-4 py-[0.62rem] outline-none focus:border-brass" />
                  <span className="font-body text-[0.82rem] text-[#8a7c6c]">% VAT</span>
                </div>
              </Field>
            </Section>
          )}

          {activeSection === 'system' && (
            <Section title="System">
              <Toggle label="Maintenance Mode"  hint="Temporarily hide the public-facing website for maintenance." />
              <Toggle label="Online Booking"    defaultChecked={true} hint="Allow guests to book online via the hotel website." />
              <Toggle label="Auto-confirmation" defaultChecked={true} hint="Automatically confirm bookings on receipt of payment." />
              <Toggle label="Debug Logging"     hint="Enable verbose server logging (development only)." />

              <div className="mt-6 p-5 bg-basalt rounded-[2px]">
                <p className="font-body font-bold text-[0.8rem] text-brass mb-1">Database</p>
                <p className="font-body text-[0.8rem] text-bone/60 mb-3">Connected to Neon PostgreSQL · Last sync: just now</p>
                <div className="flex gap-3 flex-wrap">
                  <button className="font-body font-semibold text-[0.8rem] px-4 py-[0.52rem] rounded-[2px] border border-bone/20 text-bone-soft hover:border-brass transition-all">Run Migrations</button>
                  <button className="font-body font-semibold text-[0.8rem] px-4 py-[0.52rem] rounded-[2px] border border-bone/20 text-bone-soft hover:border-brass transition-all">Export Backup</button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-crimson/[0.07] rounded-[2px] border border-crimson/15">
                <p className="font-body font-bold text-[0.8rem] text-crimson mb-1">Danger Zone</p>
                <p className="font-body text-[0.8rem] text-[#5a4f44] mb-3">These actions are irreversible. Proceed with extreme caution.</p>
                <button className="font-body font-semibold text-[0.82rem] px-4 py-[0.52rem] rounded-[2px] border border-crimson text-crimson hover:bg-crimson hover:text-bone-soft transition-all">Purge Demo Data</button>
              </div>
            </Section>
          )}

          {/* Save button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="font-body font-semibold text-[0.9rem] px-6 py-[0.75rem] rounded-[2px] bg-basalt text-bone-soft hover:-translate-y-[2px] hover:bg-basalt/90 transition-all"
            >
              Save Changes
            </button>
            {saved && (
              <span className="font-body font-semibold text-[0.82rem] text-forest bg-forest/10 px-4 py-[0.62rem] rounded-[2px]">
                ✓ Changes saved successfully
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
