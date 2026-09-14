import mongoose from 'mongoose';

const tableReservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Guest reservations
    },
    fullName: {
      type: String,
      required: [true, 'Please add your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add your email'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please add your phone number'],
    },
    date: {
      type: Date,
      required: [true, 'Please select a reservation date'],
    },
    time: {
      type: String,
      required: [true, 'Please select a reservation time'],
    },
    guests: {
      type: Number,
      required: [true, 'Please specify number of guests'],
      min: [1, 'At least 1 guest required'],
      max: [20, 'Maximum 20 guests per reservation'],
    },
    specialRequests: {
      type: String,
    },
    occasion: {
      type: String, // e.g., "Birthday", "Anniversary", "Business"
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'seated'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const TableReservation = mongoose.model('TableReservation', tableReservationSchema);

export default TableReservation;
