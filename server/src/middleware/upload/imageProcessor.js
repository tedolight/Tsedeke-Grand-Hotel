import sharp from 'sharp';

/**
 * Image processing middleware using Sharp.
 * Resizes and optimizes images before cloud upload.
 */
export const processImage = (options = {}) => {
  const {
    width = 1200,
    height = 800,
    quality = 80,
    format = 'webp',
    fit = 'cover',
  } = options;

  return async (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    try {
      // Single file
      if (req.file) {
        const processed = await sharp(req.file.buffer)
          .resize(width, height, { fit, withoutEnlargement: true })
          .toFormat(format, { quality })
          .toBuffer();

        req.file.buffer = processed;
        req.file.mimetype = `image/${format}`;
        req.file.originalname = req.file.originalname.replace(/\.\w+$/, `.${format}`);
      }

      // Multiple files (array)
      if (Array.isArray(req.files)) {
        for (const file of req.files) {
          const processed = await sharp(file.buffer)
            .resize(width, height, { fit, withoutEnlargement: true })
            .toFormat(format, { quality })
            .toBuffer();

          file.buffer = processed;
          file.mimetype = `image/${format}`;
          file.originalname = file.originalname.replace(/\.\w+$/, `.${format}`);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Thumbnail generator middleware.
 */
export const generateThumbnail = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const thumbnail = await sharp(req.file.buffer)
      .resize(300, 200, { fit: 'cover' })
      .toFormat('webp', { quality: 60 })
      .toBuffer();

    req.thumbnail = thumbnail;
    next();
  } catch (error) {
    next(error);
  }
};

export default processImage;
