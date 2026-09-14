/**
 * Apply pagination to a Mongoose query.
 * @param {Object} query - Mongoose query object.
 * @param {Object} reqQuery - Express request query (req.query).
 * @param {number} [defaultLimit=10] - Default number of results per page.
 * @returns {Object} { query, pagination }
 */
export const paginate = async (model, reqQuery, filter = {}, defaultLimit = 10) => {
  const page = parseInt(reqQuery.page, 10) || 1;
  const limit = parseInt(reqQuery.limit, 10) || defaultLimit;
  const startIndex = (page - 1) * limit;
  const total = await model.countDocuments(filter);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  if (startIndex + limit < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  return { startIndex, limit, pagination };
};

export default paginate;
