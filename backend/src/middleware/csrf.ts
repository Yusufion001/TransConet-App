// src/middleware/csrf.ts
import { Request, Response, NextFunction } from 'express';
import csurf from 'csurf';

// Setup standard cookie-based CSRF for the web dashboard
const csrfProtection = csurf({ cookie: true });

export const adaptiveCSRF = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. If the request comes from the React Native app using a Bearer token, bypass CSRF
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  // 2. If it's a designated webhook route (e.g., Paystack/Stripe), bypass CSRF
  if (req.path.startsWith('/api/webhooks/')) {
    return next();
  }

  // 3. Otherwise (web dashboard cookie sessions), enforce CSRF
  return csrfProtection(req, res, next);
};
