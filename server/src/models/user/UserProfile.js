import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    avatar: {
      type: String, // URL to profile image
    },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    preferences: {
      roomType: { type: String },
      dietaryRestrictions: { type: [String], default: [] },
      specialNeeds: { type: String },
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    dept: {
      type: String,
    },
    status: {
      type: String,
      default: 'active',
    },
    detailedRole: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
