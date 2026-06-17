const pino = require('pino');
const env = require('./env');

module.exports = pino({
  level: env.logLevel,
  redact: ['req.headers.authorization', 'WHATSAPP_TOKEN', 'META_APP_SECRET']
});
