import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import bookingRoutes from "./routes/bookingRoutes";
import itemRoutes from "./routes/itemRoute";
import categoryRoutes from "./routes/categoryRoute";
import authRoutes from "./routes/authRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import adminRoutes from "./routes/adminRoutes";
import { protect } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Error handling middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Something went wrong!";
  res.status(500).json({ message });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
    console.log("Connected to Database");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

connectDB();

// Health Check Route
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    // Check database connection
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      status: "healthy",
      message: "Server and database are running smoothly.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      message: "Server or database is not functioning properly.",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Auth Routes (public)
app.use("/api/auth", authRoutes);

// Protected Routes
app.use("/api/booking", protect as any, bookingRoutes);
app.use("/api/items", protect as any, itemRoutes);
app.use("/api/category", protect as any, categoryRoutes);
app.use("/api/vendor", protect as any, vendorRoutes);
app.use('/api/admins', adminRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  server.close(async () => {
    console.log("Server closed");
    try {
      await mongoose.connection.close();
      console.log("Database connection closed");
      process.exit(0);
    } catch (err) {
      console.error("Error closing database connection:", err);
      process.exit(1);
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);