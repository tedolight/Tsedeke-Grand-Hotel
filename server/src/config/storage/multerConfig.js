import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';

/**
 * Multer configuration for file uploads.
 */

// Memory storage (for processing with sharp before uploading to cloud)
const memoryStorage = multer.memoryStorage();

// Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isSvg = ext === 'svg' || file.mimetype === 'image/svg+xml';

    if (isSvg) {
      return {
        folder: 'tsedeke-grand-hotel',
        resource_type: 'auto',
      };
    }

    return {
      folder: 'tsedeke-grand-hotel',
      resource_type: 'image',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1920, crop: 'limit' }], // Reasonable max size
    };
  },
});

// File filter — only allow images (used mainly for memory storage now)
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp, svg) are allowed'));
};

const multerConfig = {
  memory: {
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  },
  cloud: {
    storage: cloudinaryStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB for direct cloud uploads
    },
  },
};

export default multerConfig;
