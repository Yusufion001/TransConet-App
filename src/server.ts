// Catch unhandled asynchronous errors (prevents silent server deaths)
process.on('unhandledRejection', (reason: Error) => {
  console.error('🚨 UNHANDLED REJECTION! Shutting down gracefully...', reason);
  // Optional: close server gracefully before exiting
});

// Catch uncaught synchronous exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('🚨 UNCAUGHT EXCEPTION! Critical failure:', error);
  // Perform necessary cleanup here if needed
  process.exit(1); // Exit cleanly so your container manager (Docker/Cloud Run) restarts it safely
});

import './prestart';
import { config } from './config/env';
import { initSocket } from './socket';

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

import winston from 'winston';
import expressWinston from 'express-winston';
import loadRoutes from './routes/loadRoutes';
import authRoutes from './routes/authRoutes';
import fleetRoutes from './routes/fleetRoutes';
import adminRoutes from './routes/adminRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import adminManagementRoutes from './routes/adminManagementRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import bidRoutes from './routes/bidRoutes';
import shipperRoutes from './routes/shipperRoutes';
import notificationRoutes from './routes/notificationRoutes';
import supportRoutes from './routes/supportRoutes';
import broadcastRoutes from './routes/announcementsRoutes';
import kycRoutes from './routes/kycRoutes';
import paymentRoutes from './routes/paymentRoutes';
import aiOptimizationRoutes from './routes/aiOptimizationRoutes';
import { rateLimitMiddleware } from './middleware/rateLimiter';


const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Outputs perfect JSON blocks optimized for Google Cloud Logging metrics
  ),
  transports: [
    new winston.transports.Console()
  ],
});

async function startServer() {
  console.log("Step 1: Starting server");
  const app = express();

  console.log("Step 2: Creating HTTP server");
  const httpServer = http.createServer(app);

  console.log("Step 3: Initializing routes");
  initSocket(httpServer);

  // Express Rate Limit requires trust proxy when behind a proxy (like Cloud Run)
  app.set('trust proxy', 1);

  // Redirect legacy domains to the primary domain
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      const host = req.headers.host;
      if (host && (host === 'www.transconet.com' || host === 'transconet.ng' || host === 'www.transconet.ng' || host === 'transconet.ng' || host === 'www.transconet.ng')) {
        return res.redirect(301, `https://transconet.com${req.originalUrl}`);
      }
    }
    next();
  });


  // Attach the structured automated monitor to your Express app middleware
  app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true, // Captures request performance speeds automatically
    msg: "HTTP {{req.method}} {{req.url}} completed in {{res.responseTime}}ms",
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) { 
      // Only log API requests to avoid noisy frontend asset logging
      return !req.url.startsWith('/api'); 
    }
  }));

  // 1. Security Hardening Middleware
  
  app.use((req, res, next) => {
    (res as any).locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
  });

  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://maps.googleapis.com", (req, res) => `'nonce-${(res as any).locals.nonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Tailwind often needs inline
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
      }
    } : false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }));
 
  // 1. Strict CORS Configuration (Must be mounted before API & CSRF middleware)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    'https://transconet.com', 
    'https://www.transconet.com', 
    'https://transconet.ng', 
    'https://www.transconet.ng', 
    'https://transconet.ng', 
    'https://www.transconet.ng'
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.cloudshell.dev') || origin.endsWith('.railway.app') || origin.includes('railway')) {
        callback(null, true);
      } else {
        callback(null, false); // Don't throw an error to prevent breaking, just don't allow
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }));

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  
  const csrfProtection = csurf({ cookie: { httpOnly: true, secure: true, sameSite: 'none' } });
  app.use('/api', (req, res, next) => {
    // Skip CSRF for OPTIONS, health check, csrf-token, or Bearer-authenticated requests (stateless JWTs)
    if (req.method === 'OPTIONS' || req.path === '/health' || req.path === '/csrf-token' || req.path === '/payments/webhook/paystack' || req.headers.authorization) {
      return next();
    }
    csrfProtection(req, res, next);
  });

  app.get('/api/csrf-token', (req, res) => {
    csrfProtection(req, res, () => {
      try {
        const token = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
        if (!token) throw new Error('CSRF disabled');
        res.json({ csrfToken: token });
      } catch (err) {
        res.status(500).json({ error: 'CSRF token generation failed' });
      }
    });
  });

  // 3. Rate Limiting
  app.use('/api', rateLimitMiddleware); // Apply rate limiter to API requests

  // Simple Health Check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'secured & operational' });
  });

  app.use('/api', loadRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/fleet', fleetRoutes);
  app.use('/api/admin/auth', adminAuthRoutes);
  app.use('/api/admin/management', adminManagementRoutes);
  app.use('/api/admin', adminRoutes);
    app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/bids', bidRoutes);
  app.use('/api/shipper', shipperRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/announcements', broadcastRoutes);
  app.use('/api/kyc', kycRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/ai', aiOptimizationRoutes);

  // Catch-all for undefined API routes to return 404 JSON instead of falling through to the SPA index.html
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // CSRF Token validation error check
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        error: 'Invalid or missing CSRF token. Please refresh and try again.',
        code: 'EBADCSRFTOKEN'
      });
    }

    // Capture complete, high-fidelity stack traces to pin-point file line crashes
    console.error('🚨 [CRITICAL BACKEND EXCEPTION ENCOUNTERED]:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      body: req.body
    });

    // Prisma unique constraint violation code check (e.g., duplicated license plates)
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Data conflict: A resource with these unique values already exists inside the registry.'
      });
    }

    // Graceful fallback response prevents application freezing or hanging
    return res.status(500).json({
      error: 'Internal System Safety Error Intercepted.',
      details: process.env.NODE_ENV !== 'production' ? err.message : 'System Maintenance Active'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('v' + 'ite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server: httpServer }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      
      fs.readFile(path.join(distPath, 'index.html'), 'utf8', (err, html) => {
        if (err) return res.status(500).send('Error reading index.html');
        // Replace scripts to include nonce
        const noncedHtml = html.replace(/<script /g, `<script nonce="${(res as any).locals.nonce}" `);
        res.send(noncedHtml);
      });

    });
  }

  
  
  httpServer.on('error', (e: any) => {
    console.error('Server error:', e);
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Express Global Error Catch:', err.stack || err);
    
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error. Our engineering team has been notified.',
    });
  });

  console.log("Step 4: About to listen on", config.port);

  httpServer.listen(config.port, "0.0.0.0", () => {
    console.log("Server is listening");
    logger.info(`🔒 TransConet Secure Server running on port ${config.port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down server...');
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    // Force shutdown after 5s
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
