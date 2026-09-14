import fs from 'fs';
import path from 'path';
import Room from '../models/room/Room.js';
import Amenity from '../models/amenity/Amenity.js';
import Event from '../models/event/Event.js';
import MenuItem from '../models/restaurant/MenuItem.js';
import Gallery from '../models/gallery/Gallery.js';
import Settings from '../models/settings/Settings.js';

// Helper to check if a local image URL points to a file that does NOT exist on disk
const isDeadLocal = (str) => {
  if (typeof str !== 'string' || !str.trim()) return false;
  const normalized = str.replace(/\\/g, '/');
  if (normalized.includes('/uploads/') || normalized.startsWith('uploads/')) {
    const filename = path.basename(normalized);
    const localPath = path.join(process.cwd(), 'uploads', filename);
    // If the file does NOT exist on disk, it is dead
    return !fs.existsSync(localPath);
  }
  return false;
};

export const cleanDeadLocalImages = async () => {
  try {
    // 1. Clean Amenities
    const amenities = await Amenity.find();
    for (const a of amenities) {
      if (isDeadLocal(a.icon)) {
        a.icon = '';
        await a.save();
      }
    }

    // 2. Clean Rooms
    const rooms = await Room.find();
    for (const r of rooms) {
      if (Array.isArray(r.images)) {
        const cleaned = r.images.filter(img => !isDeadLocal(img));
        if (cleaned.length !== r.images.length) {
          r.images = cleaned;
          await r.save();
        }
      }
    }

    // 3. Clean Events
    const events = await Event.find();
    for (const e of events) {
      if (isDeadLocal(e.image)) {
        e.image = '';
        await e.save();
      }
    }

    // 4. Clean Restaurant Items
    const restaurantItems = await MenuItem.find();
    for (const ri of restaurantItems) {
      if (isDeadLocal(ri.image)) {
        ri.image = '';
        await ri.save();
      }
    }

    // 5. Clean Gallery
    const galleryItems = await Gallery.find();
    for (const g of galleryItems) {
      let modified = false;
      if (isDeadLocal(g.url)) { g.url = ''; modified = true; }
      if (isDeadLocal(g.imageUrl)) { g.imageUrl = ''; modified = true; }
      if (modified) await g.save();
    }

    // 6. Clean Hotel Settings
    const settings = await Settings.findOne();
    if (settings) {
      let updated = false;
      if (settings.logoUrl && isDeadLocal(settings.logoUrl)) { settings.logoUrl = ''; updated = true; }
      if (settings.faviconUrl && isDeadLocal(settings.faviconUrl)) { settings.faviconUrl = ''; updated = true; }
      if (settings.bannerUrl && isDeadLocal(settings.bannerUrl)) { settings.bannerUrl = ''; updated = true; }
      if (Array.isArray(settings.team)) {
        const cleanedTeam = settings.team.map(m => isDeadLocal(m.img) ? { ...m._doc, img: '' } : m);
        if (JSON.stringify(cleanedTeam) !== JSON.stringify(settings.team)) {
          settings.team = cleanedTeam;
          updated = true;
        }
      }
      if (updated) await settings.save();
    }

    console.log('[DB Cleanup] Checked & cleaned dead local image references from database.');
  } catch (err) {
    console.error('[DB Cleanup Error]', err.message);
  }
};

export default cleanDeadLocalImages;
