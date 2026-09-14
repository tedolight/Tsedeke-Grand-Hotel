import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';
import { runAgentChat } from '../../services/ai/aiProvider.js';
import { guestToolsSchema } from '../../services/ai/guestTools.js';
import { adminToolsSchema } from '../../services/ai/adminTools.js';

// @desc    Guest AI Concierge Chat
// @route   POST /api/ai/guest/chat
// @access  Public (Rate-limited)
export const handleGuestChat = asyncHandler(async (req, res, next) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return next(new ErrorResponse('Please provide a valid conversation history array.', 400));
  }

  // Validate format of last message
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || !lastMsg.content || typeof lastMsg.content !== 'string') {
    return next(new ErrorResponse('The message content must be a non-empty string.', 400));
  }

  const result = await runAgentChat({
    messages,
    mode: 'guest',
  });

  sendSuccess(res, 200, 'Agent response generated successfully', result);
});

// @desc    Admin Operations AI Copilot
// @route   POST /api/ai/admin/copilot
// @access  Private / Admin
export const handleAdminCopilot = asyncHandler(async (req, res, next) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return next(new ErrorResponse('Please provide a valid conversation history array.', 400));
  }

  const result = await runAgentChat({
    messages,
    mode: 'admin',
  });

  sendSuccess(res, 200, 'Admin copilot response generated', result);
});

// @desc    Get AI Agent Service Status
// @route   GET /api/ai/status
// @access  Public
export const getAiStatus = asyncHandler(async (req, res) => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('your_'));
  
  sendSuccess(res, 200, 'AI Agent Service status', {
    status: 'online',
    provider: hasKey ? 'openai' : 'database-native-fallback',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    guestToolsCount: guestToolsSchema.length,
    adminToolsCount: adminToolsSchema.length,
    guestTools: guestToolsSchema.map(t => t.function.name),
    adminTools: adminToolsSchema.map(t => t.function.name),
  });
});
