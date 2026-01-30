const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

// Validation rules
const calculateValidation = [
  body('distance').isFloat({ min: 0.1 }).withMessage('Distance must be a positive number'),
  body('vehicleType').isString().isIn(['SEDAN', 'SUV', 'LUXURY']).withMessage('Invalid vehicle type'),
  body('zoneId').optional().isString(),
  body('useCache').optional().isBoolean()
];

const surgeValidation = [
  body('zoneId').isString().notEmpty(),
  body('multiplier').isFloat({ min: 0.5, max: 5.0 })
];

// Routes
router.post('/calculate', calculateValidation, pricingController.calculatePrice);
router.post('/surge', surgeValidation, pricingController.updateSurge);
router.get('/surge', pricingController.getSurgeMultipliers);
router.get('/rates', pricingController.getBaseRates);

module.exports = router;