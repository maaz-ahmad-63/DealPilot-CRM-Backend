const Queue = require('bull');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Email sending queue
const emailQueue = new Queue('email-sending', redisConfig);

// Report generation queue
const reportQueue = new Queue('report-generation', redisConfig);

// Webhook processing queue
const webhookQueue = new Queue('webhook-processing', redisConfig);

// Event listeners for all queues
[emailQueue, reportQueue, webhookQueue].forEach(queue => {
  queue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`, { queue: queue.name });
  });

  queue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed`, { queue: queue.name, error: err.message });
  });

  queue.on('error', (err) => {
    logger.error(`Queue error in ${queue.name}`, err);
  });

  queue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} stalled`, { queue: queue.name });
  });
});

module.exports = {
  emailQueue,
  reportQueue,
  webhookQueue,
};
