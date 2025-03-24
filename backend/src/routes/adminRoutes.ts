import express from "express";
import {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  updateAdminRole
} from "../controllers/AdminController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// All routes need authentication
router.use(protect as any);

// All routes need superadmin role
router.use(authorize('superadmin') as any);

// Routes
router.get("/", getAllAdmins as express.RequestHandler);
router.post("/", createAdmin as express.RequestHandler);
router.delete("/:id", deleteAdmin as express.RequestHandler);
router.put("/:id/role", updateAdminRole as express.RequestHandler);

export default router;