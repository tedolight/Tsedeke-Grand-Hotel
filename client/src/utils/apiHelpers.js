/**
 * Normalize API responses from axios (interceptor returns response.data).
 */
export const unwrapData = (response) => {
  if (response == null) return null;
  if (Array.isArray(response)) return response;
  if (typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
};

export const getErrorMessage = (err, fallback = 'Something went wrong') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string') return err.message;
  return fallback;
};

export const isMockId = (id) => typeof id === 'string' && id.startsWith('mock-');

export default { unwrapData, getErrorMessage, isMockId };
