import express from 'express';
import { 
    getAllItems, 
    getItemById, 
    createItem, 
    updateItem, 
    softDeleteItem, 
    hardDeleteItem 
  } from  '../controllers/ItemController';

const router = express.Router();

router.get('/', getAllItems);

// Get a single item
router.get('/:id', getItemById as express.RequestHandler);

// Create a new item
router.post('/', createItem as express.RequestHandler);

// Update an item
router.put('/:id', updateItem as express.RequestHandler);

// Soft delete an item (set isActive to false)
router.patch('/:id/deactivate', softDeleteItem as express.RequestHandler);

// Hard delete an item (remove from database)
router.delete('/:id', hardDeleteItem as express.RequestHandler);

export default router;