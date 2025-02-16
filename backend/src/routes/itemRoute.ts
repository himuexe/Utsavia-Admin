import express from 'express';
import {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
} from '../controllers/ItemController';

const router = express.Router();

// Item routes
router.post('/items', createItem);
router.get('/items', getAllItems);
router.get('/items/:id', getItemById);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;