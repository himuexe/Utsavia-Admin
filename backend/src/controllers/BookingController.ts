import { Request, Response } from 'express';
import mongoose from 'mongoose';
import '../models/user'; 
import { Booking } from '../models/booking';
import { Item } from '../models/item';
import { Vendor , IVendor} from '../models/vendor';

// Get all bookings with pagination, filtering and sorting
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    if (!mongoose.models.User) {
      return res.status(500).json({
        message: 'Database models not properly initialized',
        error: 'User model not registered',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortField = (req.query.sortField as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort: { [key: string]: 'asc' | 'desc' | 1 | -1 } = {};
    sort[sortField] = sortOrder === 1 ? 'asc' : 'desc';

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
        { 'items.vendorName': searchRegex },
      ];
    }

    const bookings = await Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate<{ userId: { firstName: string; lastName: string; primaryEmail: string } }>('userId', 'firstName lastName primaryEmail')
      .populate<{ 'items.vendorId': IVendor }>('items.vendorId', 'name companyName');

    const total = await Booking.countDocuments(filter);

    const bookingsWithVendors = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      bookingObj.items = bookingObj.items.map(item => {
        const vendor = item.vendorId as IVendor | undefined;
        return {
          ...item,
          vendor: vendor ? { 
            _id: vendor._id,
            name: vendor.name,
            companyName: vendor.companyName 
          } : null
        };
      });
      
      return bookingObj;
    });

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
    const booking = await Booking.findById(req.params.id)
      .populate<{ userId: { firstName: string; lastName: string; primaryEmail: string } }>('userId', 'firstName lastName primaryEmail')
      .populate<{ 'items.vendorId': IVendor }>('items.vendorId', 'name companyName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const bookingObj = booking.toObject();
    
    bookingObj.items = bookingObj.items.map(item => {
      const vendor = item.vendorId as IVendor | undefined;
      return {
        ...item,
        vendor: vendor ? { 
          _id: vendor._id,
          name: vendor.name,
          companyName: vendor.companyName 
        } : null
      };
    });

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
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate<{ 'items.vendorId': IVendor }>('items.vendorId', 'name companyName');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (status) booking.status = status;
    
    await booking.save();
    
    const updatedBooking = booking.toObject();
    
    updatedBooking.items = updatedBooking.items.map(item => {
      const vendor = item.vendorId as IVendor | undefined;
      return {
        ...item,
        vendor: vendor ? { 
          _id: vendor._id,
          name: vendor.name,
          companyName: vendor.companyName 
        } : null
      };
    });
    
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
          status: { $in: ["confirmed","completed"] },
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