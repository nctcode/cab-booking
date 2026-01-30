const pricingService = require('../services/pricingService');

class PricingController {
  // POST /pricing/calculate
  async calculatePrice(req, res) {
    try {
      // Validate input
      pricingService.validateCalculateRequest(req);
      
      const { distance, vehicleType, zoneId } = req.body;
      
      const result = await pricingService.calculatePrice({
        distance: parseFloat(distance),
        vehicleType,
        zoneId: zoneId || 'default'
      });
      
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error calculating price:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /pricing/surge (Admin/AI - cập nhật surge)
  async updateSurge(req, res) {
    try {
      const { zoneId, multiplier } = req.body;
      
      if (!zoneId || !multiplier) {
        return res.status(400).json({
          success: false,
          error: 'zoneId and multiplier are required'
        });
      }
      
      const success = await pricingService.updateSurgePricing(zoneId, parseFloat(multiplier));
      
      if (success) {
        res.status(200).json({
          success: true,
          message: `Surge multiplier updated for zone ${zoneId}`,
          data: { zoneId, multiplier }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update surge multiplier'
        });
      }
      
    } catch (error) {
      console.error('Error updating surge:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /pricing/surge (Lấy tất cả surge multipliers)
  async getSurgeMultipliers(req, res) {
    try {
      const multipliers = await pricingService.getSurgeMultipliers();
      
      res.status(200).json({
        success: true,
        data: multipliers,
        count: Object.keys(multipliers).length
      });
      
    } catch (error) {
      console.error('Error getting surge multipliers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get surge multipliers'
      });
    }
  }

  // GET /pricing/rates (Lấy base rates)
  async getBaseRates(req, res) {
    const pricingModel = require('../models/pricingModel');
    
    res.status(200).json({
      success: true,
      data: pricingModel.basePrices,
      currency: 'VND',
      unit: 'per km'
    });
  }
}

module.exports = new PricingController();