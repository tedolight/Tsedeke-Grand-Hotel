import mongoose from 'mongoose';

/**
 * Database helper utilities.
 */

/**
 * Check if a string is a valid MongoDB ObjectId.
 * @param {string} id - The ID to validate.
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Get database connection stats.
 * @returns {Object} Connection state info.
 */
export const getDbStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    state: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};

/**
 * Drop a collection by name (for testing/seeding).
 * @param {string} collectionName
 */
export const dropCollection = async (collectionName) => {
  try {
    await mongoose.connection.db.dropCollection(collectionName);
    console.log(`Collection '${collectionName}' dropped.`);
  } catch (error) {
    if (error.code === 26) {
      console.log(`Collection '${collectionName}' does not exist.`);
    } else {
      throw error;
    }
  }
};
