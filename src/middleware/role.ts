import type { NextFunction, Request, Response } from "express";


const role = (...roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access this route",
      });
    }

    next();
  };
};

export default role;