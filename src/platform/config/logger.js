const pino = require('pino');
const env = require('./env');

module.exports = pino({
  level: env.logLevel,
  redact: [
    'req.headers.authorization',
    'META_ACCESS_TOKEN',
    'META_APP_SECRET',
    'metaAccessToken',
    'metaAppSecret'
  ]
});
