/** Room store action creators */
export const roomActions = {
  fetchAndFilter: async (store, filters) => {
    await store.fetchRooms(filters);
  },
};

export default roomActions;
