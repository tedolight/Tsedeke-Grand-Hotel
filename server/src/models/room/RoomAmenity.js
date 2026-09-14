import mongoose from 'mongoose';

const roomAmenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add amenity name'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String, // e.g. "📶", "📺"
      required: [true, 'Please add an icon'],
    },
  },
  {
    timestamps: true,
  }
);

const RoomAmenity = mongoose.model('RoomAmenity', roomAmenitySchema);

export default RoomAmenity;
