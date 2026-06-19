const { getQueueAdapter } = require('./platform/queue/queue.factory');
const { extractMessages } = require('./platform/meta/message-extractor');
const businessFlow = require("./business-flow");
const logger = require('./platform/config/logger');

getQueueAdapter().consume(async ({ payload, receivedAt }) => {
  const messages = extractMessages(payload);
  logger.info({ count: messages.length, receivedAt }, 'Processing WhatsApp messages');

  for (const messageContext of messages) {
    await businessFlow.handleIncomingMessage(messageContext);
  }
}).catch((err) => {
  logger.error({ err }, 'Worker failed to start');
  process.exit(1);
});
