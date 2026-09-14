import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  toasts: [],
  confirmModal: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Toast notifications
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Confirm modal
  showConfirm: (config) => set({ confirmModal: config }),
  hideConfirm: () => set({ confirmModal: null }),
}));

export default useUiStore;
