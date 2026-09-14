import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const messagesService = {
  getMessages: async () => {
    const res = await api.get(ENDPOINTS.MESSAGES);
    return res.data;
  },

  getMessageById: async (id) => {
    const res = await api.get(ENDPOINTS.MESSAGE_BY_ID(id));
    return res.data;
  },

  replyToMessage: async (id, messageData) => {
    const res = await api.post(ENDPOINTS.MESSAGE_REPLY(id), messageData);
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.put(ENDPOINTS.MESSAGE_MARK_READ(id));
    return res.data;
  },

  updateAttributes: async (id, data) => {
    const res = await api.put(`${ENDPOINTS.MESSAGES}/${id}/attributes`, data);
    return res.data;
  },
};

export default messagesService;
