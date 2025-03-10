import express from 'express';
import { 
    getAllItems, 
    getItemById, 
    createItem, 
    updateItem, 
    softDeleteItem, 
    hardDeleteItem 
} from '../controllers/ItemController';
import { uploadItemImage } from '../config/cloudinary';
import { handleUploadErrors } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getAllItems);

// Get a single item
router.get('/:id', getItemById as express.RequestHandler);

// Create a new item with image upload
router.post('/', 
  uploadItemImage.single('image'),
  handleUploadErrors as any,
  createItem as express.RequestHandler
);

// Update an item with image upload
router.put('/:id', 
  uploadItemImage.single('image'),
  handleUploadErrors as any,
  updateItem as express.RequestHandler
);

// Soft delete an item (set isActive to false)
router.patch('/:id/deactivate', softDeleteItem as express.RequestHandler);

// Hard delete an item (remove from database)
router.delete('/:id', hardDeleteItem as express.RequestHandler);

export default router;