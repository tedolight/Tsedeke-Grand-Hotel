/** JWT Token management utilities. */
const TOKEN_KEY = 'token';

export const tokenService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  isTokenPresent: () => !!localStorage.getItem(TOKEN_KEY),
};

export default tokenService;
