import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const hmacValidator = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;
  
  // If this is not a webhook request, skip validation
  if (!signature || !timestamp) {
    return next();
  }

  // Get the webhook secret from environment variables
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({
      error: 'Webhook secret not configured',
    });
  }

  // Verify the timestamp is within acceptable range (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const receivedTimestamp = parseInt(timestamp, 10);
  if (isNaN(receivedTimestamp) || Math.abs(now - receivedTimestamp) > 300) {
    return res.status(400).json({
      error: 'Webhook timestamp is too old or invalid',
    });
  }

  // Recreate the signature using the same method as the sender
  const payloadString = JSON.stringify(req.body) + timestamp;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadString)
    .digest('hex');

  // Compare signatures securely
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
    console.error('Webhook signature mismatch');
    return res.status(403).json({
      error: 'Invalid webhook signature',
    });
  }

  // Verify the IP comes from a trusted source (optional - depending on PSP)
  const forwardedIpsStr = req.header('x-forwarded-for');
  const ip = forwardedIpsStr ? forwardedIpsStr.split(',')[0] : req.connection.remoteAddress;
  
  // For now, we'll trust all IPs but in production we should validate against PSP IP ranges
  // TODO: Implement IP whitelist based on PSP documentation
  
  next();
};