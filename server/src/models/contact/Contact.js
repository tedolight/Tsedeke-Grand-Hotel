import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add email'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please add a valid email',
      ],
    },
    subject: {
      type: String,
      required: [true, 'Please add subject'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please add message'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
    folder: {
      type: String,
      enum: ['inbox', 'archive', 'trash', 'sent'],
      default: 'inbox',
    },
    tags: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    assignedTo: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Front Desk',
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
