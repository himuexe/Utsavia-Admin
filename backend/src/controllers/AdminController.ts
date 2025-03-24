import { Request, Response, NextFunction } from "express";
import Admin, { IAdmin } from "../models/admin";

// Get all admins
export const getAllAdmins = async (
  req: Request & { admin?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    // Only superadmins can access this
    if (req.admin?.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      });
    }

    const admins = await Admin.find().select('-password');

    res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    next(error);
  }
};

// Create new admin
export const createAdmin = async (
  req: Request & { admin?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    // Only superadmins can create other admins
    if (req.admin?.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create admins",
      });
    }

    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin', // Default to 'admin' if not specified
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
// Delete admin
export const deleteAdmin = async (
    req: Request & { admin?: { id: string; role: string } },
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Only superadmins can delete admins
      if (req.admin?.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete admins",
        });
      }
  
      const adminId = req.params.id;
      
      // Prevent deleting yourself
      if (adminId === req.admin.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }
  
      const admin = await Admin.findById(adminId);
  
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }
  
      await admin.deleteOne();
  
      res.status(200).json({
        success: true,
        message: "Admin deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Update admin role
  export const updateAdminRole = async (
    req: Request & { admin?: { id: string; role: string } },
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Only superadmins can update roles
      if (req.admin?.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update admin roles",
        });
      }
  
      const adminId = req.params.id;
      const { role } = req.body;
      
      // Validate role
      if (!role || !['admin', 'superadmin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role specified",
        });
      }
  
      // Prevent demoting yourself
      if (adminId === req.admin.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot update your own role",
        });
      }
  
      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { role },
        { new: true, runValidators: true }
      ).select('-password');
  
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }
  
      res.status(200).json({
        success: true,
        admin,
      });
    } catch (error) {
      next(error);
    }
  };
  
  