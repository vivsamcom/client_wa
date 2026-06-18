const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const logger = require('../config/logger');

function createRedisConnection() {
  return new IORedis(env.queueUrl, {
    maxRetriesPerRequest: null
  });
}

const queue = new Queue(env.queueName, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: 1000,
    removeOnFail: 5000
  }
});

let worker;

async function enqueueIncomingWebhook(payload) {
  await queue.add('incoming-webhook', {
    payload,
    receivedAt: new Date().toISOString()
  });
  logger.info({ queue: env.queueName }, 'Webhook event queued');
}

async function consumeIncomingWebhooks(handler) {
  if (worker) return worker;

  worker = new Worker(
    env.queueName,
    async (job) => {
      await handler(job.data);
    },
    {
      connection: createRedisConnection(),
      concurrency: env.queueConcurrency
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: env.queueName }, 'Queue job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id, queue: env.queueName }, 'Queue job processing failed');
  });

  worker.on('error', (err) => {
    logger.error({ err, queue: env.queueName }, 'BullMQ worker error');
  });

  await worker.waitUntilReady();
  logger.info({ queue: env.queueName, concurrency: env.queueConcurrency }, 'Worker consuming queue');
  return worker;
}

module.exports = { enqueueIncomingWebhook, consumeIncomingWebhooks };
