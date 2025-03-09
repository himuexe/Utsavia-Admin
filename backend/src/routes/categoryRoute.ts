import express from 'express';
import { 
    createCategory, 
    getAllCategories, 
    getCategoryById, 
    updateCategory, 
    deleteCategory 
  } from '../controllers/CategoryController';

const router = express.Router();

// Category routes
router.post('/', createCategory as express.RequestHandler);
router.get('/', getAllCategories as express.RequestHandler);
router.get('/:id', getCategoryById as express.RequestHandler);
router.put('/:id', updateCategory as express.RequestHandler);
router.delete('/:id', deleteCategory as express.RequestHandler);
export default router;