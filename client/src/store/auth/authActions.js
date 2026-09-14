/** Auth store action creators — extend authStore if needed */
export const authActions = {
  loginAndRedirect: async (store, email, password, navigate) => {
    const success = await store.login(email, password);
    if (success) navigate('/');
    return success;
  },
  registerAndRedirect: async (store, name, email, password, navigate) => {
    const success = await store.register(name, email, password);
    if (success) navigate('/');
    return success;
  },
};

export default authActions;
