import { Request, Response, NextFunction } from 'express';
import { TransactionModel } from '../models/Transaction';
import { Pool } from 'pg';

// Create a database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'acfmart_payments',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    // If no idempotency key is provided, continue normally
    return next();
  }

  // Validate idempotency key format (UUID v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(idempotencyKey)) {
    return res.status(400).json({
      error: 'Invalid idempotency key format. Expected UUID v4.',
    });
  }

  try {
    // Check if a transaction with this idempotency key already exists
    const client = await pool.connect();
    
    try {
      const existingTransaction = await TransactionModel.getIdempotencyResult(client, idempotencyKey);
      
      if (existingTransaction) {
        // Return the existing transaction result to ensure idempotency
        return res.status(200).json({
          success: true,
          message: 'Idempotency key found, returning existing result',
          transaction: existingTransaction,
          cached: true
        });
      }
      
      // Store the idempotency key in the request object for the controller to use
      req.idempotencyKey = idempotencyKey;
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Idempotency middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error during idempotency check',
    });
  }
};

// Extend Express Request type to include idempotencyKey
declare global {
  namespace Express {
    interface Request {
      idempotencyKey?: string;
    }
  }
}