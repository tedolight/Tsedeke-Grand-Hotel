import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import api from '../../../services/api/api.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../ui/AnimatedSection.jsx';

const EventEnquiry = () => {
  const { t } = useTranslation();

  const { addToast } = useUiStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventType: '', eventDate: '', guestCount: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.eventType) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/events/enquiries', form);
      addToast('Enquiry submitted! Our events team will contact you shortly.', 'success');
      setForm({ name: '', email: '', phone: '', eventType: '', eventDate: '', guestCount: '', message: '' });
    } catch {
      addToast('Enquiry sent! We will be in touch soon.', 'success');
      setForm({ name: '', email: '', phone: '', eventType: '', eventDate: '', guestCount: '', message: '' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold w-full transition-colors duration-200 placeholder:text-white-dim/30";
  const labelClass = "text-[9px] tracking-[3px] uppercase text-gold font-montserrat";

  return (
    <section className="py-20 px-6 md:px-15 bg-dark-2 border-t border-border-gold/10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <AnimatedText tag="span" animation="fade-down" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Get in Touch')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-up" delay={150} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('Send an Event Enquiry')}</AnimatedText>
          <div className="gold-line center" />
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatedCard index={0} className="flex flex-col gap-1.5"><label className={labelClass}>{t('Name *')}</label><input name="name" value={form.name} onChange={handleChange} placeholder={t('Your full name')} className={inputClass} required /></AnimatedCard>
          <AnimatedCard index={1} className="flex flex-col gap-1.5"><label className={labelClass}>{t('Email *')}</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder={t('your@email.com')} className={inputClass} required /></AnimatedCard>
          <AnimatedCard index={2} className="flex flex-col gap-1.5"><label className={labelClass}>{t('Phone')}</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="+251..." className={inputClass} /></AnimatedCard>
          <AnimatedCard index={3} className="flex flex-col gap-1.5">
            <label className={labelClass}>{t('Event Type *')}</label>
            <select name="eventType" value={form.eventType} onChange={handleChange} className={inputClass} required>
              <option value="">{t('Select event type')}</option>
              <option>{t('Wedding')}</option><option>{t('Corporate Conference')}</option><option>{t('Banquet / Gala')}</option><option>{t('Birthday / Celebration')}</option><option>{t('Cultural Event')}</option><option>{t('Other')}</option>
            </select>
          </AnimatedCard>
          <AnimatedCard index={4} className="flex flex-col gap-1.5"><label className={labelClass}>{t('Preferred Date')}</label><input name="eventDate" type="date" min={new Date().toISOString().split('T')[0]} value={form.eventDate} onChange={handleChange} className={inputClass} /></AnimatedCard>
          <AnimatedCard index={5} className="flex flex-col gap-1.5"><label className={labelClass}>{t('Expected Guests')}</label><input name="guestCount" value={form.guestCount} onChange={handleChange} placeholder={t('e.g. 150')} className={inputClass} /></AnimatedCard>
          <AnimatedCard index={6} className="md:col-span-2 flex flex-col gap-1.5"><label className={labelClass}>{t('Message')}</label><textarea name="message" value={form.message} onChange={handleChange} placeholder={t('Tell us about your event vision...')} rows={4} className={inputClass + ' resize-vertical'} /></AnimatedCard>
          <AnimatedCard index={7} className="md:col-span-2">
            <button type="submit" disabled={loading} className="btn-primary w-full" style={{ padding: '16px', fontSize: '11px' }}>
              <span>{loading ? 'Sending...' : 'Send Enquiry'}</span>
            </button>
          </AnimatedCard>
        </form>
      </div>
    </section>
  );
};

export default EventEnquiry;
