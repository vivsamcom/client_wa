const amqp = require('amqplib');
const env = require('../config/env');
const logger = require('../config/logger');

let channelPromise;

async function getChannel() {
  if (!channelPromise) {
    channelPromise = amqp.connect(env.rabbitmqUrl)
      .then(async (connection) => {
        connection.on('error', (err) => logger.error({ err }, 'RabbitMQ connection error'));
        connection.on('close', () => {
          logger.warn('RabbitMQ connection closed; reconnect on next publish');
          channelPromise = undefined;
        });
        const channel = await connection.createChannel();
        await channel.assertQueue(env.rabbitmqQueue, { durable: true });
        return channel;
      });
  }
  return channelPromise;
}

async function enqueueIncomingWebhook(payload) {
  const channel = await getChannel();
  const buffer = Buffer.from(JSON.stringify({ payload, receivedAt: new Date().toISOString() }));
  channel.sendToQueue(env.rabbitmqQueue, buffer, { persistent: true, contentType: 'application/json' });
  logger.info('Webhook event queued');
}

async function consumeIncomingWebhooks(handler) {
  const channel = await getChannel();
  channel.prefetch(5);
  await channel.consume(env.rabbitmqQueue, async (message) => {
    if (!message) return;
    try {
      const data = JSON.parse(message.content.toString());
      await handler(data);
      channel.ack(message);
    } catch (err) {
      logger.error({ err }, 'Queue message processing failed');
      channel.nack(message, false, false);
    }
  });
  logger.info({ queue: env.rabbitmqQueue }, 'Worker consuming queue');
}

module.exports = { enqueueIncomingWebhook, consumeIncomingWebhooks };
