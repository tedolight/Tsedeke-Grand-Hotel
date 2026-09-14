import React, { useState, useEffect } from 'react';
import settingsService from '../../services/settings/settingsService.js';

const DEFAULT_PRICING_SETTINGS = {
  primaryCurrency: 'ETB — Ethiopian Birr',
  displayCurrency: 'Same as primary (ETB)',
  symbolPosition: 'Prefix (ETB 1,200)',
  decimalPlaces: '2 (1,200.00)',
  taxInclusive: true,
  multiCurrency: false,
  // Room Rates
  rates: [
    { key: 'standard', name: 'Standard', weekday: 2800, weekend: 3200, extraGuest: 500, minStay: 1, icon: 'fas fa-bed' },
    { key: 'single', name: 'Single', weekday: 2000, weekend: 2400, extraGuest: 500, minStay: 1, icon: 'fas fa-bed' },
    { key: 'deluxe', name: 'Deluxe', weekday: 4200, weekend: 4800, extraGuest: 700, minStay: 1, icon: 'fas fa-star' },
    { key: 'suite', name: 'Suite', weekday: 6500, weekend: 7200, extraGuest: 900, minStay: 2, icon: 'fas fa-crown' },
    { key: 'family', name: 'Family Double Bed', weekday: 9500, weekend: 10500, extraGuest: 1000, minStay: 2, icon: 'fas fa-users' },
    { key: 'vip', name: 'VIP', weekday: 14000, weekend: 16000, extraGuest: 1200, minStay: 3, icon: 'fas fa-gem' }
  ],
  // Seasons
  seasons: [
    { id: 'enkutatash', name: 'Ethiopian New Year (Enkutatash)', type: 'Peak', from: '2025-09-08', to: '2025-09-18', adjustment: 35 },
    { id: 'christmas', name: 'Christmas & New Year', type: 'Peak', from: '2024-12-20', to: '2025-01-07', adjustment: 50 },
    { id: 'lowseason', name: 'Low Season — June / July', type: 'Off-Peak', from: '2025-06-01', to: '2025-07-31', adjustment: 20 }
  ],
  // Add-ons
  extras: [
    { id: 'transfer', name: 'Airport Transfer (one-way)', price: 800, per: 'Per trip', active: true },
    { id: 'breakfast', name: 'Breakfast Buffet', price: 450, per: 'Per person', active: true },
    { id: 'spa', name: 'Spa Day Pass', price: 1200, per: 'Per person', active: true },
    { id: 'checkout', name: 'Late Check-out (until 4pm)', price: 600, per: 'Per trip', active: true },
    { id: 'parking', name: 'Parking (per day)', price: 0, per: 'Per night', active: false }
  ],
  // Discounts
  discounts: [
    { id: 'longstay', name: 'Long Stay Discount', desc: 'Automatically applied for bookings of 7 nights or more', val: '15% off', percent: 15, active: true, icon: 'fas fa-moon' },
    { id: 'earlybird', name: 'Early Bird Discount', desc: 'Book 30+ days in advance to receive a discount', val: '10% off', percent: 10, active: true, icon: 'fas fa-calendar-check' },
    { id: 'corporate', name: 'Corporate Rate', desc: 'For verified corporate accounts and loyalty members', val: '20% off', percent: 20, active: true, icon: 'fas fa-user-tie' },
    { id: 'promo_tsedeke20', name: 'Promo Code: TSEDEKE20', desc: 'Limited-time promotional code — expires Dec 31, 2025', val: '20% off', percent: 20, active: false, icon: 'fas fa-tag' }
  ],
  // Taxes
  taxes: [
    { id: 'vat', name: 'VAT (Value Added Tax)', desc: 'Applied to all charges', rate: 15, per: 'All charges', active: true, isPercent: true },
    { id: 'levy', name: 'Tourism Development Levy', desc: 'Per room per night', rate: 50, per: 'Per night', active: true, isPercent: false },
    { id: 'service', name: 'Service Charge', desc: 'Restaurant & bar bills', rate: 10, per: 'F&B only', active: true, isPercent: true },
    { id: 'citytax', name: 'City Tax', desc: 'Per person per night', rate: 30, per: 'Per night', active: false, isPercent: false }
  ]
};

const PricingSettings = () => {
  const [toast, setToast] = useState({ show: false, message: '' });
  const [activeSection, setActiveSection] = useState('currency');
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState(DEFAULT_PRICING_SETTINGS);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettings('pricing');
        if (data && Object.keys(data).length > 0) {
          setPricing({ ...DEFAULT_PRICING_SETTINGS, ...data });
        } else {
          setPricing(DEFAULT_PRICING_SETTINGS);
        }
      } catch (err) {
        console.error('Error fetching pricing settings:', err);
        showToast('Error loading pricing settings');
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  // Preview form state
  const [previewRoom, setPreviewRoom] = useState('deluxe');
  const [previewNights, setPreviewNights] = useState(3);
  const [previewGuests, setPreviewGuests] = useState(2);
  const [previewPromo, setPreviewPromo] = useState('');

  const sections = [
    { id: 'currency', label: 'Currency', icon: 'fas fa-money-bill' },
    { id: 'base', label: 'Base Room Rates', icon: 'fas fa-bed' },
    { id: 'seasons', label: 'Seasonal Pricing', icon: 'fas fa-calendar-alt' },
    { id: 'extras', label: 'Add-on & Extras', icon: 'fas fa-concierge-bell' },
    { id: 'discounts', label: 'Discounts', icon: 'fas fa-percent' },
    { id: 'taxes', label: 'Taxes & Fees', icon: 'fas fa-receipt' },
    { id: 'preview', label: 'Price Preview', icon: 'fas fa-eye' }
  ];

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const saveSettings = async (sectionName) => {
    try {
      await settingsService.updateSettings('pricing', pricing);
      showToast(`${sectionName} saved successfully`);
    } catch (err) {
      console.error('Error saving pricing settings:', err);
      showToast('Error saving settings', 'warning');
    }
  };

  // Rates Update Handler
  const handleRateChange = (index, field, value) => {
    const updatedRates = [...pricing.rates];
    updatedRates[index][field] = parseFloat(value) || 0;
    setPricing(prev => ({ ...prev, rates: updatedRates }));
  };

  // Seasons Management
  const addSeason = () => {
    const newSeason = {
      id: 'season_' + Date.now(),
      name: '',
      type: 'Peak',
      from: '',
      to: '',
      adjustment: 0
    };
    setPricing(prev => ({ ...prev, seasons: [...prev.seasons, newSeason] }));
    showToast('New seasonal rule card added');
  };

  const handleSeasonChange = (id, field, value) => {
    const updated = pricing.seasons.map(s => {
      if (s.id === id) {
        return { ...s, [field]: field === 'adjustment' ? parseFloat(value) || 0 : value };
      }
      return s;
    });
    setPricing(prev => ({ ...prev, seasons: updated }));
  };

  const removeSeason = (id) => {
    setPricing(prev => ({ ...prev, seasons: prev.seasons.filter(s => s.id !== id) }));
    showToast('Seasonal rule removed');
  };

  // Extras Management
  const addExtra = () => {
    const newExtra = {
      id: 'extra_' + Date.now(),
      name: 'New Custom Extra',
      price: 0,
      per: 'Per trip',
      active: true
    };
    setPricing(prev => ({ ...prev, extras: [...prev.extras, newExtra] }));
    showToast('New add-on row added');
  };

  const handleExtraChange = (id, field, value) => {
    const updated = pricing.extras.map(e => {
      if (e.id === id) {
        return { ...e, [field]: field === 'price' ? parseFloat(value) || 0 : value };
      }
      return e;
    });
    setPricing(prev => ({ ...prev, extras: updated }));
  };

  const toggleExtra = (id) => {
    const updated = pricing.extras.map(e => {
      if (e.id === id) {
        return { ...e, active: !e.active };
      }
      return e;
    });
    setPricing(prev => ({ ...prev, extras: updated }));
  };

  const removeExtra = (id) => {
    setPricing(prev => ({ ...prev, extras: prev.extras.filter(e => e.id !== id) }));
    showToast('Add-on service deleted');
  };

  // Discounts Toggling
  const toggleDiscount = (id) => {
    const updated = pricing.discounts.map(d => {
      if (d.id === id) {
        return { ...d, active: !d.active };
      }
      return d;
    });
    setPricing(prev => ({ ...prev, discounts: updated }));
  };

  // Taxes Management
  const handleTaxChange = (id, field, value) => {
    const updated = pricing.taxes.map(t => {
      if (t.id === id) {
        return { ...t, [field]: field === 'rate' ? parseFloat(value) || 0 : value };
      }
      return t;
    });
    setPricing(prev => ({ ...prev, taxes: updated }));
  };

  const toggleTax = (id) => {
    const updated = pricing.taxes.map(t => {
      if (t.id === id) {
        return { ...t, active: !t.active };
      }
      return t;
    });
    setPricing(prev => ({ ...prev, taxes: updated }));
  };

  // Scroll spy
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      let current = 'currency';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pricing Calculation Preview
  const calculatePreview = () => {
    const selectedRoom = pricing.rates.find(r => r.key === previewRoom) || pricing.rates[1];
    const baseRate = selectedRoom.weekday;
    const nights = Math.max(1, parseInt(previewNights) || 1);
    const guests = Math.max(1, parseInt(previewGuests) || 1);
    
    // Extra guest charge (occupancy > 2)
    const extraCount = guests > 2 ? guests - 2 : 0;
    const extraSurcharge = extraCount * selectedRoom.extraGuest * nights;
    
    let roomCharges = baseRate * nights;

    // Apply Promo Code or Discounts
    let discountAmount = 0;
    const promoCodeActive = pricing.discounts.find(d => d.id === 'promo_tsedeke20');
    
    if (previewPromo.trim().toUpperCase() === 'TSEDEKE20' && promoCodeActive?.active) {
      discountAmount = Math.round(roomCharges * 0.20);
    } else {
      // Check if long stay discount is active and nights >= 7
      const longStay = pricing.discounts.find(d => d.id === 'longstay');
      if (longStay?.active && nights >= 7) {
        discountAmount = Math.round(roomCharges * 0.15);
      }
    }

    const netRoomCharges = roomCharges - discountAmount + extraSurcharge;
    
    // Apply Taxes
    let vat = 0;
    let tourismLevy = 0;
    let serviceCharge = 0;

    const vatTax = pricing.taxes.find(t => t.id === 'vat');
    if (vatTax?.active) {
      vat = Math.round(netRoomCharges * (vatTax.rate / 100));
    }

    const levyTax = pricing.taxes.find(t => t.id === 'levy');
    if (levyTax?.active) {
      tourismLevy = levyTax.rate * nights;
    }

    const serviceTax = pricing.taxes.find(t => t.id === 'service');
    if (serviceTax?.active) {
      serviceCharge = Math.round(netRoomCharges * (serviceTax.rate / 100));
    }

    const total = netRoomCharges + vat + tourismLevy + serviceCharge;

    return {
      roomName: selectedRoom.name,
      baseRate,
      nights,
      roomTotal: roomCharges,
      extraCount,
      extraSurcharge,
      discountAmount,
      vat,
      tourismLevy,
      serviceCharge,
      total
    };
  };

  const previewCalc = calculatePreview();
  const formatCurrency = (val) => (Number(val) || 0).toLocaleString('en-ET');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gold font-mono text-xs uppercase tracking-widest animate-pulse">
          <i className="fas fa-spinner fa-spin mr-2" /> Loading pricing settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="font-cormorant text-2xl font-bold text-white">Pricing Settings</div>
          <div className="font-mono text-[9.5px] text-text-muted tracking-[0.15em] uppercase mt-1">
            Base rates, seasonal pricing, taxes & discounts
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9.5px] text-text-muted tracking-[0.1em] uppercase">
          <a href="#" className="hover:text-gold transition-colors">Dashboard</a>
          <span className="text-gold/40">›</span>
          <span className="text-gold">Pricing</span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-dark-2 border border-border-gold-soft py-2 sticky top-[88px] flex flex-col gap-0.5 z-10">
          {sections.map(sec => (
            <div
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className={`flex items-center gap-2.5 py-3 px-5 text-[13px] cursor-pointer transition-all border-l-2 ${
                activeSection === sec.id
                  ? 'text-gold bg-gold/5 border-l-gold font-semibold'
                  : 'text-text-muted border-l-transparent hover:text-white hover:bg-gold/5'
              }`}
            >
              <i className={`${sec.icon} w-3.5 text-center text-[0.8rem]`} /> {sec.label}
            </div>
          ))}
        </div>

        {/* Configurations Content */}
        <div className="space-y-5">
          {/* Currency Section */}
          <div className="bg-dark-2 border border-border-gold-soft" id="currency">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Currency & Billing</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Base currency and payment configuration
                </div>
              </div>
              <i className="fas fa-money-bill-wave text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2.5 bg-gold/5 border border-gold/15 p-3.5 px-4.5 mb-5 rounded-sm">
                <div className="text-[1.4rem]">🇪🇹</div>
                <div className="flex-1">
                  <div className="font-mono text-[12px] text-gold font-bold">{pricing.primaryCurrency}</div>
                  <div className="text-[13px] text-text-muted">Primary billing currency</div>
                </div>
                <div className="font-mono text-[11px] text-text-muted">1 USD ≈ 56.80 ETB</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Primary Currency <span>*</span></label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={pricing.primaryCurrency}
                    onChange={(e) => setPricing(prev => ({ ...prev, primaryCurrency: e.target.value }))}
                  >
                    <option value="ETB — Ethiopian Birr">ETB — Ethiopian Birr</option>
                    <option value="USD — US Dollar">USD — US Dollar</option>
                    <option value="EUR — Euro">EUR — Euro</option>
                    <option value="GBP — British Pound">GBP — British Pound</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Display Currency</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={pricing.displayCurrency}
                    onChange={(e) => setPricing(prev => ({ ...prev, displayCurrency: e.target.value }))}
                  >
                    <option value="Same as primary (ETB)">Same as primary (ETB)</option>
                    <option value="USD — US Dollar">USD — US Dollar</option>
                    <option value="Both ETB and USD">Both ETB and USD</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Currency Symbol Position</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={pricing.symbolPosition}
                    onChange={(e) => setPricing(prev => ({ ...prev, symbolPosition: e.target.value }))}
                  >
                    <option value="Prefix (ETB 1,200)">Prefix (ETB 1,200)</option>
                    <option value="Suffix (1,200 ETB)">Suffix (1,200 ETB)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Decimal Places</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={pricing.decimalPlaces}
                    onChange={(e) => setPricing(prev => ({ ...prev, decimalPlaces: e.target.value }))}
                  >
                    <option value="0 (1,200)">0 (1,200)</option>
                    <option value="2 (1,200.00)">2 (1,200.00)</option>
                  </select>
                </div>
              </div>
              <div className="mb-[18px]">
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Show prices inclusive of tax</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Display all prices on booking pages with taxes already included</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pricing.taxInclusive}
                      onChange={(e) => setPricing(prev => ({ ...prev, taxInclusive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Multi-currency support</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Allow guests to view approximate prices in their local currency</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pricing.multiCurrency}
                      onChange={(e) => setPricing(prev => ({ ...prev, multiCurrency: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveSettings('Currency Settings')}>
                  <i className="fas fa-save mr-2" />Save Settings
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Base Room Rates */}
          <div className="bg-dark-2 border border-border-gold-soft" id="base">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Base Room Rates</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Standard nightly rates per room type (ETB)
                </div>
              </div>
              <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={() => saveSettings('Base Room Rates')}>Update All</button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Room Type</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Weekday Rate</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Weekend Rate</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Extra Guest</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Min Stay</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left" />
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.rates.map((room, idx) => (
                      <tr key={room.key} className="hover:bg-gold/[0.02]">
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <div className="inline-flex items-center gap-2.5 text-[13.5px] text-white">
                            <i className={`${room.icon} text-gold`} /> {room.name}
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <div className="flex items-stretch inline-flex">
                            <div className="bg-dark-4 border border-border-gold-soft border-r-0 px-3 flex items-center font-mono text-[11px] text-gold whitespace-nowrap">ETB</div>
                            <input
                              className="bg-dark-3 border border-border-gold-soft text-white font-mono text-[12px] py-2 px-2.5 outline-none w-[110px] transition-all focus:border-gold/50 text-right border-l-0"
                              type="number"
                              value={room.weekday}
                              onChange={(e) => handleRateChange(idx, 'weekday', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <div className="flex items-stretch inline-flex">
                            <div className="bg-dark-4 border border-border-gold-soft border-r-0 px-3 flex items-center font-mono text-[11px] text-gold whitespace-nowrap">ETB</div>
                            <input
                              className="bg-dark-3 border border-border-gold-soft text-white font-mono text-[12px] py-2 px-2.5 outline-none w-[110px] transition-all focus:border-gold/50 text-right border-l-0"
                              type="number"
                              value={room.weekend}
                              onChange={(e) => handleRateChange(idx, 'weekend', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <div className="flex items-stretch inline-flex">
                            <div className="bg-dark-4 border border-border-gold-soft border-r-0 px-3 flex items-center font-mono text-[11px] text-gold whitespace-nowrap">ETB</div>
                            <input
                              className="bg-dark-3 border border-border-gold-soft text-white font-mono text-[12px] py-2 px-2.5 outline-none w-[110px] transition-all focus:border-gold/50 text-right border-l-0"
                              type="number"
                              value={room.extraGuest}
                              onChange={(e) => handleRateChange(idx, 'extraGuest', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <div className="inline-flex items-center gap-1">
                            <input
                              className="bg-dark-3 border border-border-gold-soft text-white font-mono text-[12px] py-2 px-2.5 outline-none w-[60px] transition-all focus:border-gold/50 text-right"
                              type="number"
                              value={room.minStay}
                              onChange={(e) => handleRateChange(idx, 'minStay', e.target.value)}
                            />
                            <span className="text-[0.72rem] text-text-muted">night{room.minStay > 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle text-right">
                          <button
                            className="w-[34px] h-[34px] bg-transparent border border-border-gold-soft text-text-muted cursor-pointer transition-all hover:border-gold hover:text-gold flex items-center justify-center inline-flex"
                            onClick={() => showToast(`Options for ${room.name}`)}
                          >
                            <i className="fas fa-ellipsis-v" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveSettings('Base Room Rates')}>
                  <i className="fas fa-save mr-2" />Save Rates
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Seasonal Pricing Rules */}
          <div className="bg-dark-2 border border-border-gold-soft" id="seasons">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Seasonal Pricing Rules</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Override base rates for specific date ranges
                </div>
              </div>
              <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={addSeason}>
                <i className="fas fa-plus mr-1.5" />Add Season
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-4">
                {pricing.seasons.map(s => (
                  <div key={s.id} className="bg-dark-3 border border-border-gold-soft p-4.5 transition-all hover:border-gold/30">
                    <div className="flex items-center justify-between mb-3.5">
                      <input
                        className="bg-transparent border-0 border-b border-transparent focus:border-gold/30 outline-none p-0 text-sm font-medium text-white flex-1 mr-3"
                        type="text"
                        value={s.name}
                        onChange={(e) => handleSeasonChange(s.id, 'name', e.target.value)}
                        placeholder="Season name..."
                      />
                      <div className="flex items-center gap-2.5">
                        <select
                          className="bg-dark-3 border border-border-gold-soft text-white text-[0.78rem] py-1.5 px-2.5 outline-none focus:border-gold/50 cursor-pointer"
                          style={{ width: '110px' }}
                          value={s.type}
                          onChange={(e) => handleSeasonChange(s.id, 'type', e.target.value)}
                        >
                          <option value="Peak">Peak</option>
                          <option value="Off-Peak">Off-Peak</option>
                          <option value="Standard">Standard</option>
                        </select>
                        <span className={`font-mono text-[9px] px-2.5 py-0.5 border rounded uppercase ${
                          s.type === 'Peak' ? 'bg-danger/10 text-danger border-danger/25' :
                          s.type === 'Off-Peak' ? 'bg-success/10 text-success border-success/25' :
                          'bg-gold/10 text-gold border-gold/25'
                        }`}>
                          {s.type}
                        </span>
                        <button
                          className="w-[34px] h-[34px] bg-transparent border border-border-gold-soft text-text-muted cursor-pointer transition-all hover:border-danger/40 hover:text-danger flex items-center justify-center"
                          onClick={() => removeSeason(s.id)}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 items-end">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">From</label>
                        <input
                          className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                          type="date"
                          value={s.from}
                          onChange={(e) => handleSeasonChange(s.id, 'from', e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">To</label>
                        <input
                          className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                          type="date"
                          value={s.to}
                          onChange={(e) => handleSeasonChange(s.id, 'to', e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Rate Adjustment</label>
                        <div className="flex items-stretch">
                          <input
                            className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full border-r-0"
                            type="number"
                            value={s.adjustment}
                            onChange={(e) => handleSeasonChange(s.id, 'adjustment', e.target.value)}
                            placeholder="0"
                          />
                          <div className="bg-dark-4 border border-border-gold-soft border-l-0 px-3 flex items-center font-mono text-[11px] text-text-muted whitespace-nowrap">
                            % {s.type === 'Off-Peak' ? 'decrease' : 'increase'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 pb-0.5 justify-end sm:justify-start">
                        <button
                          className="w-[34px] h-[34px] bg-transparent border border-border-gold-soft text-text-muted cursor-pointer transition-all hover:border-gold hover:text-gold flex items-center justify-center"
                          onClick={() => showToast('Edit details for seasonal rule')}
                        >
                          <i className="fas fa-edit" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="flex items-center justify-center gap-2 border border-dashed border-gold/30 py-3.5 px-4.5 cursor-pointer transition-all text-text-muted hover:border-gold hover:text-gold hover:bg-gold/5 w-full text-[13px] bg-transparent font-medium"
                onClick={addSeason}
              >
                <i className="fas fa-plus" /> Add Seasonal Rule
              </button>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveSettings('Seasonal Pricing Rules')}>
                  <i className="fas fa-save mr-2" />Save Seasons
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Add-ons & Extras */}
          <div className="bg-dark-2 border border-border-gold-soft" id="extras">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Add-ons & Extras</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Optional services guests can add to bookings
                </div>
              </div>
              <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={addExtra}>
                <i className="fas fa-plus mr-1.5" />Add Extra
              </button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Service</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Price</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Per</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left">Active</th>
                      <th className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase pb-3 pr-3 border-b border-border-gold-soft text-left" />
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.extras.map(e => (
                      <tr key={e.id} className="hover:bg-gold/[0.02]">
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <input
                            className="bg-transparent border-0 border-b border-transparent focus:border-gold/30 outline-none p-0 text-sm font-medium text-white w-full"
                            type="text"
                            value={e.name}
                            onChange={(val) => handleExtraChange(e.id, 'name', val.target.value)}
                            placeholder="Service name"
                          />
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <div className="flex items-stretch inline-flex">
                            <div className="bg-dark-4 border border-border-gold-soft border-r-0 px-3 flex items-center font-mono text-[11px] text-gold whitespace-nowrap">ETB</div>
                            <input
                              className="bg-dark-3 border border-border-gold-soft text-white font-mono text-[12px] py-2 px-2.5 outline-none w-[110px] transition-all focus:border-gold/50 text-right border-l-0"
                              type="number"
                              value={e.price}
                              onChange={(val) => handleExtraChange(e.id, 'price', val.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <select
                            className="bg-dark-3 border border-border-gold-soft text-white text-[0.78rem] py-1.5 px-2.5 outline-none focus:border-gold/50 cursor-pointer"
                            style={{ width: '110px' }}
                            value={e.per}
                            onChange={(val) => handleExtraChange(e.id, 'per', val.target.value)}
                          >
                            <option value="Per trip">Per trip</option>
                            <option value="Per night">Per night</option>
                            <option value="Per person">Per person</option>
                          </select>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle">
                          <label className="relative w-11 h-6 shrink-0 cursor-pointer inline-flex">
                            <input
                              type="checkbox"
                              checked={e.active}
                              onChange={() => toggleExtra(e.id)}
                              className="sr-only peer"
                            />
                            <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                          </label>
                        </td>
                        <td className="py-3.5 pr-3 border-b border-border-gold-soft/30 align-middle text-right">
                          <button
                            className="w-[34px] h-[34px] bg-transparent border border-border-gold-soft text-text-muted cursor-pointer transition-all hover:border-danger/40 hover:text-danger flex items-center justify-center inline-flex"
                            onClick={() => removeExtra(e.id)}
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveSettings('Add-ons & Extras')}>
                  <i className="fas fa-save mr-2" />Save Extras
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Discounts & Promotions */}
          <div className="bg-dark-2 border border-border-gold-soft" id="discounts">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Discounts & Promotions</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Configure automatic and coupon discounts
                </div>
              </div>
              <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={() => showToast('New discount promo creation')}>
                <i className="fas fa-plus mr-1.5" />New Discount
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-0.5">
                {pricing.discounts.map((d, index) => (
                  <div key={d.id} className="flex items-center gap-3.5 py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                    <div className="w-9 h-9 bg-gold/5 border border-gold/15 flex items-center justify-center text-[13.5px] text-gold shrink-0">
                      <i className={d.icon} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13.5px] text-white font-medium">{d.name}</div>
                      <div className="text-[12px] text-text-muted mt-0.5">{d.desc}</div>
                    </div>
                    <div className="font-mono text-[13px] text-gold whitespace-nowrap mr-2">{d.val}</div>
                    <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={d.active}
                        onChange={() => toggleDiscount(d.id)}
                        className="sr-only peer"
                      />
                      <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                    </label>
                    <button
                      className="w-[34px] h-[34px] bg-transparent border border-border-gold-soft text-text-muted cursor-pointer transition-all hover:border-gold hover:text-gold flex items-center justify-center ml-2"
                      onClick={() => showToast(`Edit discount ${d.name}`)}
                    >
                      <i className="fas fa-edit" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveSettings('Discounts & Promotions')}>
                  <i className="fas fa-save mr-2" />Save Discounts
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Taxes & Fees */}
          <div className="bg-dark-2 border border-border-gold-soft" id="taxes">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Taxes & Fees</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Government levies and service charges applied to bookings
                </div>
              </div>
              <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={() => showToast('Add new Tax config')}>
                <i className="fas fa-plus mr-1.5" />Add Tax
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-[1fr_120px_120px_auto] gap-3 items-center font-mono text-[9px] text-text-muted tracking-[0.1em] uppercase pb-2 border-b border-border-gold-soft/30 mb-1">
                <div>Tax / Fee Name</div>
                <div>Rate</div>
                <div>Applied To</div>
                <div>Active</div>
              </div>
              <div className="space-y-0.5">
                {pricing.taxes.map(t => (
                  <div key={t.id} className="grid grid-cols-[1fr_120px_120px_auto] gap-3 items-center py-3 border-b border-border-gold-soft/30 last:border-b-0">
                    <div>
                      <div className="text-[13.5px] text-white font-medium">{t.name}</div>
                      <div className="text-[12px] text-text-muted mt-0.5">{t.desc}</div>
                    </div>
                    <div>
                      {t.isPercent ? (
                        <div className="flex items-stretch">
                          <input
                            className="bg-dark-3 border border-border-gold-soft text-white font-mono text-[12px] py-1.5 px-2.5 outline-none w-[70px] transition-all focus:border-gold/50 text-right border-r-0"
                            type="number"
                            value={t.rate}
                            onChange={(e) => handleTaxChange(t.id, 'rate', e.target.value)}
                          />
                          <div className="bg-dark-4 border border-border-gold-soft border-l-0 px-2 flex items-center font-mono text-[10px] text-text-muted">%</div>
                        </div>
                      ) : (
                        <div className="flex items-stretch">
                          <div className="bg-dark-4 border border-border-gold-soft border-r-0 px-2 flex items-center font-mono text-[10px] text-gold whitespace-nowrap">ETB</div>
                          <input
                            className="bg-dark-3 border border-border-gold-soft text-white font-mono text-[12px] py-1.5 px-2.5 outline-none w-[70px] transition-all focus:border-gold/50 text-right border-l-0"
                            type="number"
                            value={t.rate}
                            onChange={(e) => handleTaxChange(t.id, 'rate', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <select
                        className="bg-dark-3 border border-border-gold-soft text-white text-[0.78rem] py-1.5 px-2 outline-none focus:border-gold/50 cursor-pointer w-full"
                        value={t.per}
                        onChange={(e) => handleTaxChange(t.id, 'per', e.target.value)}
                      >
                        <option value="All charges">All charges</option>
                        <option value="Room only">Room only</option>
                        <option value="F&B only">F&B only</option>
                        <option value="Per night">Per night</option>
                        <option value="Per stay">Per stay</option>
                        <option value="Per person">Per person</option>
                      </select>
                    </div>
                    <div className="text-right">
                      <label className="relative w-11 h-6 shrink-0 cursor-pointer inline-flex">
                        <input
                          type="checkbox"
                          checked={t.active}
                          onChange={() => toggleTax(t.id)}
                          className="sr-only peer"
                        />
                        <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveSettings('Taxes & Fees')}>
                  <i className="fas fa-save mr-2" />Save Tax Settings
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Live Price Preview */}
          <div className="bg-dark-2 border border-border-gold-soft" id="preview">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Live Price Preview</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  See how pricing rules apply to a sample booking
                </div>
              </div>
              <i className="fas fa-calculator text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Room Type</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={previewRoom}
                    onChange={(e) => setPreviewRoom(e.target.value)}
                  >
                    {pricing.rates.map(r => (
                      <option key={r.key} value={r.key}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Number of Nights</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="number"
                    value={previewNights}
                    min="1"
                    onChange={(e) => setPreviewNights(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Number of Guests</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="number"
                    value={previewGuests}
                    min="1"
                    onChange={(e) => setPreviewGuests(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Apply Promo Code</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={previewPromo}
                    onChange={(e) => setPreviewPromo(e.target.value)}
                    placeholder="e.g. TSEDEKE20"
                  />
                </div>
              </div>
              <div className="bg-dark-3 border border-border-gold-soft p-5">
                <div className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase mb-4">Booking Price Breakdown</div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[13px] text-text-muted">
                    <span>{previewCalc.roomName} × {previewCalc.nights} night{previewCalc.nights > 1 ? 's' : ''}</span>
                    <span className="font-mono text-[13px] text-gold">ETB {formatCurrency(previewCalc.roomTotal)}</span>
                  </div>

                  {previewCalc.extraCount > 0 && (
                    <div className="flex justify-between text-[13px] text-text-muted">
                      <span>Extra guest{previewCalc.extraCount > 1 ? 's' : ''} ({previewCalc.extraCount})</span>
                      <span className="font-mono text-[13px] text-gold">ETB {formatCurrency(previewCalc.extraSurcharge)}</span>
                    </div>
                  )}

                  {previewCalc.discountAmount > 0 && (
                    <div className="flex justify-between text-[13px] text-[#6fcf97]">
                      <span>Discount (Promo/Long Stay)</span>
                      <span className="font-mono text-[13px] text-[#6fcf97]">-ETB {formatCurrency(previewCalc.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[13px] text-text-muted">
                    <span>VAT (15%)</span>
                    <span className="font-mono text-[13px] text-gold">ETB {formatCurrency(previewCalc.vat)}</span>
                  </div>

                  <div className="flex justify-between text-[13px] text-text-muted">
                    <span>Tourism Levy</span>
                    <span className="font-mono text-[13px] text-gold">ETB {formatCurrency(previewCalc.tourismLevy)}</span>
                  </div>

                  <div className="flex justify-between text-[13px] text-text-muted">
                    <span>Service Charge (10%)</span>
                    <span className="font-mono text-[13px] text-gold">ETB {formatCurrency(previewCalc.serviceCharge)}</span>
                  </div>

                  <div className="flex justify-between text-[13px] text-white font-medium border-t border-border-gold-soft pt-2.5 mt-1">
                    <span>Total</span>
                    <span className="font-mono text-[14.5px] font-bold text-gold">ETB {formatCurrency(previewCalc.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Toast Alert */}
      <div className={`fixed bottom-7 right-7 bg-dark-2 border border-border-gold-soft py-3.5 px-4.5 flex items-center gap-3 text-[13px] text-white z-[999] transition-all duration-300 pointer-events-none min-w-[260px] ${
        toast.show ? 'opacity-100 translate-y-0 pointer-events-auto shadow-xl' : 'opacity-0 translate-y-3'
      }`}>
        <div className="w-[3px] h-full absolute left-0 top-0 bottom-0 bg-gold" />
        <i className="fas fa-check-circle text-gold" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default PricingSettings;
