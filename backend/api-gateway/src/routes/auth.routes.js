const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services.config');
const { authLimiter } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Proxy configuration for auth service
const authProxy = createProxyMiddleware({
  target: services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward request body for POST/PUT/PATCH
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    
    // Log the proxied request
    console.log(`[Auth Service] ${req.method} ${req.path} -> ${services.auth.url}${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[Auth Service] Proxy Error:', err);
    res.status(503).json({
      success: false,
      message: 'Auth service unavailable',
      error: err.message,
    });
  },
});

// Route all auth requests to auth service
router.use('/', authProxy);

module.exports = router;
