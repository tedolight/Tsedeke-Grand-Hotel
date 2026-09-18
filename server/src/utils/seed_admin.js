import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user/User.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const name = process.env.ADMIN_NAME || 'Super Admin';
    const email = process.env.ADMIN_EMAIL || 'admin@tsedekegrandhotel.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✅ Existing user found and upgraded/updated as admin: ${email}`);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'admin',
      });
      console.log(`✅ New Admin user successfully created: ${email}`);
    }

    console.log('----------------------------------------------------');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     admin`);
    console.log('----------------------------------------------------');
    console.log('⚠️  Please change your password immediately after your first login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
