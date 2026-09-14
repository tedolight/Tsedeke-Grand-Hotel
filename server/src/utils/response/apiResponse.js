/**
 * Standard success response formatter
 */
export const sendResponse = (res, statusCode, success, message, data = null, token = null) => {
  const response = {
    success,
    message,
  };

  if (data) {
    response.data = data;
  }

  if (token) {
    response.token = token;
  }

  return res.status(statusCode).json(response);
};

export const sendSuccess = (res, statusCode, message, data = null) => {
  return sendResponse(res, statusCode, true, message, data);
};
