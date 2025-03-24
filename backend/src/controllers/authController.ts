import { Request, Response, NextFunction } from "express";
import Admin from "../models/admin";

// Type for login request body
interface LoginRequestBody {
  email: string;
  password: string;
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
      secure: process.env.NODE_ENVV === "production",
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
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENVV === "production",
    maxAge: 0, // Expire immediately
    sameSite: process.env.NODE_ENVV === "production" ? "none" : "lax",
    path: "/", // Make sure path matches the cookie path
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
