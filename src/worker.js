const { consumeIncomingWebhooks } = require('./queues/messageQueue');
const { processWebhookPayload } = require('./services/loanBot.service');
const logger = require('./config/logger');

consumeIncomingWebhooks(async ({ payload, receivedAt }) => {
  await processWebhookPayload(payload, receivedAt);
}).catch((err) => {
  logger.error({ err }, 'Worker failed to start');
  process.exit(1);
});
