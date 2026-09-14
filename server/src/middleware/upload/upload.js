import multer from 'multer';
import multerConfig from '../../config/storage/multerConfig.js';

/**
 * Multer upload middleware instances.
 */

// Single image upload (memory storage for cloud processing)
export const uploadSingle = multer(multerConfig.memory).single('image');

// Multiple image upload (up to 10 images)
export const uploadMultiple = multer(multerConfig.memory).array('images', 10);

// Fields upload (for forms with multiple file inputs)
export const uploadFields = multer(multerConfig.memory).fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

// Cloud storage upload (was uploadLocal)
export const uploadCloud = multer(multerConfig.cloud).single('image');

export default uploadSingle;
