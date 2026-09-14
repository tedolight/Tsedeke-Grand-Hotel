import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add image title'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add image URL'],
    },
    category: {
      type: String, // e.g. "rooms", "restaurant", "events", "exterior", "interior", "city"
      required: [true, 'Please add image category'],
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
