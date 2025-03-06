import { Request, Response, NextFunction } from "express";
import Admin from "../models/Admin";
import jwt from "jsonwebtoken";

// Type for login request body
interface LoginRequestBody {
  email: string;
  password: string;
}

// Type for registered admin response
interface AdminResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Login controller
export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find admin with password included
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = admin.generateAuthToken();

    // Send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Send response
    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current admin controller
export const getCurrentAdmin = async (
  req: Request & { admin?: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout controller
export const logout = (req: Request, res: Response) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Create initial admin (for setup)
export const createInitialAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();

    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin users already exist",
      });
    }

    // Create initial superadmin
    const admin = await Admin.create({
      name: "Super Admin",
      email: req.body.email || "utsaviamain@gmail.com",
      password: req.body.password || "H@ppyLife", // This should be changed immediately
      role: "superadmin",
    });

    res.status(201).json({
      success: true,
      message: "Initial admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};