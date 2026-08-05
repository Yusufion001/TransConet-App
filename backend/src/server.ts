// Catch unhandled asynchronous errors (prevents silent server deaths)
process.on('unhandledRejection', (reason: Error) => {
  console.error('🚨 UNHANDLED REJECTION! Shutting down gracefully...', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('🚨 UNCAUGHT EXCEPTION! Critical failure:', error);
  process.exit(1);
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
import aiAutomationRoutes from './routes/aiAutomationRoutes';
import { rateLimitMiddleware } from './middleware/rateLimiter';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()]
});

async function startServer() {
  console.log('Step 1: Starting server');
  const app = express();
  console.log('Step 2: Creating HTTP server');
  const httpServer = http.createServer(app);
  console.log('Step 3: Initializing routes');
  initSocket(httpServer);
  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      const host = req.headers.host;
      if (host && ['www.transconet.com', 'transconet.ng', 'www.transconet.ng'].includes(host)) {
        return res.redirect(301, `https://transconet.com${req.originalUrl}`);
      }
    }
    next();
  });

  // Never serialize request headers/cookies into application logs. They can contain
  // bearer tokens, session cookies and CSRF material.
  app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    requestWhitelist: ['method', 'originalUrl', 'query', 'params'],
    responseWhitelist: ['statusCode', 'responseTime'],
    msg: 'HTTP {{req.method}} {{req.url}} completed in {{res.responseTime}}ms',
    expressFormat: true,
    colorize: false,
    ignoreRoute: (req) => !req.url.startsWith('/api')
  }));

  app.use((req, res, next) => {
    (res as any).locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
  });

  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://maps.googleapis.com', (req, res) => `'nonce-${(res as any).locals.nonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'https:', 'wss:']
      }
    } : false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  }));

  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim())
  ].filter(Boolean) as string[];

  const developmentOrigins = process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://localhost:3000'];

  const allowedOrigins = Array.from(new Set([
    ...configuredOrigins,
    ...developmentOrigins,
    'https://transconet.com',
    'https://www.transconet.com',
    'https://transconet.ng',
    'https://www.transconet.ng'
  ]));

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }));

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  const csrfProtection = csurf({ cookie: { httpOnly: true, secure: true, sameSite: 'none' } });
  app.use('/api', (req, res, next) => {
    if (req.method === 'OPTIONS' || req.path === '/health' || req.path === '/csrf-token' || req.path === '/payments/webhook/paystack' || req.headers.authorization) return next();
    csrfProtection(req, res, next);
  });

  app.get('/api/csrf-token', (req, res) => {
    csrfProtection(req, res, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      try {
        const token = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
        if (!token) throw new Error('CSRF disabled');
        res.json({ csrfToken: token });
      } catch { res.status(500).json({ error: 'CSRF token generation failed' }); }
    });
  });

  app.use('/api', rateLimitMiddleware);
  app.get('/api/health', (req, res) => res.status(200).json({ status: 'secured & operational' }));

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
  app.use('/api/ai-automation', aiAutomationRoutes);

  app.use('/api/*', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') return res.status(403).json({ error: 'Invalid or missing CSRF token. Please refresh and try again.', code: 'EBADCSRFTOKEN' });
    console.error('🚨 [CRITICAL BACKEND EXCEPTION ENCOUNTERED]:', { message: err.message, path: req.path });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Data conflict: A resource with these unique values already exists inside the registry.' });
    return res.status(500).json({ error: 'Internal System Safety Error Intercepted.', details: process.env.NODE_ENV !== 'production' ? err.message : 'System Maintenance Active' });
  });

  app.use((err: any, req: any, res: any, next: any) => res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error.' }));

  console.log('Step 4: About to listen on', config.port);
  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log('Server is listening');
    logger.info(`🔒 TransConet Secure Server running on port ${config.port}`);
  });

  const shutdown = () => {
    logger.info('Shutting down server...');
    httpServer.close(() => { logger.info('Server closed'); process.exit(0); });
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
