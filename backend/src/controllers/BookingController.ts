import { Request, Response } from 'express';
import { Booking, IBooking } from '../models/booking';

// Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, items, totalAmount, status, paymentIntentId, address } = req.body;
        const booking: IBooking = new Booking({
            userId,
            items,
            totalAmount,
            status,
            paymentIntentId,
            address,
        });
        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error });
    }
};

// Get all bookings
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookings: IBooking[] = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};

// Get a single booking by ID
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const booking: IBooking | null = await Booking.findById(req.params.id);
        if (booking) {
            res.status(200).json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error });
    }
};

// Update a booking
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, items, totalAmount, status, paymentIntentId, address } = req.body;
        const booking: IBooking | null = await Booking.findByIdAndUpdate(
            req.params.id,
            { userId, items, totalAmount, status, paymentIntentId, address },
            { new: true }
        );
        if (booking) {
            res.status(200).json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking', error });
    }
};

// Delete a booking
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const booking: IBooking | null = await Booking.findByIdAndDelete(req.params.id);
        if (booking) {
            res.status(200).json({ message: 'Booking deleted successfully' });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting booking', error });
    }
};

// Get bookings by user ID
export const getBookingsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const bookings: IBooking[] = await Booking.find({ userId });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings by user', error });
    }
};

// Get bookings by status
export const getBookingsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const status = req.params.status;
        const bookings: IBooking[] = await Booking.find({ status });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings by status', error });
    }
};