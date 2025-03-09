// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import { Category, ICategory } from '../models/Category';
import slugify from 'slugify';
import mongoose, {  Types } from 'mongoose';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentId, isActive, image } = req.body;
    
    // Create slug from name
    const slug = slugify(name, { lower: true });
    
    // Check if category with same name or slug already exists
    const categoryExists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (categoryExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category with this name already exists' 
      });
    }
    
    let level = 0;
    let path: mongoose.Types.ObjectId[] = [];
    
    // If parent category exists, set level and path accordingly
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ 
          success: false, 
          message: 'Parent category not found' 
        });
      }
      
      level = parentCategory.level + 1;
      path = [...parentCategory.path, parentCategory._id as Types.ObjectId];
    }
    
    // Create new category
    const category = new Category({
        name,
        slug,
        description,
        parentId: parentId ? new Types.ObjectId(parentId) : null,
        level,
        path,
        isActive: isActive !== undefined ? isActive : true,
        image
      });
    
    const savedCategory = await category.save();
    
    res.status(201).json({
      success: true,
      data: savedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { sort = 'createdAt', order = 'desc', parentId, search, isActive } = req.query;
    
    const query: any = {};
    
    // Filter by parent category
    if (parentId) {
      query.parentId = parentId === 'null' ? null : parentId;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions: any = {};
    sortOptions[sort as string] = order === 'desc' ? -1 : 1;
    
    const categories = await Category.find(query)
      .sort(sortOptions)
      .populate('parentId', 'name');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id)
      .populate('parentId', 'name')
      .populate('path', 'name');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, isActive, image } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Update basic fields
    if (name) {
      category.name = name;
      category.slug = slugify(name, { lower: true });
    }
    
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    if (image !== undefined) category.image = image;
    
    // Handle parent category change
    if (parentId !== undefined && parentId !== category.parentId?.toString()) {
      // Prevent circular references
      if (parentId && parentId === id) {
        return res.status(400).json({
          success: false,
          message: 'A category cannot be its own parent'
        });
      }
      
      // Check if the new parent exists
      if (parentId) {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
        
        // Check if the new parent is not a descendant of this category
        if (parentCategory.path.includes(new mongoose.Types.ObjectId(id))) {
          return res.status(400).json({
            success: false,
            message: 'Cannot set a descendant as parent'
          });
        }
        
        category.parentId = new mongoose.Types.ObjectId(parentId);
        category.level = parentCategory.level + 1;
        category.path = [...parentCategory.path, parentCategory._id as Types.ObjectId];
      } else {
        // If removing parent
        category.parentId = undefined;
        category.level = 0;
        category.path = [];
      }
      
      // Update all descendants
      await updateDescendants(category);
    }
    
    const updatedCategory = await category.save();
    
    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category has children
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a category with subcategories. Please delete or reassign subcategories first.'
      });
    }
    
    // Delete category
    await Category.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to update descendants when a category's parent changes
async function updateDescendants(category: ICategory): Promise<void> {
  const childCategories = await Category.find({ parentId: category._id });
  
  for (const child of childCategories) {
    child.level = category.level + 1;
    child.path = [...category.path, category._id as Types.ObjectId];
    await child.save();
    
    // Recursively update grandchildren
    await updateDescendants(child);
  }
}