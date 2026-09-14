import OpenAI from 'openai';
import { guestToolsSchema, executeGuestTool } from './guestTools.js';
import { adminToolsSchema, executeAdminTool } from './adminTools.js';

// Initialize OpenAI client instance
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith('your_') || apiKey.trim() === '') {
    return null;
  }
  return new OpenAI({
    apiKey: apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
};

/**
 * Specialized Room Booking AI Assistant System Prompts
 */
export const GUEST_SYSTEM_PROMPT = `
You are the dedicated AI Room Booking Specialist for Tsedeke Grand Hotel in Hossana, Ethiopia.
Your mission is to converse naturally, warmly, and politely with guests — helping them find, compare, calculate prices for, and reserve hotel rooms.

Conversation Style & Rules:
1. Speak naturally like a friendly, upscale 5-star hotel concierge. Avoid stiff templates or excessive bullet lists for simple greetings.
2. If the user says "hello", "hi", or greets you, greet them back warmly and ask how you can help with their reservation.
3. Hotel Suites:
   - Presidential VIP Suite (#501): 4,500 ETB/night | 2 Guests | King Bed | Jacuzzi Spa, Panoramic City & Mountain View.
   - Executive Deluxe Suite (#402): 2,800 ETB/night | 2 Guests | King Bed | Private Balcony, 4K TV, City View.
   - Family Double Bed Suite (#305): 3,200 ETB/night | 4 Guests | 2 Queen Beds | Family Friendly.
   - Standard Luxury Room (#201): 1,800 ETB/night | 2 Guests | Queen Bed | Optical WiFi, Work Desk.
4. Check-in: 2:00 PM (14:00) | Check-out: 11:00 AM.
5. Payment methods: Chapa (Telebirr, CBE Birr, Awash Birr, Bank Transfer, Debit/Credit Cards).
6. Fluently speak English and Amharic (አማርኛ).
`;

export const ADMIN_SYSTEM_PROMPT = `
You are the Executive Operations AI Copilot for Tsedeke Grand Hotel Management (Hossana, Ethiopia).
Provide executive-level summaries, revenue analytics, occupancy metrics, and reservation management advice.
Always format financial values in Ethiopian Birr (ETB) and present data in structured tables or bullet points.
`;

/**
 * Run Agent Chat
 */
export const runAgentChat = async ({
  messages,
  mode = 'guest',
}) => {
  const client = getOpenAIClient();
  const tools = mode === 'admin' ? adminToolsSchema : guestToolsSchema;
  const toolExecutor = mode === 'admin' ? executeAdminTool : executeGuestTool;
  const systemPrompt = mode === 'admin' ? ADMIN_SYSTEM_PROMPT : GUEST_SYSTEM_PROMPT;
  const modelName = process.env.AI_MODEL || 'gpt-4o-mini';

  // Database-grounded conversational booking engine
  if (!client) {
    return handleBookingSpecialistEngine({ messages, mode, toolExecutor });
  }

  const conversation = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-10)
  ];

  try {
    let currentIteration = 0;
    const maxIterations = 5;

    while (currentIteration < maxIterations) {
      currentIteration++;

      const response = await client.chat.completions.create({
        model: modelName,
        messages: conversation,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.6,
      });

      const choice = response.choices[0];
      const message = choice.message;

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return {
          reply: message.content || 'How may I assist you with your booking at Tsedeke Grand Hotel?',
          modelUsed: modelName,
          toolCallsCount: currentIteration - 1,
        };
      }

      conversation.push(message);

      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        try {
          functionArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          functionArgs = {};
        }

        try {
          const toolResult = await toolExecutor(functionName, functionArgs);
          conversation.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: JSON.stringify(toolResult),
          });
        } catch (toolError) {
          conversation.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: JSON.stringify({ error: toolError.message }),
          });
        }
      }
    }

    return {
      reply: 'I have checked your request. Please select a room card to proceed with your booking.',
      modelUsed: modelName,
    };
  } catch (error) {
    console.error('LLM Agent error, switching to Dedicated Booking Specialist Engine:', error?.message);
    return handleBookingSpecialistEngine({ messages, mode, toolExecutor });
  }
};

/**
 * Dedicated Room Booking Intelligence Engine
 */
async function handleBookingSpecialistEngine({ messages, mode, toolExecutor }) {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const cleanText = lastUserMessage.trim().toLowerCase();
  const isAmharic = /[\u1200-\u137F]/.test(lastUserMessage);

  if (mode === 'admin') {
    if (cleanText.includes('stat') || cleanText.includes('analytic') || cleanText.includes('occupancy') || cleanText.includes('revenue') || cleanText.includes('kpi')) {
      const stats = await toolExecutor('getLiveHotelAnalytics', {});
      return {
        reply: `### 📊 Live Operations & Revenue Executive Summary\n\n- **Current Occupancy Rate**: **${stats.occupancyRate}**\n- **Month-to-Date (MTD) Revenue**: **${stats.mtdRevenueETB} ETB**\n- **Active Checked-In Guests**: **${stats.activeGuestsCheckedIn}**\n- **Confirmed Upcoming Bookings**: **${stats.confirmedUpcomingBookings}**\n- **Pending Reservations Needing Action**: **${stats.pendingBookingsRequiringAction}**\n- **Unread Inquiries**: **${stats.unreadInquiries}**`,
        modelUsed: 'tsedeke-grand-booking-engine',
        data: stats,
      };
    }

    const bookingsData = await toolExecutor('getRecentBookings', { status: 'all', limit: 6 });
    const list = bookingsData.bookings.map((b, i) => 
      `${i + 1}. **${b.guestName}** — ${b.room} | Dates: ${b.checkIn} to ${b.checkOut} | Status: **${b.status.toUpperCase()}** | Total: **${b.totalPriceETB.toLocaleString()} ETB**`
    ).join('\n');

    return {
      reply: `### 📋 Recent Bookings Overview (${bookingsData.count})\n\n${list || 'No matching bookings found.'}`,
      modelUsed: 'tsedeke-grand-booking-engine',
    };
  }

  // --- DEDICATED GUEST ROOM BOOKING INTENT ENGINE ---

  // 1. Natural Human-like Greetings
  const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'greetings', 'selam', 'ሰላም', 'እንደምን', 'ታዲያስ', 'halo', 'hola'];
  if (greetingKeywords.some(w => cleanText === w || cleanText.startsWith(w + ' ') || cleanText.endsWith(' ' + w))) {
    if (isAmharic) {
      return {
        reply: `ጤና ይስጥልኝ! እንኳን ወደ **ፀደቀ ግራንድ ሆቴል** በደህና መጡ። 😊\n\nዛሬ ክፍል ለማስያዝ ወይም የዋጋ መረጃ ለማግኘት እንዴት ልርዳዎት? የሚፈልጉት የተለየ የክፍል ዓይነት ወይም ቀን አለ?`,
        modelUsed: 'tsedeke-grand-booking-specialist',
        quickChips: [
          { label: '🛏️ ክፍት ክፍሎች', prompt: 'አሁን የሚገኙ ክፍሎች እና ዋጋቸው ስንት ነው?' },
          { label: '👑 የVIP ክፍሎች', prompt: 'የፕሬዝዳንት VIP ክፍሎች ዋጋና ዝርዝር አሳየኝ' },
          { label: '👨‍👩‍👧 የቤተሰብ ክፍል', prompt: 'ለቤተሰብ የሚሆን ባለ 2 ድርብ አልጋ ክፍል አለ?' },
          { label: '🔍 የያዝኩት ክፍል', prompt: 'የያዝኩትን ክፍል የማስያዣ ሁኔታ ለማረጋገጥ እፈልጋለሁ' }
        ]
      };
    }

    return {
      reply: `Hello! Warm greetings from **Tsedeke Grand Hotel** in Hossana. 😊\n\nHow may I assist you with your room booking today? Are you looking for a specific suite or planning dates for your upcoming stay?`,
      modelUsed: 'tsedeke-grand-booking-specialist',
      quickChips: [
        { label: '🛏️ Available Rooms', prompt: 'What rooms are available and what are the rates?' },
        { label: '👑 VIP & Deluxe Suites', prompt: 'Show me the Presidential VIP and Deluxe suites' },
        { label: '👨‍👩‍👧 Family Suites', prompt: 'Do you have Family Double Bed suites for 4 guests?' },
        { label: '🔍 Check My Booking', prompt: 'I want to check my reservation status' }
      ]
    };
  }

  // 2. Lookup Existing Booking by Phone or ID
  if (cleanText.includes('my booking') || cleanText.includes('status') || cleanText.includes('lookup') || cleanText.includes('reservation') || /\d{8,}/.test(cleanText)) {
    const phoneMatch = cleanText.match(/\d{8,}/);
    if (phoneMatch) {
      const details = await toolExecutor('getBookingDetails', { phone: phoneMatch[0] });
      if (details.found) {
        if (isAmharic) {
          return {
            reply: `የማስያዣ መረጃዎ ተረጋግጧል! **${details.guestName}** ለ **${details.roomName}** (#${details.roomNumber}) ከ **${details.checkIn}** እስከ **${details.checkOut}** ድረስ ተመዝግቧል።`,
            modelUsed: 'tsedeke-grand-booking-specialist',
            actionCards: {
              type: 'booking',
              data: details
            }
          };
        }

        return {
          reply: `I verified your reservation! **${details.guestName}** for **${details.roomName}** (#${details.roomNumber}) from **${details.checkIn}** to **${details.checkOut}**.`,
          modelUsed: 'tsedeke-grand-booking-specialist',
          actionCards: {
            type: 'booking',
            data: details
          }
        };
      }
    }

    if (isAmharic) {
      return {
        reply: `የያዙትን ክፍል ሁኔታ ለማረጋገጥ እባክዎ ያስያዙበትን **ስልክ ቁጥር** (ምሳሌ: \`0911234567\`) ይጻፉልኝ።`,
        modelUsed: 'tsedeke-grand-booking-specialist'
      };
    }

    return {
      reply: `To look up your reservation, please provide your **Phone Number** (e.g. \`0911234567\`), and I will retrieve your confirmation details immediately.`,
      modelUsed: 'tsedeke-grand-booking-specialist'
    };
  }

  // 3. Specific Room Category Requests (VIP, Deluxe, Suite, Family, Standard) or General Room Search
  let targetType = undefined;
  if (cleanText.includes('vip') || cleanText.includes('president')) targetType = 'vip';
  else if (cleanText.includes('deluxe')) targetType = 'deluxe';
  else if (cleanText.includes('suite')) targetType = 'suite';
  else if (cleanText.includes('family') || cleanText.includes('double')) targetType = 'family double bed';
  else if (cleanText.includes('standard') || cleanText.includes('single')) targetType = 'standard';

  const today = new Date();
  const checkInStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
  const checkOutStr = new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0];

  const roomData = await toolExecutor('searchAvailableRooms', {
    checkIn: checkInStr,
    checkOut: checkOutStr,
    roomType: targetType
  });

  const roomCards = roomData.rooms || [];

  if (isAmharic) {
    return {
      reply: `ለቆይታዎ ዝግጁ የሆኑትን ክፍሎች ከታች አዘጋጅቼልዎታለሁ። የሚፈልጉትን ክፍል በመምረጥ **"አሁን ያዝ"** የሚለውን ተጭነው በቀጥታ ማስያዝ ይችላሉ:`,
      modelUsed: 'tsedeke-grand-booking-specialist',
      actionCards: {
        type: 'rooms',
        items: roomCards
      }
    };
  }

  return {
    reply: `Here are our featured suites available for your stay. You can click **"Book Room"** on any card below to proceed directly to reservation:`,
    modelUsed: 'tsedeke-grand-booking-specialist',
    actionCards: {
      type: 'rooms',
      items: roomCards
    }
  };
}
