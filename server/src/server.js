import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the backend root folder
dotenv.config({ path: path.join(__dirname, '../.env') });

import startImapListener from './utils/email/imapListener.js';
import { cleanDeadLocalImages } from './utils/cleanDeadImages.js';
import { fixCorruptedTimestamps } from './utils/fixTimestamps.js';

// Connect to database
connectDB().then((conn) => {
  if (conn?.connection?.db) {
    fixCorruptedTimestamps(conn.connection.db);
  }
  cleanDeadLocalImages();
});

const PORT = process.env.PORT || 7000;

// Start IMAP listener
startImapListener();


const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

