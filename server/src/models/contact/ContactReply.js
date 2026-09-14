import mongoose from 'mongoose';

const contactReplySchema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: [true, 'Please associate a contact query'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Staff member who replied
    },
    isCustomerReply: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: [true, 'Please add reply message'],
    },
  },
  {
    timestamps: true,
  }
);

const ContactReply = mongoose.model('ContactReply', contactReplySchema);

export default ContactReply;
