import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an amenity title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add an amenity description'],
    },
    image: {
      type: String,
      required: [true, 'Please add an amenity image'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const Amenity = mongoose.model('Amenity', amenitySchema);

export default Amenity;
