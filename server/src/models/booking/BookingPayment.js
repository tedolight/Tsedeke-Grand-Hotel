import mongoose from 'mongoose';

const bookingPaymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Please associate a booking'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['telebirr', 'chapa', 'card', 'cash'],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null/undefined values if transaction is pending
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const BookingPayment = mongoose.model('BookingPayment', bookingPaymentSchema);

export default BookingPayment;
