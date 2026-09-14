import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/public/Home.jsx';
import About from './pages/public/About.jsx';
import Rooms from './pages/public/Rooms.jsx';
import RoomDetail from './pages/public/RoomDetail.jsx';
import Restaurant from './pages/public/Restaurant.jsx';
import Events from './pages/public/Events.jsx';
import Gallery from './pages/public/Gallery.jsx';
import Contact from './pages/public/Contact.jsx';
import Amenities from './pages/public/Amenities.jsx';
import Bar from './pages/public/Bar.jsx';
import CoffeeBar from './pages/public/CoffeeBar.jsx';
import Wedding from './pages/public/Wedding.jsx';
import Conference from './pages/public/Conference.jsx';
import EventDetail from './pages/public/EventDetail.jsx';
import Booking from './pages/booking/Booking.jsx';
import Profile from './pages/user/Profile.jsx';
import NotFound from './pages/error/NotFound.jsx';
import RequireAuth from './components/common/RequireAuth.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'rooms', element: <Rooms /> },
      { path: 'rooms/:id', element: <RoomDetail /> },
      { path: 'restaurant', element: <Restaurant /> },
      { path: 'events', element: <Events /> },
      { path: 'events/:id', element: <EventDetail /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'contact', element: <Contact /> },
      { path: 'amenities', element: <Amenities /> },
      { path: 'bar', element: <Bar /> },
      { path: 'coffee-bar', element: <CoffeeBar /> },
      { path: 'wedding', element: <Wedding /> },
      { path: 'conference', element: <Conference /> },
      { path: 'booking', element: <RequireAuth message="Room booking is exclusive to registered Tsedeke Grand Hotel members. Create your free account to unlock access to all our services."><Booking /></RequireAuth> },
      { path: 'profile', element: <Profile /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
