const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const driverRoutes = require('./driver.routes');
const rideRoutes = require('./ride.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const pricingRoutes = require('./pricing.routes');
const notificationRoutes = require('./notification.routes');
const reviewRoutes = require('./review.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// WebSocket endpoint (placeholder)
router.get('/ws', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WebSocket endpoint - not configured yet',
  });
});

// Service routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/pricing', pricingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
});

module.exports = router;
