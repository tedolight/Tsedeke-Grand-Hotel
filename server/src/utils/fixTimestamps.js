import mongoose from 'mongoose';

export async function fixCorruptedTimestamps(db) {
  const collections = await db.listCollections().toArray();
  const now = new Date();
  let totalFixed = 0;

  for (const c of collections) {
    const colName = c.name;
    if (colName.startsWith('system.')) continue;
    const col = db.collection(colName);

    // Fix createdAt where type is object (BSON type 3)
    const resCreated = await col.updateMany(
      { createdAt: { $type: 3 } },
      { $set: { createdAt: now } }
    );

    // Fix updatedAt where type is object (BSON type 3)
    const resUpdated = await col.updateMany(
      { updatedAt: { $type: 3 } },
      { $set: { updatedAt: now } }
    );

    if (resCreated.modifiedCount > 0 || resUpdated.modifiedCount > 0) {
      console.log(`[fixTimestamps] Collection "${colName}": repaired ${resCreated.modifiedCount} createdAt, ${resUpdated.modifiedCount} updatedAt`);
      totalFixed += (resCreated.modifiedCount + resUpdated.modifiedCount);
    }
  }

  console.log(`[fixTimestamps] Total fields repaired: ${totalFixed}`);
  return totalFixed;
}

// Standalone execution
if (process.argv[1] && process.argv[1].endsWith('fixTimestamps.js')) {
  (async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tsedeke_grand_hotel');
    await fixCorruptedTimestamps(conn.connection.db);
    await mongoose.disconnect();
    process.exit(0);
  })().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
