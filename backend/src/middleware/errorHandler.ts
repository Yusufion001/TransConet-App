// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.message}`); // Replace with Winston logger

  // Catch malformed JSON from Express body parser
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ status: 'error', message: 'Malformed JSON payload' });
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
