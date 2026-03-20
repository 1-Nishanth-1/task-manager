import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
) => {
  const payload: ApiResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(payload);
};

export const sendError = (res: Response, message: string, statusCode = 400) => {
  const payload: ApiResponse = { success: false, message };
  return res.status(statusCode).json(payload);
};
