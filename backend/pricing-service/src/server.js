// src/server.js
require('dotenv').config();
const app = require('./app');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 3006;

const startServer = async () => {
  try {
    // Khởi động server trước
    const server = app.listen(PORT, () => {
      console.log(`🚕 Pricing Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });

    // Kết nối Redis trong background (không block server)
    if (process.env.REDIS_ENABLED !== 'false') {
      setTimeout(async () => {
        try {
          const redisClient = await connectRedis();
          if (!redisClient) {
            console.log('🧠 Running with in-memory storage (Redis unavailable)');
          }
        } catch (error) {
          console.log('🧠 Running with in-memory storage due to Redis connection failure');
        }
      }, 1000); // Chờ 1 giây để server khởi động trước
    } else {
      console.log('🧠 Redis disabled, using in-memory storage');
    }

    // Xử lý shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();