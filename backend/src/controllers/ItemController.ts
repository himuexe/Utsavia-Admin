import { Request, Response } from 'express';
import { Item, IItem } from '../models/item';
import mongoose from 'mongoose';
import { cloudinary, uploadItemImage } from '../config/cloudinary'; // Import Cloudinary and upload middleware
import { handleUploadErrors } from '../middleware/uploadMiddleware'; // Import error handling middleware

// Get all items with optional filtering and sorting
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      city,
      minPrice,
      maxPrice,
      search,
      vendor // Add vendor filter
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter.category = new mongoose.Types.ObjectId(category as string);
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (vendor) {
      filter.vendor = new mongoose.Types.ObjectId(vendor as string);
    }
    
    // Price filtering is more complex as prices are in an array
    if (city && (minPrice || maxPrice)) {
      filter['prices.city'] = city;
      const priceFilter: any = {};
      
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      
      if (Object.keys(priceFilter).length > 0) {
        filter['prices.price'] = priceFilter;
      }
    }

    // Validate the sort field
    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    const finalSortBy = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    const finalSortOrder = sortOrder === 'asc' ? 1 : -1;

    // Build sort object
    const sort: any = {};
    sort[finalSortBy as string] = finalSortOrder;

    const items = await Item.find(filter)
      .sort(sort)
      .populate('category', 'name')
      .populate('vendor', 'name') // Populate vendor information
      .exec();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single item by ID
export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findById(id)
      .populate('category', 'name')
      .populate('vendor', 'name'); // Populate vendor information
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new item with image upload
export const createItem = async (req: Request, res: Response) => {
  try {
    const itemData = req.body;

    // Parse the prices JSON string back to an array if it's a string
    if (typeof itemData.prices === 'string') {
      try {
        itemData.prices = JSON.parse(itemData.prices);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price data format',
          error: 'Prices must be a valid JSON array'
        });
      }
    }

    // Check if an image file was uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'items', // Folder in Cloudinary
      });
      itemData.image = result.secure_url; // Save the image URL in the item data
    }

    // Validation
    if (!itemData.name || !itemData.category || !itemData.prices || itemData.prices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, and at least one price entry'
      });
    }
    
    // Create new item
    const newItem = new Item(itemData);
    await newItem.save();
    
    // Populate category and vendor information before sending response
    const populatedItem = await Item.findById(newItem._id)
      .populate('category', 'name')
      .populate('vendor', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: populatedItem
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update an item with image upload
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Parse the prices JSON string back to an array if it's a string
    if (typeof updateData.prices === 'string') {
      try {
        updateData.prices = JSON.parse(updateData.prices);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price data format',
          error: 'Prices must be a valid JSON array'
        });
      }
    }

    // Check if an image file was uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'items', // Folder in Cloudinary
      });
      updateData.image = result.secure_url; // Save the new image URL in the update data
    }

    // Find the item first to check if it exists
    const existingItem = await Item.findById(id);
    
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // If updating the image, delete the old image from Cloudinary
    if (req.file && existingItem.image) {
      const publicId = existingItem.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`items/${publicId}`);
      }
    }
    
    // Update the item
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('vendor', 'name'); // Populate vendor information
    
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete an item (soft delete by setting isActive to false)
export const softDeleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Soft delete by setting isActive to false
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Item deactivated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error deactivating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Hard delete an item (actual deletion from database and Cloudinary)
export const hardDeleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Delete the associated image from Cloudinary if it exists
    if (item.image) {
      const publicId = item.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`items/${publicId}`);
      }
    }
    
    // Hard delete
    await Item.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Item permanently deleted'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};