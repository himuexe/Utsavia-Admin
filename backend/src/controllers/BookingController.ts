import { Request, Response } from 'express';
import mongoose from 'mongoose';
import '../models/user'; 
import { Booking } from '../models/booking';
import { Item } from '../models/item';
import { Vendor } from '../models/vendor';

// Get all bookings with pagination, filtering and sorting
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    // Check if models are properly registered
    if (!mongoose.models.User) {
      return res.status(500).json({
        message: 'Database models not properly initialized',
        error: 'User model not registered',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Handle sorting
    const sortField = (req.query.sortField as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort: { [key: string]: 'asc' | 'desc' | 1 | -1 } = {};
    sort[sortField] = sortOrder === 1 ? 'asc' : 'desc';

    // Handle filtering
    const filter: Record<string, any> = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.dateFrom && req.query.dateTo) {
      filter.createdAt = {
        $gte: new Date(req.query.dateFrom as string),
        $lte: new Date(req.query.dateTo as string),
      };
    }

    if (req.query.minAmount) {
      filter.totalAmount = { $gte: parseInt(req.query.minAmount as string) };
    }

    if (req.query.maxAmount) {
      if (!filter.totalAmount) filter.totalAmount = {};
      filter.totalAmount.$lte = parseInt(req.query.maxAmount as string);
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { 'address.city': searchRegex },
        { 'address.street': searchRegex },
        { 'items.itemName': searchRegex },
      ];
    }

    // Execute query with filtering, sorting, and pagination
    const bookings = await Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName primaryEmail');

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);

    // For each booking, find vendor names for items
    const bookingsWithVendors = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        // Get vendor names for each item
        for (let i = 0; i < bookingObj.items.length; i++) {
          const item = await Item.findOne({ name: bookingObj.items[i].itemName });
          if (item && item.vendor) {
            const vendor = await Vendor.findById(item.vendor);
            bookingObj.items[i].vendorName = vendor ? vendor.name : 'Admin';
          } else {
            bookingObj.items[i].vendorName = 'Admin';
          }
        }
        
        return bookingObj;
      })
    );

    res.status(200).json({
      bookings: bookingsWithVendors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching bookings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      'userId',
      'firstName lastName primaryEmail'
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const bookingObj = booking.toObject();
    
    // Get vendor names for each item
    for (let i = 0; i < bookingObj.items.length; i++) {
      const item = await Item.findOne({ name: bookingObj.items[i].itemName });
      if (item && item.vendor) {
        const vendor = await Vendor.findById(item.vendor);
        bookingObj.items[i].vendorName = vendor ? vendor.name : 'Admin';
      } else {
        bookingObj.items[i].vendorName = 'Admin+';
      }
    }

    res.status(200).json(bookingObj);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching booking',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const {
      items,
      totalAmount,
      status,
      paymentIntentId,
      address
    } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update fields if provided
    if (items) booking.items = items;
    if (totalAmount) booking.totalAmount = totalAmount;
    if (status) booking.status = status;
    if (paymentIntentId) booking.paymentIntentId = paymentIntentId;
    if (address) booking.address = address;
    
    await booking.save();
    
    const updatedBooking = booking.toObject();
    
    // Get vendor names for each item
    for (let i = 0; i < updatedBooking.items.length; i++) {
      const item = await Item.findOne({ name: updatedBooking.items[i].itemName });
      if (item && item.vendor) {
        const vendor = await Vendor.findById(item.vendor);
        updatedBooking.items[i].vendorName = vendor ? vendor.name : 'Admin';
      } else {
        updatedBooking.items[i].vendorName = 'Admin';
      }
    }
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req: Request, res: Response) => {
  try {
    // Get date range filters if provided
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Ensure end date includes the entire day
    endDate.setHours(23, 59, 59, 999);
    
    // Get total bookings count
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate }
        } 
      },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const revenueStats = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ["confirmed",] },
          createdAt: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageBookingValue: { $avg: "$totalAmount" },
          maxBookingValue: { $max: "$totalAmount" }
        }
      }
    ]);
    
    // Get bookings by day
    const bookingsByDay = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Prepare default revenue object if no data
    const defaultRevenue = {
      totalRevenue: 0,
      averageBookingValue: 0,
      maxBookingValue: 0
    };
    
    res.status(200).json({
      totalBookings,
      bookingsByStatus,
      revenue: revenueStats[0] || defaultRevenue,
      bookingsByDay
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching booking statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};