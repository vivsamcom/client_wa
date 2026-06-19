const amqp = require('amqplib');
const env = require('../config/env');
const logger = require('../config/logger');

let connection;
let channel;

async function getChannel() {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(env.queueUri);
  channel = await connection.createChannel();

  await channel.assertQueue(env.whatsappIncomingQueue, {
    durable: true
  });

  channel.prefetch(env.queueConcurrency);

  connection.on('error', (err) => {
    logger.error({ err }, 'RabbitMQ connection error');
  });

  connection.on('close', () => {
    logger.warn('RabbitMQ connection closed');
    channel = null;
    connection = null;
  });

  return channel;
}

async function publish(data) {
  const activeChannel = await getChannel();
  const payload = Buffer.from(JSON.stringify(data));

  activeChannel.sendToQueue(env.whatsappIncomingQueue, payload, {
    persistent: true,
    contentType: 'application/json'
  });

  logger.info({ queue: env.whatsappIncomingQueue }, 'Webhook event queued to RabbitMQ');
}

async function consume(handler) {
  const activeChannel = await getChannel();

  await activeChannel.consume(env.whatsappIncomingQueue, async (message) => {
    if (!message) return;

    try {
      const data = JSON.parse(message.content.toString());
      await handler(data);
      activeChannel.ack(message);
    } catch (err) {
      logger.error({ err, queue: env.whatsappIncomingQueue }, 'RabbitMQ message processing failed');
      activeChannel.nack(message, false, false);
    }
  });

  logger.info({ queue: env.whatsappIncomingQueue, concurrency: env.queueConcurrency }, 'Worker consuming RabbitMQ queue');
}

async function close() {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }
}

module.exports = { publish, consume, close };
