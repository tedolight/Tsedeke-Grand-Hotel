import mongoose from 'mongoose';

const eventEnquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please add email address'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please add a valid email',
      ],
    },
    eventType: {
      type: String,
      required: [true, 'Please specify the event type'],
    },
    preferredDate: {
      type: Date,
      required: [true, 'Please select a preferred date'],
    },
    expectedGuests: {
      type: String, // e.g. "31 – 80", "151 – 200"
      required: [true, 'Please specify expected guests range'],
    },
    preferredVenue: {
      type: String, // e.g. "Grand Ballroom"
      required: [true, 'Please select a preferred venue'],
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'confirmed', 'cancelled'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

const EventEnquiry = mongoose.model('EventEnquiry', eventEnquirySchema);

export default EventEnquiry;
