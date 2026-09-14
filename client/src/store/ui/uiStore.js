import { create } from 'zustand';

/** UI state store — modals, sidebar, mobile menu, loading overlay */
const useUiStateStore = create((set) => ({
  isMobileMenuOpen: false,
  isModalOpen: false,
  modalContent: null,
  isLoading: false,
  activeSection: null,

  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveSection: (section) => set({ activeSection: section }),
}));

export default useUiStateStore;
