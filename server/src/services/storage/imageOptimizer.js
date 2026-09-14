import sharp from 'sharp';

/**
 * Image optimization service using Sharp.
 */

/**
 * Optimize an image buffer.
 * @param {Buffer} buffer - Image buffer.
 * @param {Object} options - Optimization options.
 * @returns {Promise<Buffer>} Optimized image buffer.
 */
export const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 1200,
    height = 800,
    quality = 80,
    format = 'webp',
    fit = 'cover',
  } = options;

  return await sharp(buffer)
    .resize(width, height, { fit, withoutEnlargement: true })
    .toFormat(format, { quality })
    .toBuffer();
};

/**
 * Create a thumbnail from an image buffer.
 * @param {Buffer} buffer
 * @param {number} [width=300]
 * @param {number} [height=200]
 * @returns {Promise<Buffer>}
 */
export const createThumbnail = async (buffer, width = 300, height = 200) => {
  return await sharp(buffer)
    .resize(width, height, { fit: 'cover' })
    .toFormat('webp', { quality: 60 })
    .toBuffer();
};

/**
 * Get image metadata.
 * @param {Buffer} buffer
 * @returns {Promise<Object>}
 */
export const getImageMetadata = async (buffer) => {
  return await sharp(buffer).metadata();
};

export default { optimizeImage, createThumbnail, getImageMetadata };
