// src/models/pricingModel.js
const { getRedisClient } = require('../config/redis');

class PricingModel {
  constructor() {
    this.basePrices = {
      'SEDAN': parseInt(process.env.BASE_PRICE_SEDAN) || 10000,
      'SUV': parseInt(process.env.BASE_PRICE_SUV) || 15000,
      'LUXURY': parseInt(process.env.BASE_PRICE_LUXURY) || 25000,
    };
    
    // In-memory storage as fallback
    this.memoryCache = new Map();
    this.memorySurge = new Map();
    
    console.log('📊 Pricing Model initialized (with Redis fallback support)');
  }

  // Helper để kiểm tra Redis có sẵn không
  async getRedisIfAvailable() {
    try {
      const redis = getRedisClient();
      if (redis && (await redis.ping() === 'PONG')) {
        return redis;
      }
    } catch (error) {
      // Redis không khả dụng
    }
    return null;
  }

  // Tính giá cơ bản
  async calculateBasePrice(distance, vehicleType) {
    if (!this.basePrices[vehicleType]) {
      throw new Error(`Invalid vehicle type: ${vehicleType}`);
    }
    
    const basePricePerKm = this.basePrices[vehicleType];
    return Math.round(basePricePerKm * distance);
  }

  // Lấy surge multiplier cho zone
  async getSurgeMultiplier(zoneId) {
    try {
      const redis = await this.getRedisIfAvailable();
      if (redis) {
        const multiplier = await redis.hGet('surge:multipliers', zoneId);
        return multiplier ? parseFloat(multiplier) : 1.0;
      }
    } catch (error) {
      console.error('Redis error, using memory fallback:', error.message);
    }
    
    // Fallback to in-memory
    return this.memorySurge.get(zoneId) || 1.0;
  }

  // Cập nhật surge multiplier
  async updateSurgeMultiplier(zoneId, multiplier) {
    try {
      const redis = await this.getRedisIfAvailable();
      if (redis) {
        await redis.hSet('surge:multipliers', zoneId, multiplier);
        await redis.expire('surge:multipliers', 3600);
      } else {
        // Fallback to in-memory
        this.memorySurge.set(zoneId, multiplier);
        // Auto-remove after 1 hour
        setTimeout(() => {
          this.memorySurge.delete(zoneId);
        }, 3600 * 1000);
      }
      return true;
    } catch (error) {
      console.error('Error updating surge multiplier:', error.message);
      return false;
    }
  }

  // Cache giá tính toán
  async cachePrice(key, price, ttl = 300) {
    try {
      const redis = await this.getRedisIfAvailable();
      if (redis) {
        await redis.setEx(`price:${key}`, ttl, price.toString());
      } else {
        // Fallback to in-memory
        this.memoryCache.set(key, {
          price,
          expiry: Date.now() + (ttl * 1000)
        });
      }
    } catch (error) {
      console.error('Error caching price:', error.message);
    }
  }

  // Lấy giá từ cache
  async getCachedPrice(key) {
    try {
      const redis = await this.getRedisIfAvailable();
      if (redis) {
        const cached = await redis.get(`price:${key}`);
        return cached ? parseFloat(cached) : null;
      }
    } catch (error) {
      console.error('Redis error, checking memory cache:', error.message);
    }
    
    // Fallback to in-memory
    const item = this.memoryCache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.price;
    }
    this.memoryCache.delete(key);
    return null;
  }

  // Lấy tất cả surge multipliers
  async getAllSurgeMultipliers() {
    try {
      const redis = await this.getRedisIfAvailable();
      if (redis) {
        return await redis.hGetAll('surge:multipliers');
      }
    } catch (error) {
      console.error('Redis error, getting from memory:', error.message);
    }
    
    // Fallback to in-memory
    const result = {};
    this.memorySurge.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Clean expired in-memory cache
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiry <= now) {
        this.memoryCache.delete(key);
      }
    }
  }
}

module.exports = new PricingModel();