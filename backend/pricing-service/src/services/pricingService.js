const pricingModel = require('../models/pricingModel');
const { validationResult } = require('express-validator');

class PricingService {
  // Tính toán giá hoàn chỉnh
  async calculatePrice(data) {
    const { distance, vehicleType, zoneId = 'default', useCache = true } = data;
    
    // Validate input
    if (!distance || distance <= 0) {
      throw new Error('Distance must be greater than 0');
    }
    
    if (!vehicleType) {
      throw new Error('Vehicle type is required');
    }
    
    // Kiểm tra cache
    const cacheKey = `${distance}:${vehicleType}:${zoneId}`;
    if (useCache) {
      const cachedPrice = await pricingModel.getCachedPrice(cacheKey);
      if (cachedPrice !== null) {
        console.log(`✅ Using cached price for key: ${cacheKey}`);
        return {
          basePrice: cachedPrice,
          finalPrice: cachedPrice,
          surgeMultiplier: 1.0,
          fromCache: true
        };
      }
    }
    
    // Tính giá cơ bản
    const basePrice = await pricingModel.calculateBasePrice(distance, vehicleType);
    
    // Lấy surge multiplier
    const surgeMultiplier = await pricingModel.getSurgeMultiplier(zoneId);
    
    // Tính giá cuối cùng
    const finalPrice = Math.round(basePrice * surgeMultiplier);
    
    // Làm tròn đến hàng nghìn
    const roundedPrice = Math.round(finalPrice / 1000) * 1000;
    
    // Cache kết quả
    if (useCache) {
      await pricingModel.cachePrice(cacheKey, roundedPrice);
    }
    
    return {
      basePrice,
      finalPrice: roundedPrice,
      surgeMultiplier,
      fromCache: false,
      currency: 'VND',
      breakdown: {
        distance,
        vehicleType,
        baseRatePerKm: pricingModel.basePrices[vehicleType],
        surgeApplied: surgeMultiplier > 1.0
      }
    };
  }

  // Cập nhật surge pricing (cho admin/AI)
  async updateSurgePricing(zoneId, multiplier) {
    if (multiplier < 0.5 || multiplier > 5.0) {
      throw new Error('Surge multiplier must be between 0.5 and 5.0');
    }
    
    const success = await pricingModel.updateSurgeMultiplier(zoneId, multiplier);
    
    if (success) {
      // Broadcast event về surge change (trong thực tế sẽ dùng Kafka)
      this.broadcastSurgeChange(zoneId, multiplier);
    }
    
    return success;
  }

  // Lấy tất cả surge multipliers
  async getSurgeMultipliers() {
    return await pricingModel.getAllSurgeMultipliers();
  }

  // Broadcast surge change (mô phỏng)
  broadcastSurgeChange(zoneId, multiplier) {
    console.log(`📢 Broadcasting surge change: Zone ${zoneId} → ${multiplier}x`);
    // Trong thực tế: gửi event qua Kafka topic 'surge.updated'
  }

  // Validate input từ request
  validateCalculateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }
    
    const { distance, vehicleType } = req.body;
    
    // Validate distance range
    const minDistance = parseInt(process.env.MIN_DISTANCE) || 1;
    const maxDistance = parseInt(process.env.MAX_DISTANCE) || 100;
    
    if (distance < minDistance || distance > maxDistance) {
      throw new Error(`Distance must be between ${minDistance} and ${maxDistance} km`);
    }
    
    // Validate vehicle type
    const validVehicleTypes = ['SEDAN', 'SUV', 'LUXURY'];
    if (!validVehicleTypes.includes(vehicleType)) {
      throw new Error(`Vehicle type must be one of: ${validVehicleTypes.join(', ')}`);
    }
    
    return true;
  }
}

module.exports = new PricingService();