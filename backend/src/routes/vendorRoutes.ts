import express from 'express';
import { 
  getAllVendors, 
  getVendorById, 
  updateVendor, 
  toggleVendorStatus, 
  deleteVendor 
} from '../controllers/vendorController'
const router = express.Router();

router.get('/',  getAllVendors);
router.get('/:id',  getVendorById as express.RequestHandler);
router.put('/:id',  updateVendor as express.RequestHandler);
router.patch('/:id/status',  toggleVendorStatus as express.RequestHandler);
router.delete('/:id',  deleteVendor as express.RequestHandler);

export default router;