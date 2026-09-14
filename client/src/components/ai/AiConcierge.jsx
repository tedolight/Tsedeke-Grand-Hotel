import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api/api.js';

// shadcn/ui Components
import { Button } from '../ui/shadcn/button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/shadcn/card.jsx';
import { Badge } from '../ui/shadcn/badge.jsx';
import { Input } from '../ui/shadcn/input.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/shadcn/tabs.jsx';
import { Avatar, AvatarFallback } from '../ui/shadcn/avatar.jsx';
import { Separator } from '../ui/shadcn/separator.jsx';

// Lucide Icons
import {
  Sparkles,
  Hotel,
  Send,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  BedDouble,
  Search,
  MessageSquare,
  Compass,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

export default function AiConcierge() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Widget Open / Expand State
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'rooms' | 'lookup'
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Search & Booking Parameters
  const getTomorrowStr = (addDays = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + addDays);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTomorrowStr(1));
  const [checkOut, setCheckOut] = useState(getTomorrowStr(3));
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Chat conversation state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const isAmharic = i18n.language === 'am';

  const defaultGreeting = isAmharic
    ? 'ጤና ይስጥልኝ! እንኳን ወደ **ሸምበለላ ሆቴል** በደህና መጡ። 😊\n\nዛሬ ክፍል ለማስያዝ ወይም የዋጋ መረጃ ለማግኘት እንዴት ልርዳዎት? የሚፈልጉት የተለየ የክፍል ዓይነት ወይም ቀን አለ?'
    : 'Hello! Warm greetings from **Tsedeke Grand Hotel** in Hossana. 😊\n\nHow may I assist you with your room booking today? Are you looking for a specific suite, planning dates, or checking an existing reservation?';

  const initialQuickChips = isAmharic
    ? [
        { label: '🛏️ ክፍት ክፍሎች', prompt: 'አሁን የሚገኙ ክፍሎች እና ዋጋቸው ስንት ነው?' },
        { label: '👑 የVIP ክፍሎች', prompt: 'የፕሬዝዳንት VIP ክፍሎች ዋጋና ዝርዝር አሳየኝ' },
        { label: '👨‍👩‍👧 የቤተሰብ ክፍል', prompt: 'ለቤተሰብ የሚሆን ባለ 2 ድርብ አልጋ ክፍል አለ?' },
        { label: '🔍 የያዝኩት ክፍል', prompt: 'የያዝኩትን ክፍል የማስያዣ ሁኔታ ለማረጋገጥ እፈልጋለሁ' },
      ]
    : [
        { label: '🛏️ Available Rooms', prompt: 'What rooms are available and what are the rates?' },
        { label: '👑 VIP & Deluxe Suites', prompt: 'Show me the Presidential VIP and Deluxe suites' },
        { label: '👨‍👩‍👧 Family Suites', prompt: 'Do you have Family Double Bed suites for 4 guests?' },
        { label: '🔍 Check My Booking', prompt: 'I want to check my reservation status' },
      ];

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: defaultGreeting,
      actionCards: null,
      quickChips: initialQuickChips,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, activeTab]);

  // Voice Speech Synthesis
  const speakText = (text) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•\-_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isAmharic ? 'am-ET' : 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Send Message handler
  const handleSendMessage = async (textToSend) => {
    const userText = textToSend || input;
    if (!userText.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: userText, actionCards: null, timestamp: timeStr };
    const nextHistory = [...messages, userMsg];

    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/guest/chat', {
        messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      const replyContent =
        response?.data?.reply || response?.reply || 'I processed your request. How else can I assist?';
      const actionCards = response?.data?.actionCards || response?.actionCards || null;
      const quickChips = response?.data?.quickChips || response?.quickChips || null;

      const assistantMsg = {
        role: 'assistant',
        content: replyContent,
        actionCards: actionCards,
        quickChips: quickChips,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...nextHistory, assistantMsg]);
      speakText(replyContent);
    } catch (err) {
      console.error('AI Booking Assistant Error:', err);
      const errMsg = isAmharic
        ? 'ይቅርታ፣ ከአገልጋዩ ጋር መገናኘት አልተቻለም። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።'
        : 'I apologize, but I am temporarily unable to connect to the booking database. Please try again.';
      setMessages([...nextHistory, { role: 'assistant', content: errMsg, actionCards: null, timestamp: timeStr }]);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Direct Reservation Navigation
  const handleBookRoom = (room) => {
    setIsOpen(false);
    navigate(
      `/booking?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestsCount}&type=${room.type}`
    );
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: defaultGreeting,
        actionCards: null,
        quickChips: initialQuickChips,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Clean, modern markdown rendering
  const renderFormattedMessage = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-[#F8FAFC] text-[13px]">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return (
              <h4
                key={idx}
                className="font-cormorant text-amber-300 font-bold text-base mt-2 mb-1 border-b border-amber-500/20 pb-1 flex items-center gap-1.5"
              >
                <Hotel className="w-4 h-4 text-amber-400" />
                <span>{trimmed.replace('### ', '')}</span>
              </h4>
            );
          }

          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ');
          const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed;
          const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);

          return (
            <div key={idx} className={isBullet ? 'flex items-start gap-2 pl-1 my-0.5' : 'my-0.5'}>
              {isBullet && <span className="text-amber-400 font-bold text-xs mt-0.5">•</span>}
              <p className="flex-1">
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={pIdx} className="text-amber-200 font-semibold tracking-wide">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (part.startsWith('*') && part.endsWith('*')) {
                    return (
                      <em key={pIdx} className="text-neutral-300 italic">
                        {part.slice(1, -1)}
                      </em>
                    );
                  }
                  return part;
                })}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Sample static room cards for the quick interactive tab
  const sampleSuites = [
    {
      id: 'room_vip_01',
      name: 'Presidential VIP Suite',
      type: 'vip',
      nightlyRateETB: 4500,
      capacity: 2,
      bed: 'King Bed',
      size: '85 sqm',
      view: 'Panoramic City & Mountain View',
      badge: 'Presidential Luxury',
      amenities: ['Jacuzzi Spa', 'VIP Lounge', 'High-Speed WiFi', 'Breakfast Included'],
    },
    {
      id: 'room_deluxe_02',
      name: 'Executive Deluxe Suite',
      type: 'deluxe',
      nightlyRateETB: 2800,
      capacity: 2,
      bed: 'King Bed',
      size: '55 sqm',
      view: 'Scenic Skyline',
      badge: 'Most Popular',
      amenities: ['Private Balcony', '4K Smart TV', 'Optical WiFi', 'Room Service'],
    },
    {
      id: 'room_family_03',
      name: 'Family Double Bed Suite',
      type: 'family double bed',
      nightlyRateETB: 3200,
      capacity: 4,
      bed: '2 Queen Beds',
      size: '65 sqm',
      view: 'Garden Courtyard',
      badge: 'Family Choice',
      amenities: ['2 Queen Beds', 'Connecting Lounge', 'Kids Friendly', 'Breakfast Included'],
    },
    {
      id: 'room_standard_04',
      name: 'Standard Luxury Room',
      type: 'standard',
      nightlyRateETB: 1800,
      capacity: 2,
      bed: 'Queen Bed',
      size: '40 sqm',
      view: 'City View',
      badge: 'Best Value',
      amenities: ['Work Desk', 'Optical WiFi', 'Smart TV', 'Ensuite Bathroom'],
    },
  ];

  const filteredSuites = useMemo(() => {
    if (selectedFilter === 'all') return sampleSuites;
    return sampleSuites.filter((s) => s.type.includes(selectedFilter));
  }, [selectedFilter]);

  // Night calculation
  const totalNights = useMemo(() => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    return isNaN(diff) ? 2 : diff;
  }, [checkIn, checkOut]);

  return (
    <div className="fixed bottom-6 right-6 z-[10005] font-montserrat select-text">
      {/* Floating Sparkle Trigger Button with shadcn Button */}
      {!isOpen && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3.5 px-5 py-6 rounded-full bg-gradient-to-r from-[#0C1017] via-[#141B26] to-[#0C1017] text-amber-400 border border-[#C9A84C]/50 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(201,168,76,0.3)] hover:shadow-[0_15px_50px_rgba(201,168,76,0.5)] hover:border-amber-300 hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Open Tsedeke Grand AI Room Booking Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 shadow-[0_0_10px_#F59E0B]"></span>
          </span>
          <Avatar className="w-7 h-7 border border-amber-500/40">
            <AvatarFallback className="bg-amber-500/20 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="font-bold text-xs tracking-wider uppercase text-amber-200 flex items-center gap-1">
              {isAmharic ? 'የክፍል ማስያዣ AI' : 'AI Room Booking'}
            </span>
            <span className="text-[10px] text-emerald-400 font-sans font-medium">
              ● {isAmharic ? 'ቀጥታ ማስያዣ' : 'Instant Reservation'}
            </span>
          </div>
        </Button>
      )}

      {/* Main Luxury Booking Window */}
      {isOpen && (
        <Card
          className={`h-[650px] max-h-[90vh] bg-[#0A0E17]/98 backdrop-blur-2xl rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(201,168,76,0.22)] border border-[#C9A84C]/45 flex flex-col overflow-hidden animate-fade-in transition-all duration-300 p-0 ${
            isExpanded ? 'w-[520px] sm:w-[580px]' : 'w-[380px] sm:w-[440px]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0F1420] via-[#161E2E] to-[#0F1420] border-b border-[#C9A84C]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-amber-500/50 shadow-lg">
                <AvatarFallback className="bg-gradient-to-tr from-amber-600 to-amber-400 text-neutral-950">
                  <Hotel className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-cormorant text-xl font-bold text-amber-200 tracking-wide leading-tight flex items-center gap-2">
                  Tsedeke Grand Booking AI
                  <Badge variant="luxury" className="text-[9px] px-1.5 py-0 h-4">
                    24/7
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-sans font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]"></span>
                  {isAmharic ? 'የክፍል ማስያዣና ማረጋገጫ' : 'Room Reservation Specialist'}
                </CardDescription>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Speech' : 'Enable Voice Assistant'}
                className={soundEnabled ? 'text-amber-300 bg-amber-500/20' : 'text-neutral-400'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Compact View' : 'Expand View'}
                className="hidden sm:flex text-neutral-400 hover:text-amber-300"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                title="Reset Conversation"
                className="text-neutral-400 hover:text-amber-300"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Mode Tabs with shadcn Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-[#0D121C] border-b border-[#20293A]">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="chat" className="gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'ውይይት' : 'AI Chat'}</span>
                </TabsTrigger>
                <TabsTrigger value="rooms" className="gap-1.5">
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'ክፍሎች' : 'Rooms & Rates'}</span>
                </TabsTrigger>
                <TabsTrigger value="lookup" className="gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'ማረጋገጫ' : 'Lookup'}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: AI CHAT CONVERSATION */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans scroll-smooth">
                {messages.map((m, index) => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={index} className="space-y-2.5">
                      <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && (
                          <Avatar className="w-7 h-7 border border-amber-500/40 shrink-0 mt-0.5">
                            <AvatarFallback className="bg-[#0A0E17] text-amber-300 text-[10px]">
                              <Hotel className="w-3.5 h-3.5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl leading-relaxed shadow-md ${
                            isUser
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-none font-medium'
                              : 'bg-[#131A26] border border-[#242F42] text-[#F8FAFC] rounded-tl-none'
                          }`}
                        >
                          {renderFormattedMessage(m.content)}

                          {/* Quick Interactive Chips */}
                          {m.quickChips && m.quickChips.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#243044]">
                              {m.quickChips.map((chip, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => handleSendMessage(chip.prompt)}
                                  disabled={loading}
                                  className="px-2.5 py-1 rounded-full bg-[#182130] hover:bg-amber-500/20 text-neutral-300 hover:text-amber-200 border border-[#2B384E] hover:border-amber-500/40 text-[11px] font-medium transition cursor-pointer active:scale-95 shadow-sm"
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="text-[9px] text-neutral-400 text-right mt-1 opacity-60 font-sans">
                            {m.timestamp}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Room Action Cards with shadcn Card */}
                      {m.actionCards && m.actionCards.type === 'rooms' && (
                        <div className="pl-9 pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                          {m.actionCards.items.map((room, rIdx) => (
                            <Card
                              key={rIdx}
                              className="border-[#C9A84C]/35 bg-[#111722] p-3 flex flex-col justify-between hover:border-amber-400 transition-all shadow-md group"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <Badge variant="luxury" className="text-[9px]">
                                    {room.type}
                                  </Badge>
                                  <span className="text-[11px] font-bold text-amber-300">
                                    {room.nightlyRateETB?.toLocaleString()} ETB
                                  </span>
                                </div>
                                <h5 className="font-semibold text-white text-xs truncate">{room.name}</h5>
                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                  🛏️ {room.bed} • 👥 {room.capacity} Guests
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2.5">
                                <Button
                                  type="button"
                                  variant="luxury"
                                  size="sm"
                                  onClick={() => handleBookRoom(room)}
                                  className="flex-1 text-[11px] h-7 gap-1"
                                >
                                  <span>{isAmharic ? 'አሁን ያዝ' : 'Book Room'}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/rooms/${room.id}`);
                                  }}
                                  className="h-7 text-[11px] text-neutral-300"
                                >
                                  {isAmharic ? 'ዝርዝር' : 'Details'}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Booking Receipt Verification Card */}
                      {m.actionCards && m.actionCards.type === 'booking' && (
                        <div className="pl-9 pr-1 mt-1">
                          <Card className="border-amber-500/40 bg-[#111722] p-3.5 shadow-lg">
                            <div className="flex justify-between items-center border-b border-neutral-700/60 pb-2 mb-2">
                              <span className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                Tsedeke Grand Reservation Receipt
                              </span>
                              <Badge variant="success" className="text-[9px]">
                                {m.actionCards.data.status}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-neutral-300 space-y-1">
                              <p>
                                <strong className="text-neutral-400">Guest:</strong>{' '}
                                {m.actionCards.data.guestName}
                              </p>
                              <p>
                                <strong className="text-neutral-400">Room:</strong>{' '}
                                {m.actionCards.data.roomName} (#{m.actionCards.data.roomNumber})
                              </p>
                              <p>
                                <strong className="text-neutral-400">Dates:</strong>{' '}
                                {m.actionCards.data.checkIn} → {m.actionCards.data.checkOut}
                              </p>
                              <p>
                                <strong className="text-neutral-400">Total:</strong>{' '}
                                <span className="text-amber-300 font-bold">
                                  {m.actionCards.data.totalPriceETB?.toLocaleString()} ETB
                                </span>
                              </p>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-2.5 justify-start items-center">
                    <Avatar className="w-7 h-7 border border-amber-500/40">
                      <AvatarFallback className="bg-[#0A0E17] text-amber-300 text-[10px]">
                        <Hotel className="w-3.5 h-3.5 animate-pulse" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="px-4 py-2.5 rounded-2xl bg-[#131A26] border border-[#242F42] text-amber-300 text-xs flex items-center gap-2 shadow-sm">
                      <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                      <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-neutral-400 font-sans ml-1">
                        {isAmharic ? 'የክፍል መረጃ እያጣራ ነው...' : 'Searching available rooms...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Form with shadcn Input & Button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[#0D121C] border-t border-[#1F283A] flex items-center gap-2.5"
              >
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isAmharic ? 'የሚፈልጉትን ክፍል ዓይነት ወይም ቀን ይጻፉ...' : 'Ask about room rates, dates, or booking...'
                  }
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="luxury"
                  disabled={loading || !input.trim()}
                  className="h-10 px-4 gap-1.5"
                >
                  <span>{isAmharic ? 'ላክ' : 'Book'}</span>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </TabsContent>

            {/* TAB 2: INTERACTIVE ROOM EXPLORER & PRICE CALCULATOR */}
            <TabsContent value="rooms" className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans scroll-smooth m-0">
              {/* Date & Guests Selector Bar */}
              <Card className="p-3.5 space-y-3 bg-[#121824] border-[#273244]">
                <div className="text-amber-300 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Reservation Parameters
                  </span>
                  <Badge variant="gold">{totalNights} Nights</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Check-in</label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="h-8 text-xs bg-[#18202F] border-[#2D384D]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Check-out</label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="h-8 text-xs bg-[#18202F] border-[#2D384D]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#232D3F]">
                  <span className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Guests
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-6 h-6 rounded-md"
                    >
                      -
                    </Button>
                    <span className="text-xs font-bold text-white px-1">{guestsCount}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setGuestsCount(Math.min(6, guestsCount + 1))}
                      className="w-6 h-6 rounded-md"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Room Category Filters */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {['all', 'vip', 'deluxe', 'family', 'standard'].map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={selectedFilter === cat ? 'luxury' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(cat)}
                    className="capitalize text-[11px]"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Room Cards List */}
              <div className="space-y-3">
                {filteredSuites.map((room) => {
                  const estTotal = room.nightlyRateETB * totalNights;
                  const vat = Math.round(estTotal * 0.15);
                  const grandTotal = estTotal + vat;

                  return (
                    <Card
                      key={room.id}
                      className="p-3.5 space-y-2.5 bg-[#111722] border-[#C9A84C]/35 hover:border-amber-400 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="mb-1">
                            <Badge variant="luxury">{room.badge}</Badge>
                          </div>
                          <CardTitle className="text-sm font-bold">{room.name}</CardTitle>
                          <CardDescription className="text-[11px] text-neutral-400">
                            🛏️ {room.bed} • 👥 {room.capacity} Guests • 📐 {room.size}
                          </CardDescription>
                        </div>

                        <div className="text-right">
                          <div className="text-amber-300 font-bold text-sm">
                            {room.nightlyRateETB.toLocaleString()} ETB
                          </div>
                          <div className="text-[10px] text-neutral-400">/ night</div>
                        </div>
                      </div>

                      {/* Total Calculation breakdown */}
                      <div className="bg-[#161E2E] rounded-xl p-2.5 text-[11px] text-neutral-300 flex justify-between items-center border border-[#243044]">
                        <span className="text-neutral-400">{totalNights} Nights + 15% VAT:</span>
                        <span className="font-bold text-amber-200">{grandTotal.toLocaleString()} ETB Total</span>
                      </div>

                      <Button
                        type="button"
                        variant="luxury"
                        onClick={() => handleBookRoom(room)}
                        className="w-full text-xs h-9"
                      >
                        <span>Reserve This Suite</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 3: RESERVATION LOOKUP */}
            <TabsContent value="lookup" className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans m-0">
              <Card className="p-4 space-y-3 bg-[#121824] border-[#273244]">
                <CardTitle className="text-amber-300 font-bold text-sm flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Instant Reservation Lookup</span>
                </CardTitle>
                <CardDescription className="text-neutral-300 text-[11px] leading-relaxed">
                  Enter your reservation phone number (e.g. `0911234567`) or Booking ID to view confirmation details and
                  check-in times.
                </CardDescription>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter phone or booking ID..."
                    className="flex-1 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActiveTab('chat');
                        handleSendMessage(`Check booking for ${e.target.value}`);
                      }
                    }}
                  />
                </div>
              </Card>

              <Card className="p-4 text-[11px] text-neutral-300 space-y-2 bg-[#121824] border-[#273244]">
                <div className="text-amber-300 font-semibold text-xs flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  Front Desk Assistance
                </div>
                <Separator className="my-1 bg-neutral-800" />
                <p>📞 Phone: +251 91 123 4567 / +251 46 555 1234</p>
                <p>📍 Location: Hossana, Central Ethiopia</p>
                <p>🕒 Check-in: 2:00 PM | Check-out: 11:00 AM</p>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
