import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please add a room number'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a room name'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please add a room type'],
      enum: [
        'single', 'standard', 'deluxe', 'suite', 'family double bed', 'vip',
        'deluxe suite', 'deluxe single room', 'deluxe double room', 'deluxe triple room', 'special price room', 'hour room'
      ],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    weekendPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    extraFee: {
      type: Number,
      default: 0,
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity (max guests)'],
    },
    size: {
      type: String, // e.g., "65 sqm"
      required: [true, 'Please add room size'],
    },
    bed: {
      type: String, // e.g., "King Bed"
      required: [true, 'Please add bed type'],
    },
    bathrooms: {
      type: String, // e.g. "1 Bathroom", "2 Bathrooms"
      default: '1 Bathroom',
    },
    view: {
      type: String, // e.g., "City View"
    },
    floor: {
      type: String, // e.g., "1st Floor"
      default: '1st Floor',
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String], // Array of amenities, e.g. ["📶 Free WiFi", "📺 Smart TV"]
      default: [],
    },
    badge: {
      type: String, // e.g. "Most Popular", "Best Value"
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'],
      default: 'Available',
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

const Room = mongoose.model('Room', roomSchema);

export default Room;
