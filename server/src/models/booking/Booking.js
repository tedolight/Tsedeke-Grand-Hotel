import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Can be null if it's a guest booking
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Please select a room'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Please add check-in date'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Please add check-out date'],
    },
    guests: {
      type: Number,
      required: [true, 'Please specify the number of guests'],
      min: [1, 'Number of guests must be at least 1'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    bookingSource: {
      type: String,
      enum: ['Online', 'Walk-In'],
      default: 'Online',
    },
    // Guest info in case they book without registration
    fullName: {
      type: String,
      required: [true, 'Please add guest full name'],
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: [true, 'Please add guest phone number'],
    },
    nationalId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 });

// Pre-save hook to guarantee no double bookings exist for the same room on overlapping dates
bookingSchema.pre('save', async function (next) {
  if (this.checkIn >= this.checkOut) {
    return next(new Error('Check-out date must be after check-in date.'));
  }

  if (
    this.isNew ||
    this.isModified('checkIn') ||
    this.isModified('checkOut') ||
    this.isModified('room') ||
    this.isModified('status')
  ) {
    if (this.status !== 'cancelled' && this.status !== 'failed') {
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
      const existingOverlap = await mongoose.model('Booking').findOne({
        _id: { $ne: this._id },
        room: this.room,
        $or: [
          { status: { $in: ['confirmed', 'checked-in'] } },
          { status: 'pending', createdAt: { $gte: fifteenMinAgo } },
        ],
        checkIn: { $lt: this.checkOut },
        checkOut: { $gt: this.checkIn },
      });

      if (existingOverlap) {
        return next(
          new Error('Room is already booked for the selected dates. Double booking is not allowed.')
        );
      }
    }
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
