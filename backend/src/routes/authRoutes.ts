import express from "express";
import {
  login,
  getCurrentAdmin,
  logout,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/login", login as any);
router.post("/logout", logout);


// Protected routes
router.get("/me", protect as any, getCurrentAdmin as any);

export default router;