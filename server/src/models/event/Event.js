import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a venue name'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please add maximum capacity'],
    },
    setupOptions: {
      type: [String], // e.g. ["Theatre", "Banquet", "Cabaret"]
      default: [],
    },
    avEquipment: {
      type: [String], // e.g. ["Full PA", "200\" Screen", "Stage"]
      default: [],
    },
    halfDayPrice: {
      type: Number,
      required: [true, 'Please add half day price in ETB'],
    },
    fullDayPrice: {
      type: Number,
      required: [true, 'Please add full day price in ETB'],
    },
    availability: {
      type: String,
      enum: ['available', 'on_request'],
      default: 'available',
    },
    icon: {
      type: String, // e.g. "👥", "🎤"
      default: '🏢',
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      default: 'Wedding',
    },
    description: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
