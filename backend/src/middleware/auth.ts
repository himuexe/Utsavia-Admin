import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin";

interface JwtPayload {
  id: string;
  role: string;
}

export const protect = async (
  req: Request & { admin?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const secret = process.env.JWT_SECRET as jwt.Secret;
      
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Attach admin id and role to request
      req.admin = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to restrict access based on role
export const authorize = (...roles: string[]) => {
  return (
    req: Request & { admin?: { id: string; role: string } },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    next();
  };
};