import { v2 as cloudinary } from 'cloudinary';
import configureCloudinary from '../../config/storage/cloudinary.js';

// Initialize cloudinary
configureCloudinary();

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - Image buffer.
 * @param {string} folder - Cloudinary folder name.
 * @param {Object} [options] - Additional options.
 * @returns {Promise<Object>} Cloudinary upload result.
 */
export const uploadToCloudinary = (buffer, folder = 'tsedeke-grand-hotel', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by public ID.
 * @param {string} publicId - Cloudinary public ID.
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Cloudinary delete error: ${error.message}`);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL.
 * @param {string} url - Cloudinary image URL.
 * @returns {string} Public ID.
 */
export const extractPublicId = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename.split('.')[0]}`;
};

export default { uploadToCloudinary, deleteFromCloudinary, extractPublicId };
