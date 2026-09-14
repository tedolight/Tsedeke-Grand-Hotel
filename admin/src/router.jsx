import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/guards/ProtectedRoute.jsx';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/auth/Login.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import ManageBookings from './pages/bookings/ManageBookings.jsx';
import ManageRooms from './pages/rooms/ManageRooms.jsx';
import ManageMenu from './pages/restaurant/ManageMenu.jsx';
import ManageEvents from './pages/events/ManageEvents.jsx';
import ManageGallery from './pages/gallery/ManageGallery.jsx';
import ManageAmenities from './pages/amenities/ManageAmenities.jsx';
import Messages from './pages/messages/Messages.jsx';
import ManageTestimonials from './pages/testimonials/ManageTestimonials.jsx';
import ManageUsers from './pages/users/ManageUsers.jsx';
import UserDetail from './pages/users/UserDetail.jsx';
import HotelSettings from './pages/settings/HotelSettings.jsx';
import PricingSettings from './pages/settings/PricingSettings.jsx';
import NotificationSettings from './pages/settings/NotificationSettings.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Dashboard />,
      },
      {
        path: 'bookings',
        element: <ManageBookings />,
      },
      {
        path: 'rooms',
        element: <ManageRooms />,
      },
      {
        path: 'restaurant',
        element: <ManageMenu />,
      },
      {
        path: 'events',
        element: <ManageEvents />,
      },
      {
        path: 'gallery',
        element: <ManageGallery />,
      },
      {
        path: 'amenities',
        element: <ManageAmenities />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'testimonials',
        element: <ManageTestimonials />,
      },
      {
        path: 'users',
        element: <ManageUsers />,
      },
      {
        path: 'users/:id',
        element: <UserDetail />,
      },
      {
        path: 'settings',
        element: <HotelSettings />,
      },
      {
        path: 'settings/pricing',
        element: <PricingSettings />,
      },
      {
        path: 'settings/notifications',
        element: <NotificationSettings />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
