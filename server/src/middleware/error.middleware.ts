import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { AppError } from "../utils/appError.ts";

export const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`[${new Date().toISOString()}] ERROR`);

  console.error(`Method: ${req.method}`);
  console.error(`Route: ${req.originalUrl}`);
  console.error(`IP: ${req.ip}`);
  console.error(error);

  // Custom application error
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((err) => err.message);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // Unknown/unexpected error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
