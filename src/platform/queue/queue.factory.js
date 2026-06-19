const env = require('../config/env');

function getQueueAdapter() {
  if (env.queueProvider === 'lavinmq') {
    return require('./lavinmq.adapter');
  }

  if (env.queueProvider === 'rabbitmq') {
    return require('./rabbitmq.adapter');
  }

  if (env.queueProvider === 'bullmq') {
    return require('./bullmq.adapter');
  }

  throw new Error(`Unsupported QUEUE_PROVIDER: ${env.queueProvider}`);
}

module.exports = { getQueueAdapter };
