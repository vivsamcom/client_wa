const createApp = require('./app');
const env = require('./platform/config/env');
const logger = require('./platform/config/logger');

const app = createApp();

app.listen(env.port, () => {
  logger.info({ port: env.port }, 'WhatsApp webhook API started');
});
