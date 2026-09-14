import mongoose from 'mongoose';

const eventPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add package name'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: String, // e.g. "Up to 100 guests"
      required: [true, 'Please add capacity text'],
    },
    price: {
      type: Number, // In ETB
      required: [true, 'Please add package price'],
    },
    features: {
      type: [String], // Array of package details
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String, // e.g. "Most Popular"
    },
  },
  {
    timestamps: true,
  }
);

const EventPackage = mongoose.model('EventPackage', eventPackageSchema);

export default EventPackage;
