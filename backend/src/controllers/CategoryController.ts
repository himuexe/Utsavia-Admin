import { Request, Response } from 'express';
import { Category, ICategory } from '../models/category';

// Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, slug, description, parentId, level, path, isActive, image } = req.body;
        const category: ICategory = new Category({
            name,
            slug,
            description,
            parentId,
            level,
            path,
            isActive,
            image,
        });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories: ICategory[] = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};

// Get a single category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const category: ICategory | null = await Category.findById(req.params.id);
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error });
    }
};

// Update a category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, slug, description, parentId, level, path, isActive, image } = req.body;
        const category: ICategory | null = await Category.findByIdAndUpdate(
            req.params.id,
            { name, slug, description, parentId, level, path, isActive, image },
            { new: true }
        );
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const category: ICategory | null = await Category.findByIdAndDelete(req.params.id);
        if (category) {
            res.status(200).json({ message: 'Category deleted successfully' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};