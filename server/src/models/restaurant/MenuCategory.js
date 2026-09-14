import mongoose from 'mongoose';

const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add category system name'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: [true, 'Please add category display name'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);

export default MenuCategory;
