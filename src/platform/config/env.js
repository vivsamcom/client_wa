require('dotenv').config();

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== '');
}

const metaVerifyToken = firstDefined(process.env.META_VERIFY_TOKEN, process.env.VERIFY_TOKEN);
const queueProvider = (process.env.QUEUE_PROVIDER || 'lavinmq').toLowerCase();

if (!metaVerifyToken) {
  throw new Error('Missing required environment variable: META_VERIFY_TOKEN');
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),

  metaVerifyToken,
  metaAppSecret: process.env.META_APP_SECRET || '',
  enableSignatureValidation: process.env.ENABLE_SIGNATURE_VALIDATION === 'true',
  metaAccessToken: firstDefined(process.env.META_ACCESS_TOKEN, process.env.WHATSAPP_TOKEN, ''),
  metaPhoneNumberId: firstDefined(process.env.META_PHONE_NUMBER_ID, process.env.WHATSAPP_PHONE_NUMBER_ID, ''),
  metaApiVersion: firstDefined(process.env.META_API_VERSION, process.env.GRAPH_API_VERSION, 'v23.0'),

  queueProvider,
  queueUri: firstDefined(
    process.env.QUEUE_URI,
    queueProvider === 'bullmq' ? process.env.QUEUE_URL : undefined,
    queueProvider === 'bullmq' ? process.env.REDIS_URL : undefined,
    queueProvider === 'bullmq' ? 'redis://localhost:6379' : 'amqp://guest:guest@localhost:5672'
  ),
  whatsappIncomingQueue: firstDefined(process.env.WHATSAPP_INCOMING_QUEUE, process.env.QUEUE_NAME, 'wa.incoming.messages'),
  queueConcurrency: Number(process.env.QUEUE_CONCURRENCY || 5),

  dbProvider: (process.env.DB_PROVIDER || 'postgres').toLowerCase(),
  dbUri: firstDefined(process.env.DB_URI, process.env.DATABASE_URL, 'postgresql://postgres:postgres@localhost:5432/client_wa'),
  mongoDbName: process.env.MONGODB_DB || 'client_wa',

  logLevel: process.env.LOG_LEVEL || 'info'
};
