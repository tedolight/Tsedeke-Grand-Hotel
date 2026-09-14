import { useTranslation } from 'react-i18next';
import React from 'react';

const PACKAGES = [
  { name: 'Silver Package', price: 'ETB 45,000', guests: 'Up to 100', features: ['Basic decoration', 'Standard menu (3-course)', 'Sound system', 'Venue for 6 hours'], popular: false },
  { name: 'Gold Package', price: 'ETB 95,000', guests: 'Up to 250', features: ['Premium decoration', 'Gourmet menu (5-course)', 'Live music slot', 'Photography service', 'Venue for 10 hours', 'Dedicated event coordinator'], popular: true },
  { name: 'Platinum Package', price: 'ETB 175,000', guests: 'Up to 500', features: ['Luxury decoration & flowers', 'Full gourmet banquet', 'Live band or DJ', 'Professional photography & video', 'Venue for full day', 'Dedicated team of coordinators', 'Honeymoon suite included'], popular: false },
];

const EventPackages = () => {
  const { t } = useTranslation();
  return (

  <section className="py-24 px-6 md:px-15 bg-black">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Event Planning')}</span>
        <h2 className="text-4xl md:text-5xl font-cormorant font-light">{t('Event Packages')}</h2>
        <div className="gold-line center" />
        <p className="text-[14px] text-white-dim font-montserrat max-w-xl mx-auto">{t('Choose the perfect package for your event, or let our team create a custom experience tailored to your vision.')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg, i) => (
          <div key={i} className={`relative border p-8 ${pkg.popular ? 'border-gold bg-dark-3' : 'border-border-gold/20 bg-dark-2'} transition-all duration-300 hover:-translate-y-1`}>
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black font-cinzel text-[9px] tracking-[2px] px-4 py-1.5 font-semibold">{t('MOST POPULAR')}</span>
            )}
            <h3 className="font-cormorant text-2xl font-light text-white mb-2">{pkg.name}</h3>
            <div className="font-cormorant text-4xl text-gold mb-1">{pkg.price}</div>
            <div className="text-[10px] text-white-dim/60 font-montserrat mb-6">{pkg.guests}</div>
            <ul className="space-y-2 mb-8">
              {pkg.features.map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-[12px] text-white-dim font-montserrat">
                  <span className="text-gold mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={`w-full ${pkg.popular ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '12px', fontSize: '10px' }}>
              <span>{t('Request This Package')}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>

  );
};


export default EventPackages;
