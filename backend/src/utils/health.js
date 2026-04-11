const mongoose = require('mongoose');
const redis = require('redis');

// Check Database Connection
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (state === 1) {
      return { status: 'connected', message: 'MongoDB connected' };
    } else if (state === 0) {
      return { status: 'disconnected', message: 'MongoDB disconnected' };
    } else {
      return { status: 'connecting', message: 'MongoDB connecting...' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

// Check Redis Connection (if configured)
const checkRedisHealth = async () => {
  try {
    if (!process.env.REDIS_URL) {
      return { status: 'not_configured', message: 'Redis not configured' };
    }
    
    const client = redis.createClient({
      url: process.env.REDIS_URL
    });
    
    await client.connect();
    const ping = await client.ping();
    await client.quit();
    
    if (ping === 'PONG') {
      return { status: 'connected', message: 'Redis connected' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

// Overall Health Check
const getHealthStatus = async () => {
  const dbHealth = await checkDatabaseHealth();
  const redisHealth = await checkRedisHealth();
  
  const isHealthy = 
    dbHealth.status === 'connected' && 
    (redisHealth.status === 'connected' || redisHealth.status === 'not_configured');
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: dbHealth,
      cache: redisHealth,
      api: { status: 'running' }
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
    }
  };
};

module.exports = {
  checkDatabaseHealth,
  checkRedisHealth,
  getHealthStatus
};
