import express from 'express';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getBookingsByUserId,
    getBookingsByStatus,
} from '../controllers/BookingController';

const router = express.Router();

// Booking routes
router.post('/bookings', createBooking);
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

// Additional routes for filtering
router.get('/bookings/user/:userId', getBookingsByUserId); // Get bookings by user ID
router.get('/bookings/status/:status', getBookingsByStatus); // Get bookings by status

export default router;