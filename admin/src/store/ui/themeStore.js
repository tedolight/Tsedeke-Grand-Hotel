import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('adminTheme');
  if (saved) return saved;
  // Admin defaults to dark based on the previous UI
  return 'dark';
};

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (newTheme) => {
    localStorage.setItem('adminTheme', newTheme);
    set({ theme: newTheme });
  },
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('adminTheme', nextTheme);
    return { theme: nextTheme };
  })
}));

export default useThemeStore;
