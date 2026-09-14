import api from './api.js';

/**
 * Setup request and response interceptors.
 * Already configured in api.js — this module provides additional customization hooks.
 */

/** Add a request interceptor. */
export const addRequestInterceptor = (onFulfilled, onRejected) => {
  return api.interceptors.request.use(onFulfilled, onRejected);
};

/** Add a response interceptor. */
export const addResponseInterceptor = (onFulfilled, onRejected) => {
  return api.interceptors.response.use(onFulfilled, onRejected);
};

/** Remove an interceptor by ID. */
export const removeRequestInterceptor = (id) => {
  api.interceptors.request.eject(id);
};

export const removeResponseInterceptor = (id) => {
  api.interceptors.response.eject(id);
};

export default { addRequestInterceptor, addResponseInterceptor };
