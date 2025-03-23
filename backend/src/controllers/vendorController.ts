import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Vendor } from '../models/vendor';

// Get all vendors with filtering, sorting and search
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const {
      city,
      isActive,
      companyName,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (city) {
      filter.city = city;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (companyName) {
      filter.companyName = { $regex: companyName, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    // Validate the sort field
    const validSortFields = ['name', 'companyName', 'createdAt', 'updatedAt', 'city'];
    const finalSortBy = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    const finalSortOrder = sortOrder === 'asc' ? 1 : -1;

    // Build sort object
    const sort: any = {};
    sort[finalSortBy as string] = finalSortOrder;

    const vendors = await Vendor.find(filter)
      .sort(sort)
      .select('-password') 
      .exec();

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single vendor by ID
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('-password');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a vendor
export const updateVendor = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.id;
    const updatedData = req.body;
    
    // Remove password from updates if included
    if (updatedData.password) {
      delete updatedData.password;
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updatedData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle vendor active status
export const toggleVendorStatus = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive status is required'
      });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a vendor
export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.id;
    
    const deletedVendor = await Vendor.findByIdAndDelete(vendorId);
    
    if (!deletedVendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vendor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};