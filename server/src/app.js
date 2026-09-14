import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth/auth.js';
import roomRoutes from './routes/room/rooms.js';
import eventRoutes from './routes/event/events.js';
import restaurantRoutes from './routes/restaurant/restaurant.js';
import reservationRoutes from './routes/restaurant/reservations.js';
import galleryRoutes from './routes/gallery/gallery.js';
import bookingRoutes from './routes/booking/bookings.js';
import paymentRoutes from './routes/booking/payments.js';
import contactRoutes from './routes/contact/contact.js';
import enquiryRoutes from './routes/event/enquiries.js';
import dashboardRoutes from './routes/dashboard/dashboard.js';
import settingsRoutes from './routes/settings/settings.js';
import userRoutes from './routes/user/users.js';
import testimonialRoutes from './routes/testimonial/testimonial.js';
import amenityRoutes from './routes/amenity/amenityRoutes.js';
import aiRoutes from './routes/ai/aiRoutes.js';
import { notFound, errorHandler } from './middleware/error/errorHandler.js';

// Load env vars
dotenv.config();

const app = express();

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Body parser
app.use(express.json());

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Dynamic CORS configuration (Allows localhost in dev and production URLs from env)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman) or matched allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Set security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Global API Rate Limiting (500 requests per 15 mins per IP)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', globalApiLimiter);

// Serve static uploads (with clean fallback for missing media files)
app.use('/uploads', express.static('uploads'), (req, res) => {
  res.status(404).json({ success: false, message: 'Upload file not found' });
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/events/enquiries', enquiryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/restaurant/reservations', reservationRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', contactRoutes); // Mount contactRoutes under /api/messages as well
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/ai', aiRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
