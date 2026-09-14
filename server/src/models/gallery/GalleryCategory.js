import mongoose from 'mongoose';

const galleryCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add category system name'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: [true, 'Please add category display name'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const GalleryCategory = mongoose.model('GalleryCategory', galleryCategorySchema);

export default GalleryCategory;
