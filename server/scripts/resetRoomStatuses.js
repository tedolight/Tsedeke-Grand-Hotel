/**
 * Reset room status script.
 * Resets all rooms in MongoDB to 'Available' / isAvailable: true
 * (except those marked 'Maintenance').
 * 
 * Run from backend/:
 *   node scripts/resetRoomStatuses.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tsedeke_grand_hotel';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  const now = new Date();

  // Find active bookings right now
  const activeBookingsToday = await mongoose.connection.collection('bookings').find({
    status: { $in: ['confirmed', 'checked-in', 'active', 'pending'] },
    checkIn: { $lte: now },
    checkOut: { $gte: now }
  }).toArray();

  const occupiedRoomIds = new Set(activeBookingsToday.map(b => b.room.toString()));

  const rooms = await mongoose.connection.collection('rooms').find({}).toArray();
  let updated = 0;

  for (const r of rooms) {
    if (r.status === 'Maintenance') continue;

    const isOccupiedToday = occupiedRoomIds.has(r._id.toString());
    const targetStatus = isOccupiedToday ? 'Occupied' : 'Available';
    const targetIsAvailable = !isOccupiedToday;

    await mongoose.connection.collection('rooms').updateOne(
      { _id: r._id },
      { $set: { status: targetStatus, isAvailable: targetIsAvailable } }
    );
    updated++;
  }

  console.log(`✅ Reset statuses for ${updated} rooms.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
