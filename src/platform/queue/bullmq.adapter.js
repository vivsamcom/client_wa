const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const logger = require('../config/logger');

function createRedisConnection() {
  return new IORedis(env.queueUri, {
    maxRetriesPerRequest: null
  });
}

const queue = new Queue(env.whatsappIncomingQueue, {
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

async function publish(data) {
  await queue.add('incoming-webhook', data);
  logger.info({ queue: env.whatsappIncomingQueue }, 'Webhook event queued');
}

async function consume(handler) {
  if (worker) return worker;

  worker = new Worker(
    env.whatsappIncomingQueue,
    async (job) => {
      await handler(job.data);
    },
    {
      connection: createRedisConnection(),
      concurrency: env.queueConcurrency
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: env.whatsappIncomingQueue }, 'Queue job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id, queue: env.whatsappIncomingQueue }, 'Queue job processing failed');
  });

  worker.on('error', (err) => {
    logger.error({ err, queue: env.whatsappIncomingQueue }, 'BullMQ worker error');
  });

  await worker.waitUntilReady();
  logger.info({ queue: env.whatsappIncomingQueue, concurrency: env.queueConcurrency }, 'Worker consuming queue');
  return worker;
}

module.exports = { publish, consume };
