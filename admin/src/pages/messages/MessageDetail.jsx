import React, { useState } from 'react';

const DEFAULT_MESSAGE = {
  id: 1,
  sender: 'Yohannes Tadesse',
  email: 'yohannes.t@gmail.com',
  avatar: 'YT',
  color: '#2D4A6B',
  subject: 'Booking Inquiry — Suite 201 for New Year',
  preview: 'Good afternoon, I would like to inquire about availability of the Nile Suite for...',
  text: [
    'Good afternoon,',
    'I would like to inquire about the availability of the Nile Suite (Room 201) for the New Year period — specifically from December 30, 2024 to January 3, 2025. We are a party of two adults and one child (age 6).',
    'Could you please confirm the rate per night and whether breakfast is included? Also, are there any special packages available for the New Year\'s Eve gala?',
    'I look forward to your response.'
  ],
  tags: ['booking', 'enquiry'],
  time: '10:24 AM',
  date: 'Today, Dec 21, 2024',
  unread: true,
  urgent: false,
  folder: 'inbox',
  guest: {
    Phone: '+251 922 345 678',
    Guests: '2 adults, 1 child',
    Room: 'Suite 201 (Nile)',
    Period: 'Dec 30 – Jan 3',
    Company: 'Individual Guest',
    Stays: '3 stays',
    Status: 'Regular'
  },
  attachments: [],
  priority: 'Medium',
  assignedTo: 'Admin User',
  department: 'Front Desk',
  status: 'Open',
  thread: [
    { sender: 'Yohannes Tadesse', time: 'Today, 10:24 AM', text: 'Good afternoon, I would like to inquire about the availability of the Nile Suite (Room 201)...', isAdmin: false }
  ],
  timeline: [
    { action: 'Message received from Yohannes Tadesse', time: 'Today, 10:24 AM', type: 'info' }
  ]
};

const QUICK_TEMPLATES = {
  apology: 'Dear Guest,\n\nWe sincerely apologize for this inconvenience. We have escalated this to our team and will resolve it immediately.\n\nBest regards,\nTsedeke Grand Hotel Management',
  escalate: 'Hi Team,\n\nPlease see the complaint from the guest below. Dispatch a technician / coordinator to inspect this immediately and report back.\n\nThanks,\nAdmin Desk',
  roomchange: 'Dear Guest,\n\nWe have arranged a complimentary upgrade/change of room for you. Please coordinate with the Front Desk at your convenience to pick up your new keycards.\n\nBest regards,\nTsedeke Grand Hotel Management',
  compensation: 'Dear Guest,\n\nAs a token of our apologies for the disruption, we have waived the nightly charges for last night and credited a complimentary breakfast to your account.\n\nSincerely,\nTsedeke Grand Hotel Management',
  followup: 'Dear Guest,\n\nFollowing up on our earlier resolution, could you please confirm if everything is working fine now?\n\nBest regards,\nTsedeke Grand Hotel Management'
};

const MessageDetail = ({ message = DEFAULT_MESSAGE, onBack, onUpdateStatus, onReply }) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [replyText, setReplyText] = useState('');

  const handleApplyTemplate = (type) => {
    setReplyText(QUICK_TEMPLATES[type] || '');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    const newReply = {
      sender: 'Admin User',
      time: 'Just now',
      text: replyText,
      isAdmin: true
    };
    
    const updatedThread = [...currentMessage.thread, newReply];
    const updatedMsg = { ...currentMessage, thread: updatedThread, status: 'Resolved' };
    
    setCurrentMessage(updatedMsg);
    onReply?.(currentMessage.id, replyText);
    setReplyText('');
  };

  return (
    <div className="flex flex-col h-full bg-dark-1 font-montserrat text-white">
      <div className="p-4 border-b border-border-gold flex items-center justify-between bg-dark-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="text-text-muted hover:text-gold cursor-pointer transition-colors text-sm bg-transparent border-none outline-none"
            >
              <i className="fas fa-arrow-left mr-1" /> Back
            </button>
          )}
          <h3 className="font-cinzel text-xs text-white font-semibold tracking-[1px] uppercase">Message Details</h3>
        </div>
        <div className="flex gap-2">
          <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full uppercase border ${
            currentMessage.priority === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 
            currentMessage.priority === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' : 
            'bg-gold-glow text-gold border-gold/20'
          }`}>
            {currentMessage.priority} Priority
          </span>
          <span className="bg-dark-3 border border-border-gold-soft text-text-muted text-[10px] p-1 px-2 rounded-full">
            {currentMessage.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
        <div className="lg:col-span-2 p-5 border-r border-border-gold-soft flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="font-cinzel text-lg text-white font-semibold mb-2">{currentMessage.subject}</h2>
              <div className="flex gap-1.5 flex-wrap">
                {currentMessage.tags.map(t => (
                  <span key={t} className="text-[9px] font-bold py-0.5 px-2 bg-dark-4 border border-border-gold-soft text-text-muted uppercase">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {currentMessage.thread.map((t, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 border rounded-lg max-w-[85%] ${
                    t.isAdmin 
                      ? 'bg-gold-glow border-border-gold ml-auto' 
                      : 'bg-dark-3 border-border-gold-soft mr-auto'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2.5 text-[10px]">
                    <span className={`font-semibold ${t.isAdmin ? 'text-gold' : 'text-white'}`}>{t.sender}</span>
                    <span className="text-text-muted">{t.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-white-dim whitespace-pre-wrap">{t.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-3 border border-border-gold-soft p-4 rounded-lg space-y-4">
            <div className="flex flex-wrap gap-1.5 text-[9px] items-center">
              <span className="text-text-muted uppercase font-bold mr-1">QUICK TEMPLATES:</span>
              <button type="button" onClick={() => handleApplyTemplate('apology')} className="bg-dark-4 hover:border-gold border border-border-gold-soft text-text-muted p-1 px-2 rounded cursor-pointer">Apology</button>
              <button type="button" onClick={() => handleApplyTemplate('escalate')} className="bg-dark-4 hover:border-gold border border-border-gold-soft text-text-muted p-1 px-2 rounded cursor-pointer">Escalate</button>
              <button type="button" onClick={() => handleApplyTemplate('roomchange')} className="bg-dark-4 hover:border-gold border border-border-gold-soft text-text-muted p-1 px-2 rounded cursor-pointer">Room Change</button>
              <button type="button" onClick={() => handleApplyTemplate('compensation')} className="bg-dark-4 hover:border-gold border border-border-gold-soft text-text-muted p-1 px-2 rounded cursor-pointer">Compensation</button>
            </div>
            
            <form onSubmit={handleSendReply} className="space-y-3">
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here..."
                className="w-full bg-dark-4 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-24"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-gold btn-sm rounded font-semibold"
                >
                  <i className="fas fa-paper-plane" /> Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="p-5 bg-dark-2/50 space-y-6">
          <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2 mb-4">
            Guest Details
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-md`} style={{ backgroundColor: currentMessage.color }}>
                {currentMessage.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{currentMessage.sender}</span>
                <span className="text-[10px] text-text-muted">{currentMessage.email}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {Object.entries(currentMessage.guest).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-xs py-1.5 border-b border-border-gold-soft/50 last:border-none">
                  <span className="text-text-muted">{key}</span>
                  <span className="text-white font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {currentMessage.attachments.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-gold-soft">
              <div className="font-cinzel text-[10px] text-text-muted tracking-[1px] uppercase font-bold">
                Attachments ({currentMessage.attachments.length})
              </div>
              <div className="space-y-2">
                {currentMessage.attachments.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-dark-3 border border-border-gold-soft rounded text-xs">
                    <span className="flex items-center gap-2">
                      <i className={`fas ${file.icon} text-gold`} />
                      <span className="truncate max-w-[130px]">{file.name}</span>
                    </span>
                    <span className="text-[9px] text-text-muted">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
