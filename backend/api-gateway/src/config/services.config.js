require('dotenv').config();

const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    endpoints: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      verify: '/api/auth/verify',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
    },
  },

  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    endpoints: {
      profile: '/api/users/profile',
      updateProfile: '/api/users/profile',
      users: '/api/users',
    },
  },

  driver: {
    url: process.env.DRIVER_SERVICE_URL || 'http://localhost:3003',
    endpoints: {
      drivers: '/api/drivers',
      driverProfile: '/api/drivers/profile',
      location: '/api/drivers/location',
      nearby: '/api/drivers/nearby',
      status: '/api/drivers/status',
    },
  },

  ride: {
    url: process.env.RIDE_SERVICE_URL || 'http://localhost:3004',
    endpoints: {
      rides: '/api/rides',
      request: '/api/rides/request',
      accept: '/api/rides/accept',
      start: '/api/rides/start',
      complete: '/api/rides/complete',
      cancel: '/api/rides/cancel',
      history: '/api/rides/history',
    },
  },

  booking: {
    url: process.env.BOOKING_SERVICE_URL || 'http://localhost:3005',
    endpoints: {
      bookings: '/api/bookings',
      create: '/api/bookings/create',
      confirm: '/api/bookings/confirm',
      cancel: '/api/bookings/cancel',
    },
  },

  payment: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
    endpoints: {
      payments: '/api/payments',
      process: '/api/payments/process',
      refund: '/api/payments/refund',
      methods: '/api/payments/methods',
      history: '/api/payments/history',
    },
  },

  pricing: {
    url: process.env.PRICING_SERVICE_URL || 'http://localhost:3007',
    endpoints: {
      calculate: '/api/pricing/calculate',
      estimate: '/api/pricing/estimate',
    },
  },

  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    endpoints: {
      send: '/api/notifications/send',
      notifications: '/api/notifications',
    },
  },

  review: {
    url: process.env.REVIEW_SERVICE_URL || 'http://localhost:3009',
    endpoints: {
      reviews: '/api/reviews',
      create: '/api/reviews/create',
      driver: '/api/reviews/driver',
      rider: '/api/reviews/rider',
    },
  },
};

module.exports = services;
