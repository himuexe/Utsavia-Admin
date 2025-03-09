import express from 'express';
import { 
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingStats
} from '../controllers/BookingController';


const router = express.Router();

// Admin routes
router.get('/admin/bookings',  getAllBookings as express.RequestHandler);
router.get('/admin/bookings/stats',  getBookingStats);
router.get('/admin/bookings/:id',  getBookingById as express.RequestHandler);
router.post('/admin/bookings',  createBooking as express.RequestHandler);
router.put('/admin/bookings/:id',  updateBooking as express.RequestHandler);
router.delete('/admin/bookings/:id',  deleteBooking as express.RequestHandler);

export default router;