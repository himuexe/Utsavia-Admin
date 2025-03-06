import { Request, Response } from 'express';
import { Item, IItem } from '../models/item';

// Create a new item
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, prices, category, image, isActive } = req.body;
        const item: IItem = new Item({
            name,
            description,
            prices,
            category,
            image,
            isActive,
        });
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error creating item', error });
    }
};

// Get all items
export const getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = req.query.category as string;
      const filter = categoryId ? { category: categoryId } : {};
      const items: IItem[] = await Item.find(filter).populate('category');
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching items', error });
    }
  };
// Get a single item by ID
export const getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const item: IItem | null = await Item.findById(req.params.id);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item', error });
    }
};

// Update an item
export const updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, prices, category, image, isActive } = req.body;
        const item: IItem | null = await Item.findByIdAndUpdate(
            req.params.id,
            { name, description, prices, category, image, isActive },
            { new: true }
        );
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error });
    }
};

// Delete an item
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const item: IItem | null = await Item.findByIdAndDelete(req.params.id);
        if (item) {
            res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error });
    }
};