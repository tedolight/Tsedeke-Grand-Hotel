import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add item name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add item description'],
    },
    price: {
      type: Number, // in ETB
      required: [true, 'Please add item price'],
    },
    category: {
      type: String, // e.g. "breakfast", "lunch", "dinner", "ethiopian", "drinks", "desserts"
      required: [true, 'Please add item category'],
      trim: true,
    },
    badge: {
      type: String, // e.g. "Chef's Favourite", "Traditional", "Vegan"
    },
    image: {
      type: String, // image URL
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
