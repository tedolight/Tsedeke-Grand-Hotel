import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: [true, 'Please add a quote'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please add an author name'],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    origin: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
