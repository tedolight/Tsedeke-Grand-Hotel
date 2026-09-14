/**
 * Build a Mongoose filter object from query parameters.
 * Supports comparison operators: gt, gte, lt, lte, in.
 * @param {Object} reqQuery - Express request query (req.query).
 * @param {string[]} [excludeFields] - Fields to exclude from filtering.
 * @returns {Object} Mongoose-compatible filter object.
 */
export const buildFilter = (reqQuery, excludeFields = ['select', 'sort', 'page', 'limit']) => {
  const queryObj = { ...reqQuery };

  // Remove fields that are not for filtering
  excludeFields.forEach((field) => delete queryObj[field]);

  // Create operators ($gt, $gte, etc.)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  return JSON.parse(queryStr);
};

/**
 * Apply sort to a Mongoose query.
 * @param {Object} query - Mongoose query.
 * @param {string} [sortStr] - Sort string from req.query.sort.
 * @returns {Object} Sorted Mongoose query.
 */
export const applySort = (query, sortStr) => {
  if (sortStr) {
    const sortBy = sortStr.split(',').join(' ');
    return query.sort(sortBy);
  }
  return query.sort('-createdAt');
};

/**
 * Apply field selection to a Mongoose query.
 * @param {Object} query - Mongoose query.
 * @param {string} [selectStr] - Select string from req.query.select.
 * @returns {Object} Mongoose query with selection.
 */
export const applySelect = (query, selectStr) => {
  if (selectStr) {
    const fields = selectStr.split(',').join(' ');
    return query.select(fields);
  }
  return query;
};
