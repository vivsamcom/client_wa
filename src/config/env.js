require('dotenv').config();

const required = ['VERIFY_TOKEN'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  verifyToken: process.env.VERIFY_TOKEN,
  metaAppSecret: process.env.META_APP_SECRET || '',
  enableSignatureValidation: process.env.ENABLE_SIGNATURE_VALIDATION === 'true',
  whatsappToken: process.env.WHATSAPP_TOKEN || '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  graphApiVersion: process.env.GRAPH_API_VERSION || 'v23.0',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  rabbitmqQueue: process.env.RABBITMQ_QUEUE || 'wa.incoming.messages',
  dbProvider: process.env.DB_PROVIDER || 'postgres',
  databaseUrl: process.env.DATABASE_URL || 'postgres://wa_user:wa_password@localhost:5432/wa_loan_demo',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  mongodbDb: process.env.MONGODB_DB || 'wa_loan_demo',
  logLevel: process.env.LOG_LEVEL || 'info'
};
