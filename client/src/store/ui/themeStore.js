import { create } from 'zustand';

const STORAGE_KEY = 'theme';

export const isBlackTheme = (theme) =>
  theme === 'dark' || theme === 'black' || theme === 'theme-black' || !theme || theme !== 'light';

const applyThemeClass = (theme) => {
  document.body.classList.remove('theme-light', 'theme-gold');
  if (theme === 'light') {
    document.body.classList.add('theme-light');
    document.body.classList.remove('theme-black', 'theme-dark');
  } else {
    document.body.classList.add('theme-black', 'theme-dark');
    document.body.classList.remove('theme-light');
  }
};

const normalizeTheme = (stored) => {
  if (stored === 'light') return 'light';
  return 'dark';
};

const initialTheme =
  typeof window !== 'undefined'
    ? normalizeTheme(localStorage.getItem(STORAGE_KEY))
    : 'dark';

if (typeof document !== 'undefined') {
  applyThemeClass(initialTheme);
}

const useUiStore = create((set) => ({
  theme: initialTheme,
  cursorHovered: false,
  toasts: [],

  toggleTheme: () =>
    set((state) => {
      const nextTheme = isBlackTheme(state.theme) ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyThemeClass(nextTheme);
      return { theme: nextTheme };
    }),

  initTheme: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme = normalizeTheme(stored) || 'dark';
    applyThemeClass(theme);
    set({ theme });
  },

  setCursorHovered: (hovered) => set({ cursorHovered: hovered }),

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export default useUiStore;
