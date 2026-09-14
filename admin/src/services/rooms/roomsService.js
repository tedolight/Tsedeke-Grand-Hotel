import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const roomsService = {
  getRooms: async () => {
    const res = await api.get(`${ENDPOINTS.ROOMS}?limit=100`);
    return res.data;
  },

  createRoom: async (roomData) => {
    const res = await api.post(ENDPOINTS.ROOMS, roomData);
    return res.data;
  },

  updateRoom: async (id, roomData) => {
    const res = await api.put(ENDPOINTS.ROOM_UPDATE(id), roomData);
    return res.data;
  },

  deleteRoom: async (id) => {
    const res = await api.delete(ENDPOINTS.ROOM_DELETE(id));
    return res.data;
  },

  uploadImage: async (fileOrFormData) => {
    let formData;
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append('image', fileOrFormData);
    }
    const res = await api.post(ENDPOINTS.ROOM_UPLOAD, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return res.data;
  },
};

export default roomsService;
