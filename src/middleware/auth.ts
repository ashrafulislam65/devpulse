
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { NextFunction, Request, Response } from "express";

const auth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const decoded = jwt.verify(
      token,
      env.jwtSecret
    ) as {
      id: number;
      name: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errors: error,
    });
  }
};

export default auth;