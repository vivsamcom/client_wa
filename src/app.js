const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./platform/config/logger');
const webhookRoutes = require('./platform/meta/webhook.routes');
const healthRoutes = require('./routes/health.routes');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(pinoHttp({ logger }));

  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));

  app.use('/health', healthRoutes);
  app.use('/webhook', webhookRoutes);
  app.use('/', webhookRoutes); // Keeps compatibility with current Render callback URL.

  app.use((err, req, res, next) => {
    logger.error({ err }, 'Unhandled request error');
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
