// src/routes/categoryRoute.ts
import express from 'express';
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from '../controllers/CategoryController';
import { uploadCategoryImage } from '../config/cloudinary';
import { handleUploadErrors } from '../middleware/uploadMiddleware';

const router = express.Router();

// Category routes with image upload
router.post('/', 
  uploadCategoryImage.single('image'), 
  handleUploadErrors as any,
  createCategory as express.RequestHandler
);

router.put('/:id', 
  uploadCategoryImage.single('image'), 
  handleUploadErrors as any,
  updateCategory as express.RequestHandler
);

// Routes without image upload
router.get('/', getAllCategories as express.RequestHandler);
router.get('/:id', getCategoryById as express.RequestHandler);
router.delete('/:id', deleteCategory as express.RequestHandler);

export default router;