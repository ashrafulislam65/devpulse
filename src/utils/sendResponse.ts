import type { Response } from "express";

interface ResponseType<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  statusCode: number;
}

const sendResponse = <T>(
  res: Response,
  payload: ResponseType<T>
) => {
  const {
    success,
    message,
    data,
    errors,
    statusCode,
  } = payload;

  res.status(statusCode).json({
    success,
    message,
    data,
    errors,
  });
};

export default sendResponse;