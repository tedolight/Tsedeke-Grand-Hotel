/**
 * Migration script: Fix room types stored incorrectly in MongoDB.
 * 
 * Run from backend/ directory:
 *   node scripts/fixRoomTypes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tsedeke_grand_hotel';

// ── Type inference rules (checked in order, first match wins) ────────────────
const inferType = (room) => {
  const name  = (room.name  || '').toLowerCase();
  const badge = (room.badge || '').toLowerCase();
  const type  = (room.type  || '').toLowerCase();

  if (name.includes('vip') || name.includes('royal') || badge.includes('vip') || badge.includes('royal'))
    return 'vip';

  if (name.includes('family double') || badge.includes('family'))
    return 'family double bed';

  if (name.includes('executive suite') || name.includes('junior suite') ||
      badge.includes('executive suite') || badge.includes('junior suite') ||
      name.includes('suite') || badge.includes('suite'))
    return 'suite';

  if (name.includes('deluxe') || badge.includes('deluxe'))
    return 'deluxe';

  if (name.includes('single') || badge.includes('single'))
    return 'single';

  // If already a valid type, keep it; otherwise fall back to standard
  const valid = ['single', 'standard', 'deluxe', 'suite', 'family double bed', 'vip'];
  if (valid.includes(type)) return type;

  return 'standard';
};

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  const rooms = await mongoose.connection.collection('rooms').find({}).toArray();
  console.log(`\n📋 Found ${rooms.length} rooms in DB.\n`);

  let updated = 0;
  for (const room of rooms) {
    const inferred = inferType(room);
    const current  = (room.type || '').toLowerCase().trim();

    if (current !== inferred) {
      await mongoose.connection.collection('rooms').updateOne(
        { _id: room._id },
        { $set: { type: inferred } }
      );
      console.log(`  🔄  Room "${room.name}" (${room.roomNumber})  |  "${room.type}" → "${inferred}"`);
      updated++;
    } else {
      console.log(`  ✓   Room "${room.name}" (${room.roomNumber})  |  type OK: "${room.type}"`);
    }
  }

  console.log(`\n✅ Done. Updated ${updated} of ${rooms.length} rooms.\n`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
