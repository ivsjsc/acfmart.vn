import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error occurred:', err);
  
  // Log the error for debugging
  console.error(`Route: ${req.method} ${req.url}`);
  console.error(`Body: ${JSON.stringify(req.body)}`);
  console.error(`Error: ${err.message}`);
  
  // Send generic error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong. Please try again later.'
  });
}