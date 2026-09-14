import React, { useState, useEffect } from 'react';
import settingsService from '../../services/settings/settingsService.js';

const DEFAULT_NOTIF_CONFIG = {
  // SMTP Channel
  smtpHost: 'smtp.tsedekegrandhotel.com',
  smtpPort: 587,
  smtpUsername: 'notifications@tsedekegrandhotel.com',
  smtpPassword: 'password123',
  fromName: 'Tsedeke Grand Hotel',
  fromEmail: 'noreply@tsedekegrandhotel.com',
  encryption: 'TLS',
  emailFooter: 'Tsedeke Grand Hotel · Hossana, Ethiopia · Excellence in Hospitality',
  emailHtml: true,
  emailPdfAttach: true,
  emailLogoHeader: true,
  emailActive: true,

  // SMS Channel
  smsProvider: 'Twilio',
  smsSid: 'AC4827492749274928',
  smsToken: 'token49274927492749',
  smsSenderId: '+251911234567',
  smsUnsubscribe: true,
  smsUnicode: false,
  smsActive: true,

  // Push Channel
  pushFcmKey: '',
  pushApnsKey: '',
  pushIconUrl: 'https://tsedekegrandhotel.com/icon-192.png',
  pushInApp: false,
  pushActive: false,

  // Event Triggers per event ID
  triggers: {
    new_booking: { email: true, sms: true, push: true },
    booking_cancel: { email: true, sms: true, push: false },
    booking_modified: { email: true, sms: false, push: false },
    payment_received: { email: true, sms: false, push: false },
    payment_failed: { email: true, sms: true, push: true },
    refund_issued: { email: true, sms: false, push: false },
    checkin_reminder: { email: true, sms: true, push: false },
    checkout_reminder: { email: false, sms: true, push: false },
    review_received: { email: true, sms: false, push: true },
    enquiry_submitted: { email: true, sms: false, push: true },
    event_enquiry: { email: true, sms: true, push: false },
    restaurant_reservation: { email: true, sms: true, push: false }
  },

  // Digest & Schedule
  digestFrequency: 'Daily Digest',
  digestTime: '07:30',
  digestDay: 'Monday',
  digestFormat: 'HTML Email with Summary Table',
  digestModules: 'All Modules',

  // Quiet Hours
  quietEnabled: true,
  quietFrom: '22:00',
  quietTo: '07:00',
  quietAllowUrgent: true,
  quietBatchEnd: true,

  // Recipients
  adminEmails: ['admin@tsedekegrandhotel.com', 'manager@tsedekegrandhotel.com'],
  staffPhones: ['+251911XXXXXX', '+251922XXXXXX'],
  routeRestaurantKitchen: true,
  routeHousekeepingSMS: true,
  ccFinancePayment: false
};

const DEFAULT_TEMPLATES = {
  booking_conf: {
    emailSubject: '✔ Your booking at Tsedeke Grand Hotel is confirmed — Ref {{booking_ref}}',
    emailBody: `Dear {{guest_name}},\n\nThank you for choosing Tsedeke Grand Hotel. Your booking has been confirmed.\n\n🏨 Room: {{room_type}} — {{room_number}}\n📅 Check-in: {{checkin_date}}  |  Check-out: {{checkout_date}}\n👤 Guests: {{guest_count}}\n💳 Total: ETB {{total_amount}}\n\nWe look forward to welcoming you.\n\nWarm regards,\nThe Tsedeke Grand Hotel Team`,
    smsBody: 'Tsedeke Grand Hotel: Hi {{guest_name}}, your booking (Ref {{booking_ref}}) is confirmed. Check-in: {{checkin_date}}. Call +251XXX for help.'
  },
  booking_cancel: {
    emailSubject: 'Booking Cancellation Confirmed — Ref {{booking_ref}}',
    emailBody: `Dear {{guest_name}},\n\nYour booking cancellation has been processed successfully.\n\n🏨 Room: {{room_type}}\n📅 Check-in was scheduled for: {{checkin_date}}\n\nWe hope to host you another time.\n\nWarm regards,\nThe Tsedeke Grand Hotel Team`,
    smsBody: 'Tsedeke Grand Hotel: Hi {{guest_name}}, your booking (Ref {{booking_ref}}) has been cancelled. We hope to host you another time.'
  },
  checkin_reminder: {
    emailSubject: 'We are preparing for your arrival tomorrow! — Tsedeke Grand Hotel',
    emailBody: `Dear {{guest_name}},\n\nWe are looking forward to welcoming you tomorrow at Tsedeke Grand Hotel.\n\n🏨 Room: {{room_type}}\n📅 Check-in: {{checkin_date}} (Standard check-in starts at 14:00)\n\nPlease let us know if you need airport transfer.\n\nSafe travels,\nThe Tsedeke Grand Hotel Team`,
    smsBody: 'Tsedeke Grand Hotel: Hi {{guest_name}}, we look forward to welcoming you tomorrow! Standard check-in starts at 14:00. Safe travels!'
  },
  checkout_reminder: {
    emailSubject: 'Important check-out reminder — Tsedeke Grand Hotel',
    emailBody: `Dear {{guest_name}},\n\nWe hope you enjoyed your stay at Tsedeke Grand Hotel.\n\nThis is a quick reminder that standard check-out time is {{checkout_time}} today.\n\nHave a safe onward journey!\n\nWarm regards,\nThe Tsedeke Grand Hotel Team`,
    smsBody: 'Tsedeke Grand Hotel: Hi {{guest_name}}, we hope you enjoyed your stay. Quick reminder that check-out is at {{checkout_time}} today. Safe travels!'
  },
  payment_receipt: {
    emailSubject: 'Payment Receipt for Booking {{booking_ref}} — Tsedeke Grand Hotel',
    emailBody: `Dear {{guest_name}},\n\nYour payment has been received successfully.\n\n💳 Paid: ETB {{total_amount}}\n🏨 Booking Ref: {{booking_ref}}\n\nThank you for your payment.\n\nWarm regards,\nThe Tsedeke Grand Hotel Team`,
    smsBody: 'Tsedeke Grand Hotel: Hi {{guest_name}}, payment of ETB {{total_amount}} received successfully for booking {{booking_ref}}. Thank you!'
  },
  enquiry_received: {
    emailSubject: 'Thank you for contacting Tsedeke Grand Hotel',
    emailBody: `Dear {{guest_name}},\n\nWe have received your enquiry and our team will get back to you within 24 hours.\n\nSummary of your request:\n{{enquiry_details}}\n\nThank you for your interest,\nThe Tsedeke Grand Hotel Team`,
    smsBody: 'Tsedeke Grand Hotel: Hi {{guest_name}}, we have received your enquiry and our team will get back to you shortly. Thank you!'
  }
};

const NotificationSettings = () => {
  const [toast, setToast] = useState({ show: false, message: '' });
  const [activeSection, setActiveSection] = useState('channels');
  const [loading, setLoading] = useState(true);
  const [notifConfig, setNotifConfig] = useState(DEFAULT_NOTIF_CONFIG);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [configData, templatesData] = await Promise.all([
          settingsService.getSettings('notifications'),
          settingsService.getSettings('notification_templates')
        ]);
        if (configData && Object.keys(configData).length > 0) {
          setNotifConfig({ ...DEFAULT_NOTIF_CONFIG, ...configData });
        } else {
          setNotifConfig(DEFAULT_NOTIF_CONFIG);
        }
        if (templatesData && Object.keys(templatesData).length > 0) {
          setTemplates({ ...DEFAULT_TEMPLATES, ...templatesData });
        } else {
          setTemplates(DEFAULT_TEMPLATES);
        }
      } catch (err) {
        console.error('Error fetching notification settings:', err);
        showToast('Error loading notification settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const [selectedTemplateKey, setSelectedTemplateKey] = useState('booking_conf');
  const [newEmailTag, setNewEmailTag] = useState('');
  const [newPhoneTag, setNewPhoneTag] = useState('');

  // Send Test Form State
  const [testChannel, setTestChannel] = useState('email');
  const [testTemplate, setTestTemplate] = useState('Booking Confirmation');
  const [testRecipient, setTestRecipient] = useState('');
  const [testGuestName, setTestGuestName] = useState('Almaz Tadesse');

  // Logs Filter State
  const [logFilter, setLogFilter] = useState('All Channels');
  const [visibleLogsCount, setVisibleLogsCount] = useState(5);

  const sections = [
    { id: 'channels', label: 'Channels', icon: 'fas fa-broadcast-tower' },
    { id: 'events', label: 'Event Triggers', icon: 'fas fa-list-check' },
    { id: 'templates', label: 'Templates', icon: 'fas fa-file-alt' },
    { id: 'digest', label: 'Digest & Schedule', icon: 'fas fa-clock' },
    { id: 'quiet', label: 'Quiet Hours', icon: 'fas fa-moon', isSep: true },
    { id: 'recipients', label: 'Recipients', icon: 'fas fa-user-friends' },
    { id: 'test', label: 'Send Test', icon: 'fas fa-paper-plane' },
    { id: 'log', label: 'Delivery Log', icon: 'fas fa-history', isSep: true }
  ];

  const eventTriggersList = [
    { id: 'new_booking', name: 'New Booking Received', desc: 'A guest completes a booking', cat: 'Bookings' },
    { id: 'booking_cancel', name: 'Booking Cancelled', desc: 'A guest cancels their reservation', cat: 'Bookings' },
    { id: 'booking_modified', name: 'Booking Modified', desc: 'A guest updates their booking details', cat: 'Bookings' },
    { id: 'payment_received', name: 'Payment Received', desc: 'A payment is successfully processed', cat: 'Payments' },
    { id: 'payment_failed', name: 'Payment Failed', desc: 'A payment attempt is declined', cat: 'Payments' },
    { id: 'refund_issued', name: 'Refund Issued', desc: 'A refund is processed to the guest', cat: 'Payments' },
    { id: 'checkin_reminder', name: 'Check-in Reminder', desc: 'Sent 24 hours before guest arrival', cat: 'Guest Stay' },
    { id: 'checkout_reminder', name: 'Check-out Reminder', desc: 'Sent 2 hours before guest check-out', cat: 'Guest Stay' },
    { id: 'review_received', name: 'Guest Review Received', desc: 'A guest leaves a rating or review', cat: 'Guest Stay' },
    { id: 'enquiry_submitted', name: 'New Enquiry Submitted', desc: 'A contact form enquiry is received', cat: 'Enquiries' },
    { id: 'event_enquiry', name: 'Event Enquiry Received', desc: 'A guest enquires about an event package', cat: 'Enquiries' },
    { id: 'restaurant_reservation', name: 'Restaurant Reservation', desc: 'A table reservation is made', cat: 'Restaurant' }
  ];

  const deliveryLogs = [
    { status: 'delivered', icon: 'fas fa-envelope', event: 'Booking Confirmation', meta: 'Ref BK-2041 · Almaz Tadesse', channel: 'email', time: 'Today, 14:32' },
    { status: 'delivered', icon: 'fas fa-sms', event: 'New Booking Alert', meta: 'Ref BK-2041 · Admin +251911XXXXX', channel: 'sms', time: 'Today, 14:32' },
    { status: 'delivered', icon: 'fas fa-envelope', event: 'Payment Receipt', meta: 'ETB 14,000 · Booking BK-2040', channel: 'email', time: 'Today, 11:18' },
    { status: 'failed', icon: 'fas fa-envelope', event: 'Check-in Reminder', meta: 'Ref BK-2039 · Delivery failed: invalid address', channel: 'email', time: 'Today, 09:00' },
    { status: 'pending', icon: 'fas fa-bell', event: 'Daily Digest', meta: 'Scheduled — awaiting delivery window', channel: 'push', time: 'Today, 07:30' },
    { status: 'delivered', icon: 'fas fa-sms', event: 'Booking Cancellation', meta: 'Ref BK-2038 · Yonas Bekele', channel: 'sms', time: 'Yesterday, 20:14' },
    { status: 'delivered', icon: 'fas fa-envelope', event: 'Event Enquiry Received', meta: 'Wedding Package · Meseret Alemu', channel: 'email', time: 'Yesterday, 16:55' },
    { status: 'delivered', icon: 'fas fa-envelope', event: 'Booking Confirmation', meta: 'Ref BK-2037 · Dawit Haile', channel: 'email', time: 'Yesterday, 14:01' }
  ];

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const updateConfig = (key, value) => {
    setNotifConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async (sectionName) => {
    try {
      await settingsService.updateSettings('notifications', notifConfig);
      showToast(`${sectionName} saved successfully`);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      showToast('Error saving settings', 'warning');
    }
  };

  // Toggle checkbox helper
  const handleCheckboxToggle = (eventId, channel) => {
    setNotifConfig(prev => {
      const triggers = { ...prev.triggers };
      triggers[eventId] = {
        ...triggers[eventId],
        [channel]: !triggers[eventId][channel]
      };
      return { ...prev, triggers };
    });
  };

  // Template Handlers
  const handleTemplateChange = async (field, value) => {
    const updated = {
      ...templates,
      [selectedTemplateKey]: {
        ...templates[selectedTemplateKey],
        [field]: value
      }
    };
    setTemplates(updated);
    try {
      await settingsService.updateSettings('notification_templates', updated);
    } catch (err) {
      console.error('Error saving template:', err);
      showToast('Failed to save template change', 'warning');
    }
  };

  const resetTemplate = async () => {
    if (window.confirm('Reset this template to factory defaults?')) {
      const updated = {
        ...templates,
        [selectedTemplateKey]: DEFAULT_TEMPLATES[selectedTemplateKey]
      };
      setTemplates(updated);
      try {
        await settingsService.updateSettings('notification_templates', updated);
        showToast('Template reset to default');
      } catch (err) {
        console.error('Error resetting template:', err);
        showToast('Failed to reset template', 'warning');
      }
    }
  };

  // 24 Hour Quiet hours calculator
  const renderQuietHoursBar = () => {
    const fromHour = parseInt(notifConfig.quietFrom.split(':')[0]) || 0;
    const toHour = parseInt(notifConfig.quietTo.split(':')[0]) || 0;
    const barHours = [];

    for (let h = 0; h < 24; h++) {
      let isQuiet = false;
      if (notifConfig.quietEnabled) {
        if (fromHour > toHour) {
          isQuiet = h >= fromHour || h < toHour;
        } else {
          isQuiet = h >= fromHour && h < toHour;
        }
      }
      barHours.push({ hour: h, isQuiet });
    }

    return (
      <div className="flex h-7 w-full overflow-hidden my-3 gap-[1px]">
        {barHours.map(({ hour, isQuiet }) => (
          <div
            key={hour}
            className={`flex-1 transition-all duration-200 cursor-default ${
              isQuiet
                ? 'bg-gold/5 border-t-2 border-gold/15'
                : 'bg-gold/35'
            }`}
            title={`${String(hour).padStart(2, '0')}:00 — ${isQuiet ? 'Quiet' : 'Delivery OK'}`}
          />
        ))}
      </div>
    );
  };

  // Tag inputs helper
  const addEmailTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = newEmailTag.trim();
      if (val && !notifConfig.adminEmails.includes(val)) {
        updateConfig('adminEmails', [...notifConfig.adminEmails, val]);
        setNewEmailTag('');
        showToast(`Email ${val} added`);
      }
    }
  };

  const removeEmailTag = (email) => {
    updateConfig('adminEmails', notifConfig.adminEmails.filter(e => e !== email));
  };

  const addPhoneTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = newPhoneTag.trim();
      if (val && !notifConfig.staffPhones.includes(val)) {
        updateConfig('staffPhones', [...notifConfig.staffPhones, val]);
        setNewPhoneTag('');
        showToast(`Phone number ${val} added`);
      }
    }
  };

  const removePhoneTag = (phone) => {
    updateConfig('staffPhones', notifConfig.staffPhones.filter(p => p !== phone));
  };

  const handleSendTestNotification = () => {
    showToast(`Test ${testChannel.toUpperCase()} notification sent to ${testRecipient || 'configured defaults'}`);
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
      let current = 'channels';
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

  // SMS Text count calculations
  const smsBodyText = templates[selectedTemplateKey]?.smsBody || '';
  const smsLength = smsBodyText.length;
  const smsProgressPercent = Math.min(smsLength / 160, 1) * 100;
  const progressColor = smsProgressPercent > 90 ? 'bg-danger' : smsProgressPercent > 75 ? 'bg-gold-light' : 'bg-gold';

  // Filter logs
  const filteredLogs = deliveryLogs.filter(log => {
    if (logFilter === 'All Channels') return true;
    if (logFilter === 'Email Only') return log.channel === 'email';
    if (logFilter === 'SMS Only') return log.channel === 'sms';
    if (logFilter === 'Failed Only') return log.status === 'failed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gold font-mono text-xs uppercase tracking-widest animate-pulse">
          <i className="fas fa-spinner fa-spin mr-2" /> Loading notification settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="font-cormorant text-2xl font-bold text-white">Notification Settings</div>
          <div className="font-mono text-[9.5px] text-text-muted tracking-[0.15em] uppercase mt-1">
            SMTP CREDENTIALS, SMS APIS, EVENT TRIGGERS AND DELIVERY LOGS
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9.5px] text-text-muted tracking-[0.1em] uppercase">
          <a href="#" className="hover:text-gold transition-colors">Dashboard</a>
          <span className="text-gold/40">›</span>
          <span className="text-gold">Notifications</span>
        </div>
      </div>

      {/* Grid Settings Layout */}
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
          {/* Channels Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="channels">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Notification Channels</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Configure each delivery channel
                </div>
              </div>
              <i className="fas fa-broadcast-tower text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6 space-y-7">
              {/* Email channel */}
              <div>
                <div className="flex items-center gap-2 mb-4.5">
                  <div className="font-mono text-[9.5px] text-text-muted tracking-[0.18em] uppercase flex items-center gap-1.5">
                    <i className="fas fa-envelope text-gold" /> Email Channel
                  </div>
                  <div className="flex-1 h-[1px] bg-border-gold-soft" />
                  <span className="font-mono text-[9px] text-success tracking-[0.08em] font-semibold flex items-center gap-1">
                    ● ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">SMTP Host <span>*</span></label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.smtpHost}
                      onChange={(e) => updateConfig('smtpHost', e.target.value)}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">SMTP Port <span>*</span></label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="number"
                      value={notifConfig.smtpPort}
                      onChange={(e) => updateConfig('smtpPort', parseInt(e.target.value) || '')}
                      placeholder="587"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">SMTP Username <span>*</span></label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.smtpUsername}
                      onChange={(e) => updateConfig('smtpUsername', e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">SMTP Password <span>*</span></label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="password"
                      value={notifConfig.smtpPassword}
                      onChange={(e) => updateConfig('smtpPassword', e.target.value)}
                      placeholder="Password"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">From Name</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.fromName}
                      onChange={(e) => updateConfig('fromName', e.target.value)}
                      placeholder="Hotel name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">From Email</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="email"
                      value={notifConfig.fromEmail}
                      onChange={(e) => updateConfig('fromEmail', e.target.value)}
                      placeholder="noreply@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Encryption</label>
                    <select
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                      value={notifConfig.encryption}
                      onChange={(e) => updateConfig('encryption', e.target.value)}
                    >
                      <option value="TLS">TLS</option>
                      <option value="SSL">SSL</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Email Footer Tagline</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.emailFooter}
                      onChange={(e) => updateConfig('emailFooter', e.target.value)}
                      placeholder="Footer text"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                    <div className="flex-1 pr-5">
                      <div className="text-[13.5px] text-white font-medium">Enable HTML Emails</div>
                      <div className="text-[12px] text-text-muted mt-0.75">Send beautifully formatted HTML emails instead of plain text</div>
                    </div>
                    <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.emailHtml}
                        onChange={(e) => updateConfig('emailHtml', e.target.checked)}
                        className="sr-only peer"
                      />
                      <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                    <div className="flex-1 pr-5">
                      <div className="text-[13.5px] text-white font-medium">Attach PDF Confirmation</div>
                      <div className="text-[12px] text-text-muted mt-0.75">Auto-attach a PDF booking confirmation to every guest booking email</div>
                    </div>
                    <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.emailPdfAttach}
                        onChange={(e) => updateConfig('emailPdfAttach', e.target.checked)}
                        className="sr-only peer"
                      />
                      <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                    <div className="flex-1 pr-5">
                      <div className="text-[13.5px] text-white font-medium">Include Hotel Logo in Email Header</div>
                      <div className="text-[12px] text-text-muted mt-0.75">Display the Tsedeke Grand Hotel logo at the top of each email</div>
                    </div>
                    <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.emailLogoHeader}
                        onChange={(e) => updateConfig('emailLogoHeader', e.target.checked)}
                        className="sr-only peer"
                      />
                      <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                  <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveConfig('Email Channel Settings')}>
                    <i className="fas fa-save mr-2" />Save Email Config
                  </button>
                  <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2.5 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={() => showToast('Test email sent to default')}>
                    <i className="fas fa-paper-plane mr-1.5" />Send Test Email
                  </button>
                  <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
                </div>
              </div>

              {/* SMS channel */}
              <div className="pt-6 border-t border-border-gold-soft">
                <div className="flex items-center gap-2 mb-4.5">
                  <div className="font-mono text-[9.5px] text-text-muted tracking-[0.18em] uppercase flex items-center gap-1.5">
                    <i className="fas fa-sms text-gold" /> SMS Channel
                  </div>
                  <div className="flex-1 h-[1px] bg-border-gold-soft" />
                  <span className="font-mono text-[9px] text-success tracking-[0.08em] font-semibold flex items-center gap-1">
                    ● ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">SMS Provider</label>
                    <select
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                      value={notifConfig.smsProvider}
                      onChange={(e) => updateConfig('smsProvider', e.target.value)}
                    >
                      <option value="Twilio">Twilio</option>
                      <option value="Nexmo / Vonage">Nexmo / Vonage</option>
                      <option value="Africa's Talking">Africa's Talking</option>
                      <option value="Custom API">Custom API</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Account SID / API Key <span>*</span></label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.smsSid}
                      onChange={(e) => updateConfig('smsSid', e.target.value)}
                      placeholder="Account SID"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Auth Token <span>*</span></label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="password"
                      value={notifConfig.smsToken}
                      onChange={(e) => updateConfig('smsToken', e.target.value)}
                      placeholder="Auth Token"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Sender Number / ID</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.smsSenderId}
                      onChange={(e) => updateConfig('smsSenderId', e.target.value)}
                      placeholder="+2519XXXXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                    <div className="flex-1 pr-5">
                      <div className="text-[13.5px] text-white font-medium">Append Unsubscribe Text</div>
                      <div className="text-[12px] text-text-muted mt-0.75">Add "Reply STOP to unsubscribe" to outbound SMS messages</div>
                    </div>
                    <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.smsUnsubscribe}
                        onChange={(e) => updateConfig('smsUnsubscribe', e.target.checked)}
                        className="sr-only peer"
                      />
                      <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                    <div className="flex-1 pr-5">
                      <div className="text-[13.5px] text-white font-medium">Unicode SMS (Amharic/UTF-8 support)</div>
                      <div className="text-[12px] text-text-muted mt-0.75">Enable for sending SMS messages in Amharic or other non-Latin scripts</div>
                    </div>
                    <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.smsUnicode}
                        onChange={(e) => updateConfig('smsUnicode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                  <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveConfig('SMS Channel Settings')}>
                    <i className="fas fa-save mr-2" />Save SMS Config
                  </button>
                  <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2.5 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={() => showToast('Test SMS sent')}>
                    <i className="fas fa-paper-plane mr-1.5" />Send Test SMS
                  </button>
                  <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
                </div>
              </div>

              {/* Push channel */}
              <div className="pt-6 border-t border-border-gold-soft">
                <div className="flex items-center gap-2 mb-4.5">
                  <div className="font-mono text-[9.5px] text-text-muted tracking-[0.18em] uppercase flex items-center gap-1.5">
                    <i className="fas fa-bell text-gold" /> Push Notifications
                  </div>
                  <div className="flex-1 h-[1px] bg-border-gold-soft" />
                  <span className="font-mono text-[9px] text-text-muted tracking-[0.08em] font-semibold flex items-center gap-1">
                    ○ INACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">FCM Server Key (Firebase)</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.pushFcmKey}
                      onChange={(e) => updateConfig('pushFcmKey', e.target.value)}
                      placeholder="AAAAxxxxx:APA91b…"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">APNS Key ID (Apple)</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={notifConfig.pushApnsKey}
                      onChange={(e) => updateConfig('pushApnsKey', e.target.value)}
                      placeholder="XXXXXXXXXXXX"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-full">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Notification Icon URL</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="url"
                      value={notifConfig.pushIconUrl}
                      onChange={(e) => updateConfig('pushIconUrl', e.target.value)}
                      placeholder="https://tsedekegrandhotel.com/icon-192.png"
                    />
                    <span className="text-[12px] text-text-muted mt-1">Recommended size: 192×192px, PNG format</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Enable In-App Push Notifications</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Show push alerts inside the hotel's web/mobile application</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifConfig.pushInApp}
                      onChange={(e) => updateConfig('pushInApp', e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                  <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveConfig('Push Notification Settings')}>
                    <i className="fas fa-save mr-2" />Save Push Config
                  </button>
                  <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
                </div>
              </div>
            </div>
          </div>

          {/* Event Triggers Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="events">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Event Triggers</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Choose which events fire notifications and via which channel
                </div>
              </div>
              <i className="fas fa-list-check text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_44px_44px_44px] gap-0 border-b border-border-gold-soft pb-2 mb-1">
                <div className="font-mono text-[9px] text-text-muted tracking-[0.1em] uppercase">Event</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase text-center flex flex-col items-center">
                  <i className="fas fa-envelope text-[#74c0fc] mb-1" /> Email
                </div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase text-center flex flex-col items-center">
                  <i className="fas fa-sms text-[#95d863] mb-1" /> SMS
                </div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase text-center flex flex-col items-center">
                  <i className="fas fa-bell text-gold mb-1" /> Push
                </div>
              </div>

              {/* Groups list */}
              {['Bookings', 'Payments', 'Guest Stay', 'Enquiries', 'Restaurant'].map(category => (
                <div key={category} className="space-y-0.5">
                  <div className="flex items-center gap-2 mt-4 mb-2">
                    <div className="font-mono text-[9.5px] text-text-muted tracking-[0.18em] uppercase whitespace-nowrap">
                      {category}
                    </div>
                    <div className="flex-1 h-[1px] bg-border-gold-soft" />
                  </div>
                  {eventTriggersList
                    .filter(ev => ev.cat === category)
                    .map(ev => {
                      const userTriggers = notifConfig.triggers[ev.id] || { email: false, sms: false, push: false };
                      return (
                        <div key={ev.id} className="grid grid-cols-[1fr_44px_44px_44px] gap-0 border-b border-border-gold-soft/30 last:border-b-0 align-middle items-center">
                          <div className="py-3">
                            <div className="text-[13.5px] text-white font-medium">{ev.name}</div>
                            <div className="text-[12px] text-text-muted mt-0.5">{ev.desc}</div>
                          </div>
                          <div className="flex items-center justify-center py-3">
                            <div
                              onClick={() => handleCheckboxToggle(ev.id, 'email')}
                              className={`w-[18px] h-[18px] bg-dark-3 border cursor-pointer flex items-center justify-center shrink-0 transition-all ${
                                userTriggers.email
                                  ? 'bg-gold/10 border-gold'
                                  : 'border-border-gold-soft hover:border-gold/40'
                              }`}
                            >
                              {userTriggers.email && <i className="fas fa-check text-[9px] text-gold" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-center py-3">
                            <div
                              onClick={() => handleCheckboxToggle(ev.id, 'sms')}
                              className={`w-[18px] h-[18px] bg-dark-3 border cursor-pointer flex items-center justify-center shrink-0 transition-all ${
                                userTriggers.sms
                                  ? 'bg-gold/10 border-gold'
                                  : 'border-border-gold-soft hover:border-gold/40'
                              }`}
                            >
                              {userTriggers.sms && <i className="fas fa-check text-[9px] text-gold" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-center py-3">
                            <div
                              onClick={() => handleCheckboxToggle(ev.id, 'push')}
                              className={`w-[18px] h-[18px] bg-dark-3 border cursor-pointer flex items-center justify-center shrink-0 transition-all ${
                                userTriggers.push
                                  ? 'bg-gold/10 border-gold'
                                  : 'border-border-gold-soft hover:border-gold/40'
                              }`}
                            >
                              {userTriggers.push && <i className="fas fa-check text-[9px] text-gold" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveConfig('Event Trigger Settings')}>
                  <i className="fas fa-save mr-2" />Save Triggers
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Reset to Defaults</button>
              </div>
            </div>
          </div>

          {/* Templates Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="templates">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Message Templates</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Customise the content sent for each notification type
                </div>
              </div>
              <button className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10" onClick={() => showToast('New template creation modal')}>
                <i className="fas fa-plus mr-1.5" />New Template
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-1.5 mb-4.5">
                <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Select Template to Edit</label>
                <select
                  className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                >
                  <option value="booking_conf">Booking Confirmation</option>
                  <option value="booking_cancel">Booking Cancellation</option>
                  <option value="checkin_reminder">Check-in Reminder</option>
                  <option value="checkout_reminder">Check-out Reminder</option>
                  <option value="payment_receipt">Payment Receipt</option>
                  <option value="enquiry_received">Enquiry Received</option>
                </select>
              </div>

              {/* Email Template Card */}
              <div className="bg-dark-3 border border-border-gold-soft p-5 mb-3.5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[9px] tracking-[0.12em] uppercase py-0.5 px-2 border border-[#74c0fc]/25 bg-[#74c0fc]/5 text-[#74c0fc]">Email</span>
                      <span className="font-mono text-[9.5px] text-text-muted tracking-[0.08em] uppercase">{selectedTemplateKey.replace('_', ' ')}</span>
                    </div>
                    <div className="text-[13.5px] text-white font-bold mb-1">Subject Line</div>
                  </div>
                </div>
                <input
                  className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full mb-3.5"
                  type="text"
                  value={templates[selectedTemplateKey]?.emailSubject || ''}
                  onChange={(e) => handleTemplateChange('emailSubject', e.target.value)}
                />
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Email Body</label>
                  <textarea
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full resize-y min-h-[130px] leading-relaxed"
                    value={templates[selectedTemplateKey]?.emailBody || ''}
                    onChange={(e) => handleTemplateChange('emailBody', e.target.value)}
                  />
                </div>
                <div className="mb-2.5">
                  <div className="font-mono text-[9px] text-text-muted tracking-[0.1em] uppercase mb-2">Available Variables</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['guest_name', 'booking_ref', 'room_type', 'room_number', 'checkin_date', 'checkout_date', 'guest_count', 'total_amount', 'hotel_name', 'hotel_phone'].map(variable => (
                      <span key={variable} className="font-mono text-[9px] text-gold bg-gold/10 border border-gold/20 py-0.5 px-2">
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2.5 mt-3 pt-3 border-t border-border-gold-soft/30">
                  <button className="font-mono text-[9.5px] tracking-[0.1em] uppercase py-1.5 px-3.5 border border-gold/30 bg-gold/10 text-gold cursor-pointer transition-all hover:bg-gold/15" onClick={() => showToast('Email template saved successfully')}>
                    <i className="fas fa-save mr-1" />Save
                  </button>
                  <button className="font-mono text-[9.5px] tracking-[0.1em] uppercase py-1.5 px-3.5 border border-border-gold-soft bg-transparent text-text-muted cursor-pointer transition-all hover:border-gold hover:text-gold" onClick={() => showToast('Email preview triggered')}>
                    <i className="fas fa-eye mr-1" />Preview
                  </button>
                  <button className="font-mono text-[9.5px] tracking-[0.1em] uppercase py-1.5 px-3.5 border border-border-gold-soft bg-transparent text-text-muted cursor-pointer transition-all hover:border-gold hover:text-gold" onClick={resetTemplate}>
                    <i className="fas fa-undo mr-1" />Reset Default
                  </button>
                </div>
              </div>

              {/* SMS Template Card */}
              <div className="bg-dark-3 border border-border-gold-soft p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] tracking-[0.12em] uppercase py-0.5 px-2 border border-[#95d863]/25 bg-[#95d863]/5 text-[#95d863]">SMS</span>
                    <span className="font-mono text-[9.5px] text-text-muted tracking-[0.08em] uppercase">{selectedTemplateKey.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mb-2.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">
                    SMS Body <span className="text-text-muted ml-1">(max 160 chars)</span>
                  </label>
                  <textarea
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full resize-y min-h-[70px]"
                    value={smsBodyText}
                    onChange={(e) => handleTemplateChange('smsBody', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] text-text-muted font-medium">Characters: <span className="text-white font-mono">{smsLength}</span>/160</span>
                  <div className="w-[120px] h-1.5 bg-dark-4 border border-border-gold-soft rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-200 ${progressColor}`} style={{ width: `${smsProgressPercent}%` }} />
                  </div>
                </div>
                <div className="flex gap-2.5 mt-3 pt-3 border-t border-border-gold-soft/30">
                  <button className="font-mono text-[9.5px] tracking-[0.1em] uppercase py-1.5 px-3.5 border border-gold/30 bg-gold/10 text-gold cursor-pointer transition-all hover:bg-gold/15" onClick={() => showToast('SMS template saved successfully')}>
                    <i className="fas fa-save mr-1" />Save
                  </button>
                  <button className="font-mono text-[9.5px] tracking-[0.1em] uppercase py-1.5 px-3.5 border border-border-gold-soft bg-transparent text-text-muted cursor-pointer transition-all hover:border-gold hover:text-gold" onClick={resetTemplate}>
                    <i className="fas fa-undo mr-1" />Reset Default
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Digest Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="digest">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Digest &amp; Delivery Schedule</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Control when admin summary reports are sent
                </div>
              </div>
              <i className="fas fa-clock text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="mb-[18px]">
                <div className="font-mono text-[9px] text-text-muted tracking-[0.14em] uppercase mb-3">Admin Summary Digest Frequency</div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Real-time', desc: 'Receive admin alerts immediately as events occur', icon: 'fas fa-bolt' },
                    { title: 'Daily Digest', desc: 'One summary email per day covering all activity', icon: 'fas fa-sun' },
                    { title: 'Weekly Summary', desc: 'Consolidated weekly report delivered every Monday', icon: 'fas fa-calendar-week' }
                  ].map(option => {
                    const isSelected = notifConfig.digestFrequency === option.title;
                    return (
                      <div
                        key={option.title}
                        onClick={() => updateConfig('digestFrequency', option.title)}
                        className={`bg-dark-3 border p-4.5 flex items-center gap-4 cursor-pointer transition-all ${
                          isSelected ? 'border-gold/45 bg-gold/5' : 'border-border-gold-soft hover:border-gold/30'
                        }`}
                      >
                        <div className="relative w-4.5 h-4.5 border-2 border-border-gold-soft rounded-full flex-shrink-0 flex items-center justify-center">
                          {isSelected && <div className="w-2 h-2 bg-gold rounded-full" />}
                        </div>
                        <div className="w-10 h-10 border border-border-gold-soft flex items-center justify-center text-[1rem] text-gold shrink-0 bg-dark-4">
                          <i className={option.icon} />
                        </div>
                        <div>
                          <div className="text-[13.5px] text-white font-medium">{option.title}</div>
                          <div className="text-[12px] text-text-muted mt-0.5">{option.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Daily Digest Delivery Time</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={notifConfig.digestTime}
                    onChange={(e) => updateConfig('digestTime', e.target.value)}
                  />
                  <span className="text-[11px] text-text-muted">Time is based on Africa/Addis_Ababa (EAT, UTC+3)</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Weekly Digest Day</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={notifConfig.digestDay}
                    onChange={(e) => updateConfig('digestDay', e.target.value)}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Digest Format</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={notifConfig.digestFormat}
                    onChange={(e) => updateConfig('digestFormat', e.target.value)}
                  >
                    <option value="HTML Email with Summary Table">HTML Email with Summary Table</option>
                    <option value="Plain Text">Plain Text</option>
                    <option value="PDF Attachment">PDF Attachment</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Include in Digest</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                    value={notifConfig.digestModules}
                    onChange={(e) => updateConfig('digestModules', e.target.value)}
                  >
                    <option value="All Modules">All Modules</option>
                    <option value="Bookings Only">Bookings Only</option>
                    <option value="Revenue + Bookings">Revenue + Bookings</option>
                    <option value="Custom Selection">Custom Selection</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveConfig('Digest Schedule')}>
                  <i className="fas fa-save mr-2" />Save Schedule
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Quiet Hours Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="quiet">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Quiet Hours</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Suppress non-urgent notifications during set hours
                </div>
              </div>
              <i className="fas fa-moon text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                <div className="flex-1 pr-5">
                  <div className="text-[13.5px] text-white font-medium">Enable Quiet Hours</div>
                  <div className="text-[12px] text-text-muted mt-0.75">Delay non-critical notifications during the quiet window and send them the next morning</div>
                </div>
                <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifConfig.quietEnabled}
                    onChange={(e) => updateConfig('quietEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mt-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Quiet From</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={notifConfig.quietFrom}
                    onChange={(e) => updateConfig('quietFrom', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Quiet Until</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={notifConfig.quietTo}
                    onChange={(e) => updateConfig('quietTo', e.target.value)}
                  />
                </div>
              </div>

              {/* Quiet hours 24h timeline visual */}
              <div className="bg-dark-3 border border-border-gold-soft p-5 rounded-sm">
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mb-1">24-Hour Delivery Window</div>
                {renderQuietHoursBar()}
                <div className="flex justify-between font-mono text-[9px] text-text-muted tracking-[0.05em] px-0.5">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:00</span>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <div className="w-2.5 h-2.5 bg-gold/35 rounded-sm" /> Delivery allowed
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <div className="w-2.5 h-2.5 bg-gold/5 border border-gold/15 rounded-sm" /> Quiet — held until morning
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 mt-4">
                <div className="flex-1 pr-5">
                  <div className="text-[13.5px] text-white font-medium">Allow Urgent Notifications During Quiet Hours</div>
                  <div className="text-[12px] text-text-muted mt-0.75">New bookings, payment failures and cancellations always send immediately regardless of quiet hours</div>
                </div>
                <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifConfig.quietAllowUrgent}
                    onChange={(e) => updateConfig('quietAllowUrgent', e.target.checked)}
                    className="sr-only peer"
                  />
                  <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                </label>
              </div>
              <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                <div className="flex-1 pr-5">
                  <div className="text-[13.5px] text-white font-medium">Batch &amp; Send at Quiet-End</div>
                  <div className="text-[12px] text-text-muted mt-0.75">Collect held notifications and deliver them as a single summary at the end of quiet hours</div>
                </div>
                <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifConfig.quietBatchEnd}
                    onChange={(e) => updateConfig('quietBatchEnd', e.target.checked)}
                    className="sr-only peer"
                  />
                  <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveConfig('Quiet Hours')}>
                  <i className="fas fa-save mr-2" />Save Quiet Hours
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Recipients Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="recipients">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Notification Recipients</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Manage who receives admin and staff alerts
                </div>
              </div>
              <i className="fas fa-user-friends text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              {/* Admin Email Addresses Tags */}
              <div className="flex items-center gap-2 mb-3">
                <div className="font-mono text-[9px] text-text-muted tracking-[0.18em] uppercase">Admin Alert Emails</div>
                <div className="flex-1 h-[1px] bg-border-gold-soft" />
              </div>
              <div className="flex flex-col gap-1.5 mb-[18px]">
                <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Admin Email Addresses <span>*</span></label>
                <div
                  className="bg-dark-3 border border-border-gold-soft p-2 px-3 flex flex-wrap gap-1.75 items-center min-h-[44px] cursor-text focus-within:border-gold/50"
                  onClick={() => document.getElementById('adminEmailInputId').focus()}
                >
                  {notifConfig.adminEmails.map(email => (
                    <span key={email} className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/25 py-1 px-2.5 text-[12px] text-gold font-medium">
                      {email}
                      <span className="cursor-pointer text-text-muted hover:text-gold text-[10px]" onClick={(e) => { e.stopPropagation(); removeEmailTag(email); }}>✕</span>
                    </span>
                  ))}
                  <input
                    id="adminEmailInputId"
                    className="bg-transparent border-none outline-none text-white text-[13.5px] flex-1 min-w-[120px]"
                    type="email"
                    value={newEmailTag}
                    onChange={(e) => setNewEmailTag(e.target.value)}
                    onKeyDown={addEmailTag}
                    placeholder={notifConfig.adminEmails.length === 0 ? "Add email address..." : ""}
                  />
                </div>
                <span className="text-[12px] text-text-muted">Press Enter to add. These addresses receive all admin-level alerts.</span>
              </div>

              {/* Staff Phone Numbers Tags */}
              <div className="flex items-center gap-2 mb-3">
                <div className="font-mono text-[9px] text-text-muted tracking-[0.18em] uppercase">Staff Alert Phones (SMS)</div>
                <div className="flex-1 h-[1px] bg-border-gold-soft" />
              </div>
              <div className="flex flex-col gap-1.5 mb-[18px]">
                <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Staff Phone Numbers</label>
                <div
                  className="bg-dark-3 border border-border-gold-soft p-2 px-3 flex flex-wrap gap-1.75 items-center min-h-[44px] cursor-text focus-within:border-gold/50"
                  onClick={() => document.getElementById('staffPhoneInputId').focus()}
                >
                  {notifConfig.staffPhones.map(phone => (
                    <span key={phone} className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/25 py-1 px-2.5 text-[12px] text-gold font-medium">
                      {phone}
                      <span className="cursor-pointer text-text-muted hover:text-gold text-[10px]" onClick={(e) => { e.stopPropagation(); removePhoneTag(phone); }}>✕</span>
                    </span>
                  ))}
                  <input
                    id="staffPhoneInputId"
                    className="bg-transparent border-none outline-none text-white text-[13.5px] flex-1 min-w-[120px]"
                    type="tel"
                    value={newPhoneTag}
                    onChange={(e) => setNewPhoneTag(e.target.value)}
                    onKeyDown={addPhoneTag}
                    placeholder={notifConfig.staffPhones.length === 0 ? "Add phone number..." : ""}
                  />
                </div>
                <span className="text-[12px] text-text-muted">Press Enter to add. Staff phones receive SMS alerts for new bookings and check-ins.</span>
              </div>

              {/* Department Routing */}
              <div className="flex items-center gap-2 mb-3">
                <div className="font-mono text-[9px] text-text-muted tracking-[0.18em] uppercase">Department Routing</div>
                <div className="flex-1 h-[1px] bg-border-gold-soft" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Route Restaurant Notifications to Kitchen</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Send restaurant reservation alerts to kitchen staff separately</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifConfig.routeRestaurantKitchen}
                      onChange={(e) => updateConfig('routeRestaurantKitchen', e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Route Housekeeping Alerts to Housekeeping Team</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Checkout notifications trigger housekeeping SMS alerts automatically</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifConfig.routeHousekeepingSMS}
                      onChange={(e) => updateConfig('routeHousekeepingSMS', e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">CC Finance on Payment Notifications</div>
                    <div className="text-[12px] text-text-muted mt-0.75">All payment receipts and failures are copied to the finance team inbox</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifConfig.ccFinancePayment}
                      onChange={(e) => updateConfig('ccFinancePayment', e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft mt-4">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => saveConfig('Notification Recipients')}>
                  <i className="fas fa-save mr-2" />Save Recipients
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Test Notification Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="test">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Send Test Notification</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Verify your channel configuration is working
                </div>
              </div>
              <i className="fas fa-paper-plane text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="bg-gold/[0.03] border border-gold/12 p-5">
                <div className="font-mono text-[9.5px] text-gold tracking-[0.16em] uppercase mb-3.5 flex items-center gap-2 font-semibold">
                  <i className="fas fa-flask text-[11px]" /> Test Configuration
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Channel</label>
                    <select
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                      value={testChannel}
                      onChange={(e) => setTestChannel(e.target.value)}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Template</label>
                    <select
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer"
                      value={testTemplate}
                      onChange={(e) => setTestTemplate(e.target.value)}
                    >
                      <option value="Booking Confirmation">Booking Confirmation</option>
                      <option value="Booking Cancellation">Booking Cancellation</option>
                      <option value="Check-in Reminder">Check-in Reminder</option>
                      <option value="Payment Receipt">Payment Receipt</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Send To (Override)</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      placeholder="test@example.com or +251…"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Guest Name (Preview)</label>
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                      type="text"
                      value={testGuestName}
                      onChange={(e) => setTestGuestName(e.target.value)}
                      placeholder="Test guest name"
                    />
                  </div>
                </div>
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={handleSendTestNotification}>
                  <i className="fas fa-paper-plane mr-2" />Send Test Now
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Log Panel */}
          <div className="bg-dark-2 border border-border-gold-soft" id="log">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Delivery Log</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Recent notification delivery history
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <select
                  className="bg-dark-3 border border-border-gold-soft text-white text-[0.78rem] py-1.5 px-3 outline-none focus:border-gold/50 cursor-pointer"
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                >
                  <option value="All Channels">All Channels</option>
                  <option value="Email Only">Email Only</option>
                  <option value="SMS Only">SMS Only</option>
                  <option value="Failed Only">Failed Only</option>
                </select>
                <button
                  className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-3.5 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10 whitespace-nowrap"
                  onClick={() => showToast('Exporting logs...')}
                >
                  <i className="fas fa-download mr-1.5" />Export
                </button>
              </div>
            </div>
            <div className="p-6 pb-2">
              <div className="space-y-0.5">
                {filteredLogs.slice(0, visibleLogsCount).map((l, index) => (
                  <div key={index} className="flex items-start gap-3.5 py-3 border-b border-border-gold-soft/30 last:border-b-0">
                    <div className={`w-[30px] h-[30px] flex items-center justify-center text-[0.78rem] flex-shrink-0 mt-0.5 border rounded-sm ${
                      l.status === 'delivered' ? 'bg-[#2f9e44]/10 border-[#2f9e44]/20 text-[#40c057]' :
                      l.status === 'failed' ? 'bg-danger/10 border-danger/20 text-danger' :
                      'bg-gold/10 border-gold/20 text-gold'
                    }`}>
                      <i className={l.icon} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13.5px] text-white font-medium flex items-center">
                        {l.event}
                        <span className={`font-mono text-[9px] px-2 py-0.5 border rounded-sm ml-2 ${
                          l.channel === 'email' ? 'text-[#74c0fc] border-[#74c0fc]/20' :
                          l.channel === 'sms' ? 'text-[#95d863] border-[#95d863]/20' :
                          'text-gold border-gold/20'
                        }`}>
                          {l.channel.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[12px] text-text-muted mt-0.5">{l.meta}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-text-muted whitespace-nowrap">{l.time}</div>
                      <div className="mt-1">
                        <span className={`font-mono text-[9px] px-2 py-0.5 font-bold ${
                          l.status === 'delivered' ? 'text-[#40c057] bg-[#2f9e44]/10' :
                          l.status === 'failed' ? 'text-danger bg-danger/10' :
                          'text-gold bg-gold/10'
                        }`}>
                          {l.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredLogs.length > visibleLogsCount && (
                <div className="py-3.5 text-center border-t border-border-gold-soft/30 mt-2">
                  <button
                    className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-5 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white"
                    onClick={() => setVisibleLogsCount(prev => prev + 5)}
                  >
                    Load More
                  </button>
                </div>
              )}
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

export default NotificationSettings;
