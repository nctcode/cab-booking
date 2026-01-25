const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services.config');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication to all notification routes
router.use(verifyToken);

// Proxy configuration for notification service
const notificationProxy = createProxyMiddleware({
  target: services.notification.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api/notifications',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user info to notification service
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
    console.log(`[Notification Service] ${req.method} ${req.path} -> ${services.notification.url}${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[Notification Service] Proxy Error:', err);
    res.status(503).json({
      success: false,
      message: 'Notification service unavailable',
      error: err.message,
    });
  },
});

// Route all notification requests to notification service
router.use('/', notificationProxy);

module.exports = router;
